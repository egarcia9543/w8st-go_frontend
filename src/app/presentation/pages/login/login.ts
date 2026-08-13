import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmInput } from '@spartan-ng/helm/input';
import { AnimationOptions, LottieComponent } from 'ngx-lottie';
import { AuthFacade } from '../../facades/auth.facade';

@Component({
  selector: 'app-login',
  imports: [HlmButton, HlmInput, ReactiveFormsModule, TranslatePipe, LottieComponent],
  templateUrl: './login.html',
})
export class Login {
  private readonly authFacade = inject(AuthFacade);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly loginAnimation: AnimationOptions = {
    path: '/animations/Money.json',
  };

  protected readonly loading = signal(false);
  protected readonly errorKey = signal<string | null>(null);

  protected readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  public submit(): void {
    if (this.loading()) return;

    this.errorKey.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    this.authFacade.login(this.form.getRawValue()).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorKey.set(this.errorKeyFor(error.status));
      },
    });
  }

  private errorKeyFor(status: number): string {
    switch (status) {
      case HttpStatusCode.BadRequest:
        return 'login.errors.missingFields';
      case HttpStatusCode.Unauthorized:
        return 'login.errors.invalidCredentials';
      default:
        return 'login.errors.unexpected';
    }
  }
}
