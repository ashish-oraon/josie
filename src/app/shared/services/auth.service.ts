import { Injectable } from '@angular/core';
import { LocalStorageService } from './local-storage.service';
import { environment } from '../../environments/environment';
import { CommonService } from '../common.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private localStorage: LocalStorageService,
    private commonService: CommonService
  ) {}
  isAuthenticated(): boolean {
    const registeredUsers = environment.users;
    const receivedToken = atob(this.localStorage.getItem('token'));
    const [user, dateString] = receivedToken.split(':');
    const [day, month, date, year, ...rest] = dateString.split(' ');
    const [tokenDate, today] = [
      new Date(`${date}-${month}-${year}`),
      new Date(),
    ];
    if (
      registeredUsers.includes(user) &&
      today.getDate() === tokenDate.getDate() &&
      today.getMonth() === tokenDate.getMonth() &&
      today.getFullYear() === tokenDate.getFullYear()
    ) {
      this.commonService.activeUserSubject$.next(user);
      return true;
    } else {
      return false;
    }
  }
}
