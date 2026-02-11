import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleSheetService } from '../../shared/gsheet.service';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { LoaderService } from '../../shared/loader.service';

interface ProfitBookingEntry {
  id?: number;
  'Trade ID': number;
  Stock: string;
  'Sell Date': Date | string;
  'Sell Price': number;
  'Quantity Sold': number;
  'Buy Price': number;
  'Buy Value': number;
  'Sell Value': number;
  'Profit/Loss Amount': number;
  'Profit/Loss %': number;
  'Holding Period': number;
  Notes?: string;
  'Account Owner': string;
  Exchange: string;
  'Base Currency'?: string;
  'EUR to INR Rate'?: number;
  'USD to INR Rate'?: number;
  'EUR to USD Rate'?: number;
  'Buy Value (INR)'?: number;
  'Sell Value (INR)'?: number;
  'Profit/Loss Amount (INR)'?: number;
  [key: string]: any;
}

@Component({
  selector: 'app-profit-booking-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    RouterModule,
    MatTooltipModule,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule,
  ],
  templateUrl: './profit-booking-list.component.html',
  styleUrl: './profit-booking-list.component.scss',
})
export class ProfitBookingListComponent implements OnInit {
  profitBookings = signal<ProfitBookingEntry[]>([]);
  isLoading = signal<boolean>(false);

  // Filter state
  selectedExchange = signal<string>('all');
  selectedOwner = signal<string>('all');

  // Master data for filters
  exchanges: any[] = [];
  accountOwners: any[] = [];

  // Displayed columns
  displayedColumns: string[] = [
    'Stock',
    'Sell Date',
    'Quantity Sold',
    'Buy Price',
    'Sell Price',
    'Profit/Loss Amount',
    'Profit/Loss %',
    'Holding Period',
    'Exchange',
    'Account Owner',
  ];

  // Summary statistics (computed) - using INR converted values
  summaryStats = computed(() => {
    const bookings = this.profitBookings();
    const filtered = this.getFilteredBookings();

    // Always use INR converted values for accurate cross-currency comparison
    const totalProfit = filtered.reduce((sum: number, booking: ProfitBookingEntry) => {
      // Get original profit amount
      const originalProfit = parseFloat(String(booking['Profit/Loss Amount'] || 0));

      // Prioritize INR converted value if available
      const profitInrValue: any = booking['Profit/Loss Amount (INR)'];

      // Check if INR value exists and is a valid number
      if (profitInrValue !== undefined && profitInrValue !== null) {
        // Skip empty strings
        const profitInrStr = String(profitInrValue);
        if (profitInrStr.trim() === '') {
          // Fall through to use original profit
        } else {
          // Convert to number if it's a string, or use directly if it's already a number
          const profitInr = typeof profitInrValue === 'number'
            ? profitInrValue
            : parseFloat(profitInrStr);

          // Use INR value if it's valid and not NaN
          // If both are 0, use INR (0). If INR is 0 but original is not, use original (conversion missing)
          if (!isNaN(profitInr) && isFinite(profitInr)) {
            if (profitInr === 0 && originalProfit !== 0) {
              // INR conversion missing, use original profit
              return sum + originalProfit;
            }
            return sum + profitInr;
          }
        }
      }

      // Fallback: Use original profit
      // For India exchange, original profit is already in INR
      // For other exchanges, we use original (less accurate but better than 0)
      return sum + originalProfit;
    }, 0);


    const totalBookings = filtered.length;
    const profitableBookings = filtered.filter(b => {
      // Use INR converted value for accurate comparison
      const profitInrStr = String(b['Profit/Loss Amount (INR)'] || '');
      const profitInr = profitInrStr !== '' && profitInrStr !== 'null' && profitInrStr !== 'undefined'
        ? parseFloat(profitInrStr)
        : parseFloat(String(b['Profit/Loss Amount'] || 0));
      return profitInr > 0;
    }).length;

    const avgProfitPercent = filtered.length > 0
      ? filtered.reduce((sum, booking) => {
          const percent = parseFloat(String(booking['Profit/Loss %'] || 0));
          return sum + percent;
        }, 0) / filtered.length
      : 0;

    const avgHoldingPeriod = filtered.length > 0
      ? filtered.reduce((sum, booking) => {
          const days = parseInt(String(booking['Holding Period'] || 0));
          return sum + days;
        }, 0) / filtered.length
      : 0;

    return {
      totalProfit,
      totalBookings,
      profitableBookings,
      lossBookings: totalBookings - profitableBookings,
      avgProfitPercent,
      avgHoldingPeriod: Math.round(avgHoldingPeriod),
    };
  });

  filteredBookings = computed(() => {
    return this.getFilteredBookings();
  });

  constructor(
    private googleSheetService: GoogleSheetService,
    private router: Router,
    private loaderService: LoaderService
  ) {}

