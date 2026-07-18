import { Component, inject, OnInit } from '@angular/core';
import { TransactionType } from '../../../domain/entities/transaction.entity';
import { TransactionsFacade } from '../../facades/transactions.facade';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { HlmButton } from '@spartan-ng/helm/button';

@Component({
  selector: 'app-transactions',
  imports: [CurrencyPipe, DatePipe, HlmButton],
  templateUrl: './transactions.html',
  styleUrl: './transactions.scss',
})
export class Transactions implements OnInit {
  protected readonly transactionsFacade = inject(TransactionsFacade);
  protected readonly transactionTypes = TransactionType;

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.transactionsFacade.loadTransactions();
  }
}
