import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TrackerService } from '../services/tracker.service';
import { IBudget } from '../interfaces/budget';
import { ICategory } from '../interfaces/category';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { logger } from '../../shared/utils/logger.util';
@Component({
  selector: 'app-budget-management',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './budget-management.component.html',
  styleUrl: './budget-management.component.scss'
})
export class BudgetManagementComponent implements OnInit {
  budgets: IBudget[] = [];
  budgetSummary: any;
  categories: ICategory[] = [];
  displayedColumns: string[] = ['category', 'planned', 'actual', 'variance', 'status', 'progress', 'actions'];

  // Form data for new budget
  newBudget = {
    category: '',
    planned: 0
  };

  // Current month
  currentMonth: string = '';

  // Loading states
  isLoading = false;
  isAddingBudget = false;

  constructor(private trackerService: TrackerService) {}

  ngOnInit() {
    this.currentMonth = this.getCurrentMonth();
    this.loadBudgets();
    this.loadCategories();

    // Add sample data for demonstration until backend is ready
    this.addSampleData();
  }

  addSampleData() {
    // Sample budget data for demonstration
    this.budgets = [
      {
        Month: this.currentMonth,
        Category: 'Groceries',
        Planned: 300,
        Actual: 280,
        Variance: 20,
        Status: 'under',
        LastUpdated: new Date().toISOString()
      },
      {
        Month: this.currentMonth,
        Category: 'Transportation',
        Planned: 150,
        Actual: 165,
        Variance: -15,
        Status: 'over',
        LastUpdated: new Date().toISOString()
      },
      {
        Month: this.currentMonth,
        Category: 'Entertainment',
        Planned: 100,
        Actual: 75,
        Variance: 25,
        Status: 'under',
        LastUpdated: new Date().toISOString()
      }
    ];

    // Sample categories for demonstration
    this.categories = [
      {
        id: 1,
        name: 'Groceries',
        subType: 'Food',
        type: 'Expense',
        icon: 'shopping_cart',
        isDeleted: false,
        color: '#4CAF50'
      },
      {
        id: 2,
        name: 'Transportation',
        subType: 'Travel',
        type: 'Expense',
        icon: 'directions_car',
        isDeleted: false,
        color: '#2196F3'
      },
      {
        id: 3,
        name: 'Entertainment',
        subType: 'Leisure',
        type: 'Expense',
        icon: 'movie',
        isDeleted: false,
        color: '#FF9800'
      },
      {
        id: 4,
        name: 'Utilities',
        subType: 'Home',
        type: 'Expense',
        icon: 'home',
        isDeleted: false,
        color: '#9C27B0'
      },
      {
        id: 5,
        name: 'Healthcare',
        subType: 'Medical',
        type: 'Expense',
        icon: 'local_hospital',
        isDeleted: false,
        color: '#F44336'
      }
    ];
  }

  loadBudgets() {
    this.isLoading = true;
    this.trackerService.budgetSummary$.subscribe({
      next: (summary) => {
        logger.log('Budget summary received:', summary);
        // Ensure budgets is always an array
        this.budgets = Array.isArray(summary) ? summary : [];
        logger.log('Processed budgets:', this.budgets);
        this.isLoading = false;
      },
      error: (error) => {
        logger.error('Error loading budgets:', error);
        this.budgets = []; // Set empty array on error
        this.isLoading = false;
      }
    });
  }

  loadCategories() {
    this.trackerService.getCategories().subscribe({
      next: (categories) => {
        logger.log('Raw categories received:', categories);
        this.categories = categories.filter(cat => !cat.isDeleted);
        logger.log('Filtered categories:', this.categories);
        logger.log('First category sample:', this.categories[0]);
      },
      error: (error) => {
        logger.error('Error loading categories:', error);
      }
    });
  }

  getCurrentMonth(): string {
    const date = new Date();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    return `${monthNames[date.getMonth()]}-${date.getFullYear()}`;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'under': return 'primary';
      case 'over': return 'warn';
      case 'on_track': return 'accent';
      default: return 'primary';
    }
  }

  getProgressValue(planned: number, actual: number): number {
    if (planned === 0) return 0;
    return Math.min((actual / planned) * 100, 100);
  }

  getProgressColor(planned: number, actual: number): string {
    const percentage = this.getProgressValue(planned, actual);
    if (percentage >= 90) return 'warn';
    if (percentage >= 75) return 'accent';
    return 'primary';
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'under': return 'trending_down';
      case 'over': return 'trending_up';
      case 'on_track': return 'check_circle';
      default: return 'help';
    }
  }

  addBudget() {
    if (!this.newBudget.category || this.newBudget.planned <= 0) {
      return;
    }

    this.isAddingBudget = true;
    const budget: IBudget = {
      Month: this.currentMonth,
      Category: this.newBudget.category,
      Planned: this.newBudget.planned,
      Actual: 0,
      Variance: this.newBudget.planned,
      Status: 'under',
      LastUpdated: new Date().toISOString()
    };

    this.trackerService.createBudget(budget).subscribe({
      next: (result) => {
        logger.log('Budget created:', result);
        this.newBudget = { category: '', planned: 0 };
        this.loadBudgets(); // Reload budgets
        this.isAddingBudget = false;
      },
      error: (error) => {
        logger.error('Error creating budget:', error);
        this.isAddingBudget = false;
      }
    });
  }

  updateBudget(budget: IBudget) {
    this.trackerService.updateBudget(budget).subscribe({
      next: (result) => {
        logger.log('Budget updated:', result);
        this.loadBudgets(); // Reload budgets
      },
      error: (error) => {
        logger.error('Error updating budget:', error);
      }
    });
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

  getTotalPlanned(): number {
    if (!Array.isArray(this.budgets)) {
      logger.warn('budgets is not an array:', this.budgets);
      return 0;
    }
    return this.budgets.reduce((sum, budget) => sum + budget.Planned, 0);
  }

  getTotalActual(): number {
    if (!Array.isArray(this.budgets)) {
      logger.warn('budgets is not an array:', this.budgets);
      return 0;
    }
    return this.budgets.reduce((sum, budget) => sum + budget.Actual, 0);
  }

  getTotalVariance(): number {
    if (!Array.isArray(this.budgets)) {
      logger.warn('budgets is not an array:', this.budgets);
      return 0;
    }
    return this.getTotalPlanned() - this.getTotalActual();
  }

  getOverallStatus(): string {
    const variance = this.getTotalVariance();
    return variance >= 0 ? 'under' : 'over';
  }
}
