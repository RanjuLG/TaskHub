import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-task-top-bar',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './task-top-bar.component.css',
  template: `
    <header class="task-top-bar">
      <div class="flex items-center gap-3">
        <div class="task-top-bar__logo">
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
          </svg>
        </div>
        <div>
          <p class="text-xs font-bold uppercase tracking-[0.22em] text-blue-600">{{ title() }}</p>
          <h1 class="text-xl font-extrabold tracking-tight text-slate-900">{{ subtitle() }}</h1>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <div class="task-top-bar__user">
          <div class="task-top-bar__avatar">{{ username()?.charAt(0) | uppercase }}</div>
          <div class="leading-tight">
            <p class="text-sm font-semibold text-slate-700">{{ username() }}</p>
          </div>
        </div>

        <button type="button" class="task-top-bar__logout" (click)="logout()">
          <span>Logout</span>
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
        </button>
      </div>
    </header>
  `
})
export class TaskTopBarComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  title = input('TaskHub');
  subtitle = input('Plan work, stay focused');
  username = input<string | null>(null);

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}