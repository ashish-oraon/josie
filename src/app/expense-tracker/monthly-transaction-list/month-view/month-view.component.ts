import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { ITabInformation } from '../../interfaces/tab-info';
import { CommonModule } from '@angular/common';
import { TrackerService } from '../../services/tracker.service';
import { ITransaction } from '../../interfaces/transaction';
import { Observable, map, of, startWith, Subject, takeUntil, shareReplay, distinctUntilChanged, debounceTime } from 'rxjs';
import { DayCardComponent } from './day-card/day-card.component';
import { LoaderService } from '../../../shared/loader.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { DialogConfirmationComponent } from '../../../shared/component/dialog-confirmation/dialog-confirmation.component';
import { CommonService } from '../../../shared/common.service';
import { IncomeExpenseComponent } from './income-expense/income-expense.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-month-view',
  standalone: true,
  imports: [
    CommonModule,
    DayCardComponent,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    IncomeExpenseComponent,
  ],
  templateUrl: './month-view.component.html',
  styleUrl: './month-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MonthViewComponent implements OnChanges, OnDestroy {
  @Input()
  monthDetail!: ITabInformation;
  @Input()
  triggerChange!: unknown;

  @Output() mEvent = new EventEmitter<unknown>();

  @ViewChild('input') input!: ElementRef<HTMLInputElement>;

  transactionsOftheMonth: ITransaction[] = [];
  datesInTheMonth: string[] = [];
  transactionMap: Map<string, ITransaction[]> = new Map<
    string,
    ITransaction[]
  >();
  public cancellableSubscriptions: { [key: string]: any } = {};

  canShowSpinner: boolean = true;
  // ✅ REMOVED: isDataLoading property - no longer using global loader integration



  searchControl = new FormControl<string | ITransaction>('');
  filteredOptions!: Observable<ITransaction[]>;

  // Performance optimization properties
  private destroy$ = new Subject<void>();
  private monthCache = new Map<string, {
    transactions: ITransaction[];
    transactionMap: Map<string, ITransaction[]>;
    datesInTheMonth: string[];
    timestamp: number;
  }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private lastMonthKey: string = '';
  private performanceMetrics = {
    cacheHits: 0,
    cacheMisses: 0,
    totalLoadTime: 0,
    loadCount: 0
  };

        ngOnInit() {
    // ✅ SIMPLIFIED: Removed global loader integration, using only standalone local loader

    this.filteredOptions = this.searchControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300), // Add debounce for better performance
      distinctUntilChanged(),
      map((value) => {
        const name = typeof value === 'string' ? value : value?.note;
        return name ? this._filter(name) : this.transactionsOftheMonth.slice();
      })
    );

    // Check if monthDetail is already available on init
    if (this.monthDetail) {
      console.log('🚀 MonthDetail available on init, triggering load');
      this.triggerDataLoad();
    }
  }

  // Method to manually trigger data loading
  triggerDataLoad(): void {
    if (!this.monthDetail) {
      console.log('⏳ Cannot trigger load - monthDetail not available');
      return;
    }

    const { month, year } = this.monthDetail;
    if (month === undefined || year === undefined) {
      console.warn('⚠️ Cannot trigger load - invalid monthDetail:', this.monthDetail);
      return;
    }

    const monthKey = `${month}-${year}`;
    console.log(`🎯 Manually triggering data load for: ${monthKey}`);

    if (this.isCachedDataValid(monthKey)) {
      this.loadFromCache(monthKey);
    } else {
      // ✅ IMPROVED: Use direct loading to avoid triggering global refresh
      this.loadMonthDataDirectly(monthKey);
    }
  }

  // ✅ RESTORED: Method to force fresh data load, bypassing cache
  forceFreshDataLoad(): void {
    if (!this.monthDetail) {
      console.log('⏳ Cannot force fresh load - monthDetail not available');
      return;
    }

    const { month, year } = this.monthDetail;
    if (month === undefined || year === undefined) {
      console.warn('⚠️ Cannot force fresh load - invalid monthDetail:', this.monthDetail);
      return;
    }

    const monthKey = `${month}-${year}`;
    console.log(`🔄 Force fresh data load for: ${monthKey} (bypassing cache)`);

    // Clear this month's cache to ensure fresh data
    this.monthCache.delete(monthKey);

    // ✅ IMPROVED: Use direct loading to avoid triggering global refresh
    this.loadMonthDataDirectly(monthKey);
  }

  // ✅ NEW: Method to load data directly from service without triggering global refresh
  private loadMonthDataDirectly(monthKey: string): void {
    const startTime = performance.now();
    this.transactionsOftheMonth = [];
    this.transactionMap.clear();
    this.datesInTheMonth = [];
    this.canShowSpinner = true;
    this.lastMonthKey = monthKey;

    // Show local loader only (no global loader for direct loads)
    this.Loader.show();

    // Add timeout to prevent loader from getting stuck
    const loaderTimeout = setTimeout(() => {
      console.warn('⏰ Loader timeout reached, hiding spinner');
      this.canShowSpinner = false;
      this.Loader.hide();
      this.forceUIUpdate();
    }, 10000); // 10 second timeout

    // Unsubscribe from previous subscription
    if (this.cancellableSubscriptions['allTransactionWithCatSubs']) {
      this.cancellableSubscriptions['allTransactionWithCatSubs'].unsubscribe();
    }

    this.cancellableSubscriptions['allTransactionWithCatSubs'] =
      this.trackerService.allTransactionsWithCategories$
        .pipe(
          takeUntil(this.destroy$),
          map((data) => this.filterAndSortTransactions(data, monthKey)),
          shareReplay(1) // Cache the result for multiple subscribers
        )
        .subscribe({
          next: (data) => {
            clearTimeout(loaderTimeout); // Clear timeout on success
            this.transactionsOftheMonth = data;
            this.processData(this.transactionsOftheMonth);
            this.cacheMonthData(monthKey);

            // Track performance metrics
            const loadTime = performance.now() - startTime;
            this.performanceMetrics.totalLoadTime += loadTime;
            this.performanceMetrics.loadCount++;
            this.performanceMetrics.cacheMisses++;

            console.log(`⏱️ Month ${monthKey} loaded directly in ${loadTime.toFixed(2)}ms (Avg: ${(this.performanceMetrics.totalLoadTime / this.performanceMetrics.loadCount).toFixed(2)}ms)`);
          },
          error: (error) => {
            clearTimeout(loaderTimeout); // Clear timeout on error
            console.error('❌ Error loading month data directly:', error);
            this.canShowSpinner = false;
            this.Loader.hide();
            this.forceUIUpdate();
          },
          complete: () => {
            clearTimeout(loaderTimeout); // Clear timeout on complete
            this.Loader.hide();
            this.forceUIUpdate();
          }
        });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    // Clean up subscriptions
    Object.values(this.cancellableSubscriptions).forEach(sub => {
      if (sub && typeof sub.unsubscribe === 'function') {
        sub.unsubscribe();
      }
    });
  }

  filter($event: Event) {
    const name = this.input.nativeElement.value;
    this.filteredOptions = of(this._filter(name));
  }

  displayFn(transaction: ITransaction): string {
    return transaction?.note ? transaction.note : '';
  }

  triggerFilter($event: MatAutocompleteSelectedEvent) {
    const transaction: ITransaction = $event.option.value;
    this.filterTheMonthData(transaction);
  }

  filterTheMonthData(transaction: ITransaction) {
    const filteredTransactions = this.transactionsOftheMonth.filter(
      (tr) => tr.note === transaction.note
    );
    this.processData(filteredTransactions);
  }

  resetMonthData($event: MouseEvent) {
    $event.stopPropagation();
    $event.preventDefault();
    this.searchControl.setValue('');
    this.processData(this.transactionsOftheMonth);
  }

  private _filter(name: string): ITransaction[] {
    const filterValue = name.toLowerCase();
    return this.transactionsOftheMonth.filter((option) =>
      option.note.toLowerCase().includes(filterValue)
    );
  }

  constructor(
    private trackerService: TrackerService,
    private Loader: LoaderService,
    public dialog: MatDialog,
    private commonService: CommonService,
    private cdr: ChangeDetectorRef
  ) {}

    ngOnChanges(changes: SimpleChanges): void {
    if (!this.monthDetail) {
      console.log('⏳ Waiting for monthDetail input...');
      return;
    }

    const { month, year } = this.monthDetail;

    // Safety check for valid month/year
    if (month === undefined || year === undefined) {
      console.warn('⚠️ Invalid monthDetail:', this.monthDetail);
      return;
    }

    const monthKey = `${month}-${year}`;
    console.log(`🔄 MonthView ngOnChanges triggered for: ${monthKey}`);

    // ✅ IMPROVED: Only update service sheet if we don't have cached data
    // This prevents unnecessary backend calls when switching tabs
    const sheetName = this.commonService.getSheetName(new Date(year, month));

    // ✅ SIMPLIFIED: Removed global loader integration, using only local cache logic

    // Check if we have cached data for this month
    if (this.isCachedDataValid(monthKey)) {
      console.log(`📦 Using cached data for ${monthKey}`);
      // ✅ IMPROVED: Update sheet without triggering refresh when using cache
      this.trackerService.setSheet(sheetName, false);
      this.loadFromCache(monthKey);
      return;
    }

    // ✅ IMPROVED: Load data directly without triggering global refresh for tab switching
    console.log(`🔄 No cached data for ${monthKey}, loading fresh data directly`);
    this.trackerService.setSheet(sheetName, false); // Update sheet but don't trigger refresh
    this.loadMonthDataDirectly(monthKey); // Use direct loading method
  }

  private isCachedDataValid(monthKey: string): boolean {
    const cached = this.monthCache.get(monthKey);
    if (!cached) {
      console.log(`📦 No cache found for ${monthKey}`);
      return false;
    }

    const age = Date.now() - cached.timestamp;
    const isValid = age < this.CACHE_DURATION;

    if (isValid) {
      console.log(`📦 Cache for ${monthKey} is valid (age: ${(age / 1000).toFixed(1)}s)`);
    } else {
      console.log(`📦 Cache for ${monthKey} is expired (age: ${(age / 1000).toFixed(1)}s)`);
    }

    return isValid;
  }

  private loadFromCache(monthKey: string): void {
    const cached = this.monthCache.get(monthKey);
    if (cached) {
      this.transactionsOftheMonth = [...cached.transactions];
      this.transactionMap = new Map(cached.transactionMap);
      this.datesInTheMonth = [...cached.datesInTheMonth];
      this.canShowSpinner = false;
      this.lastMonthKey = monthKey;
      this.performanceMetrics.cacheHits++;

      // ✅ SIMPLIFIED: Ensure local loader is hidden
      this.Loader.hide();
      // No global loader to clear
      this.forceUIUpdate();

      console.log(`🚀 Loaded month ${monthKey} from cache (Cache hits: ${this.performanceMetrics.cacheHits}, Misses: ${this.performanceMetrics.cacheMisses})`);
    }
  }

  private loadMonthData(monthKey: string): void {
    const startTime = performance.now();
    this.transactionsOftheMonth = [];
    this.transactionMap.clear();
    this.datesInTheMonth = [];
    this.canShowSpinner = true;
    this.lastMonthKey = monthKey;

    // ✅ SIMPLIFIED: Show only local loader
    this.Loader.show();

    // Add timeout to prevent loader from getting stuck
    const loaderTimeout = setTimeout(() => {
      console.warn('⏰ Loader timeout reached, hiding spinner');
      this.canShowSpinner = false;
      this.Loader.hide();
      // ✅ SIMPLIFIED: No global loader to clear
      // Force change detection to update UI
      this.forceUIUpdate();
    }, 10000); // 10 second timeout

    // Unsubscribe from previous subscription
    if (this.cancellableSubscriptions['allTransactionWithCatSubs']) {
      this.cancellableSubscriptions['allTransactionWithCatSubs'].unsubscribe();
    }

    this.cancellableSubscriptions['allTransactionWithCatSubs'] =
      this.trackerService.allTransactionsWithCategories$
        .pipe(
          takeUntil(this.destroy$),
          map((data) => this.filterAndSortTransactions(data, monthKey)),
          shareReplay(1) // Cache the result for multiple subscribers
        )
        .subscribe({
          next: (data) => {
            clearTimeout(loaderTimeout); // Clear timeout on success
            this.transactionsOftheMonth = data;
            this.processData(this.transactionsOftheMonth);
            this.cacheMonthData(monthKey);

            // Track performance metrics
            const loadTime = performance.now() - startTime;
            this.performanceMetrics.totalLoadTime += loadTime;
            this.performanceMetrics.loadCount++;
            this.performanceMetrics.cacheMisses++;

            console.log(`⏱️ Month ${monthKey} loaded in ${loadTime.toFixed(2)}ms (Avg: ${(this.performanceMetrics.totalLoadTime / this.performanceMetrics.loadCount).toFixed(2)}ms)`);
          },
          error: (error) => {
            clearTimeout(loaderTimeout); // Clear timeout on error
            console.error('❌ Error loading month data:', error);
            this.canShowSpinner = false;
            this.Loader.hide();
            // ✅ SIMPLIFIED: No global loader to clear
            this.forceUIUpdate();
          },
          complete: () => {
            clearTimeout(loaderTimeout); // Clear timeout on complete
            this.Loader.hide();
            // ✅ SIMPLIFIED: No global loader to clear
            this.forceUIUpdate();
          }
        });
  }

  private filterAndSortTransactions(data: ITransaction[], monthKey: string): ITransaction[] {
    const [month, year] = monthKey.split('-').map(Number);

    return data
      .filter((el) => {
        const dataOfTr = new Date(el.date);
        return month === dataOfTr.getMonth() && year === dataOfTr.getFullYear();
      })
      .sort((a, b) => {
        const aDate = new Date(a.date);
        const bDate = new Date(b.date);
        return bDate.getTime() - aDate.getTime();
      });
  }

  private cacheMonthData(monthKey: string): void {
    this.monthCache.set(monthKey, {
      transactions: [...this.transactionsOftheMonth],
      transactionMap: new Map(this.transactionMap),
      datesInTheMonth: [...this.datesInTheMonth],
      timestamp: Date.now()
    });
    console.log(`Cached month ${monthKey} data`);
  }

    processData(transactionsOftheMonth: ITransaction[]) {
    if (!transactionsOftheMonth || transactionsOftheMonth.length === 0) {
      this.canShowSpinner = false;
      this.Loader.hide();
      // ✅ SIMPLIFIED: No global loader to clear
      this.forceUIUpdate();
      console.log('📭 No transactions found for this month');
      return;
    }

    // Use more efficient data processing
    const dateMap = new Map<string, ITransaction[]>();
    const dateSet = new Set<string>();
    // ✅ FIXED: Remove unused variable
    // let sum = 0;

    // Single loop for better performance
    for (const tr of transactionsOftheMonth) {
      // sum += +tr.amount; // ✅ REMOVED: Unused variable
      dateSet.add(tr.date);

      if (!dateMap.has(tr.date)) {
        dateMap.set(tr.date, []);
      }
      dateMap.get(tr.date)!.push(tr);
    }

    this.transactionMap = dateMap;
    this.datesInTheMonth = Array.from(dateSet).sort((a, b) =>
      new Date(b).getTime() - new Date(a).getTime()
    );
        this.canShowSpinner = false;
    this.Loader.hide();

    // ✅ SIMPLIFIED: No global loader to clear

    this.forceUIUpdate();
    console.log(`✅ Processed ${transactionsOftheMonth.length} transactions for ${this.datesInTheMonth.length} days`);
  }

  deleteTransaction(transaction: ITransaction) {
    // ✅ IMPROVED: This method is not used - delete operations are handled by the service
    // The global loader will be managed by TrackerService
    console.log('🗑️ Delete transaction called for:', transaction);
  }

  handleDayEvent($event: { action: string; data: { transaction: ITransaction } }) {
    const { action, data } = $event;
    if (action === 'delete') {
      this.showDialog(data.transaction);
    } else if (action === 'refresh') {
      // ✅ IMPROVED: Clear cache and reload data directly
      this.clearMonthCache();
      this.loadMonthDataDirectly(this.lastMonthKey);
    }
  }

  private clearMonthCache(): void {
    this.monthCache.clear();
    console.log('🗑️ Month cache cleared');
  }

    // Performance monitoring method
  getPerformanceStats(): void {
    const avgLoadTime = this.performanceMetrics.loadCount > 0
      ? this.performanceMetrics.totalLoadTime / this.performanceMetrics.loadCount
      : 0;

    const cacheHitRate = (this.performanceMetrics.cacheHits + this.performanceMetrics.cacheMisses) > 0
      ? (this.performanceMetrics.cacheHits / (this.performanceMetrics.cacheHits + this.performanceMetrics.cacheMisses) * 100).toFixed(2)
      : '0.00';

    console.log('📊 Performance Statistics:');
    console.log(`   Cache Hits: ${this.performanceMetrics.cacheHits}`);
    console.log(`   Cache Misses: ${this.performanceMetrics.cacheMisses}`);
    console.log(`   Cache Hit Rate: ${cacheHitRate}%`);
    console.log(`   Total Loads: ${this.performanceMetrics.loadCount}`);
    console.log(`   Average Load Time: ${avgLoadTime.toFixed(2)}ms`);
    console.log(`   Cache Size: ${this.monthCache.size} months`);
  }

  // Force UI update to ensure loader disappears
  private forceUIUpdate(): void {
    this.cdr.detectChanges();
    console.log('🔄 Forced change detection to update UI');
  }

  // Debug method to check current state
  debugCurrentState(): void {
    console.log('🔍 Current Component State:');
    console.log(`   canShowSpinner: ${this.canShowSpinner}`);
    console.log(`   transactionsOftheMonth.length: ${this.transactionsOftheMonth.length}`);
    console.log(`   datesInTheMonth.length: ${this.datesInTheMonth.length}`);
    console.log(`   lastMonthKey: ${this.lastMonthKey}`);
    console.log(`   monthDetail:`, this.monthDetail);

    // Check loader service state
    this.Loader.isLoading$.subscribe(loading => {
      console.log(`   LoaderService.isLoading: ${loading}`);
    }).unsubscribe();
  }

  showDialog(transaction: ITransaction): void {
    this.dialog
      .open(DialogConfirmationComponent, {
        data: `Are you sure?`,
      })
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((confirmation: boolean) => {
        if (confirmation) {
          console.log('🗑️ Delete confirmed, triggering delete operation...');

          // Don't clear local data - let the universal loader handle the loading state
          // The TrackerService will show the universal loader and handle data refresh

          this.trackerService
            .deleteTransaction(transaction, transaction.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (data) => {
                this.commonService.openSnackBar(data.message, '');
              },
              error: (error) => {
                console.error('❌ Delete error:', error.message);
                // ✅ IMPROVED: Clear global loader on error
                this.trackerService.setLoading(false);
              },
              complete: () => {
                // ✅ IMPROVED: Clear cache and reload, but don't clear global loader
                // The service will manage the refresh loader
                this.clearMonthCache();
                this.mEvent.emit();
              }
            });
        }
      });
  }
}
