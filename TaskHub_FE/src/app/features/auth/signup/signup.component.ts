import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { AbstractControl, ReactiveFormsModule, ValidationErrors, Validators, FormBuilder } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { ConfirmationBannerComponent } from '../../../shared/ui/confirmation-banner/confirmation-banner.component';
import { ValidationMessageComponent } from '../../../shared/ui/validation-message/validation-message.component';
import { WarningBannerComponent } from '../../../shared/ui/warning-banner/warning-banner.component';

function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value as string | null;
  const confirmPassword = control.get('confirmPassword')?.value as string | null;

  if (!password || !confirmPassword) {
    return null;
  }

  return password === confirmPassword ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ValidationMessageComponent, WarningBannerComponent, ConfirmationBannerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  isSubmitting = signal(false);
  warningMessage = signal<string | null>(null);
  confirmationMessage = signal<string | null>(null);

  signupForm = this.fb.nonNullable.group(
    {
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    },
    { validators: passwordsMatchValidator }
  );

  onSubmit() {
  if (this.signupForm.invalid) {
    this.signupForm.markAllAsTouched();

    return;
  }

    const { username, password } = this.signupForm.getRawValue();
    this.isSubmitting.set(true);
    this.warningMessage.set(null);
    this.confirmationMessage.set(null);

    this.authService.register(username, password).subscribe({
      next: () => {
        this.signupForm.reset();
        this.confirmationMessage.set('Your account is ready. Sign in with your new credentials.');
        this.isSubmitting.set(false);
      },
      error: () => {
        this.warningMessage.set('Registration could not be completed. Try a different username or try again later.');
        this.isSubmitting.set(false);
      }
    });
  }
}