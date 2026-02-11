import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { ExpenseTrackerComponent } from './expense-tracker/expense-tracker.component';
import { ShoppingListComponent } from './shopping-list/shopping-list.component';
import { MonthlyTransactionListComponent } from './expense-tracker/monthly-transaction-list/monthly-transaction-list.component';
import { TransactionFormComponent } from './expense-tracker/transaction-form/transaction-form.component';
import { BudgetManagementComponent } from './expense-tracker/budget-management/budget-management.component';
import { AuthGuard } from './shared/services/auth.guard';
import { TicTacToeComponent } from './tic-tac-toe/tic-tac-toe.component';
import { DietComponent } from './diet/diet.component';
import { TradingLogComponent } from './trading-log/trading-log.component';
import { TradingLogListComponent } from './trading-log/trading-log-list/trading-log-list.component';
import { TradingLogFormComponent } from './trading-log/trading-log-form/trading-log-form.component';
import { ProfitBookingFormComponent } from './trading-log/profit-booking-form/profit-booking-form.component';

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
        path: 'budget',
        component: BudgetManagementComponent,
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
    path: 'tic-tac-toe',
    component: TicTacToeComponent,
  },
  {
    path: 'diet',
    component: DietComponent,
  },
  {
    path: 'trading-log',
    canActivate: [AuthGuard],
    component: TradingLogComponent,
    children: [
      {
        path: '',
        component: TradingLogListComponent,
      },
      {
        path: 'add',
        component: TradingLogFormComponent,
      },
      {
        path: 'edit/:id',
        component: TradingLogFormComponent,
      },
      {
        path: 'profit-booking',
        component: ProfitBookingFormComponent,
      },
    ],
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
];
