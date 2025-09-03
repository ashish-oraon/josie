import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { IDietPlan } from '../interfaces/diet.interface';
import { logger } from '../../shared/utils/logger.util';

@Injectable({
  providedIn: 'root'
})
export class DietService {
  private dietData: IDietPlan | null = null;

  constructor(private http: HttpClient) {}

  getDietPlan(): Observable<IDietPlan> {
    if (this.dietData) {
      logger.log('📋 Returning cached diet data');
      return of(this.dietData);
    }

    logger.log('📋 Loading diet data from assets');
    return this.http.get<IDietPlan>('/assets/diet.json').pipe(
      tap((data) => {
        this.dietData = data;
        logger.log('📋 Diet data loaded successfully:', data.title);
      })
    );
  }

  getCurrentDay(): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  }

  getMealTypeIcon(mealType: string): string {
    const iconMap: { [key: string]: string } = {
      'Morning': 'wb_sunny',
      'Breakfast': 'free_breakfast',
      'Mid-Morning': 'local_cafe',
      'Lunch': 'lunch_dining',
      'Evening Snack': 'local_pizza',
      'Dinner': 'dinner_dining',
      'Before Bed': 'bedtime'
    };
    return iconMap[mealType] || 'restaurant';
  }

  getMealTypeColor(mealType: string): string {
    const colorMap: { [key: string]: string } = {
      'Morning': 'primary',
      'Breakfast': 'accent',
      'Mid-Morning': 'warn',
      'Lunch': 'primary',
      'Evening Snack': 'accent',
      'Dinner': 'warn',
      'Before Bed': 'primary'
    };
    return colorMap[mealType] || 'primary';
  }
}
