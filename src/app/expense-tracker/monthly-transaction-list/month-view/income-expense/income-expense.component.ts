import { Component, Input, OnInit } from '@angular/core';
import { ITransaction } from '../../../interfaces/transaction';
import { CommonModule, NgIf } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'tracker-income-expense',
  standalone: true,
  imports: [CommonModule, MatListModule, MatDividerModule, MatCardModule, NgIf],
  templateUrl: './income-expense.component.html',
  styleUrl: './income-expense.component.scss',
})
export class IncomeExpenseComponent implements OnInit {
  @Input()
  transactions: ITransaction[] | undefined;

  totalExpense: number = 0;
  totalIncome: number = 0;

  ngOnInit(): void {
    this.transactions?.forEach((transaction) => {
      if (transaction.type === 'expense') {
        this.totalExpense += transaction.amount;
      } else {
        this.totalIncome += transaction.amount;
      }
    });
  }
}
