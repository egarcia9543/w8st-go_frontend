import { Component, inject } from '@angular/core';
import { AuthFacade } from '../../facades/auth.facade';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  protected readonly facade = inject(AuthFacade);
}
