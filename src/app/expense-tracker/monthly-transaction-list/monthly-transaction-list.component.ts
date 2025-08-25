import { Component, OnInit } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TrackerService } from '../services/tracker.service';
import { CommonModule } from '@angular/common';
import { MonthViewComponent } from './month-view/month-view.component';
import { MonthlyTransactionReportComponent } from '../monthly-transaction-report/monthly-transaction-report.component';

import { logger } from '../../shared/utils/logger.util';
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
  activeLink: {
    month: number;
    year: number;
    date: Date;
    header: string;
    sheet: string;
  } | null = null;
  tabs: Array<{
    month: number;
    year: number;
    date: Date;
    header: string;
    sheet: string;
  }> = [];
  selectedTab: number = 0;
  triggerBoolean: { val: boolean } = { val: true };

  locationType: string = 'list';

  constructor(
    private trackerService: TrackerService,
    private activatedRoute: ActivatedRoute
  ) {}

    ngOnInit(): void {
    // ✅ SIMPLIFIED: Removed global loader integration, using only local loaders
    logger.log('🚀 Monthly transaction list component loading...');

    this.activatedRoute.data.subscribe(
      ({ type }) => {
        this.locationType = type;
        logger.log(`📍 Location type set to: ${this.locationType}`);

        // Initialize tabs for both views
        this.initializeTabs();
      }
    );

    this.links = ['month-view', 'qweqwe'];
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
      logger.log('📅 Active tab set to current month:', this.activeLink?.header);

      // ✅ SIMPLIFIED: No global loader integration, just set up tabs
      logger.log(`📋 Setting up tabs for ${this.locationType} view`);
      this.triggerBoolean = { val: true };
    } else {
      logger.warn('⚠️ No tabs generated');
    }
  }

  handleOutput(pa: unknown) {
    // this.triggerBoolean = { val: false };
  }

  // ✅ REMOVED: No longer needed with simplified loader system

    switchTab(link: {
      month: number;
      year: number;
      date: Date;
      header: string;
      sheet: string;
    }) {
    this.activeLink = link;
    logger.log('🔄 Switched to tab:', link?.header);

    // ✅ IMPROVED: Tab switching should be instant and use cached data
    // The month-view component will check cache first and only call backend if needed
    // No loader needed - this should be a smooth, instant transition
  }
}
