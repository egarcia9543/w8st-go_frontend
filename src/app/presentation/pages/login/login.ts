import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { HlmButton } from '@spartan-ng/helm/button';
import { AnimationOptions, LottieComponent } from 'ngx-lottie';

@Component({
  selector: 'app-login',
  imports: [HlmButton, TranslatePipe, LottieComponent],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  protected readonly loginAnimation: AnimationOptions = {
    path: '/animations/Money.json',
  };
}
