import { ChangeDetectionStrategy, Component, computed, ElementRef, HostListener, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TaskService } from '../../../core/services/task.service';
import { AuthService } from '../../../core/auth/auth.service';
import { TaskItem, CreateTaskPayload, UpdateTaskPayload, TaskSortOption } from '../../../core/models/task.model';
import { TaskTopBarComponent } from '../../../shared/ui/top-bar/task-top-bar.component';
import { ConfirmationDialogComponent } from '../../../shared/ui/confirmation-dialog/confirmation-dialog.component';
import { ValidationMessageComponent } from '../../../shared/ui/validation-message/validation-message.component';

type TaskTab = 'pending' | 'completed';
type ConfirmationAction = 'complete' | 'delete';

interface ConfirmationState {
  action: ConfirmationAction;
  task: TaskItem;
  title: string;
  message: string;
  confirmLabel: string;
  variant: 'primary' | 'danger';
}

@Component({
  selector: 'app-task-board',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ValidationMessageComponent, TaskTopBarComponent,ConfirmationDialogComponent],
  templateUrl: './task-board.component.html',
  styleUrl: './task-board.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskBoardComponent implements OnInit {
  private taskService = inject(TaskService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private elementRef = inject(ElementRef);
  
  tasks = signal<TaskItem[]>([]);
  availableCategories = signal<string[]>([]);
  selectedTask = signal<TaskItem | null>(null);
  isLoading = signal<boolean>(true);
  
  isFormActive = signal<boolean>(false);
  isEditing = signal<boolean>(false);
  
  username = signal<string | null>(null);
  currentSort = signal<TaskSortOption>(TaskSortOption.Default);
  sortMenuOpen = signal<boolean>(false);
  currentTab = signal<TaskTab>('pending');
  currentCategory = signal<string>('all');
  currentPage = signal<number>(1);
  pageSize = 8;
  totalCount = signal<number>(0);
  totalPages = signal<number>(0);
  pendingTasksCount = signal<number>(0);
  completedTasksCount = signal<number>(0);
  confirmationState = signal<ConfirmationState | null>(null);

  sortOptions = [
    { value: TaskSortOption.Default, label: 'Default' },
    { value: TaskSortOption.TitleAsc, label: 'Title (A-Z)' },
    { value: TaskSortOption.TitleDesc, label: 'Title (Z-A)' },
    { value: TaskSortOption.CreatedAtDesc, label: 'Newest First' },
    { value: TaskSortOption.CreatedAtAsc, label: 'Oldest First' }
  ];
  
  TaskSortOption = TaskSortOption;
  //taskTopBarComponent = TaskTopBarComponent;
  //confirmationDialogComponent = ConfirmationDialogComponent;

  taskForm = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    category: [''],
    deadline: ['']
  });

  ngOnInit() {
    this.username.set(this.authService.getUsername() || 'User');
    this.loadTasks();
  }

  loadTasks() {
    this.isLoading.set(true);

    this.taskService.getTasks({
      category: this.currentCategory() === 'all' ? undefined : this.currentCategory(),
      isCompleted: this.currentTab() === 'completed',
      sortBy: this.currentSort(),
      pageNumber: this.currentPage(),
      pageSize: this.pageSize
    }).subscribe({
      next: (response) => {
        if (response.totalPages > 0 && this.currentPage() > response.totalPages) {
          this.currentPage.set(response.totalPages);
          this.loadTasks();
          return;
        }

        this.tasks.set(response.items);
        this.availableCategories.set(response.categories);
        this.totalCount.set(response.totalCount);
        this.totalPages.set(response.totalPages);
        this.pendingTasksCount.set(response.pendingCount);
        this.completedTasksCount.set(response.completedCount);
        this.isLoading.set(false);

        const currentSelected = this.selectedTask();
        if (currentSelected) {
          const updatedSelected = response.items.find(task => task.id === currentSelected.id);
          this.selectedTask.set(updatedSelected || null);
        }
      },
      error: () => this.isLoading.set(false)
    });
  }

  categories = computed(() => {
    const uniqueCategories = Array.from(new Set(this.availableCategories()
      .map(category => category || 'General')
      .filter(category => category && category !== 'default')));
    return uniqueCategories.sort();
  });

  toggleSortMenu() {
    this.sortMenuOpen.update((open) => !open);
  }

  selectSort(sort: TaskSortOption) {
    this.currentSort.set(sort);
    this.sortMenuOpen.set(false);
    this.currentPage.set(1);
    this.loadTasks();
  }

  @HostListener('document:click', ['$event'])
  closeSortMenuOnOutsideClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.sortMenuOpen.set(false);
    }
  }

  changeCategory(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.currentCategory.set(value);
    this.currentPage.set(1);
    this.loadTasks();
  } 
  changeTab(tab: TaskTab) {
    this.currentTab.set(tab);
    this.currentPage.set(1);
    this.loadTasks();
  }

  selectTask(task: TaskItem) {
    this.selectedTask.set(task);
    this.isFormActive.set(false);
  }

  startAddTask() {
    this.isEditing.set(false);
    this.isFormActive.set(true);
    this.taskForm.reset();
  }

  startEditTask(task: TaskItem) {
    this.isEditing.set(true);
    this.isFormActive.set(true);
    this.taskForm.patchValue({
      title: task.title,
      description: task.description || '',
      category: task.category || '',
      deadline: task.deadline || ''
    });
  }

  cancelForm() {
    this.isFormActive.set(false);
  }

  previousPage() {
    if (this.currentPage() === 1) {
      return;
    }

    this.currentPage.update(page => page - 1);
    this.loadTasks();
  }

  nextPage() {
    if (this.currentPage() >= this.totalPages()) {
      return;
    }

    this.currentPage.update(page => page + 1);
    this.loadTasks();
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages()) {
      return;
    }

    this.currentPage.set(page);
    this.loadTasks();
  }

  pageNumbers = computed(() => Array.from({ length: this.totalPages() }, (_, index) => index + 1));

  dueLabel(deadline?: string): string {
    if (!deadline) {
      return '';
    }

    const dueDate = new Date(deadline);
    const now = new Date();
    const diffMs = dueDate.getTime() - now.getTime();
    const absDiffMs = Math.abs(diffMs);
    const isPastDue = diffMs < 0;

    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;
    const week = 7 * day;

    const formatUnit = (value: number, unit: 'minute' | 'hour' | 'day' | 'week') => {
      const label = value === 1 ? unit : `${unit}s`;
      return isPastDue ? `Due ${value} ${label} ago` : `Due in ${value} ${label}`;
    };

    if (absDiffMs < hour) {
      return formatUnit(Math.max(1, Math.round(absDiffMs / minute)), 'minute');
    }

    if (absDiffMs < day) {
      return formatUnit(Math.max(1, Math.round(absDiffMs / hour)), 'hour');
    }

    if (absDiffMs < week) {
      return formatUnit(Math.max(1, Math.round(absDiffMs / day)), 'day');
    }

    return formatUnit(Math.max(1, Math.round(absDiffMs / week)), 'week');
  }

  displayStart = computed(() => {
    if (this.totalCount() === 0) {
      return 0;
    }

    return ((this.currentPage() - 1) * this.pageSize) + 1;
  });

  displayEnd = computed(() => Math.min(this.currentPage() * this.pageSize, this.totalCount()));

  onSaveTask() {
    if (this.taskForm.invalid) return;

    const formValue = this.taskForm.value;
    
    if (this.isEditing() && this.selectedTask()) {
      const payload: UpdateTaskPayload = {
        title: formValue.title!,
        description: formValue.description || '',
        category: formValue.category || '',
        deadline: formValue.deadline || undefined,
        isCompleted: this.selectedTask()!.isCompleted
      };
      
      this.taskService.updateTask(this.selectedTask()!.id, payload).subscribe(() => {
        this.isFormActive.set(false);
        this.currentPage.set(1);
        this.loadTasks();
      });
    } else {
      const payload: CreateTaskPayload = {
        title: formValue.title!,
        description: formValue.description || '',
        category: formValue.category || '',
        deadline: formValue.deadline || undefined
      };
      
      this.taskService.createTask(payload).subscribe(() => {
        this.isFormActive.set(false);
        this.currentPage.set(1);
        this.loadTasks();
      });
    }
  }

  requestMarkComplete(task: TaskItem) {
    this.confirmationState.set({
      action: 'complete',
      task,
      title: 'Mark task as completed?',
      message: `This will move “${task.title}” into the completed tasks list`,
      confirmLabel: 'Mark complete',
      variant: 'primary'
    });
  }

  requestDeleteTask(task: TaskItem) {
    this.confirmationState.set({
      action: 'delete',
      task,
      title: 'Delete this task?',
      message: `This will hide “${task.title}” from your board. You can’t undo this action.`,
      confirmLabel: 'Delete task',
      variant: 'danger'
    });
  }

  confirmPendingAction = () => {
    const confirmation = this.confirmationState();

    if (!confirmation) {
      return;
    }

    if (confirmation.action === 'complete') {
      this.taskService.markAsComplete(confirmation.task.id).subscribe(() => {
        this.confirmationState.set(null);
        this.loadTasks();
      });
      return;
    }

    this.taskService.deleteTask(confirmation.task.id).subscribe(() => {
      if (this.selectedTask()?.id === confirmation.task.id) {
        this.selectedTask.set(null);
      }
      this.confirmationState.set(null);
      this.loadTasks();
    });
  };

  cancelConfirmation = () => {
    this.confirmationState.set(null);
  };

  logout() {
    this.authService.logout();
  }
}
