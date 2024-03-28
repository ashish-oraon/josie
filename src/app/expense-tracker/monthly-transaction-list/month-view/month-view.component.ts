import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { ITabInformation } from '../../interfaces/tab-info';
import { CommonModule } from '@angular/common';
import { TrackerService } from '../../services/tracker.service';
import { ITransaction } from '../../interfaces/transaction';
import { map, tap } from 'rxjs';
import { DayCardComponent } from './day-card/day-card.component';
import { LoaderService } from '../../../shared/loader.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { DialogConfirmationComponent } from '../../../shared/component/dialog-confirmation/dialog-confirmation.component';
import { CommonService } from '../../../shared/common.service';
import { IncomeExpenseComponent } from './income-expense/income-expense.component';

@Component({
  selector: 'month-view',
  standalone: true,
  imports: [
    CommonModule,
    DayCardComponent,
    MatProgressSpinnerModule,
    IncomeExpenseComponent,
  ],
  templateUrl: './month-view.component.html',
  styleUrl: './month-view.component.scss',
})
export class MonthViewComponent implements OnChanges {
  @Input()
  monthDetail!: ITabInformation;
  @Input()
  triggerChange!: any;

  @Output() mEvent = new EventEmitter<any>();

  transactionsOftheMonth: ITransaction[] = [];
  datesInTheMonth: string[] = [];
  transactionMap: Map<string, ITransaction[]> = new Map<
    string,
    ITransaction[]
  >();
  public cancellableSubscriptions: any = {};

  canShowSpinner: boolean = true;

  // transactionsOfTheMonth =

  constructor(
    private trackerService: TrackerService,
    private Loader: LoaderService,
    public dialog: MatDialog,
    private commonService: CommonService
  ) {}
  ngOnChanges(changes: SimpleChanges): void {
    this.transactionsOftheMonth = [];
    this.transactionMap.clear();
    this.datesInTheMonth = [];
    this.canShowSpinner = true;
    const { month, year } = this.monthDetail;

    this.cancellableSubscriptions['allTransactionWithCatSubs'] =
      this.trackerService.allTransactionsWithCategories$
        .pipe(
          map((data) =>
            data
              .filter((el) => {
                let dataOfTr = new Date(el.date);
                return (
                  month === dataOfTr.getMonth() &&
                  year == dataOfTr.getFullYear()
                );
              })
              .sort((a, b) => {
                let aDate = new Date(a.date);
                let bDate = new Date(b.date);
                return bDate.getTime() - aDate.getTime();
              })
          )
        )
        .subscribe(
          (data) => {
            this.transactionsOftheMonth = data;
            this.processData(this.transactionsOftheMonth);
          },
          () => {},
          () => this.Loader.hide()
        );
  }
  processData(transactionsOftheMonth: ITransaction[]) {
    let sum: number = 0;
    let dateSet: Set<string> = new Set<string>();
    this.transactionMap.clear();
    this.datesInTheMonth = [];

    for (let tr of transactionsOftheMonth) {
      sum += +tr.amount;
      if (!dateSet.has(tr.date)) {
        dateSet.add(tr.date);
      }
      const existingTransactions = this.transactionMap.get(tr.date) || [];
      existingTransactions.push(tr);
      this.transactionMap.set(tr.date, existingTransactions);
      this.datesInTheMonth = Array.from(dateSet);
    }
    this.canShowSpinner = false;
  }

  deleteTransaction(transaction: ITransaction) {
    this.Loader.show();
  }

  handleDayEvent($event: any) {
    const { action, data } = $event;
    if (action === 'delete') {
      this.showDialog(data.transaction);
    }
  }

  showDialog(transaction: ITransaction): void {
    this.dialog
      .open(DialogConfirmationComponent, {
        data: `Are you sure?`,
      })
      .afterClosed()
      .subscribe((confirmation: boolean) => {
        if (confirmation) {
          this.transactionsOftheMonth = [];
          this.transactionMap.clear();
          this.datesInTheMonth = [];
          this.canShowSpinner = true;
          this.trackerService
            .deleteTransaction(transaction, transaction.id)
            .subscribe(
              (data) => {
                this.commonService.openSnackBar(data.message, '');
              },
              (error) => console.error(error.message),
              () => {
                this.mEvent.emit();
              }
            );
        }
      });
  }
}
