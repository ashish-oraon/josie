import { Component, OnInit } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import { TrackerService } from '../services/tracker.service';
import { CommonModule } from '@angular/common';
import { MonthViewComponent } from './month-view/month-view.component';

@Component({
  selector: 'app-monthly-transaction-list',
  standalone: true,
  imports: [MatTabsModule, RouterModule, CommonModule, MonthViewComponent],
  templateUrl: './monthly-transaction-list.component.html',
  styleUrl: './monthly-transaction-list.component.scss',
})
export class MonthlyTransactionListComponent implements OnInit {
  links: string[] = [];
  background: ThemePalette = 'primary';
  activeLink: any;
  tabs: any[] = [];
  selectedTab: number = 0;
  triggerBoolean: any = { val: true };
  constructor(private trackerService: TrackerService) {}

  ngOnInit(): void {
    this.links = ['month-view', 'qweqwe'];

    this.tabs = this.trackerService.asyncTabs();
    this.activeLink = this.tabs[1];
  }

  handleOutput(pa: any) {
    this.triggerBoolean = { val: false };
  }
}
