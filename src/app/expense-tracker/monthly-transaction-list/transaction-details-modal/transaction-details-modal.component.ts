import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ITransaction } from '../../interfaces/transaction';
import { ICategory } from '../../interfaces/category';
import { TrackerService } from '../../services/tracker.service';

@Component({
  selector: 'app-transaction-details-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatListModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './transaction-details-modal.component.html',
  styleUrl: './transaction-details-modal.component.scss'
})
export class TransactionDetailsModalComponent {
  transaction: ITransaction;
  categories: ICategory[] = [];
  isEditing = false;
  editForm: any = {};

  // Payment method icons mapping
  paymentMethodIcons: { [key: string]: string } = {
    'cash': 'payments',
    'card': 'credit_card',
    'bank_transfer': 'account_balance',
    'paypal': 'payment',
    'mobile_payment': 'smartphone',
    'check': 'receipt',
    'other': 'more_horiz'
  };

  // Transaction type icons mapping
  transactionTypeIcons: { [key: string]: string } = {
    'expense': 'trending_down',
    'income': 'trending_up',
    'transfer': 'swap_horiz',
    'refund': 'undo'
  };

  constructor(
    public dialogRef: MatDialogRef<TransactionDetailsModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { transaction: ITransaction },
    private trackerService: TrackerService
  ) {
    this.transaction = data.transaction;
    this.loadCategories();
    this.initializeEditForm();
  }

  loadCategories() {
    this.trackerService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories.filter(cat => !cat.isDeleted);
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  initializeEditForm() {
    this.editForm = {
      amount: this.transaction.amount,
      category: this.transaction.category,
      note: this.transaction.note,
      date: this.transaction.date,
      paymentMethod: this.transaction.paymentMethod,
      paidBy: this.transaction.paidBy,
      type: this.transaction.type
    };
  }

  getPaymentMethodIcon(method: string): string {
    return this.paymentMethodIcons[method.toLowerCase()] || 'payment';
  }

  getTransactionTypeIcon(type: string): string {
    return this.transactionTypeIcons[type.toLowerCase()] || 'help';
  }

  getCategoryIcon(categoryName: string): string {
    const category = this.categories.find(cat => cat.name === categoryName);
    return category?.icon || 'category';
  }

  getCategoryColor(categoryName: string): string {
    const category = this.categories.find(cat => cat.name === categoryName);
    return category?.color || '#757575';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('de-DE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.initializeEditForm(); // Reset form when canceling edit
    }
  }

  saveChanges() {
    // Update the transaction object
    Object.assign(this.transaction, this.editForm);

    // Call the service to update
    this.trackerService.updateTransaction(this.transaction, this.transaction.id).subscribe({
      next: (result) => {
        console.log('Transaction updated:', result);
        this.isEditing = false;
        // Emit event to refresh parent component
        this.dialogRef.close({ action: 'updated', transaction: this.transaction });
      },
      error: (error) => {
        console.error('Error updating transaction:', error);
      }
    });
  }

  deleteTransaction() {
    if (confirm('Are you sure you want to delete this transaction?')) {
      this.trackerService.deleteTransaction(this.transaction, this.transaction.id).subscribe({
        next: (result) => {
          console.log('Transaction deleted:', result);
          this.dialogRef.close({ action: 'deleted', transaction: this.transaction });
        },
        error: (error) => {
          console.error('Error deleting transaction:', error);
        }
      });
    }
  }

  close() {
    this.dialogRef.close();
  }

  getTransactionStatus(): { status: string; color: string; icon: string } {
    if (this.transaction.type === 'income') {
      return { status: 'Income', color: 'success', icon: 'trending_up' };
    } else if (this.transaction.type === 'expense') {
      return { status: 'Expense', color: 'warn', icon: 'trending_down' };
    } else if (this.transaction.type === 'transfer') {
      return { status: 'Transfer', color: 'primary', icon: 'swap_horiz' };
    } else {
      return { status: 'Other', color: 'accent', icon: 'help' };
    }
  }
}
