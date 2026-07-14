import { Observable } from 'rxjs';
import { User } from '../../entities/user.entity';

export abstract class AuthRepository {
  abstract login(): void;
  abstract checkSession(): Observable<User | null>;
}
