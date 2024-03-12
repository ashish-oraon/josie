import { Injectable } from '@angular/core';
import { GoogleSheetService } from './gsheet.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  constructor(private gsService: GoogleSheetService) {}

  login(username: string, password: string): Observable<any> {
    const loginData = { username, password };
    // Replace 'your-login-api-url' with the actual API endpoint for login
    // return this.http.post('your-login-api-url', loginData);
    // return of(true);
    return this.gsService.login(loginData);
  }
  loginCred(obj: any): Observable<any> {
    // const loginData = { username, password };
    // Replace 'your-login-api-url' with the actual API endpoint for login
    // return this.http.post('your-login-api-url', loginData);
    // return of(true);
    return this.gsService.login(obj);
  }
}
