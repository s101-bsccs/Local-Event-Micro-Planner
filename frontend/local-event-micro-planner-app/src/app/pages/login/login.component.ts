import { CommonModule } from '@angular/common';
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

  readonly loginForm = this.formBuilder.nonNullable.group({
    email: ['demo@planner.com', [Validators.required, Validators.email]],
    password: ['Password@123', [Validators.required, Validators.minLength(6)]]
  });

  submit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.userService.login(this.loginForm.getRawValue()).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.toastService.success('Login successful. Your five planners are ready.');
        void this.router.navigate(['/']);
      },
      error: (error: { error?: { message?: string } }) => {
        this.loading = false;
        this.toastService.error(error.error?.message ?? 'Unable to log in.');
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
}
