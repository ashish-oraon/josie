import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Observable } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { LoaderService } from '../shared/loader.service';
import { MatDialog } from '@angular/material/dialog';
import { TransactionFormComponent } from './transaction-form/transaction-form.component';

@Component({
  selector: 'app-expense-tracker',
  standalone: true,
  imports: [
    RouterModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    CommonModule,
  ],
  templateUrl: './expense-tracker.component.html',
  styleUrl: './expense-tracker.component.scss',
})
export class ExpenseTrackerComponent {
  isLoading$: Observable<boolean>;
  constructor(private loaderService: LoaderService, public dialog: MatDialog) {
    this.isLoading$ = this.loaderService.isLoading$;
  }

  addTransaction() {
    const dialogRef = this.dialog.open(TransactionFormComponent, {
      data: { type: 'Edit Transaction' },
    });

    dialogRef.afterClosed().subscribe((result) => {
    });
  }
}
