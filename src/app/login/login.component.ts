import { Component, OnInit, inject } from '@angular/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoginService } from '../login.service';
import { Router } from '@angular/router';
import { error } from 'console';
import { LocalStorageService } from '../shared/services/local-storage.service';

@Component({
  selector: 'login-form',
  standalone: true,
  imports: [
    MatSlideToggleModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    CommonModule,
    MatIconModule,
    MatDividerModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup<any>;
  loginService: LoginService = inject(LoginService);
  localStorage: LocalStorageService = inject(LocalStorageService);
  private router: Router = inject(Router);
  isLoading: boolean = false;
  error: any;

  ngOnInit(): void {
    this.loginForm = new FormGroup({
      username: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
    });
  }

  loginNow() {
    this.isLoading = true;
    this.loginService.loginCred(this.loginForm.value).subscribe(
      (data) => {
        if (data.message === 'Login successful!') {
          this.localStorage.setItem('token', data.token);
          this.router.navigate(['/home']);
        } else {
          this.error = data.message;
        }
      },
      (error) => {},
      () => (this.isLoading = false)
    );
  }
}
