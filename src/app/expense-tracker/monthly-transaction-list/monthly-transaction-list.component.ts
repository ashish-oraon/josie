import { Component, OnInit } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TrackerService } from '../services/tracker.service';
import { CommonModule } from '@angular/common';
import { MonthViewComponent } from './month-view/month-view.component';
import { MonthlyTransactionReportComponent } from '../monthly-transaction-report/monthly-transaction-report.component';

@Component({
  selector: 'app-monthly-transaction-list',
  standalone: true,
  imports: [
    MatTabsModule,
    RouterModule,
    CommonModule,
    MonthViewComponent,
    MonthlyTransactionReportComponent,
  ],
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

  locationType: string = 'list';

  constructor(
    private trackerService: TrackerService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Show loader immediately when component loads
    console.log('🚀 Monthly transaction list component loading...');
    this.trackerService.setLoading(true, 'Loading transaction list...');

    this.activatedRoute.data.subscribe(
      ({ type }) => (this.locationType = type)
    );

    this.links = ['month-view', 'qweqwe'];

    // Wait for service to be ready before generating tabs
    this.initializeTabs();
  }

  private initializeTabs(): void {
    // Check if service is ready
    if (this.trackerService.isServiceReady()) {
      this.setupTabs();
    } else {
      // Wait a bit and try again
      setTimeout(() => this.initializeTabs(), 100);
    }
  }

  private setupTabs(): void {
    // Generate tabs and set the current month as active
    this.tabs = this.trackerService.asyncTabs();

    // Fix: Set activeLink to the current month tab using the helper method
    if (this.tabs && this.tabs.length > 0) {
      // Use the service method to get the current month tab
      this.activeLink = this.trackerService.getCurrentMonthTabByIndex();
      console.log('📅 Active tab set to current month:', this.activeLink?.header);

      // Update loader message to indicate data loading is starting
      this.trackerService.setLoading(true, 'Loading transaction data...');

      // Trigger change detection - this will trigger the month-view component to load data
      this.triggerBoolean = { val: true };
    } else {
      console.warn('⚠️ No tabs generated');
      // Clear loader if no tabs
      this.trackerService.setLoading(false);
    }
  }

  handleOutput(pa: any) {
    this.triggerBoolean = { val: false };
  }

    switchTab(link: any) {
    this.activeLink = link;
    console.log('🔄 Switched to tab:', link?.header);

    // No loader needed for tab switching - it should be instant
    // The month-view component will handle its own data loading if needed
  }
}
