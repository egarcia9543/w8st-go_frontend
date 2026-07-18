import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { HlmButton } from '@spartan-ng/helm/button';
import { AuthFacade } from '../../facades/auth.facade';
import { SummaryFacade } from '../../facades/summary.facade';
import { CurrencyPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [TranslatePipe, HlmButton, DatePipe, CurrencyPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  protected readonly facade = inject(AuthFacade);
  protected readonly summaryFacade = inject(SummaryFacade);
  protected readonly summaryState = this.summaryFacade.summaryState;
  private router = inject(Router);

  constructor() {
    this.summaryFacade.loadSummary();
  }

  logout(): void {
    this.facade.logout().subscribe(() => this.router.navigate(['/login']));
  }
}
