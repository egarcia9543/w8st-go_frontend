import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { AuthRepository } from '../../../domain/repositories/auth/auth.repository';

@Injectable()
export class AuthRepositoryImp implements AuthRepository {
  login(): void {
    window.location.href = `${environment.apiUrl}/auth/google`;
  }
}
