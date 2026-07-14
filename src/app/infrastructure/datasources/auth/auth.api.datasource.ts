import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserDto } from '../../models/user.dto';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthApiDatasource {
  private readonly http = inject(HttpClient);

  checkSession(): Observable<UserDto> {
    return this.http.get<UserDto>(`${environment.apiUrl}/auth/me`);
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/auth/logout`, {});
  }
}
