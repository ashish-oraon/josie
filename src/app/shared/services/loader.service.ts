import { Injectable } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  private loadingAction = new BehaviorSubject<boolean>(false);
  isLoading$ = this.loadingAction
    .asObservable()
    .pipe(tap((val) => console.log(`loading: ${val}`)));

  show(): void {
    setTimeout(() => {
      this.loadingAction.next(true);
    }, 0);
  }

  hide(): void {
    setTimeout(() => {
      this.loadingAction.next(false);
    }, 0);
  }
}
