import { Component, OnInit } from '@angular/core';
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
import { Router, ActivatedRoute } from '@angular/router';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { GoogleSheetService } from '../../shared/gsheet.service';
import { LoaderService } from '../../shared/loader.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { environment } from '../../../environments/environment';

interface TradingLogFormData {
  List: string;
  Stock: string;
  'Buy Date': Date;
  'Buy Price': number;
  Qty: number;
  CMP?: number;
  'Strategy Name': string;
  'Target Price': number;
  'Account Owner': string;
  Exchange: string;
  Status?: string;
}

@Component({
  selector: 'app-trading-log-form',
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
    MatTooltipModule,
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'en-IN' },
    provideMomentDateAdapter(),
    provideNativeDateAdapter(),
  ],
  templateUrl: './trading-log-form.component.html',
  styleUrl: './trading-log-form.component.scss',
})
export class TradingLogFormComponent implements OnInit {
  tradingLogForm: FormGroup;
  formType: string = 'add';
  selectedTrade: any = null;
  rowIndex: number | null = null;

  // Master data
  exchanges: any[] = [];
  accountOwners: any[] = [];
  strategyNames: any[] = [];
  
  // List/Portfolio options
  listOptions: string[] = ['Super 45', 'Good 45', 'Good 200', 'Any Other'];
  showCustomListInput: boolean = false;

  // Calculated fields (read-only)
  calculatedFields = {
    buyValue: 0,
    currentValue: 0,
    gainAmount: 0,
    percentGain: 0,
    targetValue: 0,
    totalPotentialGain: 0,
    remainingGain: 0,
    timeFrame: 0,
  };

