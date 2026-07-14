import { inject, Injectable } from '@angular/core';
import { AuthRepository } from '../../../domain/repositories/auth/auth.repository';
import { Observable } from 'rxjs';
import { User } from '../../../domain/entities/user.entity';

@Injectable({ providedIn: 'root' })
export class CheckSessionUseCase {
  private readonly authRepository = inject(AuthRepository);

  execute(): Observable<User | null> {
    return this.authRepository.checkSession();
  }
}
