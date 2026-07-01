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
import { Category } from '../../../core/models/task.model';

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
  categories = input<Category[]>([]);
  isCreatingCategory = input(false);
  categoryError = input<string | null>(null);

  /** External error/success notifications forwarded from the parent. */
  errorMessage = input<string | null>(null);
  successMessage = input<string | null>(null);

  /** Events back to the parent. */
  save = output<void>();
  cancel = output<void>();
  createCategory = output<string>();

  /** Local UI state for the inline "add new category" affordance. */
  isAddingCategory = signal(false);
  newCategoryName = signal('');

  onSubmit(): void {
    if (this.form().invalid) return;
    this.save.emit();
  }

  toggleAddCategory(): void {
    this.isAddingCategory.update((open) => !open);
    this.newCategoryName.set('');
  }

  confirmAddCategory(): void {
    const name = this.newCategoryName().trim();
    if (!name) return;

    this.createCategory.emit(name);
    this.isAddingCategory.set(false);
    this.newCategoryName.set('');
  }
}