  isLoading$: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private googleSheetService: GoogleSheetService,
    private loaderService: LoaderService,
    private snackBar: MatSnackBar
  ) {
    this.isLoading$ = this.loaderService.isLoading$;
    this.tradingLogForm = this.fb.group({
      List: ['Good 45', Validators.required],
      Stock: ['', Validators.required],
      'Buy Date': [new Date(), Validators.required],
      'Buy Price': [null, [Validators.required, Validators.min(0.01)]],
      Qty: [null, [Validators.required, Validators.min(1)]],
      CMP: [null],
      'Strategy Name': ['', Validators.required],
      'Target Price': [null, [Validators.required, Validators.min(0.01)]],
      'Account Owner': ['', Validators.required],
      Exchange: ['', Validators.required],
      Status: ['Active'], // Hidden field, always defaults to 'Active'
    });

    // Subscribe to form changes to calculate fields
    this.tradingLogForm.valueChanges.subscribe(() => {
      this.calculateFields();
    });
  }

  ngOnInit(): void {
    this.loadMasterData();

    // Check if editing existing trade
    const navigationExtras = this.router.getCurrentNavigation()?.extras;
    const state = navigationExtras?.state;
    if (state && state['trade']) {
      this.selectedTrade = state['trade'];
      this.rowIndex = state['rowIndex'] as number | null;
      this.formType = 'edit';
      this.setFormData();
    }
  }

  onListChange(event: any): void {
    const selectedValue = event.value;
    this.showCustomListInput = selectedValue === 'Any Other';
    if (this.showCustomListInput) {
      // Clear the value to allow custom input
      setTimeout(() => {
        this.tradingLogForm.patchValue({ List: '' });
      }, 0);
    }
  }

  resetListSelection(): void {
    this.showCustomListInput = false;
    this.tradingLogForm.patchValue({ List: 'Good 45' });
  }

  loadMasterData(): void {
    // Load exchanges
    this.googleSheetService.readExchanges().subscribe({
      next: (data) => {
        this.exchanges = data;
        if (this.exchanges.length > 0 && !this.tradingLogForm.value.Exchange) {
          this.tradingLogForm.patchValue({ Exchange: this.exchanges[0].name });
        }
      },
      error: (error) => console.error('Error loading exchanges:', error),
    });

    // Load account owners
    this.googleSheetService.readAccountOwners().subscribe({
      next: (data) => {
        this.accountOwners = data;
        if (
          this.accountOwners.length > 0 &&
          !this.tradingLogForm.value['Account Owner']
        ) {
          this.tradingLogForm.patchValue({
            'Account Owner': this.accountOwners[0].name,
          });
        }
      },
      error: (error) => console.error('Error loading account owners:', error),
    });

    // Load strategy names
    this.googleSheetService.readStrategyNames().subscribe({
      next: (data) => {
        this.strategyNames = data;
      },
      error: (error) => console.error('Error loading strategy names:', error),
    });
  }

  setFormData(): void {
    if (this.selectedTrade) {
      const buyDate =
        this.selectedTrade['Buy Date'] instanceof Date
          ? this.selectedTrade['Buy Date']
          : new Date(this.selectedTrade['Buy Date']);

      const listValue = this.selectedTrade.List || '';
      // Check if the list value is one of the predefined options
      this.showCustomListInput = !this.listOptions.includes(listValue);

      this.tradingLogForm.patchValue({
        List: listValue,
        Stock: this.selectedTrade.Stock || '',
        'Buy Date': buyDate,
        'Buy Price': this.selectedTrade['Buy Price'] || 0,
        Qty: this.selectedTrade.Qty || 0,
        CMP: this.selectedTrade.CMP || null,
        'Strategy Name': this.selectedTrade['Strategy Name'] || '',
        'Target Price': parseFloat(
          this.selectedTrade['Target Price']?.toString().replace(/,/g, '') ||
            '0'
        ),
        'Account Owner': this.selectedTrade['Account Owner'] || '',
        Exchange: this.selectedTrade.Exchange || '',
        Status: this.selectedTrade.Status || 'Active', // Preserve existing status when editing, default to 'Active'
      });
    }
  }

  calculateFields(): void {
    const formValue = this.tradingLogForm.value;
    const buyPrice = parseFloat(formValue['Buy Price']) || 0;
    const qty = parseInt(formValue.Qty) || 0;
    const cmp = parseFloat(formValue.CMP) || buyPrice;
    const targetPrice = parseFloat(formValue['Target Price']) || 0;
    const buyDate = formValue['Buy Date']
      ? new Date(formValue['Buy Date'])
      : new Date();
    const today = new Date();

    // Calculate fields
    this.calculatedFields.buyValue = buyPrice * qty;
    this.calculatedFields.currentValue = cmp * qty;
    this.calculatedFields.gainAmount =
      this.calculatedFields.currentValue - this.calculatedFields.buyValue;
    this.calculatedFields.percentGain =
      this.calculatedFields.buyValue !== 0
        ? (this.calculatedFields.gainAmount /
            this.calculatedFields.buyValue) *
          100
        : 0;
    this.calculatedFields.targetValue = targetPrice * qty;
    this.calculatedFields.totalPotentialGain =
      buyPrice !== 0 ? ((targetPrice - buyPrice) / buyPrice) * 100 : 0;
    this.calculatedFields.remainingGain =
      buyPrice !== 0 ? ((targetPrice - cmp) / buyPrice) * 100 : 0;
    this.calculatedFields.timeFrame = Math.floor(
      (today.getTime() - buyDate.getTime()) / (1000 * 60 * 60 * 24)
    );
  }

  getCurrencySymbol(): string {
    const exchange = this.tradingLogForm.get('Exchange')?.value;
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

  onSubmit(): void {
    if (this.tradingLogForm.valid) {
      const formValue = this.tradingLogForm.value;
      const payload = {
        ...formValue,
        'Buy Date': formValue['Buy Date'],
        'Buy Price': parseFloat(formValue['Buy Price']),
        Qty: parseInt(formValue.Qty),
        CMP: formValue.CMP ? parseFloat(formValue.CMP) : null,
        'Target Price': parseFloat(formValue['Target Price']),
      };

      if (this.formType === 'add') {
        this.createTrade(payload);
      } else {
        payload.rowIndex = this.rowIndex;
        this.updateTrade(payload);
      }
    }
  }

  createTrade(payload: any): void {
    this.loaderService.show();
    this.googleSheetService.createTradingLog(payload).subscribe({
      next: (response) => {
        this.snackBar.open(
          response.message || 'Trading log created successfully',
          '',
          { duration: 3000 }
        );
        this.goBack();
      },
      error: (error) => {
        console.error('Error creating trading log:', error);
        this.snackBar.open('Error creating trading log. Please try again.', '', {
          duration: 3000,
        });
      },
      complete: () => {
        this.loaderService.hide();
      },
    });
  }

  updateTrade(payload: any): void {
    this.loaderService.show();
    this.googleSheetService.updateTradingLog(payload).subscribe({
      next: (response) => {
        this.snackBar.open(
          response.message || 'Trading log updated successfully',
          '',
          { duration: 3000 }
        );
        this.goBack();
      },
      error: (error) => {
        console.error('Error updating trading log:', error);
        this.snackBar.open('Error updating trading log. Please try again.', '', {
          duration: 3000,
        });
      },
      complete: () => {
        this.loaderService.hide();
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/trading-log']);
  }
}
