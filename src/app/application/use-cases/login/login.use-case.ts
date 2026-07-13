import { inject, Injectable } from "@angular/core";
import { AuthRepository } from "../../../domain/repositories/auth/auth.repository";

@Injectable()
export class LoginUseCase {
  private readonly authRepository = inject(AuthRepository);

  execute(): void {
    this.authRepository.login();
  }
}
