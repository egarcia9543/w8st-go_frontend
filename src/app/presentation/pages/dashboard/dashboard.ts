import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { HlmButton } from '@spartan-ng/helm/button';
import { AuthFacade } from '../../facades/auth.facade';

@Component({
  selector: 'app-dashboard',
  imports: [TranslatePipe, HlmButton],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  protected readonly facade = inject(AuthFacade);
  private router = inject(Router);

  logout(): void {
    this.facade.logout().subscribe(() => this.router.navigate(['/login']));
  }
}
