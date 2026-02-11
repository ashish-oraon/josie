import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleSheetService } from '../../shared/gsheet.service';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { TradeDetailsModalComponent } from '../trade-details-modal/trade-details-modal.component';
import { DialogConfirmationComponent } from '../../shared/component/dialog-confirmation/dialog-confirmation.component';

interface TradingLogEntry {
  id?: number;
  List: string;
  Stock: string;
  'Buy Date': Date | string;
  'Buy Price': number;
  Qty: number;
  'Buy Value': string;
  CMP: number;
  'Current Value': string;
  'Gain Amount': string;
  '% Gain': string;
  'Strategy Name': string;
  'Target Price': string;
  'Total Potential Gain': string;
  'Remaining Gain': string;
  'Target Value': string;
  'Time Frame': number;
  'Account Owner': string;
  Exchange?: string;
  Status?: string;
}

@Component({
  selector: 'app-trading-log-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    RouterModule,
    MatDialogModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatMenuModule,
    MatCheckboxModule,
    MatDividerModule,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './trading-log-list.component.html',
  styleUrl: './trading-log-list.component.scss',
})
export class TradingLogListComponent implements OnInit {
  // All available columns
  allColumns: { key: string; label: string; defaultVisible: boolean }[] = [
    { key: 'Stock', label: 'Stock', defaultVisible: true },
    { key: 'Buy Date', label: 'Buy Date', defaultVisible: true },
    { key: 'Buy Price', label: 'Buy Price', defaultVisible: true },
    { key: 'CMP', label: 'Current Price (CMP)', defaultVisible: true },
    { key: 'Qty', label: 'Quantity', defaultVisible: true },
    { key: 'Current Value', label: 'Current Value', defaultVisible: true },
    { key: 'Gain Amount', label: 'Gain/Loss', defaultVisible: true },
    { key: '% Gain', label: '% Gain', defaultVisible: true },
    { key: 'Remaining Gain', label: 'Remaining Gain', defaultVisible: true },
    { key: 'Strategy Name', label: 'Strategy', defaultVisible: true },
    { key: 'Target Price', label: 'Target Price', defaultVisible: true },
    { key: 'actions', label: 'Actions', defaultVisible: true },
  ];

  // Column visibility state
  columnVisibility = signal<{ [key: string]: boolean }>({});

  // Computed displayed columns based on visibility
  displayedColumns = signal<string[]>([]);

  tradingLogs = signal<TradingLogEntry[]>([]);
  filteredTradingLogs = computed(() => {
    const logs = this.tradingLogs();
    // Ensure logs is always an array
    if (!Array.isArray(logs)) {
      return [];
    }

    const exchangeFilter = this.selectedExchange();
    const ownerFilter = this.selectedOwner();
    const statusFilter = this.selectedStatus();

    // Apply filters
    let filtered = logs.filter(log => {
      const matchesExchange = !exchangeFilter || exchangeFilter === 'all' || log.Exchange === exchangeFilter;
      const matchesOwner = !ownerFilter || ownerFilter === 'all' || log['Account Owner'] === ownerFilter;
      
      const logStatus = log.Status || 'Active';
      let matchesStatus = false;
      
      if (!statusFilter || statusFilter === 'all') {
        matchesStatus = true;
      } else if (statusFilter === 'Active') {
        // Show both Active and Partial trades by default
        matchesStatus = logStatus === 'Active' || logStatus === 'Partial';
      } else {
        matchesStatus = logStatus === statusFilter;
      }
      
      return matchesExchange && matchesOwner && matchesStatus;
    });

    // Apply sorting
    const sortBy = this.selectedSortBy();
    const sortOrder = this.sortOrder();

    return this.sortTradingLogs(filtered, sortBy, sortOrder);
  });

  isLoading = signal<boolean>(false);

  // Filter state
  selectedExchange = signal<string>('all');
  selectedOwner = signal<string>('all');
  selectedStatus = signal<string>('Active');

