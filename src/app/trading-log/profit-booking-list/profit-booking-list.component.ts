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
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
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
    MatMenuModule,
    MatCheckboxModule,
    MatDividerModule,
    FormsModule,
  ],
  templateUrl: './profit-booking-list.component.html',
  styleUrl: './profit-booking-list.component.scss',
})
export class ProfitBookingListComponent implements OnInit {
  profitBookings = signal<ProfitBookingEntry[]>([]);
  isLoading = signal<boolean>(false);

  selectedExchange = signal<string>('all');
  selectedOwner = signal<string>('all');
  selectedCurrency = signal<string>('INR'); // Default to INR

  selectedSortBy = signal<string>('Sell Date');
  sortOrder = signal<'asc' | 'desc'>('desc');

  exchanges: any[] = [];
  accountOwners: any[] = [];

  sortOptions = [
    { value: 'Sell Date', label: 'Sell Date' },
    { value: 'Holding Period', label: 'Holding Period' },
    { value: 'Profit/Loss Amount', label: 'Profit/Loss Amount' },
    { value: 'Profit/Loss %', label: 'Profit/Loss %' },
    { value: 'Stock', label: 'Stock Name' },
  ];

  allColumns = computed(() => [
    { key: 'Stock', label: 'Stock', defaultVisible: true },
    { key: 'Sell Date', label: 'Sell Date', defaultVisible: true },
    { key: 'Quantity Sold', label: 'Quantity Sold', defaultVisible: true },
    { key: 'Buy Price', label: 'Buy Price', defaultVisible: true },
    { key: 'Sell Price', label: 'Sell Price', defaultVisible: true },
    { key: 'Profit/Loss Amount', label: `Profit/Loss (${this.selectedCurrency()})`, defaultVisible: true },
    { key: 'Profit/Loss %', label: 'Profit/Loss %', defaultVisible: true },
    { key: 'Holding Period', label: 'Holding Period', defaultVisible: true },
    { key: 'Exchange', label: 'Exchange', defaultVisible: true },
    { key: 'Account Owner', label: 'Account Owner', defaultVisible: true },
  ]);

  columnVisibility = signal<{ [key: string]: boolean }>({});
  displayedColumns = computed(() => {
    return this.allColumns()
      .filter(col => this.columnVisibility()[col.key])
      .map(col => col.key);
  });

