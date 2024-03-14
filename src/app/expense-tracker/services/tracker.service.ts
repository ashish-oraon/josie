import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  combineLatest,
  distinct,
  map,
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
  transactions: Observable<ITransaction[]>;
  allCategories: Observable<ICategory[]>;
  transactionsDates: Observable<{ date: string; total: number }[]>;
  allTransactionsWithCategories$: Observable<ITransaction[]>;

  selectTransactionAction: BehaviorSubject<any> = new BehaviorSubject(
    'May-2023'
  );
  selectedTab: Observable<any> = this.selectTransactionAction
    .asObservable()
    .pipe(shareReplay(1));

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
    this.transactions = this.googleSheetsService
      .readData('readTransactions', this.sheet)
      .pipe(
        tap((data) => console.log('data base call triggered')),
        map((arr: { data: any[]; length: number }) => {
          return arr.data.filter((el) => !el.isDeleted);
        })
      );

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
      )
    );

    this.allCategories = this.commonService.allCategories$;

    this.allTransactionsWithCategories$ = combineLatest([
      this.transactions,
      this.allCategories,
    ]).pipe(
      map(([transactions, allCat]) => {
        return transactions?.map((transaction) => {
          let categorySelected = allCat?.find(
            (cat) => cat.name === transaction.category
          );
          return { ...transaction, icon: categorySelected?.icon };
        });
      })
    );
  }

  getTransactionWithID(sheet: string = 'TJune-2023', id?: number) {
    return this.googleSheetsService.readData(
      'readSingleTransaction',
      sheet,
      id
    );
  }
  getTotal(date: string, objArr: ITransaction[]): number {
    return objArr.reduce((a, c) => (a += c.date === date ? c.amount : 0), 0);
  }

  updateTransaction(data: any, id: number) {
    return this.googleSheetsService.updateData(data, id, data.sheetName);
  }
  deleteTransaction(data: any, id: number) {
    return this.googleSheetsService.deleteData(id, data.sheetName);
  }

  parseDate(date: Date): string {
    return this.commonService.parseDate(date);
  }

  getTransactionsFormSheet(
    type: string = 'readTransactions',
    sheet: string = 'June-2023',
    id?: number
  ) {
    return this.googleSheetsService
      .readData('readSingleTransaction', sheet)
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
              })
            )
            .filter((el) => !el.isDeleted);
        }),
        shareReplay(1)
      );
  }

  subtractMonths(date: Date, months: number) {
    // 👇 Make copy with "Date" constructor
    const dateCopy = new Date(date);

    dateCopy.setMonth(dateCopy.getMonth() - months);

    return dateCopy;
  }
}
