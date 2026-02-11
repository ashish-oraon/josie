import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

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
    private router: Router
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
    
    const gainStr = typeof gainPercent === 'string' 
      ? gainPercent 
      : gainPercent.toString();
    
    const gain = parseFloat(gainStr.replace('%', '').replace(/,/g, '')) || 0;
    
    if (gain > 0) return 'gain-positive';
    if (gain < 0) return 'gain-negative';
    return 'gain-neutral';
  }

  getFormattedPercentGain(gainPercent: string | number | undefined): string {
    if (gainPercent === undefined || gainPercent === null) {
      return '0.00%';
    }
    
    const gainStr = typeof gainPercent === 'string' 
      ? gainPercent 
      : String(gainPercent);
    
    const gain = parseFloat(gainStr.replace('%', '').replace(/,/g, '')) || 0;
    
    return gain.toFixed(2) + '%';
  }

  formatPercentage(value: string | number | undefined): string {
    if (value === undefined || value === null || value === '') {
      return '0.00%';
    }
    
    const valueStr = typeof value === 'string' ? value : String(value);
    // Remove any existing % sign and commas
    const cleanValue = valueStr.replace('%', '').replace(/,/g, '').trim();
    let numValue = parseFloat(cleanValue);
    
    // Check if it's NaN
    if (isNaN(numValue)) {
      return '0.00%';
    }
    
    // If the absolute value is less than 1 and not zero, it's likely a decimal (0.27) 
    // and needs to be multiplied by 100 to convert to percentage (27%)
    // If it's already a percentage (27), use it as is
    if (Math.abs(numValue) < 1 && numValue !== 0) {
      numValue = numValue * 100;
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

  close() {
    this.dialogRef.close();
  }
}
