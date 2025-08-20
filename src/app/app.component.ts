import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { TrackerService } from './expense-tracker/services/tracker.service';
import { AuthService } from './shared/services/auth.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoginComponent, MatProgressSpinnerModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'Josie World';
  isLoading = false;
  loadingMessage = '';
  isOnProtectedRoute = false;

  constructor(
    private trackerService: TrackerService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Listen to route changes to determine if we're on a protected route
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.updateProtectedRouteStatus(event.url);
        }
      });

    // Check initial route
    this.updateProtectedRouteStatus(this.router.url);

    // Subscribe to unified loading state from tracker service
    this.trackerService.unifiedLoadingState$.subscribe(loadingState => {
      // Only show loader if user is on a protected route
      if (this.isOnProtectedRoute) {
        this.isLoading = loadingState.isLoading;
        this.loadingMessage = loadingState.message;

        // Debug loader positioning
        if (loadingState.isLoading) {
          console.log('🔍 Loader activated:', {
            message: loadingState.message,
            isOnProtectedRoute: this.isOnProtectedRoute,
            currentUrl: this.router.url
          });

          // Force loader positioning after a brief delay to ensure DOM is ready
          setTimeout(() => {
            this.forceLoaderPositioning();
          }, 10);
        }
      } else {
        this.isLoading = false;
        this.loadingMessage = '';
      }
    });
  }

  private updateProtectedRouteStatus(url: string): void {
    // Protected routes are those that require authentication (expense-tracker, etc.)
    this.isOnProtectedRoute = url.includes('/expense-tracker') ||
                              url.includes('/shopping-list') ||
                              url.includes('/home');

    console.log('🛡️ Protected route status:', {
      url,
      isOnProtectedRoute: this.isOnProtectedRoute
    });
  }

  private forceLoaderPositioning(): void {
    // Force the loader to be properly positioned
    const loaderOverlay = document.querySelector('.global-loader-overlay') as HTMLElement;
    if (loaderOverlay) {
      // Ensure proper positioning
      loaderOverlay.style.position = 'fixed';
      loaderOverlay.style.top = '0';
      loaderOverlay.style.left = '0';
      loaderOverlay.style.width = '100vw';
      loaderOverlay.style.height = '100vh';
      loaderOverlay.style.zIndex = '99999';

      console.log('🔧 Forced loader positioning:', {
        position: loaderOverlay.style.position,
        top: loaderOverlay.style.top,
        left: loaderOverlay.style.left,
        width: loaderOverlay.style.width,
        height: loaderOverlay.style.height,
        zIndex: loaderOverlay.style.zIndex
      });
    }
  }

  //path = /home/oraon-as/.nvm/versions/node/v20.11.1/bin/ng
}
