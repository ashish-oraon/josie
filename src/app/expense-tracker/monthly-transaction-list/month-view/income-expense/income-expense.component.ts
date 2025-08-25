import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
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
export class IncomeExpenseComponent implements OnInit, OnChanges {
  @Input()
  transactions: ITransaction[] | undefined;

  totalExpense: number = 0;
  totalIncome: number = 0;
  totalTransfer: number = 0;
  totalRefund: number = 0;
  netAmount: number = 0;

  ngOnInit(): void {
    this.calculateTotals();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['transactions'] && changes['transactions'].currentValue) {
      this.calculateTotals();
    }
  }

  private calculateTotals(): void {
    // Reset totals
    this.totalExpense = 0;
    this.totalIncome = 0;
    this.totalTransfer = 0;
    this.totalRefund = 0;
    this.netAmount = 0;

    if (!this.transactions || this.transactions.length === 0) {
      return;
    }

    // Calculate totals with proper type classification
    this.transactions.forEach((transaction) => {
      const amount = Math.abs(transaction.amount); // Ensure positive amount for calculations

      switch (transaction.type?.toLowerCase()) {
        case 'expense':
          this.totalExpense += amount;
          break;
        case 'income':
          this.totalIncome += amount;
          break;
        case 'transfer':
          this.totalTransfer += amount;
          break;
        case 'refund':
          this.totalRefund += amount;
          break;
        default:
          // Log unknown transaction types for debugging
          console.warn(`⚠️ Unknown transaction type: ${transaction.type} for transaction ID: ${transaction.id}`);
          // Default to expense if type is unknown
          this.totalExpense += amount;
          break;
      }
    });

    // Calculate net amount (Income - Expenses)
    this.netAmount = this.totalIncome - this.totalExpense;

    // Log calculation results for debugging
    console.log('💰 Income/Expense Calculation:', {
      totalIncome: this.totalIncome,
      totalExpense: this.totalExpense,
      totalTransfer: this.totalTransfer,
      totalRefund: this.totalRefund,
      netAmount: this.netAmount,
      transactionCount: this.transactions.length
    });
  }

  // Helper method to get formatted amounts
  getFormattedAmount(amount: number): string {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(amount);
  }
}
