import { Component, OnInit } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-monthly-transaction-list',
  standalone: true,
  imports: [MatTabsModule,RouterModule],
  templateUrl: './monthly-transaction-list.component.html',
  styleUrl: './monthly-transaction-list.component.scss',
})
export class MonthlyTransactionListComponent implements OnInit {
  links: string[] = [];
  background: ThemePalette = 'primary';
  activeLink: any;
  constructor() {}
  ngOnInit(): void {
    this.links = ['month-view','qweqwe'];
  }
}
