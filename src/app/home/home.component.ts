import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';

export interface NavigationCard {
  path: string;
  icon: string;
  label: string;
  description: string;
  color: 'primary' | 'accent' | 'secondary' | 'warn';
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatTooltipModule,
    CommonModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  navigationCards: NavigationCard[] = [
    {
      path: 'expense-tracker',
      icon: 'receipt',
      label: 'Expense Tracker',
      description: 'Track your expenses and income',
      color: 'primary',
    },
    {
      path: 'shopping-list',
      icon: 'add_shopping_cart',
      label: 'Shopping List',
      description: 'Manage your shopping items',
      color: 'accent',
    },
    {
      path: 'tic-tac-toe',
      icon: 'games',
      label: 'Tic Tac Toe',
      description: 'Play a quick game',
      color: 'secondary',
    },
    {
      path: 'diet',
      icon: 'restaurant',
      label: 'Diet Tracker',
      description: 'Track your meals and nutrition',
      color: 'warn',
    },
  ];

  constructor(private router: Router) {}

  redirectTo(path: string): void {
    this.router.navigate([`/${path}`]).catch((error) => {
      console.error('Navigation error:', error);
    });
  }

  handleKeyDown(event: KeyboardEvent, path: string): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.redirectTo(path);
    }
  }
}
