import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';

import { AccountService, UserService } from '@app/_services';

@Component({ templateUrl: 'list.component.html' })
export class ListComponent implements OnInit {
  accounts?: any[];

  constructor(
    private accountService: AccountService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.userService
      .getAllusers()
      .pipe(first())
      .subscribe((accounts) => (this.accounts = accounts.results));
  }

  deleteAccount(id: string) {
    const account = this.accounts!.find((x) => x.id === id);
    account.isDeleting = true;
    this.accountService
      .delete(id)
      .pipe(first())
      .subscribe(() => {
        this.accounts = this.accounts!.filter((x) => x.id !== id);
      });
  }
}