  ngOnInit(): void {
    this.loadMasterData();
    this.loadProfitBookings();
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

  loadProfitBookings(): void {
    this.isLoading.set(true);
    this.loaderService.show();
    this.googleSheetService.readProfitBookings().subscribe({
      next: (response) => {
        if (response && response.data && Array.isArray(response.data)) {
          const processedBookings = response.data.map((entry: any, index: number) => {
            try {
              // Check if INR columns exist in the entry (for older bookings without currency conversion)
              const profitInrRaw = entry['Profit/Loss Amount (INR)'];
              const hasInrConversion = entry.hasOwnProperty('Profit/Loss Amount (INR)') &&
                                       profitInrRaw !== undefined &&
                                       profitInrRaw !== null &&
                                       (typeof profitInrRaw !== 'string' || profitInrRaw.trim() !== '');

              const buyValueInrRaw = entry['Buy Value (INR)'];
              const hasBuyValueInr = entry.hasOwnProperty('Buy Value (INR)') &&
                                    buyValueInrRaw !== undefined &&
                                    buyValueInrRaw !== null &&
                                    (typeof buyValueInrRaw !== 'string' || buyValueInrRaw.trim() !== '');

              const sellValueInrRaw = entry['Sell Value (INR)'];
              const hasSellValueInr = entry.hasOwnProperty('Sell Value (INR)') &&
                                     sellValueInrRaw !== undefined &&
                                     sellValueInrRaw !== null &&
                                     (typeof sellValueInrRaw !== 'string' || sellValueInrRaw.trim() !== '');

              const processedEntry = {
                ...entry,
                id: entry.id || index + 1,
                'Sell Date': entry['Sell Date'] instanceof Date
                  ? entry['Sell Date']
                  : new Date(entry['Sell Date']),
                'Profit/Loss Amount': parseFloat(String(entry['Profit/Loss Amount'] || 0)),
                'Profit/Loss %': parseFloat(String(entry['Profit/Loss %'] || 0)),
                'Holding Period': parseInt(String(entry['Holding Period'] || 0)),
                'Profit/Loss Amount (INR)': hasInrConversion
                  ? parseFloat(String(profitInrRaw))
                  : undefined, // Keep as undefined if column doesn't exist
                'Buy Value (INR)': hasBuyValueInr
                  ? parseFloat(String(buyValueInrRaw))
                  : undefined,
                'Sell Value (INR)': hasSellValueInr
                  ? parseFloat(String(sellValueInrRaw))
                  : undefined,
              } as ProfitBookingEntry;

              return processedEntry;
            } catch (error) {
              console.error('Error processing booking:', entry, error);
              return {
                ...entry,
                id: index + 1,
                'Sell Date': new Date(),
                'Profit/Loss Amount': 0,
                'Profit/Loss %': 0,
                'Holding Period': 0,
              } as ProfitBookingEntry;
            }
          }).filter((entry: ProfitBookingEntry) => entry && entry.Stock);

          this.profitBookings.set(processedBookings);
        } else {
          this.profitBookings.set([]);
        }
        this.isLoading.set(false);
        this.loaderService.hide();
      },
      error: (error: any) => {
        console.error('Error loading profit bookings:', error);
        this.isLoading.set(false);
        this.loaderService.hide();
        this.profitBookings.set([]);
      },
    });
  }

  getFilteredBookings(): ProfitBookingEntry[] {
    const bookings = this.profitBookings();
    if (!Array.isArray(bookings)) {
      return [];
    }

    const exchangeFilter = this.selectedExchange();
    const ownerFilter = this.selectedOwner();

    return bookings.filter(booking => {
      const matchesExchange = !exchangeFilter || exchangeFilter === 'all' || booking.Exchange === exchangeFilter;
      const matchesOwner = !ownerFilter || ownerFilter === 'all' || booking['Account Owner'] === ownerFilter;
      return matchesExchange && matchesOwner;
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
  }

  getCurrencySymbol(exchange?: string): string {
    if (!exchange) {
      console.warn('getCurrencySymbol: exchange is undefined, using default:', environment.currencySymbol || '₹');
      return environment.currencySymbol || '₹';
    }
    const exchangeLower = exchange.toLowerCase().trim();
    // Handle various possible exchange name formats
    if (exchangeLower === 'india' || exchangeLower.includes('india')) return '₹';
    if (exchangeLower === 'germany' || exchangeLower.includes('germany')) {
      return '€';
    }
    if (exchangeLower === 'us' || exchangeLower === 'usa' || exchangeLower.includes('us')) return '$';
    // Log warning for unknown exchange
    console.warn('Unknown exchange for currency symbol:', exchange, 'using default:', environment.currencySymbol || '₹');
    return environment.currencySymbol || '₹';
  }

  formatCurrency(value: number | string | undefined, exchange?: string): string {
    const numValue = typeof value === 'string' ? parseFloat(value.replace(/[₹€$,\s]/g, '')) : (value || 0);
    const symbol = this.getCurrencySymbol(exchange);
    return `${symbol}${numValue.toFixed(2)}`;
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return '';
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  getProfitClass(profit: number | string | undefined): string {
    const profitValue = typeof profit === 'string' ? parseFloat(profit.replace(/[₹€$,\s]/g, '')) : (profit || 0);
    if (profitValue > 0) return 'profit-positive';
    if (profitValue < 0) return 'profit-negative';
    return 'profit-neutral';
  }

  goBack(): void {
    this.router.navigate(['/trading-log']);
  }
}
