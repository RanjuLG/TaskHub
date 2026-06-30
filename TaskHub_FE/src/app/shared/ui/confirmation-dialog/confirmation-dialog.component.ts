import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './confirmation-dialog.component.css',
  template: `
    @if (open()) {
      <div class="task-confirmation-backdrop" (click)="cancelClicked()">
        <div class="task-confirmation-dialog" (click)="$event.stopPropagation()">
          <div class="task-confirmation-dialog__body">
            <div class="task-confirmation-dialog__icon" [class.task-confirmation-dialog__icon--danger]="variant() === 'danger'">
              @if (variant() === 'danger') {
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v4m0 4h.01M10.29 3.86l-8.4 14.52A2 2 0 003.62 21h16.76a2 2 0 001.73-2.62l-8.4-14.52a2 2 0 00-3.46 0z" />
                </svg>
              } @else {
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              }
            </div>

            <div class="min-w-0 flex-1">
              <p class="text-lg font-extrabold tracking-tight text-slate-900">{{ title() }}</p>
              <p class="mt-1 text-sm leading-6 text-slate-600">{{ message() }}</p>
            </div>
          </div>

          <div class="task-confirmation-dialog__footer">
            <button type="button" class="task-confirmation-dialog__secondary" (click)="cancelClicked()">
              {{ cancelLabel() }}
            </button>
            <button type="button" class="task-confirmation-dialog__primary" [class.task-confirmation-dialog__primary--danger]="variant() === 'danger'" (click)="confirmClicked()">
              {{ confirmLabel() }}
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class ConfirmationDialogComponent {
  open = input(false);
  title = input('Confirm action');
  message = input('Are you sure you want to continue?');
  confirmLabel = input('Confirm');
  cancelLabel = input('Cancel');
  variant = input<'primary' | 'danger'>('primary');

  confirm = output<void>();
  cancel = output<void>();

  confirmClicked(): void {
    this.confirm.emit();
  }

  cancelClicked(): void {
    this.cancel.emit();
  }
}