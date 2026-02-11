import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../../environments/environment';
import { GoogleSheetService } from '../../shared/gsheet.service';
import { DialogConfirmationComponent } from '../../shared/component/dialog-confirmation/dialog-confirmation.component';
import { MatDialog } from '@angular/material/dialog';

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
  selector: 'app-trade-details-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
  ],
  templateUrl: './trade-details-modal.component.html',
  styleUrl: './trade-details-modal.component.scss'
})
export class TradeDetailsModalComponent {
  trade: TradingLogEntry;
  rowIndex: number | null;

  constructor(
    public dialogRef: MatDialogRef<TradeDetailsModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { trade: TradingLogEntry; rowIndex?: number },
    private router: Router,
    private googleSheetService: GoogleSheetService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.trade = data.trade;
    this.rowIndex = data.rowIndex || null;
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
    
    return environment.currencySymbol || '₹';
  }

  formatCurrency(value: string | number | undefined, exchange?: string): string {
    const currencySymbol = this.getCurrencySymbol(exchange);
    
    if (value === undefined || value === null) {
      return currencySymbol + '0.00';
    }
    
    const valueStr = typeof value === 'string' ? value : String(value);
    const numValue = parseFloat(valueStr.replace(/[₹€$,\s]/g, '')) || 0;
    
    return currencySymbol + numValue.toFixed(2);
  }

  formatDate(date: Date | string): string {
    if (!date) return 'N/A';
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getGainClass(gainPercent: string | number | undefined): string {
    if (gainPercent === undefined || gainPercent === null) {
      return 'gain-neutral';
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

  formatPercentage(value: string | number | undefined): string {
    if (value === undefined || value === null || value === '') {
      return '0.00%';
    }
    
    let numValue: number;
    
    // If it's already a number, it's from percentage-formatted column (0.27 for 27%, 1.4397 for 143.97%)
    // Always multiply by 100 to convert to percentage
    if (typeof value === 'number') {
      numValue = value * 100;
    } else {
      // If it's a string, parse it (already in percentage format like "27%" or "143.97%")
      const valueStr = value.replace('%', '').replace(/,/g, '').trim();
      numValue = parseFloat(valueStr) || 0;
    }
    
    return numValue.toFixed(2) + '%';
  }

  getStatusColor(status?: string): string {
    if (!status) return '#757575';
    const statusLower = status.toLowerCase();
    if (statusLower === 'active') return '#4caf50';
    if (statusLower === 'sold') return '#f44336';
    if (statusLower === 'partial') return '#ff9800';
    if (statusLower === 'target reached') return '#2196f3';
    return '#757575';
  }

  editTrade() {
    this.dialogRef.close();
    this.router.navigate(['/trading-log/edit', this.trade.id], {
      state: { trade: this.trade, rowIndex: this.rowIndex },
    });
  }

  deleteTrade() {
    if (!this.rowIndex) {
      this.snackBar.open('Unable to delete: Row index not found', '', { duration: 3000 });
      return;
    }

    const confirmDialogRef = this.dialog.open(DialogConfirmationComponent, {
      data: `Are you sure you want to delete the trade for ${this.trade.Stock}?`,
      width: '400px',
      maxWidth: '90vw',
      panelClass: 'light-theme-dialog',
    });

    confirmDialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.googleSheetService.deleteTradingLog(this.rowIndex!).subscribe({
          next: (response) => {
            this.snackBar.open(
              response.message || 'Trade deleted successfully',
              '',
              { duration: 3000 }
            );
            this.dialogRef.close({ action: 'deleted', trade: this.trade });
          },
          error: (error) => {
            console.error('Error deleting trade:', error);
            this.snackBar.open(
              'Error deleting trade. Please try again.',
              '',
              { duration: 3000 }
            );
          },
        });
      }
    });
  }

  close() {
    this.dialogRef.close();
  }
}
