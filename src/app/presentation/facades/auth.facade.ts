import { inject, Injectable, signal } from '@angular/core';
import { LoginUseCase } from '../../application/use-cases/login/login.use-case';
import { CheckSessionUseCase } from '../../application/use-cases/check-session/check-session.use-case';
import { User } from '../../domain/entities/user.entity';
import { Observable, tap } from 'rxjs';

export interface UserState {
  isAuthenticated: boolean;
  user: User | null;
}

@Injectable({ providedIn: 'root' })
export class AuthFacade {
  private readonly loginUC = inject(LoginUseCase);
  private readonly checkSessionUC = inject(CheckSessionUseCase);

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
}
