import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UserService } from '../../services/user.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  loading = false;
  showPassword = false;

  readonly loginForm = this.formBuilder.nonNullable.group({
    email: ['demo@planner.com', [Validators.required, Validators.email]],
    password: ['Password@123', [Validators.required, Validators.minLength(6)]]
  });

  submit(): void {
    if (this.loading) {
      return;
    }

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.userService.login({
      email: this.loginForm.controls.email.getRawValue().trim().toLowerCase(),
      password: this.loginForm.controls.password.getRawValue()
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.toastService.success('Login successful. Your five planners are ready.');
        void this.router.navigate(['/']);
      },
      error: (error: HttpErrorResponse) => {
        this.loading = false;
        this.toastService.error(this.getErrorMessage(error, 'login'));
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  private getErrorMessage(error: HttpErrorResponse, mode: 'login' | 'register'): string {
    const apiMessage = error.error?.message;

    if (apiMessage) {
      return apiMessage;
    }

    if (error.status === 0) {
      return 'The server is waking up or unreachable right now. Please wait a few seconds and try again.';
    }

    if (mode === 'login' && error.status === 401) {
      return 'Invalid email or password. Please try again.';
    }

    return mode === 'login' ? 'Unable to log in right now. Please try again.' : 'Unable to register right now. Please try again.';
  }
}
