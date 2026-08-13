import { Observable } from 'rxjs';
import { User } from '../../entities/user.entity';
import { Credentials } from '../../entities/credentials.entity';

export abstract class AuthRepository {
  abstract login(credentials: Credentials): Observable<User>;
  abstract checkSession(): Observable<User | null>;
  abstract logout(): Observable<void>;
  abstract connectGmail(): void;
}
