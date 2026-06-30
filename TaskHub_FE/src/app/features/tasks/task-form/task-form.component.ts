import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ValidationMessageComponent } from '../../../shared/ui/validation-message/validation-message.component';
import { WarningBannerComponent } from '../../../shared/ui/warning-banner/warning-banner.component';
import { ConfirmationBannerComponent } from '../../../shared/ui/confirmation-banner/confirmation-banner.component';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ValidationMessageComponent,
    WarningBannerComponent,
    ConfirmationBannerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './task-form.component.html',
})
export class TaskFormComponent {
  /** The reactive form group passed from the parent. */
  form = input.required<FormGroup>();
  isEditing = input(false);
  isSaving = input(false);

  /** External error/success notifications forwarded from the parent. */
  errorMessage = input<string | null>(null);
  successMessage = input<string | null>(null);

  /** Events back to the parent. */
  save = output<void>();
  cancel = output<void>();

  onSubmit(): void {
    if (this.form().invalid) return;
    this.save.emit();
  }
}
