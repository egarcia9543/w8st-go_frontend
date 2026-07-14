import { inject, Injectable, signal } from '@angular/core';
import { LoginUseCase } from '../../application/use-cases/login/login.use-case';
import { CheckSessionUseCase } from '../../application/use-cases/check-session/check-session.use-case';
import { User } from '../../domain/entities/user.entity';
import { finalize, Observable, tap } from 'rxjs';
import { LogoutUseCase } from '../../application/use-cases/logout/logout.use-case';

export interface UserState {
  isAuthenticated: boolean;
  user: User | null;
}

@Injectable({ providedIn: 'root' })
export class AuthFacade {
  private readonly loginUC = inject(LoginUseCase);
  private readonly checkSessionUC = inject(CheckSessionUseCase);
  private readonly logoutUC = inject(LogoutUseCase);

  private readonly initialState: UserState = {
    isAuthenticated: false,
    user: null,
  };

  private readonly _sessionState = signal<UserState>({ ...this.initialState });
  readonly sessionState = this._sessionState.asReadonly();

  loginWithGoogle(): void {
    this.loginUC.execute();
  }

  checkSession(): Observable<User | null> {
    return this.checkSessionUC.execute().pipe(
      tap((response) => {
        this._sessionState.update((state) => ({
          ...state,
          isAuthenticated: response !== null,
          user: response,
        }));
      }),
    );
  }

  clearSession(): void {
    this._sessionState.set({ ...this.initialState });
  }

  logout(): Observable<void> {
    return this.logoutUC.execute().pipe(
      finalize(() => {
        this.clearSession();
      }),
    );
  }
}
