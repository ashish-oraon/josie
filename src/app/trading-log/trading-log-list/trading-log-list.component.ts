import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  MatCardModule,
  MatCardHeaderModule,
  MatCardTitleModule,
  MatCardContentModule,
} from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

interface TradingLogEntry {
  List: string;
  Stock: string;
  'Buy Date': string;
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
}

@Component({
  selector: 'app-trading-log-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatCardHeaderModule,
    MatCardTitleModule,
    MatCardContentModule,
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

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadTradingLogs();
  }

  loadTradingLogs(): void {
    this.isLoading = true;
    this.http
      .get('assets/TradingLog.csv', { responseType: 'text' })
      .subscribe({
        next: (data) => {
          this.parseCSV(data);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading trading log:', error);
          this.isLoading = false;
        },
      });
  }

  parseCSV(csvText: string): void {
    const lines = csvText.split('\n');
    if (lines.length < 2) return;

    // Skip header row
    const dataLines = lines.slice(1);

    this.tradingLogs = dataLines
      .filter((line) => line.trim())
      .map((line) => {
        // Parse CSV line (handling quoted values)
        const values: string[] = [];
        let currentValue = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            values.push(currentValue.trim());
            currentValue = '';
          } else {
            currentValue += char;
          }
        }
        values.push(currentValue.trim());

        return {
          List: values[0] || '',
          Stock: values[1] || '',
          'Buy Date': values[2] || '',
          'Buy Price': parseFloat(values[3]?.replace(/,/g, '') || '0'),
          Qty: parseInt(values[4] || '0', 10),
          'Buy Value': values[5] || '',
          CMP: parseFloat(values[6]?.replace(/,/g, '') || '0'),
          'Current Value': values[7] || '',
          'Gain Amount': values[8] || '',
          '% Gain': values[9] || '',
          'Strategy Name': values[10] || '',
          'Target Price': values[11] || '',
          'Total Potential Gain': values[12] || '',
          'Remaining Gain': values[13] || '',
          'Target Value': values[14] || '',
          'Time Frame': parseInt(values[15] || '0', 10),
          'Account Owner': values[16] || '',
        };
      });
  }

  getGainClass(gainPercent: string): string {
    const gain = parseFloat(gainPercent.replace('%', '').replace(',', ''));
    if (gain > 0) return 'gain-positive';
    if (gain < 0) return 'gain-negative';
    return 'gain-neutral';
  }
}
