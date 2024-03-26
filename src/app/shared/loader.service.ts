import { Injectable } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  private loadingAction = new BehaviorSubject<boolean>(false);
  isLoading$ = this.loadingAction.asObservable().pipe();

  show(): void {
    this.loadingAction.next(true);
  }

  hide(): void {
    this.loadingAction.next(false);
  }
}
