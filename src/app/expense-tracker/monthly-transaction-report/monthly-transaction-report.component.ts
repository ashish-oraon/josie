import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HighlightDirective } from '../../shared/highlight.directive';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';
import { ITabInformation } from '../interfaces/tab-info';
import { TrackerService } from '../services/tracker.service';
import { map, tap } from 'rxjs';
import { ITransaction } from '../interfaces/transaction';
import { PieChartComponent } from './pie-chart/pie-chart.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { MatExpansionModule } from '@angular/material/expansion';
import { LineChartComponent } from './line-chart/line-chart.component';

export interface IPieChartData {
  name: string;
  value: number | undefined;
}
@Component({
  selector: 'tracker-monthly-transaction-report',
  standalone: true,
  imports: [
    RouterModule,
    HighlightDirective,
    FormsModule,
    MatButtonModule,
    MatInputModule,
    MatTabsModule,
    CommonModule,
    PieChartComponent,
    LineChartComponent,
    MatExpansionModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './monthly-transaction-report.component.html',
  styleUrl: './monthly-transaction-report.component.scss',
})
export class MonthlyTransactionReportComponent implements OnChanges {
  @Input()
  monthDetail!: ITabInformation;

  public cancellableSubscriptions: any = {};
  transactionsOftheMonth: ITransaction[] = [];
  categoryData: IPieChartData[] = [];
  panelOpenState: boolean = true;
  canShowSpinner: boolean = false;

  constructor(private trackerService: TrackerService) {}

  ngOnChanges(changes: SimpleChanges): void {
    const { month, year } = this.monthDetail;
    this.canShowSpinner = true;
    this.transactionsOftheMonth = [];

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
          () => {}
        );
  }

  processData(transactionsOftheMonth: ITransaction[]) {
    const expensesOfTheMonth: ITransaction[] = transactionsOftheMonth.filter(
      (tran) => tran.type === 'expense'
    );
    let sum: number = 0;
    // let dateSet: Set<string> = new Set<string>();
    let categoryMap: Map<string, number> = new Map<string, number>();
    // graphData: graphModel[] = []
    for (let tr of expensesOfTheMonth) {
      categoryMap.set(
        tr.category,
        categoryMap.get(tr.category) ?? 0 + tr.amount
      );
    }
    this.categoryData = [...categoryMap.keys()].map((k) => ({
      name: k.toUpperCase(),
      value: categoryMap.get(k),
    }));

    this.canShowSpinner = false;
  }

  deleteTransaction(transaction: ITransaction) {}
}
