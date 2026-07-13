import { inject, Injectable } from "@angular/core";
import { LoginUseCase } from "../../application/use-cases/login/login.use-case";

@Injectable({ providedIn: "root" })
export class AuthFacade {
  private readonly loginUC = inject(LoginUseCase);

  loginWithGoogle(): void {
    this.loginUC.execute();
  }
}
