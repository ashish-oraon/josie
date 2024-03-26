import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HighlightDirective } from '../../shared/highlight.directive';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-monthly-transaction-report',
  standalone: true,
  imports: [
    RouterModule,
    HighlightDirective,
    FormsModule,
    MatButtonModule,
    MatInputModule,
  ],
  templateUrl: './monthly-transaction-report.component.html',
  styleUrl: './monthly-transaction-report.component.scss',
})
export class MonthlyTransactionReportComponent {
  searchTerm: string = 'blue';
  index: number = 0;
  acc: string = '';
  findPrev() {
    this.acc = 'prev';
  }
  findNext() {
    this.acc = 'next';
  }
  find() {
    throw new Error('Method not implemented.');
  }
  constructor(private router: Router, private route: ActivatedRoute) {}
  handelClick() {
    this.router.navigate(['../transaction-list'], { relativeTo: this.route });
  }
}
