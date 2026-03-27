import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastService } from '../../services/toast.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  loading = false;
  showPassword = false;

  readonly registerForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  submit(): void {
    if (this.loading) {
      return;
    }

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.userService.register({
      name: this.registerForm.controls.name.getRawValue().trim(),
      email: this.registerForm.controls.email.getRawValue().trim().toLowerCase(),
      password: this.registerForm.controls.password.getRawValue()
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.toastService.success('Registration complete. Five planner accounts were created for you.');
        void this.router.navigate(['/']);
      },
      error: (error: HttpErrorResponse) => {
        this.loading = false;
        this.toastService.error(this.getErrorMessage(error));
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    const apiMessage = error.error?.message;

    if (apiMessage) {
      return apiMessage;
    }

    if (error.status === 0) {
      return 'The server is waking up or unreachable right now. Please wait a few seconds and try again.';
    }

    if (error.status === 400) {
      return 'That account could not be created. Please check the form details and try again.';
    }

    return 'Unable to register right now. Please try again.';
  }
}
