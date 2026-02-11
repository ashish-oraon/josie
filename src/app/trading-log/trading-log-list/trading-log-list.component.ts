import { Component, OnInit, signal } from '@angular/core';
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
  ],
  templateUrl: './trading-log-list.component.html',
  styleUrl: './trading-log-list.component.scss',
})
export class TradingLogListComponent implements OnInit {
  displayedColumns: string[] = [
    'Stock',
    'Buy Date',
    'Buy Price',
    'Qty',
    'Current Value',
    'Gain Amount',
    '% Gain',
    'Strategy Name',
    'Target Price',
    'actions',
  ];
  tradingLogs = signal<TradingLogEntry[]>([]);
  isLoading = signal<boolean>(false);

  constructor(
    private googleSheetService: GoogleSheetService,
    private dialog: MatDialog,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadTradingLogs();
  }

  loadTradingLogs(): void {
    this.isLoading.set(true);
    this.googleSheetService.readTradingLogs().subscribe({
      next: (response: { data: TradingLogEntry[]; length: number }) => {
        console.log('Trading logs response:', response);
        console.log('Number of entries received:', response?.data?.length);

        if (response && response.data) {
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

          console.log('Processed trading logs:', processedLogs.length);
          console.log('Sample entry:', processedLogs[0]);
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
