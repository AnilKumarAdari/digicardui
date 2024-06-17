import { Component } from '@angular/core';

import { AccountService, CardService } from '@app/_services';

@Component({
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.css'],
})
export class HomeComponent {
  account = this.accountService.accountValue;
  cardDetails: any;

  constructor(
    private accountService: AccountService,
    private cardService: CardService
  ) {}

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.cardService
      .getcardByUserId(this.account?.id || '')
      .subscribe((data) => {
        this.cardDetails = data;
      });
  }
}
