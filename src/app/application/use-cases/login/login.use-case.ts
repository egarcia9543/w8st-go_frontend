import { inject, Injectable } from '@angular/core';
import { AuthRepository } from '../../../domain/repositories/auth/auth.repository';
import { Observable } from 'rxjs';
import { User } from '../../../domain/entities/user.entity';
import { Credentials } from '../../../domain/entities/credentials.entity';

@Injectable({ providedIn: 'root' })
export class LoginUseCase {
  private readonly authRepository = inject(AuthRepository);

  execute(credentials: Credentials): Observable<User> {
    return this.authRepository.login(credentials);
  }
}
