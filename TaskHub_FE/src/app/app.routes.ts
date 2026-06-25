import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { TaskBoardComponent } from './features/tasks/task-board/task-board.component';
import { authGuard } from './core/guards/auth.guard';
import { SignupComponent } from './features/auth/signup/signup.component';

export const routes: Routes = [
  { path: '', redirectTo: '/tasks', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'tasks', component: TaskBoardComponent, canActivate: [authGuard] }
];
