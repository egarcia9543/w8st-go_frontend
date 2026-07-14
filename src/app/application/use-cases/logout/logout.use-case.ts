import { inject, Injectable } from '@angular/core';
import { AuthRepository } from '../../../domain/repositories/auth/auth.repository';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LogoutUseCase {
  private readonly authRepository = inject(AuthRepository);

  execute(): Observable<void> {
    return this.authRepository.logout();
  }
}
