import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  combineLatest,
  distinct,
  map,
  of,
  share,
  shareReplay,
  switchMap,
  take,
  takeLast,
  tap,
} from 'rxjs';
import { ITransaction } from '../interfaces/transaction';
import { environment } from '../../environments/environment';
import { GoogleSheetService } from '../../gsheet.service';
import { CommonService } from '../../shared/common.service';
import { ICategory } from '../interfaces/category';
import {
  IBudget,
  IUser,
  ISettings,
  IMonthlyStats,
} from '../interfaces/budget';

const monthNameMap: string[] = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const PREVIOUSMONTHSTOSHOW = environment.previousMonthsToShow;

@Injectable({
  providedIn: 'root',
})
export class TrackerService {
  // Properties - declare without initialization
  budgets!: Observable<IBudget[]>;
  users!: Observable<IUser[]>;
  settings!: Observable<ISettings>;
  monthlyStats!: Observable<IMonthlyStats>;

  // Budget-related observables
  budgetSummary$!: Observable<IBudget[]>;
  currentMonthBudget$!: Observable<IBudget[]>;

  // Existing properties
  transactions!: Observable<ITransaction[]>;
  allCategories!: Observable<ICategory[]>;
  transactionsDates!: Observable<{ date: string; total: number }[]>;
  allTransactionsWithCategories$!: Observable<ITransaction[]>;

  selectTransactionAction: BehaviorSubject<any> = new BehaviorSubject(
    'May-2023'
  );
  selectedTab: Observable<any> = this.selectTransactionAction
    .asObservable()
    .pipe();

  sheet: string = 'March-2024';

  asyncTabs = () => {
    const currentMonth = new Date().getMonth();
    let months = [currentMonth];

    let date = new Date();
    let tempDateArray: any[] = [];
    for (var i = 0; i < PREVIOUSMONTHSTOSHOW + 2; i++) {
      let tempD = this.subtractMonths(date, PREVIOUSMONTHSTOSHOW - i);
      tempDateArray.push({
        month: tempD.getMonth(),
        year: tempD.getFullYear(),
        date: tempD,
        header: this.commonService.getSheetName(tempD),
        sheet: this.commonService.getSheetName(tempD),
      });
    }
    return tempDateArray.sort((a, b) => b.date.getTime() - a.date.getTime());
  };

  constructor(
    private googleSheetsService: GoogleSheetService,
    private commonService: CommonService
  ) {
    this.initializeObservables();
  }

  private initializeObservables() {
    // Initialize transactions with better caching
    this.transactions = this.googleSheetsService
      .readData('readTransactions', this.sheet)
      .pipe(
        map((arr: { data: any[]; length: number }) => {
          return arr.data.filter((el) => !el.isDeleted);
        }),
        shareReplay(1) // Cache transactions for multiple subscribers
      );

    // Initialize transaction dates with caching
    this.transactionsDates = this.transactions.pipe(
      map((objArr: ITransaction[]) =>
        objArr
          .map((el: ITransaction) => {
            return { date: el.date, total: this.getTotal(el.date, objArr) };
          })
          .filter((ob, i, a) => i === a.findIndex((el) => el.date === ob.date))
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )
      ),
      shareReplay(1) // Cache transaction dates
    );

    // Initialize categories - use the existing interface with better caching
    this.allCategories = this.googleSheetsService
      .readData('readCategories')
      .pipe(
        map((data: any[]) => data.filter((cat) => !cat.isDeleted)),
        shareReplay(1) // Cache categories for multiple subscribers
      );

    // Initialize transactions with categories - optimized with better caching
    this.allTransactionsWithCategories$ = combineLatest([
      this.transactions,
      this.allCategories,
    ]).pipe(
      map(([transactions, allCat]) => {
        if (!transactions || !allCat) return [];

        // Create a category lookup map for better performance
        const categoryMap = new Map(allCat.map(cat => [cat.name, cat]));

        return transactions.map((transaction) => {
          const categorySelected = categoryMap.get(transaction.category);
          return { ...transaction, icon: categorySelected?.icon };
        });
      }),
      shareReplay(1) // Cache the combined result for multiple subscribers
    );

    // Initialize new observables - temporarily return empty arrays until backend is ready
    this.budgets = of([]).pipe(shareReplay(1));

    this.users = of([]).pipe(shareReplay(1));

    this.settings = of({
      Currency: 'EUR',
      CurrencySymbol: '€',
      PreviousMonthsToShow: 3,
      DefaultBudget: 1000,
      NotificationsEnabled: false,
      AutoCategorization: false
    } as ISettings).pipe(shareReplay(1));

    // Budget summary with actual spending - temporarily return empty array until backend is ready
    this.budgetSummary$ = of([]).pipe(shareReplay(1));

    // Monthly statistics - temporarily return empty object until backend is ready
    this.monthlyStats = of({
      month: '',
      totalExpenses: 0,
      totalIncome: 0,
      netAmount: 0,
      transactionCount: 0,
      categoryBreakdown: {}
    } as IMonthlyStats).pipe(shareReplay(1));

