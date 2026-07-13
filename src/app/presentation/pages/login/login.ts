import { Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { HlmButton } from '@spartan-ng/helm/button';
import { AnimationOptions, LottieComponent } from 'ngx-lottie';
import { AuthFacade } from '../../facades/auth.facade';

@Component({
  selector: 'app-login',
  imports: [HlmButton, TranslatePipe, LottieComponent],
  templateUrl: './login.html',
})
export class Login {
  private readonly authFacade = inject(AuthFacade);

  protected readonly loginAnimation: AnimationOptions = {
    path: '/animations/Money.json',
  };

  public loginWithGoogle(): void {
    this.authFacade.loginWithGoogle();
  }
}
