import { inject, Injectable } from '@angular/core';
import { AuthRepository } from '../../../domain/repositories/auth/auth.repository';

@Injectable({ providedIn: 'root' })
export class SignInWithGoogleUseCase {
  private readonly authRepository = inject(AuthRepository);

  execute(): void {
    this.authRepository.signInWithGoogle();
  }
}
