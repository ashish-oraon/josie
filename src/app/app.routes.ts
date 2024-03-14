import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { ExpenseTrackerComponent } from './expense-tracker/expense-tracker.component';
import { ShoppingListComponent } from './shopping-list/shopping-list.component';
import { MonthlyTransactionListComponent } from './expense-tracker/monthly-transaction-list/monthly-transaction-list.component';
import { MonthlyTransactionReportComponent } from './expense-tracker/monthly-transaction-report/monthly-transaction-report.component';
import { TransactionFormComponent } from './expense-tracker/transaction-form/transaction-form.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'home',
    component: HomeComponent,
  },

  { path: 'month-view', component: ExpenseTrackerComponent },
  {
    path: 'expense-tracker',
    component: ExpenseTrackerComponent,
    children: [
      {
        path: 'transaction-list',
        component: MonthlyTransactionListComponent,
      },
      {
        path: 'add-transaction',
        component: TransactionFormComponent,
      },
      {
        path: 'transaction-report',
        component: MonthlyTransactionReportComponent,
      },
    ],
  },
  {
    path: 'shopping-list',
    component: ShoppingListComponent,
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
];
