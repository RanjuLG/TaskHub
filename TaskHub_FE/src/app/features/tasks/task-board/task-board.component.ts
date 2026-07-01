import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  HostListener,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TaskService } from '../../../core/services/task.service';
import { AuthService } from '../../../core/auth/auth.service';
import {
  TaskItem,
  CreateTaskPayload,
  UpdateTaskPayload,
  TaskSortOption,
  Category,
} from '../../../core/models/task.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TaskTopBarComponent } from '../../../shared/ui/top-bar/task-top-bar.component';
import { TaskFormComponent } from '../task-form/task-form.component';
import { TaskDetailComponent } from '../task-detail/task-detail.component';
import { TimeAgoPipe } from '../../../shared/pipes/time-ago.pipe';

type TaskTab = 'pending' | 'completed';

@Component({
  selector: 'app-task-board',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TaskTopBarComponent,
    TaskFormComponent,
    TaskDetailComponent,
    TimeAgoPipe,
  ],
  templateUrl: './task-board.component.html',
  styleUrl: './task-board.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskBoardComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private taskService = inject(TaskService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private elementRef = inject(ElementRef);

  // ── List state ─────────────────────────────────────────────────────────────
  tasks = signal<TaskItem[]>([]);
  categories = signal<Category[]>([]);
  selectedTask = signal<TaskItem | null>(null);
  isLoading = signal<boolean>(true);

  // ── Panel / form state ─────────────────────────────────────────────────────
  isFormActive = signal<boolean>(false);
  isEditing = signal<boolean>(false);
  isSaving = signal<boolean>(false);

  // ── Notification signals for the form panel ─────────────────────────────────
  formError = signal<string | null>(null);
  formSuccess = signal<string | null>(null);
  isCreatingCategory = signal<boolean>(false);
  categoryError = signal<string | null>(null);

  // ── Notification signals for the detail panel ───────────────────────────────
  detailError = signal<string | null>(null);
  detailSuccess = signal<string | null>(null);

  // ── Toolbar / filters ──────────────────────────────────────────────────────
  username = signal<string | null>(null);
  currentSort = signal<TaskSortOption>(TaskSortOption.Default);
  sortMenuOpen = signal<boolean>(false);
  currentTab = signal<TaskTab>('pending');
  currentCategoryId = signal<string>('all');
  currentPage = signal<number>(1);
  pageSize = 8;
  totalCount = signal<number>(0);
  totalPages = signal<number>(0);
  pendingTasksCount = signal<number>(0);
  completedTasksCount = signal<number>(0);

  sortOptions = [
    { value: TaskSortOption.Default, label: 'Default' },
    { value: TaskSortOption.TitleAsc, label: 'Title (A-Z)' },
    { value: TaskSortOption.TitleDesc, label: 'Title (Z-A)' },
    { value: TaskSortOption.CreatedAtDesc, label: 'Newest First' },
    { value: TaskSortOption.CreatedAtAsc, label: 'Oldest First' },
  ];

  TaskSortOption = TaskSortOption;

  taskForm = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    categoryId: [''],
    deadline: [''],
  });

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  ngOnInit() {
    this.username.set(this.authService.getUsername() || 'User');
    this.loadCategories();
    this.loadTasks();
  }

  // ── Data loading ───────────────────────────────────────────────────────────
  loadCategories() {
    this.taskService
      .getCategories()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (categories) => this.categories.set(categories),
      });
  }

  loadTasks() {
    this.isLoading.set(true);

    this.taskService
      .getTasks({
        categoryId:
          this.currentCategoryId() === 'all' ? undefined : this.currentCategoryId(),
        isCompleted: this.currentTab() === 'completed',
        sortBy: this.currentSort(),
        pageNumber: this.currentPage(),
        pageSize: this.pageSize,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (
            response.totalPages > 0 &&
            this.currentPage() > response.totalPages
          ) {
            this.currentPage.set(response.totalPages);
            this.loadTasks();
            return;
          }

          this.tasks.set(response.items);
          this.totalCount.set(response.totalCount);
          this.totalPages.set(response.totalPages);
          this.pendingTasksCount.set(response.pendingCount);
          this.completedTasksCount.set(response.completedCount);
          this.isLoading.set(false);

          const currentSelected = this.selectedTask();
          if (currentSelected) {
            const updatedSelected = response.items.find(
              (task) => task.id === currentSelected.id
            );
            this.selectedTask.set(updatedSelected || null);
          }
        },
        error: () => this.isLoading.set(false),
      });
  }

  // ── Computed ───────────────────────────────────────────────────────────────
  pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, index) => index + 1)
  );

  displayStart = computed(() => {
    if (this.totalCount() === 0) return 0;
    return (this.currentPage() - 1) * this.pageSize + 1;
  });

  displayEnd = computed(() =>
    Math.min(this.currentPage() * this.pageSize, this.totalCount())
  );

  // ── Sort / filter / pagination ─────────────────────────────────────────────
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
    this.currentCategoryId.set(value);
    this.currentPage.set(1);
    this.loadTasks();
  }

  changeTab(tab: TaskTab) {
    this.currentTab.set(tab);
    this.currentPage.set(1);
    this.loadTasks();
  }

  previousPage() {
    if (this.currentPage() === 1) return;
    this.currentPage.update((page) => page - 1);
    this.loadTasks();
  }

  nextPage() {
    if (this.currentPage() >= this.totalPages()) return;
    this.currentPage.update((page) => page + 1);
    this.loadTasks();
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.loadTasks();
  }

  // ── Task selection ─────────────────────────────────────────────────────────
  selectTask(task: TaskItem) {
    this.selectedTask.set(task);
    this.isFormActive.set(false);
    this.clearNotifications();
  }

  // ── Form actions ───────────────────────────────────────────────────────────
  startAddTask() {
    this.isEditing.set(false);
    this.isFormActive.set(true);
    this.taskForm.reset();
    this.clearNotifications();
  }

  startEditTask(task: TaskItem) {
    this.selectedTask.set(task);
    this.isEditing.set(true);
    this.isFormActive.set(true);
    this.taskForm.patchValue({
      title: task.title,
      description: task.description || '',
      categoryId: task.categoryId || '',
      deadline: task.deadline || '',
    });
    this.clearNotifications();
  }

  cancelForm() {
    this.isFormActive.set(false);
    this.clearNotifications();
  }

  onCreateCategory(name: string) {
    this.categoryError.set(null);
    this.isCreatingCategory.set(true);

    this.taskService.createCategory(name)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (category) => {
          this.isCreatingCategory.set(false);
          if (!this.categories().some(c => c.id === category.id)) {
            this.categories.update(categories =>
              [...categories, category].sort((a, b) => a.name.localeCompare(b.name))
            );
          }
          this.taskForm.patchValue({ categoryId: category.id });
        },
        error: () => {
          this.isCreatingCategory.set(false);
          this.categoryError.set('Failed to create the category. Please try again.');
        },
      });
  }

  onSaveTask() {
    if (this.taskForm.invalid) return;

    this.isSaving.set(true);
    this.formError.set(null);
    this.formSuccess.set(null);

    const formValue = this.taskForm.value;

    if (this.isEditing() && this.selectedTask()) {
      const existingTask = this.selectedTask()!;
      const payload: UpdateTaskPayload = {
        title: formValue.title!,
        description: formValue.description || '',
        categoryId: formValue.categoryId || undefined,
        deadline: formValue.deadline || undefined,
        isCompleted: existingTask.isCompleted,
      };

      const previousTasks = this.tasks();
      const categoryName = this.categories().find(c => c.id === payload.categoryId)?.name;
      const updatedTask: TaskItem = { ...existingTask, ...payload, categoryName };

      this.tasks.update(tasks => tasks.map(t => (t.id === existingTask.id ? updatedTask : t)));
      this.selectedTask.set(updatedTask);

      this.taskService.updateTask(existingTask.id, payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSaving.set(false);
          this.isFormActive.set(false);
        },
        error: () => {
          this.tasks.set(previousTasks);
          this.selectedTask.set(existingTask);
          this.isSaving.set(false);
          this.formError.set('Failed to update the task. Please try again.');
        },
      });
    } else {
      const payload: CreateTaskPayload = {
        title: formValue.title!,
        description: formValue.description || '',
        categoryId: formValue.categoryId || undefined,
        deadline: formValue.deadline || undefined,
      };

      this.taskService.createTask(payload)
       .pipe(takeUntilDestroyed(this.destroyRef))
       .subscribe({
        next: (createdTask) => {
          this.isSaving.set(false);
          this.isFormActive.set(false);
          this.pendingTasksCount.update(count => count + 1);

          const matchesCurrentView = this.currentTab() === 'pending' && this.currentCategoryId() === 'all';
          if (matchesCurrentView) {
            this.totalCount.update(count => count + 1);
            this.totalPages.set(Math.ceil(this.totalCount() / this.pageSize));

            if (this.currentPage() === 1) {
              this.tasks.update(tasks => [createdTask, ...tasks].slice(0, this.pageSize));
            }
          }
        },
        error: () => {
          this.isSaving.set(false);
          this.formError.set('Failed to create the task. Please try again.');
        },
      });
    }
  }

  // ── Detail-panel actions (delegated from TaskDetailComponent) ──────────────
  onMarkComplete(task: TaskItem) {
    this.detailError.set(null);
    this.detailSuccess.set(null);

    const previousTasks = this.tasks();
    const previousTotalCount = this.totalCount();
    const previousTotalPages = this.totalPages();
    const previousPendingCount = this.pendingTasksCount();
    const previousCompletedCount = this.completedTasksCount();
    const previousSelectedTask = this.selectedTask();
    const wasVisibleInCurrentTab = this.currentTab() === 'pending';

    if (wasVisibleInCurrentTab) {
      this.tasks.update(tasks => tasks.filter(t => t.id !== task.id));
      const newTotalCount = Math.max(0, previousTotalCount - 1);
      this.totalCount.set(newTotalCount);
      this.totalPages.set(Math.ceil(newTotalCount / this.pageSize));
    }
    this.pendingTasksCount.set(Math.max(0, previousPendingCount - 1));
    this.completedTasksCount.set(previousCompletedCount + 1);
    if (previousSelectedTask?.id === task.id) {
      this.selectedTask.set(null);
    }

    this.taskService.markAsComplete(task.id)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: () => {
        this.detailSuccess.set(`"${task.title}" has been marked as complete.`);
        if (wasVisibleInCurrentTab && this.tasks().length === 0 && this.currentPage() > 1) {
          this.currentPage.update(page => page - 1);
          this.loadTasks();
        }
      },
      error: () => {
        this.tasks.set(previousTasks);
        this.totalCount.set(previousTotalCount);
        this.totalPages.set(previousTotalPages);
        this.pendingTasksCount.set(previousPendingCount);
        this.completedTasksCount.set(previousCompletedCount);
        this.selectedTask.set(previousSelectedTask);
        this.detailError.set('Failed to update the task. Please try again.');
      },
    });
  }

  onDeleteTask(task: TaskItem) {
    this.detailError.set(null);
    this.detailSuccess.set(null);

    const previousTasks = this.tasks();
    const previousTotalCount = this.totalCount();
    const previousTotalPages = this.totalPages();
    const previousPendingCount = this.pendingTasksCount();
    const previousCompletedCount = this.completedTasksCount();
    const previousSelectedTask = this.selectedTask();

    this.tasks.update(tasks => tasks.filter(t => t.id !== task.id));
    const newTotalCount = Math.max(0, previousTotalCount - 1);
    this.totalCount.set(newTotalCount);
    this.totalPages.set(Math.ceil(newTotalCount / this.pageSize));
    if (task.isCompleted) {
      this.completedTasksCount.set(Math.max(0, previousCompletedCount - 1));
    } else {
      this.pendingTasksCount.set(Math.max(0, previousPendingCount - 1));
    }
    if (previousSelectedTask?.id === task.id) {
      this.selectedTask.set(null);
    }

    this.taskService.deleteTask(task.id)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: () => {
        if (this.tasks().length === 0 && this.currentPage() > 1) {
          this.currentPage.update(page => page - 1);
          this.loadTasks();
        }
      },
      error: () => {
        this.tasks.set(previousTasks);
        this.totalCount.set(previousTotalCount);
        this.totalPages.set(previousTotalPages);
        this.pendingTasksCount.set(previousPendingCount);
        this.completedTasksCount.set(previousCompletedCount);
        this.selectedTask.set(previousSelectedTask);
        this.detailError.set('Failed to delete the task. Please try again.');
      },
    });
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  private clearNotifications() {
    this.formError.set(null);
    this.formSuccess.set(null);
    this.detailError.set(null);
    this.detailSuccess.set(null);
    this.categoryError.set(null);
  }
}
