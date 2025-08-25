import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export interface LoaderConfig {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'accent' | 'warn';
  overlay?: boolean;
  backdrop?: boolean;
}

@Component({
  selector: 'app-reusable-loader',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: './reusable-loader.component.html',
  styleUrls: ['./reusable-loader.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReusableLoaderComponent {
  @Input() message: string = 'Loading...';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() color: 'primary' | 'accent' | 'warn' = 'primary';
  @Input() overlay: boolean = false;
  @Input() backdrop: boolean = false;
  @Input() config: LoaderConfig = {};

  // Computed properties for dynamic styling
  get spinnerSize(): number {
    const sizeMap = {
      small: 24,
      medium: 48,
      large: 64
    };
    return sizeMap[this.config.size || this.size];
  }

  get spinnerColor(): string {
    return this.config.color || this.color;
  }

  get displayMessage(): string {
    return this.config.message || this.message;
  }

  get showOverlay(): boolean {
    return this.config.overlay !== undefined ? this.config.overlay : this.overlay;
  }

  get showBackdrop(): boolean {
    return this.config.backdrop !== undefined ? this.config.backdrop : this.backdrop;
  }

  get containerClasses(): string {
    const classes = ['reusable-loader'];

    if (this.showOverlay) {
      classes.push('overlay');
    }

    if (this.showBackdrop) {
      classes.push('backdrop');
    }

    classes.push(`size-${this.config.size || this.size}`);
    classes.push(`color-${this.config.color || this.color}`);

    return classes.join(' ');
  }
}
