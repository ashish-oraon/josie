# 🔄 Reusable Loader Component

A flexible, customizable, and reusable loading component for Angular applications with support for inline loading, full-screen overlays, and dynamic configuration.

## ✨ Features

- **🎯 Multiple Display Modes**: Inline loading and full-screen overlay
- **🎨 Customizable Appearance**: Size, color, and message options
- **📱 Responsive Design**: Works seamlessly across all device sizes
- **♿ Accessibility**: Built-in accessibility features and keyboard navigation
- **🌙 Theme Support**: Automatic dark/light theme detection
- **⚡ Performance**: OnPush change detection strategy
- **🔧 Flexible Configuration**: Both individual properties and configuration objects

## 🚀 Quick Start

### Basic Usage

```typescript
import { ReusableLoaderComponent } from '@shared/component/reusable-loader';

@Component({
  // ... other component config
  imports: [ReusableLoaderComponent]
})
export class MyComponent {
  isLoading = false;
}
```

```html
<app-reusable-loader 
  *ngIf="isLoading"
  message="Loading data...">
</app-reusable-loader>
```

### With Configuration Object

```typescript
import { ReusableLoaderComponent, LoaderConfig } from '@shared/component/reusable-loader';

export class MyComponent {
  loaderConfig: LoaderConfig = {
    message: 'Processing your request...',
    size: 'large',
    color: 'accent',
    overlay: true,
    backdrop: true
  };
}
```

```html
<app-reusable-loader 
  *ngIf="isLoading"
  [config]="loaderConfig">
</app-reusable-loader>
```

## 📋 Configuration Options

### Individual Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `message` | `string` | `'Loading...'` | Text displayed below the spinner |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Spinner size (24px, 48px, 64px) |
| `color` | `'primary' \| 'accent' \| 'warn'` | `'primary'` | Spinner and message color theme |
| `overlay` | `boolean` | `false` | Whether to show as full-screen overlay |
| `backdrop` | `boolean` | `false` | Whether to show backdrop (requires overlay=true) |

### Configuration Object

```typescript
export interface LoaderConfig {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'accent' | 'warn';
  overlay?: boolean;
  backdrop?: boolean;
}
```

## 🎯 Usage Examples

### 1. Simple Inline Loader

```html
<app-reusable-loader message="Loading transactions..."></app-reusable-loader>
```

### 2. Large Accent Loader

```html
<app-reusable-loader 
  message="Saving changes..."
  size="large"
  color="accent">
</app-reusable-loader>
```

### 3. Full-Screen Overlay

```html
<app-reusable-loader 
  message="Processing your request..."
  size="large"
  color="primary"
  [overlay]="true"
  [backdrop]="true">
</app-reusable-loader>
```

### 4. Dynamic Configuration

```typescript
export class MyComponent {
  loaderConfig: LoaderConfig = {
    message: 'Loading...',
    size: 'medium',
    color: 'primary',
    overlay: false,
    backdrop: false
  };

  updateLoader(message: string, size: 'small' | 'medium' | 'large' = 'medium') {
    this.loaderConfig = {
      ...this.loaderConfig,
      message,
      size
    };
  }
}
```

```html
<app-reusable-loader 
  *ngIf="isLoading"
  [config]="loaderConfig">
</app-reusable-loader>

<button (click)="updateLoader('Saving...', 'large')">Save</button>
<button (click)="updateLoader('Deleting...', 'small')">Delete</button>
```

## 🎨 Styling and Customization

### CSS Custom Properties

The component uses CSS custom properties for theming:

```scss
:root {
  --mat-primary-color: #1976d2;
  --mat-accent-color: #ff4081;
  --mat-warn-color: #f44336;
}
```

### Custom Styling

You can override the default styles:

```scss
app-reusable-loader {
  .loader-message {
    font-weight: bold;
    font-size: 1.2rem;
  }
  
  .loader-overlay .loader-content {
    background-color: rgba(0, 0, 0, 0.9);
    color: white;
  }
}
```

## 📱 Responsive Behavior

The component automatically adapts to different screen sizes:

- **Desktop**: Full-size overlay with large content area
- **Tablet**: Medium-size overlay with adjusted padding
- **Mobile**: Compact overlay with smaller content and margins

## ♿ Accessibility Features

