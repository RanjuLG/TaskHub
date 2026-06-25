import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, input, signal } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-validation-message',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (visible()) {
      <p class="mt-2 flex items-start gap-2 text-sm text-rose-600">
        <span class="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-700">
          !
        </span>
        <span>{{ message() }}</span>
      </p>
    }
  `
})
export class ValidationMessageComponent {
  control = input<AbstractControl | null>(null);
  messages = input<Record<string, string>>({});
  fallbackMessage = input('Please check this field');

  private readonly refresh = signal(0);

  private readonly syncControlState = effect((onCleanup) => {
    const control = this.control();

    this.refresh.update((value) => value + 1);

    if (!control) {
      return;
    }

    const subscription = control.events.subscribe(() => {
      this.refresh.update((value) => value + 1);
    });

    onCleanup(() => subscription.unsubscribe());
  });

  visible = computed(() => {
    this.refresh();

    const control = this.control();
    if (!control || !control.invalid || !control.errors) {
      return false;
    }

    const hasTouchedDescendant = Object.values((control as { controls?: Record<string, AbstractControl> }).controls ?? {}).some(
      (child) => child.touched || child.dirty
    );
    return control.touched || control.dirty || hasTouchedDescendant;
  });

  message = computed(() => {
    this.refresh();

    const control = this.control();

    if (!control?.errors) {
      return '';
    }

    const firstErrorKey = Object.keys(control.errors)[0];
    return this.messages()[firstErrorKey] ?? this.fallbackMessage();
  });
}