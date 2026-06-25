import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { of } from 'rxjs';

import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/auth/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: Pick<AuthService, 'login'>;

  beforeEach(async () => {
    authService = {
      login: vi.fn().mockReturnValue(of(null))
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [{ provide: AuthService, useValue: authService }]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should submit credentials to the auth service', () => {
    component.loginForm.setValue({
      username: 'demo',
      password: 'secret'
    });

    component.onSubmit();

    expect(authService.login).toHaveBeenCalledWith('demo', 'secret');
  });
});
