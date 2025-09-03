import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DietService } from './services/diet.service';
import { IDietPlan, IDay, IMeal } from './interfaces/diet.interface';
import { logger } from '../shared/utils/logger.util';

@Component({
  selector: 'app-diet',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    MatChipsModule,
    MatDividerModule,
    MatListModule,
    MatExpansionModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './diet.component.html',
  styleUrl: './diet.component.scss'
})
export class DietComponent implements OnInit {
  dietPlan: IDietPlan | null = null;
  isLoading = true;
  selectedDayIndex = 0;
  currentDay = '';

  constructor(
    private dietService: DietService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentDay = this.dietService.getCurrentDay();
    this.loadDietPlan();
  }

  private loadDietPlan(): void {
    this.isLoading = true;
    this.dietService.getDietPlan().subscribe({
      next: (data) => {
        this.dietPlan = data;
        this.selectedDayIndex = this.getCurrentDayIndex();
        this.isLoading = false;
        logger.log('🍽️ Diet plan loaded successfully:', data.title);
      },
      error: (error) => {
        logger.error('❌ Error loading diet plan:', error);
        this.isLoading = false;
      }
    });
  }

  private getCurrentDayIndex(): number {
    if (!this.dietPlan) return 0;
    return this.dietPlan.days.findIndex(day => day.day === this.currentDay);
  }

  getMealTypeIcon(mealType: string): string {
    return this.dietService.getMealTypeIcon(mealType);
  }

  getMealTypeColor(mealType: string): string {
    return this.dietService.getMealTypeColor(mealType);
  }

  onDaySelected(index: number): void {
    this.selectedDayIndex = index;
    logger.log('📅 Selected day:', this.dietPlan?.days[index]?.day);
  }

  getSelectedDay(): IDay | null {
    if (!this.dietPlan || this.selectedDayIndex < 0) return null;
    return this.dietPlan.days[this.selectedDayIndex];
  }

  isCurrentDay(dayName: string): boolean {
    return dayName === this.currentDay;
  }

  isCurrentMeal(mealTime: string): boolean {
    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();
    const mealTimeNum = parseInt(mealTime.replace(':', ''));

    // Consider it current if within 30 minutes of the meal time
    return Math.abs(currentTime - mealTimeNum) <= 30;
  }

  retryLoadDietPlan(): void {
    this.loadDietPlan();
  }

  goBack(): void {
    this.router.navigate(['/home']);
    logger.log('🏠 Navigating back to home');
  }
}
