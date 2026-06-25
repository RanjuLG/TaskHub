import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { catchError, Observable, tap} from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly authToken = signal<string | null>(localStorage.getItem('basicAuth'));
  readonly isLoggedIn = computed(() => !!this.authToken());

  login(username: string, password: string): Observable<any> {
    const credentials = btoa(`${username}:${password}`);

    return this.http.get(`${environment.apiUrl}/auth/login`, {
      headers: { Authorization: `Basic ${credentials}` }
    }).pipe(
      tap(() => {
        this.authToken.set(credentials);
        localStorage.setItem('basicAuth', credentials);
        this.router.navigate(['/tasks']);
      })
    );
  }

  register(username: string, password: string): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/auth/register`, { username, password });
  }

  logout(): void {
    localStorage.removeItem('basicAuth');
    this.authToken.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.authToken();
  }

  getUsername(): string | null {
    const token = this.authToken();
    if (!token) return null;
    try {
      return atob(token).split(':')[0];
    } catch {
      return null;
    }
  }
}
