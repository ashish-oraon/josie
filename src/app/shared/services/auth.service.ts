import { Injectable } from '@angular/core';
import { LocalStorageService } from './local-storage.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private localStorage: LocalStorageService) {}
  isAuthenticated(): boolean {
    const registeredUsers = environment.users;
    const receivedToken = atob(this.localStorage.getItem('token'));
    const [user, dateString] = receivedToken.split(':');
    const [tokenDate, today] = [new Date(dateString), new Date()];
    if (
      registeredUsers.includes(user) &&
      today.getDate() === tokenDate.getDate() &&
      today.getMonth() === tokenDate.getMonth() &&
      today.getFullYear() === tokenDate.getFullYear()
    ) {
      return true;
    } else {
      return false;
    }
  }
}
