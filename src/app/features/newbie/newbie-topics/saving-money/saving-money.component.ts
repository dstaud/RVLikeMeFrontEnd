import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { ShareDataService } from '@services/share-data.service';

@Component({
  selector: 'app-rvlm-saving-money',
  templateUrl: './saving-money.component.html',
  styleUrls: ['./saving-money.component.scss']
})
export class SavingMoneyComponent implements OnInit {

  constructor(private activateBackArrowSvc: ActivateBackArrowService,
              private router: Router,
              private shareDataSvc: ShareDataService) { }

  ngOnInit(): void {
  }

  onGroup() {
    let params: string;

    this.activateBackArrowSvc.setBackRoute('newbie/saving-money');
    params = '{"forumType":"topic","topic":"savingMoney","topicDesc":"Money-saving ideas" }'
    this.shareDataSvc.setData(params);
    this.router.navigateByUrl('/forums');
  }
}
