import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { HlmButton } from '@spartan-ng/helm/button';

@Component({
  selector: 'app-login',
  imports: [HlmButton, TranslatePipe],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {}
