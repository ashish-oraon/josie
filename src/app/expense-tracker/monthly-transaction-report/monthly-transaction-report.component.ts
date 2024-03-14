import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-monthly-transaction-report',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './monthly-transaction-report.component.html',
  styleUrl: './monthly-transaction-report.component.scss',
})
export class MonthlyTransactionReportComponent {
  constructor(private router: Router, private route: ActivatedRoute) {}
  handelClick() {
    this.router.navigate(['../transaction-list'], { relativeTo: this.route });
  }
}