  // Sort state
  selectedSortBy = signal<string>('% Gain');
  sortOrder = signal<'asc' | 'desc'>('desc');

  // Master data for filters
  exchanges: any[] = [];
  accountOwners: any[] = [];

  // Sort options
  sortOptions = [
    { value: '% Gain', label: '% Gain/Loss' },
    { value: 'Buy Date', label: 'Buy Date' },
    { value: 'Stock', label: 'Stock Name' },
    { value: 'Current Value', label: 'Current Value' },
  ];

  constructor(
    private googleSheetService: GoogleSheetService,
    private dialog: MatDialog,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeColumnVisibility();
    this.loadMasterData();
    this.loadTradingLogs();
  }

  loadMasterData(): void {
    // Load exchanges
    this.googleSheetService.readExchanges().subscribe({
      next: (data) => {
        this.exchanges = Array.isArray(data) ? data : [];
      },
      error: (error) => {
        console.error('Error loading exchanges:', error);
        this.exchanges = [];
      },
    });

    // Load account owners
    this.googleSheetService.readAccountOwners().subscribe({
      next: (data) => {
        this.accountOwners = Array.isArray(data) ? data : [];
      },
      error: (error) => {
        console.error('Error loading account owners:', error);
        this.accountOwners = [];
      },
    });
  }

  onExchangeFilterChange(value: string): void {
    this.selectedExchange.set(value);
  }

  onOwnerFilterChange(value: string): void {
    this.selectedOwner.set(value);
  }

  clearFilters(): void {
    this.selectedExchange.set('all');
    this.selectedOwner.set('all');
    this.selectedStatus.set('Active');
  }

  onStatusFilterChange(value: string): void {
    this.selectedStatus.set(value);
  }

  onSortChange(sortBy: string): void {
    // If clicking the same sort option, toggle order; otherwise set new sort and default to desc
    if (this.selectedSortBy() === sortBy) {
      this.sortOrder.set(this.sortOrder() === 'asc' ? 'desc' : 'asc');
    } else {
      this.selectedSortBy.set(sortBy);
      // Default order: desc for % Gain and Current Value, asc for Stock Name, desc for Buy Date
      const defaultOrder = sortBy === 'Stock' ? 'asc' : 'desc';
      this.sortOrder.set(defaultOrder);
    }
  }

  sortTradingLogs(logs: TradingLogEntry[], sortBy: string, order: 'asc' | 'desc'): TradingLogEntry[] {
    // Ensure logs is an array
    if (!Array.isArray(logs)) {
      return [];
    }

    const sorted = [...logs].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case '% Gain':
          const gainA = this.parsePercentGain(a['% Gain']);
          const gainB = this.parsePercentGain(b['% Gain']);
          comparison = gainA - gainB;
          break;

        case 'Buy Date':
          const dateA = a['Buy Date'] instanceof Date ? a['Buy Date'] : new Date(a['Buy Date']);
          const dateB = b['Buy Date'] instanceof Date ? b['Buy Date'] : new Date(b['Buy Date']);
          comparison = dateA.getTime() - dateB.getTime();
          break;

        case 'Stock':
          comparison = (a.Stock || '').localeCompare(b.Stock || '');
          break;

        case 'Current Value':
          const valueA = this.parseCurrency(a['Current Value']);
          const valueB = this.parseCurrency(b['Current Value']);
          comparison = valueA - valueB;
          break;

        default:
          return 0;
      }

