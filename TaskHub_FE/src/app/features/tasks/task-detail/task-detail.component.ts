import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskItem } from '../../../core/models/task.model';
import { ConfirmationDialogComponent } from '../../../shared/ui/confirmation-dialog/confirmation-dialog.component';
import { WarningBannerComponent } from '../../../shared/ui/warning-banner/warning-banner.component';
import { ConfirmationBannerComponent } from '../../../shared/ui/confirmation-banner/confirmation-banner.component';

interface ConfirmationState {
  title: string;
  message: string;
  confirmLabel: string;
  variant: 'primary' | 'danger';
  onConfirm: () => void;
}

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [
    CommonModule,
    ConfirmationDialogComponent,
    WarningBannerComponent,
    ConfirmationBannerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './task-details.component.html',
})
export class TaskDetailComponent {
  task = input.required<TaskItem>();

  /** Optional notification messages forwarded from the parent. */
  errorMessage = input<string | null>(null);
  successMessage = input<string | null>(null);

  /** Events emitted back to the parent. */
  edit = output<TaskItem>();
  markComplete = output<TaskItem>();
  delete = output<TaskItem>();

  confirmationState: ConfirmationState | null = null;

  requestComplete(): void {
    this.confirmationState = {
      title: 'Mark task as completed?',
      message: `This will move "${this.task().title}" into the completed tasks list`,
      confirmLabel: 'Mark complete',
      variant: 'primary',
      onConfirm: () => {
        this.confirmationState = null;
        this.markComplete.emit(this.task());
      },
    };
  }

  requestDelete(): void {
    this.confirmationState = {
      title: 'Delete this task?',
      message: `This will remove "${this.task().title}" from your board. You can't undo this action.`,
      confirmLabel: 'Delete task',
      variant: 'danger',
      onConfirm: () => {
        this.confirmationState = null;
        this.delete.emit(this.task());
      },
    };
  }

  dismissConfirmation = (): void => {
    this.confirmationState = null;
  };
}