  // Summary statistics (computed) - using selected currency
  summaryStats = computed(() => {
    const bookings = this.profitBookings();
    const filtered = this.getFilteredBookings();
    const selectedCurr = this.selectedCurrency();

    // Calculate total profit in selected currency
    const totalProfit = filtered.reduce((sum: number, booking: ProfitBookingEntry) => {
      // Get profit in selected currency
      const profitInSelectedCurr = this.getValueInSelectedCurrency(booking, 'Profit/Loss Amount');
      return sum + profitInSelectedCurr;
    }, 0);


    const totalBookings = filtered.length;
    const profitableBookings = filtered.filter(b => {
      // Use value in selected currency for comparison
      const profitInSelectedCurr = this.getValueInSelectedCurrency(b, 'Profit/Loss Amount');
      return profitInSelectedCurr > 0;
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
    const filtered = this.getFilteredBookings();
    const sortBy = this.selectedSortBy();
    const order = this.sortOrder();
    return this.sortProfitBookings(filtered, sortBy, order);
  });

  constructor(
    private googleSheetService: GoogleSheetService,
    private router: Router,
    private loaderService: LoaderService
  ) {}

  ngOnInit(): void {
    this.initializeColumnVisibility();
    this.loadMasterData();
    this.loadProfitBookings();
  }

  initializeColumnVisibility(): void {
    const savedVisibility = localStorage.getItem('profitBookingColumnVisibility');
    let visibility: { [key: string]: boolean };
    
    if (savedVisibility) {
      try {
        visibility = JSON.parse(savedVisibility);
        this.allColumns().forEach(col => {
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
    this.allColumns().forEach(col => {
      visibility[col.key] = col.defaultVisible;
    });
    return visibility;
  }

  updateDisplayedColumns(): void {
    // displayedColumns is now computed, so it updates automatically
    // This method is kept for compatibility but doesn't need to do anything
  }

  toggleColumnVisibility(columnKey: string): void {
    const current = this.columnVisibility();
    const newVisibility = {
      ...current,
      [columnKey]: !current[columnKey]
    };
    this.columnVisibility.set(newVisibility);
    this.updateDisplayedColumns();
    localStorage.setItem('profitBookingColumnVisibility', JSON.stringify(newVisibility));
  }

  resetColumnVisibility(): void {
    const defaultVisibility = this.getDefaultVisibility();
    this.columnVisibility.set(defaultVisibility);
    this.updateDisplayedColumns();
    localStorage.setItem('profitBookingColumnVisibility', JSON.stringify(defaultVisibility));
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

  onSortChange(sortBy: string): void {
    if (this.selectedSortBy() === sortBy) {
      this.sortOrder.set(this.sortOrder() === 'asc' ? 'desc' : 'asc');
    } else {
      this.selectedSortBy.set(sortBy);
      const defaultOrder = sortBy === 'Stock' ? 'asc' : 'desc';
      this.sortOrder.set(defaultOrder);
    }
  }

  sortProfitBookings(bookings: ProfitBookingEntry[], sortBy: string, order: 'asc' | 'desc'): ProfitBookingEntry[] {
    if (!Array.isArray(bookings)) {
      return [];
    }

    const sorted = [...bookings].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'Sell Date':
          const dateA = a['Sell Date'] instanceof Date ? a['Sell Date'] : new Date(a['Sell Date']);
          const dateB = b['Sell Date'] instanceof Date ? b['Sell Date'] : new Date(b['Sell Date']);
          comparison = dateA.getTime() - dateB.getTime();
          break;

        case 'Holding Period':
          const periodA = parseInt(String(a['Holding Period'] || 0));
          const periodB = parseInt(String(b['Holding Period'] || 0));
          comparison = periodA - periodB;
          break;

        case 'Profit/Loss Amount':
          const profitA = this.getProfitAmount(a);
          const profitB = this.getProfitAmount(b);
          comparison = profitA - profitB;
          break;

        case 'Profit/Loss %':
          const percentA = parseFloat(String(a['Profit/Loss %'] || 0));
          const percentB = parseFloat(String(b['Profit/Loss %'] || 0));
          comparison = percentA - percentB;
          break;

        case 'Stock':
          comparison = (a.Stock || '').localeCompare(b.Stock || '');
          break;

        default:
          return 0;
      }

      return order === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }

  getProfitAmount(booking: ProfitBookingEntry): number {
    const profitInrValue: any = booking['Profit/Loss Amount (INR)'];
    
    if (profitInrValue !== undefined && profitInrValue !== null) {
      const profitInrStr = String(profitInrValue);
      if (profitInrStr.trim() !== '') {
        const profitInr = typeof profitInrValue === 'number' 
          ? profitInrValue 
          : parseFloat(profitInrStr);
        
        if (!isNaN(profitInr) && isFinite(profitInr)) {
          return profitInr;
        }
      }
    }
    
    return parseFloat(String(booking['Profit/Loss Amount'] || 0));
  }

  getCurrencySymbol(currency?: string): string {
    const selected = currency || this.selectedCurrency();
    if (selected === 'INR') return '₹';
    if (selected === 'EUR') return '€';
    if (selected === 'USD') return '$';
    return '₹'; // Default
  }

  // Convert value from INR to target currency
  convertCurrency(valueInInr: number, targetCurrency: string, entry: ProfitBookingEntry): number {
    if (targetCurrency === 'INR' || !valueInInr) return valueInInr || 0;
    
    const eurToInr = entry['EUR to INR Rate'] || 0;
    const usdToInr = entry['USD to INR Rate'] || 0;
    
    if (targetCurrency === 'EUR' && eurToInr > 0) {
      return valueInInr / eurToInr;
    }
    if (targetCurrency === 'USD' && usdToInr > 0) {
      return valueInInr / usdToInr;
    }
    
    // Fallback: if rates not available, return original value
    return valueInInr;
  }

  // Get value in selected currency (handles both INR converted values and original values)
  getValueInSelectedCurrency(entry: ProfitBookingEntry, field: 'Buy Price' | 'Sell Price' | 'Profit/Loss Amount' | 'Buy Value' | 'Sell Value'): number {
    const selectedCurr = this.selectedCurrency();
    
    // For Profit/Loss Amount, prioritize INR converted value
    if (field === 'Profit/Loss Amount') {
      const inrValue: any = entry['Profit/Loss Amount (INR)'];
      if (inrValue !== undefined && inrValue !== null) {
        const inrValueStr = String(inrValue);
        if (inrValueStr.trim() !== '') {
          return this.convertCurrency(parseFloat(inrValueStr), selectedCurr, entry);
        }
      }
      // Fallback to original value
      const originalValue = entry['Profit/Loss Amount'] || 0;
      // If exchange is India, original is already in INR
      if (entry.Exchange?.toLowerCase().includes('india')) {
        return this.convertCurrency(originalValue, selectedCurr, entry);
      }
      // For other exchanges, we need to convert from original currency to INR first, then to target
      // This is complex, so for now, use original value (less accurate)
      return originalValue;
    }
    
    // For Buy/Sell Price and Values
    if (field === 'Buy Price' || field === 'Buy Value') {
      const inrValue: any = entry['Buy Value (INR)'];
      if (inrValue !== undefined && inrValue !== null) {
        const inrValueStr = String(inrValue);
        if (inrValueStr.trim() !== '') {
          const priceInr = field === 'Buy Price' 
            ? parseFloat(inrValueStr) / (entry['Quantity Sold'] || 1)
            : parseFloat(inrValueStr);
          return this.convertCurrency(priceInr, selectedCurr, entry);
        }
      }
      // Fallback to original value
      const originalValue = entry[field] || 0;
      if (entry.Exchange?.toLowerCase().includes('india')) {
        return this.convertCurrency(originalValue, selectedCurr, entry);
      }
      return originalValue;
    }
    
    if (field === 'Sell Price' || field === 'Sell Value') {
      const inrValue: any = entry['Sell Value (INR)'];
      if (inrValue !== undefined && inrValue !== null) {
        const inrValueStr = String(inrValue);
        if (inrValueStr.trim() !== '') {
          const priceInr = field === 'Sell Price'
            ? parseFloat(inrValueStr) / (entry['Quantity Sold'] || 1)
            : parseFloat(inrValueStr);
          return this.convertCurrency(priceInr, selectedCurr, entry);
        }
      }
      // Fallback to original value
      const originalValue = entry[field] || 0;
      if (entry.Exchange?.toLowerCase().includes('india')) {
        return this.convertCurrency(originalValue, selectedCurr, entry);
      }
      return originalValue;
    }
    
    return 0;
  }

  formatCurrency(value: number | string | undefined, currency?: string): string {
    const numValue = typeof value === 'string' ? parseFloat(value.replace(/[₹€$,\s]/g, '')) : (value || 0);
    const symbol = this.getCurrencySymbol(currency);
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