      return order === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }

  parsePercentGain(gainPercent: string | number | undefined): number {
    if (gainPercent === undefined || gainPercent === null) {
      return 0;
    }

    const gainStr = typeof gainPercent === 'string' ? gainPercent : String(gainPercent);
    return parseFloat(gainStr.replace('%', '').replace(/,/g, '')) || 0;
  }

  parseCurrency(value: string | number | undefined): number {
    if (value === undefined || value === null) {
      return 0;
    }

    const valueStr = typeof value === 'string' ? value : String(value);
    return parseFloat(valueStr.replace(/[₹€$,\s]/g, '')) || 0;
  }

  initializeColumnVisibility(): void {
    // Load from localStorage or use defaults
    const savedVisibility = localStorage.getItem('tradingLogColumnVisibility');
    let visibility: { [key: string]: boolean };

    if (savedVisibility) {
      try {
        visibility = JSON.parse(savedVisibility);
        // Ensure all columns have visibility state
        this.allColumns.forEach(col => {
          if (visibility[col.key] === undefined) {
            visibility[col.key] = col.defaultVisible;
          }
        });
      } catch (e) {
        visibility = this.getDefaultVisibility();
      }
    } else {
      visibility = this.getDefaultVisibility();
    }

    this.columnVisibility.set(visibility);
    this.updateDisplayedColumns();
  }

  getDefaultVisibility(): { [key: string]: boolean } {
    const visibility: { [key: string]: boolean } = {};
    this.allColumns.forEach(col => {
      visibility[col.key] = col.defaultVisible;
    });
    return visibility;
  }

  updateDisplayedColumns(): void {
    const visible = this.allColumns
      .filter(col => this.columnVisibility()[col.key])
      .map(col => col.key);
    this.displayedColumns.set(visible);
  }

  toggleColumnVisibility(columnKey: string): void {
    const current = this.columnVisibility();
    const newVisibility = {
      ...current,
      [columnKey]: !current[columnKey]
    };
    this.columnVisibility.set(newVisibility);
    this.updateDisplayedColumns();

    // Save to localStorage
    localStorage.setItem('tradingLogColumnVisibility', JSON.stringify(newVisibility));
  }

  resetColumnVisibility(): void {
    const defaultVisibility = this.getDefaultVisibility();
    this.columnVisibility.set(defaultVisibility);
    this.updateDisplayedColumns();
    localStorage.setItem('tradingLogColumnVisibility', JSON.stringify(defaultVisibility));
  }

  loadTradingLogs(): void {
    this.isLoading.set(true);
    this.googleSheetService.readTradingLogs().subscribe({
      next: (response: { data: TradingLogEntry[]; length: number }) => {
        if (response && response.data && Array.isArray(response.data)) {
          // Convert Buy Date strings to Date objects if needed and ensure % Gain is string
          const processedLogs = response.data
            .map((entry: any, index: number) => {
              try {
                // Ensure % Gain is a string
                const percentGainValue = entry['% Gain'];
                let percentGain: string;
                if (typeof percentGainValue === 'string') {
                  percentGain = percentGainValue;
                } else if (percentGainValue !== null && percentGainValue !== undefined) {
                  const gainStr = String(percentGainValue);
                  percentGain = gainStr.includes('%') ? gainStr : gainStr + '%';
                } else {
                  percentGain = '0%';
                }

                return {
                  ...entry,
                  id: entry.id || index + 1, // Ensure id is set
                  'Buy Date': entry['Buy Date'] instanceof Date
                    ? entry['Buy Date']
                    : new Date(entry['Buy Date']),
                  '% Gain': percentGain
                } as TradingLogEntry;
              } catch (error) {
                console.error('Error parsing entry:', entry, error);
                const percentGainValue = entry['% Gain'];
                return {
                  ...entry,
                  id: entry.id || index + 1,
                  'Buy Date': new Date(),
                  '% Gain': percentGainValue ? String(percentGainValue) : '0%'
                } as TradingLogEntry;
              }
            })
            .filter((entry: TradingLogEntry) => entry && entry.Stock); // Filter out invalid entries

          this.tradingLogs.set(processedLogs);
        } else {
          this.tradingLogs.set([]);
        }
        this.isLoading.set(false);
      },
      error: (error: any) => {
        console.error('Error loading trading log:', error);
        this.isLoading.set(false);
        this.tradingLogs.set([]);
      },
    });
  }

  getGainClass(gainPercent: string | number | undefined): string {
    if (gainPercent === undefined || gainPercent === null) {
      return 'gain-neutral';
    }

    // Convert to string if it's a number
    const gainStr = typeof gainPercent === 'string'
      ? gainPercent
      : gainPercent.toString();

    // Remove % and commas, then parse
    const gain = parseFloat(gainStr.replace('%', '').replace(/,/g, '')) || 0;

    if (gain > 0) return 'gain-positive';
    if (gain < 0) return 'gain-negative';
    return 'gain-neutral';
  }

  getFormattedPercentGain(gainPercent: string | number | undefined): string {
    if (gainPercent === undefined || gainPercent === null) {
      return '0.00%';
    }

    // Convert to string if it's a number
    const gainStr = typeof gainPercent === 'string'
      ? gainPercent
      : String(gainPercent);

    // Remove % and commas, then parse
    const gain = parseFloat(gainStr.replace('%', '').replace(/,/g, '')) || 0;

    // Format to 2 decimal places and add % sign
    return gain.toFixed(2) + '%';
  }

  getCurrencySymbol(exchange?: string): string {
    if (!exchange) {
      return environment.currencySymbol || '₹';
    }

    const exchangeLower = exchange.toLowerCase().trim();

    if (exchangeLower === 'india') {
      return '₹';
    } else if (exchangeLower === 'germany') {
      return '€';
    } else if (exchangeLower === 'us') {
      return '$';
    }

    // Fallback to environment currency symbol
    return environment.currencySymbol || '₹';
  }

  formatCurrency(value: string | number | undefined, exchange?: string): string {
    const currencySymbol = this.getCurrencySymbol(exchange);

    if (value === undefined || value === null) {
      return currencySymbol + '0.00';
    }

    // Convert to string if it's a number
    const valueStr = typeof value === 'string' ? value : String(value);

    // Remove currency symbols, commas, and parse
    const numValue = parseFloat(valueStr.replace(/[₹€$,\s]/g, '')) || 0;

    // Format to 2 decimal places with currency symbol
    return currencySymbol + numValue.toFixed(2);
  }

  viewTrade(trade: TradingLogEntry, index: number): void {
    // Find the actual row index in the trading logs array
    const rowIndex = this.tradingLogs().findIndex(t => t.id === trade.id) + 1; // +1 because sheet rows are 1-indexed

    const dialogRef = this.dialog.open(TradeDetailsModalComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: { trade, rowIndex },
      panelClass: 'trade-details-dialog'
    });

    dialogRef.afterClosed().subscribe((result) => {
      // Refresh data if trade was deleted from modal
      if (result?.action === 'deleted') {
        this.loadTradingLogs();
      }
    });
  }

  editTrade(trade: TradingLogEntry, index: number): void {
    // Find the actual row index in the trading logs array
    const rowIndex = this.tradingLogs().findIndex(t => t.id === trade.id) + 1; // +1 because sheet rows are 1-indexed

    this.router.navigate(['/trading-log/edit', trade.id], {
      state: { trade, rowIndex },
    });
  }

  deleteTrade(trade: TradingLogEntry, index: number): void {
    // Find the actual row index in the trading logs array
    const rowIndex = this.tradingLogs().findIndex(t => t.id === trade.id) + 1; // +1 because sheet rows are 1-indexed

    const dialogRef = this.dialog.open(DialogConfirmationComponent, {
      data: `Are you sure you want to delete the trade for ${trade.Stock}?`,
      width: '400px',
      maxWidth: '90vw',
      panelClass: 'light-theme-dialog',
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.isLoading.set(true);
        this.googleSheetService.deleteTradingLog(rowIndex).subscribe({
          next: (response) => {
            this.snackBar.open(
              response.message || 'Trade deleted successfully',
              '',
              { duration: 3000 }
            );
            // Reload the trading logs list
            this.loadTradingLogs();
          },
          error: (error) => {
            console.error('Error deleting trade:', error);
            this.snackBar.open(
              'Error deleting trade. Please try again.',
              '',
              { duration: 3000 }
            );
            this.isLoading.set(false);
          },
        });
      }
    });
  }
}