- **Keyboard Navigation**: Focus management for overlay mode
- **Screen Reader Support**: Proper ARIA labels and descriptions
- **High Contrast Mode**: Enhanced visibility in high contrast environments
- **Reduced Motion**: Respects user's motion preferences

## 🔧 Advanced Usage

### Conditional Loading States

```typescript
export class MyComponent {
  loadingStates = {
    initial: { message: 'Loading initial data...', size: 'medium' },
    saving: { message: 'Saving changes...', size: 'small' },
    processing: { message: 'Processing request...', size: 'large', overlay: true }
  };

  currentState: keyof typeof this.loadingStates = 'initial';
}
```

```html
<app-reusable-loader 
  *ngIf="isLoading"
  [config]="loadingStates[currentState]">
</app-reusable-loader>
```

### Service Integration

```typescript
@Injectable()
export class LoadingService {
  private loadingSubject = new BehaviorSubject<LoaderConfig | null>(null);
  loading$ = this.loadingSubject.asObservable();

  show(config: LoaderConfig) {
    this.loadingSubject.next(config);
  }

  hide() {
    this.loadingSubject.next(null);
  }
}
```

```html
<app-reusable-loader 
  *ngIf="loading$ | async as config"
  [config]="config">
</app-reusable-loader>
```

## 🧪 Testing

### Unit Tests

```typescript
describe('ReusableLoaderComponent', () => {
  let component: ReusableLoaderComponent;
  let fixture: ComponentFixture<ReusableLoaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReusableLoaderComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ReusableLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display custom message', () => {
    component.message = 'Custom message';
    fixture.detectChanges();
    
    const messageElement = fixture.nativeElement.querySelector('.loader-message');
    expect(messageElement.textContent).toContain('Custom message');
  });
});
```

### Integration Tests

```typescript
describe('ReusableLoader Integration', () => {
  it('should show overlay loader when overlay is true', () => {
    // Test implementation
  });

  it('should hide loader when *ngIf is false', () => {
    // Test implementation
  });
});
```

## 🚨 Common Issues and Solutions

### 1. Loader Not Showing

**Problem**: Loader doesn't appear even when `*ngIf` is true.

**Solution**: Ensure the component is properly imported and the `*ngIf` condition is correct.

```typescript
// ✅ Correct
import { ReusableLoaderComponent } from '@shared/component/reusable-loader';

// ❌ Incorrect
import { ReusableLoaderComponent } from './reusable-loader.component';
```

### 2. Overlay Not Full Screen

**Problem**: Overlay doesn't cover the entire viewport.

**Solution**: Check if any parent elements have `overflow: hidden` or `position: relative`.

### 3. Styling Conflicts

**Problem**: Custom styles not applying correctly.

**Solution**: Use more specific selectors or `!important` when necessary.

```scss
// ✅ More specific selector
app-reusable-loader .loader-overlay .loader-content {
  background-color: rgba(0, 0, 0, 0.9) !important;
}
```

## 📚 API Reference

### Inputs

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `@Input() message` | `string` | `'Loading...'` | Loading message text |
| `@Input() size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Spinner size |
| `@Input() color` | `'primary' \| 'accent' \| 'warn'` | `'primary'` | Color theme |
| `@Input() overlay` | `boolean` | `false` | Overlay mode |
| `@Input() backdrop` | `boolean` | `false` | Backdrop display |
| `@Input() config` | `LoaderConfig` | `{}` | Configuration object |

### Computed Properties

| Property | Type | Description |
|----------|------|-------------|
| `spinnerSize` | `number` | Computed spinner diameter in pixels |
| `spinnerColor` | `string` | Computed color theme |
| `displayMessage` | `string` | Computed message text |
| `showOverlay` | `boolean` | Computed overlay state |
| `showBackdrop` | `boolean` | Computed backdrop state |
| `containerClasses` | `string` | Computed CSS classes |

## 🤝 Contributing

When contributing to this component:

1. **Follow Angular Style Guide**: Use Angular best practices and conventions
2. **Add Tests**: Include unit tests for new features
3. **Update Documentation**: Keep this README and inline comments up to date
4. **Consider Accessibility**: Ensure new features are accessible
5. **Test Responsiveness**: Verify behavior across different screen sizes

## 📄 License

This component is part of the Josie application and follows the same licensing terms.

---

**Happy Loading! 🚀**
