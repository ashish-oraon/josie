import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { provideMomentDateAdapter } from '@angular/material-moment-adapter';
import { Router } from '@angular/router';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { GoogleSheetService } from '../../shared/gsheet.service';
import { LoaderService } from '../../shared/loader.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

interface ProfitBookingFormData {
  'Trade ID': number;
  'Sell Date': Date;
  'Sell Price': number;
  'Quantity Sold': number;
  Notes?: string;
}

interface ActiveTrade {
  id: number;
  Stock: string;
  'Buy Date': Date | string;
  'Buy Price': number;
  Qty: number;
  'Account Owner': string;
  Exchange: string;
  Status: string;
  [key: string]: any;
}

@Component({
  selector: 'app-profit-booking-form',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatButtonModule,
    MatExpansionModule,
    MatSelectModule,
    MatDatepickerModule,
    MatInputModule,
    CommonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'en-IN' },
    provideMomentDateAdapter(),
    provideNativeDateAdapter(),
  ],
  templateUrl: './profit-booking-form.component.html',
  styleUrl: './profit-booking-form.component.scss',
})
export class ProfitBookingFormComponent implements OnInit {
  profitBookingForm: FormGroup;
  
  // Active trades for dropdown
  private _activeTrades: ActiveTrade[] = [];
  selectedTrade: ActiveTrade | null = null;
  
  get activeTrades(): ActiveTrade[] {
    return Array.isArray(this._activeTrades) ? this._activeTrades : [];
  }
  
  // Calculated fields (read-only)
  calculatedFields = {
    sellValue: 0,
    buyValue: 0,
    profitLossAmount: 0,
    profitLossPercent: 0,
    holdingPeriod: 0,
    remainingQuantity: 0,
    remainingBuyValue: 0,
  };