    // TODO: Uncomment when Google Apps Script budget endpoints are implemented
    // this.budgets = this.googleSheetsService
    //   .readData('readBudgets', this.sheet)
    //   .pipe(shareReplay(1));
    //
    // this.users = this.googleSheetsService
    //   .readData('readUsers')
    //   .pipe(shareReplay(1));
    //
    // this.settings = this.googleSheetsService
    //   .readData('readSettings')
    //   .pipe(shareReplay(1));
    //
    // this.budgetSummary$ = this.googleSheetsService
    //   .readData('readBudgetSummary', this.sheet)
    //   .pipe(shareReplay(1));
    //
    // this.monthlyStats = this.googleSheetsService
    //   .readData('readMonthlyStats', this.sheet)
    //   .pipe(shareReplay(1));
  }

  getTransactionWithID(sheet: string = 'TJune-2023', id?: number) {
    const params = id ? `${sheet}&id=${id}` : sheet;
    return this.googleSheetsService.readData(
      'readSingleTransaction',
      params
    );
  }

  getTotal(date: string, objArr: ITransaction[]): number {
    return objArr.reduce((a, c) => (a += c.date === date ? c.amount : 0), 0);
  }

  addNewTransaction(transactionDetails: ITransaction) {
    let dt: Date = new Date(transactionDetails.date);
    transactionDetails.date = this.commonService.parseDate(dt);
    const payload = {
      ...transactionDetails,
      date: this.commonService.parseDate(dt),
      sheetName: this.commonService.getSheetName(dt),
    };
    return this.googleSheetsService.createData(payload);
  }

  updateTransaction(transactionDetails: ITransaction, transactionId: number) {
    let dt: Date = new Date(transactionDetails.date);
    const payload = {
      amount: transactionDetails.amount,
      category: transactionDetails.category,
      note: transactionDetails.note,
      date: this.commonService.parseDate(dt),
      paymentMethod: transactionDetails.paymentMethod,
      paidBy: transactionDetails.paidBy,
      sheetName: this.commonService.getSheetName(dt),
    };

    return this.googleSheetsService.updateData(
      payload,
      transactionId,
      payload.sheetName
    );
  }

  deleteTransaction(transactionDetails: ITransaction, transactionId: number) {
    let dt: Date = new Date(transactionDetails.date);
    const sheetName = this.commonService.getSheetName(dt);
    return this.googleSheetsService.deleteData(transactionId, sheetName);
  }

  parseDate(date: Date): string {
    return this.commonService.parseDate(date);
  }

  getTransactionsFormSheet(
    type: string = 'readTransactions',
    sheet: string = 'June-2023',
    id?: number
  ) {
    const params = id ? `${sheet}&id=${id}` : sheet;
    return this.googleSheetsService
      .readData('readSingleTransaction', params)
      .pipe(
        take(1),
        map((arr: any[]) => {
          return arr
            .map(
              ([
                id,
                amount,
                category,
                note,
                date,
                paymentMethod,
                paidBy,
                type,
                isDeleted,
              ]) => ({
                id,
                amount,
                category,
                note,
                date,
                paymentMethod,
                paidBy,
                type,
                isDeleted,
              }))
            .filter((el) => !el.isDeleted);
        })
      );
  }

  getCategories(): Observable<ICategory[]> {
    return this.googleSheetsService.readData('readCategories').pipe(
      tap((data) => {
        console.log('Categories data from service:', data);
        if (Array.isArray(data) && data.length > 0) {
          console.log('First category from service:', data[0]);
          console.log('Category keys:', Object.keys(data[0]));
        }
      })
    );
  }

  subtractMonths(date: Date, months: number) {
    const dateCopy = new Date(date);
    dateCopy.setDate(2);
    dateCopy.setMonth(dateCopy.getMonth() - months);
    return dateCopy;
  }

  // Budget-related methods
  getMonthlyBudget(month: string): Observable<IBudget[]> {
    return this.googleSheetsService.readData('readBudgets', month);
  }

  getBudgetSummary(month: string): Observable<IBudget[]> {
    return this.googleSheetsService.readData('readBudgetSummary', month);
  }

  getMonthlyStats(month: string, category?: string): Observable<IMonthlyStats> {
    const params = category ? `${month}&category=${category}` : month;
    return this.googleSheetsService.readData('readMonthlyStats', params);
  }

  createBudget(budget: IBudget): Observable<any> {
    return this.googleSheetsService.createData({
      ...budget,
      sheetName: 'Budgets',
      action: 'createBudget',
    });
  }

  updateBudget(budget: IBudget): Observable<any> {
    // For budget updates, we need to find the row index first
    // For now, let's use a placeholder approach
    return this.googleSheetsService.createData({
      ...budget,
      sheetName: 'Budgets',
      action: 'updateBudget'
    });
  }

  // Method to check if service is ready
  isServiceReady(): boolean {
    return !!this.transactions && !!this.allCategories;
  }

  // Method to get current month tab
  getCurrentMonthTab(): any {
    const tabs = this.asyncTabs();
    return tabs && tabs.length > 0 ? tabs[0] : null;
  }

  // Method to get current month tab index
  getCurrentMonthTabIndex(): number {
    // The current month index changes based on sorting
    // We need to find it dynamically in the sorted array
    const tabs = this.asyncTabs();
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const currentIndex = tabs.findIndex(tab =>
      tab.month === currentMonth && tab.year === currentYear
    );

    console.log(`🔍 Current month (${currentMonth}, ${currentYear}) found at index: ${currentIndex}`);
    return currentIndex;
  }

  // Method to get current month tab by index
  getCurrentMonthTabByIndex(): any {
    const tabs = this.asyncTabs();
    const currentIndex = this.getCurrentMonthTabIndex();
    return currentIndex >= 0 && tabs.length > currentIndex ? tabs[currentIndex] : null;
  }
}
