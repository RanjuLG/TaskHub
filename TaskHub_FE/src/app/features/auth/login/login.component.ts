import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { ValidationMessageComponent } from '../../../shared/ui/validation-message/validation-message.component';
import { WarningBannerComponent } from '../../../shared/ui/warning-banner/warning-banner.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, ValidationMessageComponent, WarningBannerComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  warningMessage = signal<string | null>(null);

  loginForm = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  onSubmit() {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.getRawValue();
      this.warningMessage.set(null);
      this.authService.login(username, password)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: () => {
          this.warningMessage.set('Sign in failed. Check your username and password, then try again.');
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
