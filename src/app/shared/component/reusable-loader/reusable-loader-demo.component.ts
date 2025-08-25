import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { ReusableLoaderComponent, LoaderConfig } from './reusable-loader.component';

@Component({
  selector: 'app-reusable-loader-demo',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule,
    ReusableLoaderComponent
  ],
  templateUrl: './reusable-loader-demo.component.html',
  styleUrls: ['./reusable-loader-demo.component.scss']
})
export class ReusableLoaderDemoComponent {
  // Demo configurations
  basicConfig: LoaderConfig = {
    message: 'Loading data...',
    size: 'medium',
    color: 'primary',
    overlay: false,
    backdrop: false
  };

  overlayConfig: LoaderConfig = {
    message: 'Processing your request...',
    size: 'large',
    color: 'primary',
    overlay: true,
    backdrop: true
  };

  customConfig: LoaderConfig = {
    message: 'Saving changes...',
    size: 'small',
    color: 'accent',
    overlay: false,
    backdrop: false
  };

  // Demo state
  showBasicLoader = false;
  showOverlayLoader = false;
  showCustomLoader = false;

  // Custom message input
  customMessage = 'Custom loading message...';

  // Available options for demo
  sizes = ['small', 'medium', 'large'];
  colors = ['primary', 'accent', 'warn'];

  // Demo methods
  toggleBasicLoader(): void {
    this.showBasicLoader = !this.showBasicLoader;
  }

  toggleOverlayLoader(): void {
    this.showOverlayLoader = !this.showOverlayLoader;
  }

  toggleCustomLoader(): void {
    this.showCustomLoader = !this.showCustomLoader;
  }

  updateCustomMessage(): void {
    this.customConfig.message = this.customMessage;
  }

  changeSize(size: 'small' | 'medium' | 'large'): void {
    this.customConfig.size = size;
  }

  changeColor(color: 'primary' | 'accent' | 'warn'): void {
    this.customConfig.color = color;
  }

  // Simulate loading operations
  simulateLoading(duration: number = 2000): void {
    this.showOverlayLoader = true;

    setTimeout(() => {
      this.showOverlayLoader = false;
    }, duration);
  }

  simulateInlineLoading(duration: number = 3000): void {
    this.showCustomLoader = true;

    setTimeout(() => {
      this.showCustomLoader = false;
    }, duration);
  }
}
