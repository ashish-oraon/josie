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
import { MatInputModule } from '@angular/material/input';
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
  '% Gain': string | number;
  'Strategy Name': string;
  'Target Price': string;
  'Total Potential Gain': string | number;
  'Remaining Gain': string | number;
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
    MatInputModule,
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

  // Highlight threshold for Remaining Gain
  remainingGainThreshold = signal<number | null>(null);

  // Master data for filters
  exchanges: any[] = [];
  accountOwners: any[] = [];

  // Sort options
  sortOptions = [
    { value: '% Gain', label: '% Gain/Loss' },
    { value: 'Remaining Gain', label: 'Remaining Gain' },
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

  refreshData(): void {
    this.loadMasterData(true);
    this.loadTradingLogs(true);
  }

  loadMasterData(forceRefresh: boolean = false): void {
    // Load exchanges
    this.googleSheetService.readExchanges(forceRefresh).subscribe({
      next: (data) => {
        this.exchanges = Array.isArray(data) ? data : [];
      },
      error: (error) => {
        console.error('Error loading exchanges:', error);
        this.exchanges = [];
      },
    });

    // Load account owners
    this.googleSheetService.readAccountOwners(forceRefresh).subscribe({
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
    this.remainingGainThreshold.set(null);
  }

  onThresholdChange(value: string): void {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue !== null) {
      this.remainingGainThreshold.set(numValue);
    } else {
      this.remainingGainThreshold.set(null);
    }
  }

  shouldHighlightRow(entry: TradingLogEntry): boolean {
    const threshold = this.remainingGainThreshold();
    if (threshold === null || threshold === undefined) {
      return false;
    }
    const remainingGain = this.parsePercentGain(entry['Remaining Gain']);
    return remainingGain < threshold;
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
      // Default order: desc for % Gain, Remaining Gain and Current Value, asc for Stock Name, desc for Buy Date
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

        case 'Remaining Gain':
          const remainingGainA = this.parsePercentGain(a['Remaining Gain']);
          const remainingGainB = this.parsePercentGain(b['Remaining Gain']);
          comparison = remainingGainA - remainingGainB;
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

    // If it's already a number, it's from percentage-formatted column (0.27 for 27%, 1.4397 for 143.97%)
    // Always multiply by 100 to convert to percentage
    if (typeof gainPercent === 'number') {
      return gainPercent * 100;
    }

    // If it's a string, parse it (already in percentage format like "27%" or "143.97%")
    const gainStr = gainPercent.replace('%', '').replace(/,/g, '').trim();
    return parseFloat(gainStr) || 0;
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

  loadTradingLogs(forceRefresh: boolean = false): void {
    this.isLoading.set(true);
    this.googleSheetService.readTradingLogs(forceRefresh).subscribe({
      next: (response: { data: TradingLogEntry[]; length: number }) => {
        if (response && response.data && Array.isArray(response.data)) {
          // Convert Buy Date strings to Date objects
          // Keep % Gain, Remaining Gain, Total Potential Gain as numbers (they come as decimals from percentage-formatted columns)
          const processedLogs = response.data
            .map((entry: any, index: number) => {
              try {
                return {
                  ...entry,
                  id: entry.id || index + 1,
                  'Buy Date': entry['Buy Date'] instanceof Date
                    ? entry['Buy Date']
                    : new Date(entry['Buy Date']),
                  // Keep percentage values as numbers (they're decimals from percentage-formatted columns)
                  '% Gain': entry['% Gain'] !== undefined && entry['% Gain'] !== null 
                    ? (typeof entry['% Gain'] === 'number' ? entry['% Gain'] : parseFloat(String(entry['% Gain']).replace('%', '').replace(/,/g, '')) || 0)
                    : 0,
                  'Remaining Gain': entry['Remaining Gain'] !== undefined && entry['Remaining Gain'] !== null
                    ? (typeof entry['Remaining Gain'] === 'number' ? entry['Remaining Gain'] : parseFloat(String(entry['Remaining Gain']).replace('%', '').replace(/,/g, '')) || 0)
                    : 0,
                  'Total Potential Gain': entry['Total Potential Gain'] !== undefined && entry['Total Potential Gain'] !== null
                    ? (typeof entry['Total Potential Gain'] === 'number' ? entry['Total Potential Gain'] : parseFloat(String(entry['Total Potential Gain']).replace('%', '').replace(/,/g, '')) || 0)
                    : 0,
                } as TradingLogEntry;
              } catch (error) {
                console.error('Error parsing entry:', entry, error);
                return {
                  ...entry,
                  id: index + 1,
                  'Buy Date': new Date(),
                  '% Gain': 0,
                  'Remaining Gain': 0,
                  'Total Potential Gain': 0,
                } as TradingLogEntry;
              }
            })
            .filter((entry: TradingLogEntry) => entry && entry.Stock);

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

    let numValue: number;
    
    // If it's already a number, use it directly
    if (typeof gainPercent === 'number') {
      numValue = gainPercent;
    } else {
      // If it's a string, parse it
      const gainStr = gainPercent.replace('%', '').replace(/,/g, '').trim();
      numValue = parseFloat(gainStr) || 0;
    }

    // If it's a decimal (< 1), it's from percentage-formatted column, multiply by 100
    if (Math.abs(numValue) < 1 && numValue !== 0) {
      numValue = numValue * 100;
    }

    if (numValue > 0) return 'gain-positive';
    if (numValue < 0) return 'gain-negative';
    return 'gain-neutral';
  }

  getFormattedPercentGain(gainPercent: string | number | undefined): string {
    if (gainPercent === undefined || gainPercent === null) {
      return '0.00%';
    }

    let numValue: number;
    
    // If it's already a number, it's from percentage-formatted column (0.27 for 27%, 1.4397 for 143.97%)
    // Always multiply by 100 to convert to percentage
    if (typeof gainPercent === 'number') {
      numValue = gainPercent * 100;
    } else {
      // If it's a string, parse it (already in percentage format like "27%" or "143.97%")
      const gainStr = gainPercent.replace('%', '').replace(/,/g, '').trim();
      numValue = parseFloat(gainStr) || 0;
    }

    return numValue.toFixed(2) + '%';
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
