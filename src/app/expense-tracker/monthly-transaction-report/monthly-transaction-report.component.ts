import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';
import { ITabInformation } from '../interfaces/tab-info';
import { TrackerService } from '../services/tracker.service';
import { BehaviorSubject, combineLatest, map, Observable, tap } from 'rxjs';
import { ITransaction } from '../interfaces/transaction';
import { PieChartComponent } from './pie-chart/pie-chart.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { MatExpansionModule } from '@angular/material/expansion';
import { LineChartComponent } from './line-chart/line-chart.component';
import { MatCardModule } from '@angular/material/card';

import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { environment } from '../../environments/environment';
import { logger } from '../../shared/utils/logger.util';

const CURRENCY_SYMBOL = environment.currencySymbol;
export interface IPieChartData {
  name: string;
  value: number | undefined;
}

export interface IFinancialSummary {
  totalIncome: number;
  totalExpense: number;
  totalTransfer: number;
  totalRefund: number;
  netAmount: number;
  transactionCount: number;
  expenseCount: number;
  incomeCount: number;
}
@Component({
  selector: 'tracker-monthly-transaction-report',
  standalone: true,
  imports: [
    RouterModule,
    FormsModule,
    MatButtonModule,
    MatInputModule,
    MatTabsModule,
    CommonModule,
    PieChartComponent,
    LineChartComponent,
    MatExpansionModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
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
  incomeCategoryData: IPieChartData[] = [];
  incomeExpenseLineData: IPieChartData[] = [];
  panelOpenState: boolean = true;
  canShowSpinner: boolean = false;
  showRent: boolean = false;

  // Financial summary data
  financialSummary: IFinancialSummary = {
    totalIncome: 0,
    totalExpense: 0,
    totalTransfer: 0,
    totalRefund: 0,
    netAmount: 0,
    transactionCount: 0,
    expenseCount: 0,
    incomeCount: 0
  };

  private toggleShowRent = new BehaviorSubject<boolean>(false);
  toggleShowRent$ = this.toggleShowRent.asObservable().pipe();
  transactions$!: Observable<ITransaction[]>;

  constructor(private trackerService: TrackerService) {}

  ngOnChanges(changes: SimpleChanges): void {
    const { month, year } = this.monthDetail;
    this.canShowSpinner = true;
    this.transactionsOftheMonth = [];
    this.transactions$ =
      this.trackerService.allTransactionsWithCategories$.pipe(
        map((data) =>
          data
            .filter((el) => {
              let dataOfTr = new Date(el.date);
              return (
                month === dataOfTr.getMonth() && year == dataOfTr.getFullYear()
              );
            })
            .sort((a, b) => {
              let aDate = new Date(a.date);
              let bDate = new Date(b.date);
              return bDate.getTime() - aDate.getTime();
            })
        )
      );
    this.cancellableSubscriptions['allTransactionWithCatSubs'] = combineLatest(
      this.transactions$,
      this.toggleShowRent$
    ).subscribe(([data, showRent]) => {
      this.transactionsOftheMonth = showRent
        ? data
        : data.filter((tran) => tran.category !== 'rent');
      this.processData(this.transactionsOftheMonth);
    });
  }

  processData(transactionsOftheMonth: ITransaction[]) {
    if (!transactionsOftheMonth || transactionsOftheMonth.length === 0) {
      this.resetFinancialData();
      this.canShowSpinner = false;
      return;
    }

    // Reset financial data
    this.resetFinancialData();

    // Initialize category maps for expenses and income
    const expenseCategoryMap: Map<string, number> = new Map<string, number>();
    const incomeCategoryMap: Map<string, number> = new Map<string, number>();

    // Process each transaction with proper type classification
    transactionsOftheMonth.forEach((transaction) => {
      const amount = Math.abs(transaction.amount); // Ensure positive amount for calculations

      switch (transaction.type?.toLowerCase()) {
        case 'expense':
          this.financialSummary.totalExpense += amount;
          this.financialSummary.expenseCount++;
          // Add to expense category map
          expenseCategoryMap.set(
            transaction.category,
            (expenseCategoryMap.get(transaction.category) ?? 0) + amount
          );
          break;

        case 'income':
          this.financialSummary.totalIncome += amount;
          this.financialSummary.incomeCount++;
          // Add to income category map
          incomeCategoryMap.set(
            transaction.category,
            (incomeCategoryMap.get(transaction.category) ?? 0) + amount
          );
          break;

        case 'transfer':
          this.financialSummary.totalTransfer += amount;
          break;

        case 'refund':
          this.financialSummary.totalRefund += amount;
          break;

        default:
          // Log unknown transaction types for debugging
          logger.warn(`⚠️ Unknown transaction type: ${transaction.type} for transaction ID: ${transaction.id}`);
          // Default to expense if type is unknown
          this.financialSummary.totalExpense += amount;
          this.financialSummary.expenseCount++;
          expenseCategoryMap.set(
            transaction.category,
            (expenseCategoryMap.get(transaction.category) ?? 0) + amount
          );
          break;
      }

      this.financialSummary.transactionCount++;
    });

    // Calculate net amount
    this.financialSummary.netAmount = this.financialSummary.totalIncome - this.financialSummary.totalExpense;

    // Prepare expense category data for charts
    this.categoryData = [...expenseCategoryMap.keys()].map((category) => ({
      name: category.toUpperCase(),
      value: expenseCategoryMap.get(category),
    }));

    // Prepare income category data for charts
    this.incomeCategoryData = [...incomeCategoryMap.keys()].map((category) => ({
      name: category.toUpperCase(),
      value: incomeCategoryMap.get(category),
    }));

    // Prepare income vs expense line chart data
    this.incomeExpenseLineData = [
      {
        name: 'Income',
        value: this.financialSummary.totalIncome
      },
      {
        name: 'Expenses',
        value: this.financialSummary.totalExpense
      },
      {
        name: 'Net Amount',
        value: this.financialSummary.netAmount
      }
    ];

    // Log calculation results for debugging
    logger.log('📊 Monthly Transaction Report Calculation:', {
      month: this.monthDetail,
      financialSummary: this.financialSummary,
      expenseCategories: this.categoryData.length,
      incomeCategories: this.incomeCategoryData.length,
      incomeExpenseLineData: this.incomeExpenseLineData,
      totalTransactions: transactionsOftheMonth.length
    });

    this.canShowSpinner = false;
  }

  private resetFinancialData(): void {
    this.financialSummary = {
      totalIncome: 0,
      totalExpense: 0,
      totalTransfer: 0,
      totalRefund: 0,
      netAmount: 0,
      transactionCount: 0,
      expenseCount: 0,
      incomeCount: 0
    };
    this.categoryData = [];
    this.incomeCategoryData = [];
    this.incomeExpenseLineData = [];
  }

  // Helper method to get formatted amounts
  getFormattedAmount(amount: number): string {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(amount);
  }

  onShowRentChange($event: any) {
    $event ? this.toggleShowRent.next(true) : this.toggleShowRent.next(false);
  }

  deleteTransaction(transaction: ITransaction) {}
}
