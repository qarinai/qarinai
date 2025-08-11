import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AuthBackendService } from '../auth-backend.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AppConfigurator } from '../../layout/component/app.configurator';

@Component({
  selector: 'app-login',
  imports: [FormsModule, ReactiveFormsModule, CommonModule, InputTextModule, ButtonModule, AppConfigurator],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authBackendService = inject(AuthBackendService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);

  loginForm = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]]
  });

  constructor() {}

  onLoginClick() {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;

      this.authBackendService
        .login({
          username: username as string,
          password: password as string
        })
        .subscribe({
          next: (response) => {
            console.log('Login successful', response);
            localStorage.setItem('token', response.access_token);
            localStorage.setItem('refreshToken', response.refresh_token);
            localStorage.setItem('user', JSON.stringify(response.user));
            // Redirect to the home page or any other page

            const returnUrl = this.activatedRoute.snapshot.queryParams['returnUrl'] || '/';

            this.router.navigate([returnUrl]);
          },
          error: (error) => {
            console.error('Login failed', error);
            // Handle login error (e.g., show a message to the user)
          }
        });
    } else {
      console.log('Form is invalid');
      this.loginForm.markAllAsTouched();
      this.loginForm.updateValueAndValidity();
    }
  }
}
