import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { ShareDataService } from '@services/share-data.service';

@Component({
  selector: 'app-rvlm-making-money',
  templateUrl: './making-money.component.html',
  styleUrls: ['./making-money.component.scss']
})
export class MakingMoneyComponent implements OnInit {

  constructor(private activateBackArrowSvc: ActivateBackArrowService,
              private router: Router,
              private shareDataSvc: ShareDataService) { }

  ngOnInit(): void {
  }

  onGroup() {
    let params: string;

    this.activateBackArrowSvc.setBackRoute('newbie/making-money');
    params = '{"forumType":"topic","topic":"makingMoneyOnTheRoad","topicDesc":"Making money on the road" }'
    this.shareDataSvc.setData(params);
    this.router.navigateByUrl('/forums');
  }
}
