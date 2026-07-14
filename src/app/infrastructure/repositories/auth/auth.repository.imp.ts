import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { AuthRepository } from '../../../domain/repositories/auth/auth.repository';
import { catchError, Observable, of, map, throwError } from 'rxjs';
import { User } from '../../../domain/entities/user.entity';
import { AuthApiDatasource } from '../../datasources/auth/auth.api.datasource';
import { UserMapper } from '../../mappers/user.mapper';
import { UserDto } from '../../models/user.dto';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';

@Injectable()
export class AuthRepositoryImp implements AuthRepository {
  private readonly authDatasource = inject(AuthApiDatasource);
  login(): void {
    window.location.href = `${environment.apiUrl}/auth/google`;
  }

  checkSession(): Observable<User | null> {
    return this.authDatasource.checkSession().pipe(
      map((user: UserDto) => {
        return UserMapper.toDomain(user);
      }),
      catchError((error: HttpErrorResponse) =>
        error.status === HttpStatusCode.Unauthorized ? of(null) : throwError(() => error),
      ),
    );
  }

  logout(): Observable<void> {
    return this.authDatasource.logout();
  }
}
