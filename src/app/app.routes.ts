import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { ExpenseTrackerComponent } from './expense-tracker/expense-tracker.component';
import { ShoppingListComponent } from './shopping-list/shopping-list.component';
import { MonthlyTransactionListComponent } from './expense-tracker/monthly-transaction-list/monthly-transaction-list.component';
import { TransactionFormComponent } from './expense-tracker/transaction-form/transaction-form.component';
import { AuthGuard } from './shared/services/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'home',
    component: HomeComponent,
  },
  {
    path: 'expense-tracker',
    canActivate: [AuthGuard],
    component: ExpenseTrackerComponent,
    children: [
      {
        path: 'transaction-list',
        component: MonthlyTransactionListComponent,
        data: { type: 'list' },
      },
      {
        path: 'add-transaction',
        component: TransactionFormComponent,
      },
      {
        path: 'transaction-report',
        component: MonthlyTransactionListComponent,
        data: { type: 'report' },
      },
      {
        path: '',
        redirectTo: 'transaction-list',
        pathMatch: 'full',
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
