import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleSheetService } from '../../shared/gsheet.service';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

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
  ];
  tradingLogs: TradingLogEntry[] = [];
  isLoading = false;

  constructor(private googleSheetService: GoogleSheetService) {}

  ngOnInit(): void {
    this.loadTradingLogs();
  }

  loadTradingLogs(): void {
    this.isLoading = true;
    this.googleSheetService.readTradingLogs().subscribe({
      next: (response: { data: TradingLogEntry[]; length: number }) => {
        if (response && response.data) {
          // Convert Buy Date strings to Date objects if needed
          this.tradingLogs = response.data.map((entry: TradingLogEntry) => ({
            ...entry,
            'Buy Date': entry['Buy Date'] instanceof Date 
              ? entry['Buy Date'] 
              : new Date(entry['Buy Date'])
          }));
        } else {
          this.tradingLogs = [];
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading trading log:', error);
        this.isLoading = false;
        this.tradingLogs = [];
      },
    });
  }

  getGainClass(gainPercent: string): string {
    const gain = parseFloat(gainPercent.replace('%', '').replace(',', ''));
    if (gain > 0) return 'gain-positive';
    if (gain < 0) return 'gain-negative';
    return 'gain-neutral';
  }
}