  isLoading$: Observable<boolean>;
  isLoading = signal<boolean>(false);

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private googleSheetService: GoogleSheetService,
    private loaderService: LoaderService,
    private snackBar: MatSnackBar
  ) {
    this.isLoading$ = this.loaderService.isLoading$;
    // Subscribe to loading state and update signal
    this.isLoading$.subscribe(loading => this.isLoading.set(loading));
    this.profitBookingForm = this.fb.group({
      'Trade ID': ['', Validators.required],
      'Sell Date': [new Date(), Validators.required],
      'Sell Price': ['', [Validators.required, Validators.min(0.01)]],
      'Quantity Sold': ['', [Validators.required, Validators.min(1)]],
      Notes: [''],
    });
    
  }

  ngOnInit(): void {
    this.loadActiveTrades();
    
    // Watch for trade selection changes
    this.profitBookingForm.get('Trade ID')?.valueChanges.subscribe(() => {
      this.onTradeSelectionChange();
    });
    
    // Watch for quantity and price changes to recalculate
    this.profitBookingForm.get('Quantity Sold')?.valueChanges.subscribe(() => {
      this.calculateFields();
    });
    
    this.profitBookingForm.get('Sell Price')?.valueChanges.subscribe(() => {
      this.calculateFields();
    });
    
    this.profitBookingForm.get('Sell Date')?.valueChanges.subscribe(() => {
      this.calculateFields();
    });
  }

  loadActiveTrades(): void {
    this.loaderService.show();
    this.googleSheetService.readActiveTrades().subscribe({
      next: (response) => {
        console.log('Active trades response:', response);
        // Ensure response.data is an array
        if (response && Array.isArray(response.data)) {
          this._activeTrades = response.data;
        } else if (Array.isArray(response)) {
          // Handle case where response itself is an array
          this._activeTrades = response;
        } else {
          console.warn('Unexpected response format:', response);
          this._activeTrades = [];
        }
        console.log('Active trades array:', this._activeTrades);
        this.loaderService.hide();
        if (this._activeTrades.length === 0) {
          this.snackBar.open('No active trades found', 'Close', { duration: 3000 });
        }
      },
      error: (error) => {
        console.error('Error loading active trades:', error);
        this._activeTrades = []; // Ensure it's always an array
        this.loaderService.hide();
        this.snackBar.open('Error loading active trades', 'Close', { duration: 3000 });
      },
    });
  }

  onTradeSelectionChange(): void {
    const tradeId = this.profitBookingForm.get('Trade ID')?.value;
    if (tradeId) {
      this.selectedTrade = this._activeTrades.find(t => t.id === parseInt(String(tradeId))) || null;
      this.calculateFields();
      
      // Set max quantity validation
      if (this.selectedTrade) {
        const maxQty = this.selectedTrade.Qty || 0;
        this.profitBookingForm.get('Quantity Sold')?.setValidators([
          Validators.required,
          Validators.min(1),
          Validators.max(maxQty)
        ]);
        this.profitBookingForm.get('Quantity Sold')?.updateValueAndValidity();
      }
    } else {
      this.selectedTrade = null;
    }
  }

  calculateFields(): void {
    if (!this.selectedTrade) {
      this.resetCalculatedFields();
      return;
    }

    const sellPriceValue = this.profitBookingForm.get('Sell Price')?.value;
    const quantitySoldValue = this.profitBookingForm.get('Quantity Sold')?.value;
    const sellPrice = parseFloat(String(sellPriceValue || 0)) || 0;
    const quantitySold = parseInt(String(quantitySoldValue || 0)) || 0;
    const buyPrice = parseFloat(String(this.selectedTrade['Buy Price'] || 0)) || 0;
    const originalQty = parseInt(String(this.selectedTrade.Qty || 0)) || 0;
    
    // Parse dates
    const sellDate = this.profitBookingForm.get('Sell Date')?.value;
    const buyDateStr = this.selectedTrade['Buy Date'];
    let buyDate: Date;
    
    if (buyDateStr instanceof Date) {
      buyDate = buyDateStr;
    } else if (typeof buyDateStr === 'string') {
      buyDate = new Date(buyDateStr);
    } else {
      buyDate = new Date();
    }
    
    const sellDateObj = sellDate instanceof Date ? sellDate : new Date(sellDate);
    
    // Calculate fields
    const sellValue = sellPrice * quantitySold;
    const buyValue = buyPrice * quantitySold;
    const profitLossAmount = sellValue - buyValue;
    const profitLossPercent = buyValue !== 0 ? (profitLossAmount / buyValue) * 100 : 0;
    
    // Calculate holding period in days
    const holdingPeriod = Math.floor((sellDateObj.getTime() - buyDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Calculate remaining
    const remainingQuantity = originalQty - quantitySold;
    const remainingBuyValue = buyPrice * remainingQuantity;
    
    this.calculatedFields = {
      sellValue,
      buyValue,
      profitLossAmount,
      profitLossPercent,
      holdingPeriod: Math.max(0, holdingPeriod),
      remainingQuantity,
      remainingBuyValue,
    };
  }

  resetCalculatedFields(): void {
    this.calculatedFields = {
      sellValue: 0,
      buyValue: 0,
      profitLossAmount: 0,
      profitLossPercent: 0,
      holdingPeriod: 0,
      remainingQuantity: 0,
      remainingBuyValue: 0,
    };
  }

  getCurrencySymbol(): string {
    if (!this.selectedTrade) {
      return environment.currencySymbol || '₹';
    }
    const exchange = (this.selectedTrade.Exchange || '').toLowerCase().trim();
    if (exchange === 'india') return '₹';
    if (exchange === 'germany') return '€';
    if (exchange === 'us') return '$';
    return environment.currencySymbol || '₹';
  }

  getTradeDisplayName(trade: ActiveTrade): string {
    return `${trade.Stock} - Qty: ${trade.Qty} @ ${this.getCurrencySymbol()}${trade['Buy Price']}`;
  }

  onSubmit(): void {
    if (this.profitBookingForm.invalid) {
      this.markFormGroupTouched(this.profitBookingForm);
      return;
    }

    const formValue = this.profitBookingForm.value;
    const selectedTradeId = parseInt(String(formValue['Trade ID']));
    const selectedTrade = this._activeTrades.find(t => t.id === selectedTradeId);
    
    if (!selectedTrade) {
      this.snackBar.open('Please select a valid trade', 'Close', { duration: 3000 });
      return;
    }

    // Prepare data for backend
    const profitBookingData = {
      tradeRowIndex: selectedTradeId, // This is the row index in TradingLog sheet
      'Sell Date': formValue['Sell Date'],
      'Sell Price': parseFloat(formValue['Sell Price']),
      'Quantity Sold': parseInt(formValue['Quantity Sold']),
      Notes: formValue['Notes'] || '',
    };

    this.loaderService.show();
    this.googleSheetService.createProfitBooking(profitBookingData).subscribe({
      next: (response) => {
        this.loaderService.hide();
        if (response.error) {
          this.snackBar.open(response.error, 'Close', { duration: 5000 });
        } else {
          this.snackBar.open('Profit booking added successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/trading-log']);
        }
      },
      error: (error) => {
        console.error('Error creating profit booking:', error);
        this.loaderService.hide();
        this.snackBar.open('Error creating profit booking', 'Close', { duration: 3000 });
      },
    });
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  goBack(): void {
    this.router.navigate(['/trading-log']);
  }
}
