import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { GoogleSheetService } from './gsheet.service';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  constructor(private gsService: GoogleSheetService, private router: Router) {}

  login(username: string, password: string): Observable<any> {
    const loginData = { username, password };
    // Replace 'your-login-api-url' with the actual API endpoint for login
    // return this.http.post('your-login-api-url', loginData);
    // return of(true);
    return this.gsService.login(loginData);
  }

  handleLoginSuccess(): void {
    // Redirect to the desired route on successful login
    this.router.navigate(['tracker']); // Change '/dashboard' to your desired route
  }
}
