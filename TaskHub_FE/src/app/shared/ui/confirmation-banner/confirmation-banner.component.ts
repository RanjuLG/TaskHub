import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-confirmation-banner',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (message()) {
      <div class="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-900 shadow-sm">
        <div class="flex items-start gap-3">
          <div class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            ✓
          </div>
          <div class="min-w-0">
            <p class="text-sm font-semibold">{{ title() }}</p>
            <p class="mt-1 text-sm leading-6 text-emerald-900/90">{{ message() }}</p>
          </div>
        </div>
      </div>
    }
  `
})
export class ConfirmationBannerComponent {
  title = input('Success');
  message = input<string | null>(null);
}