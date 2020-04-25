import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { ShareDataService } from '@services/share-data.service';

@Component({
  selector: 'app-rvlm-cost-ft-travel',
  templateUrl: './cost-ft-travel.component.html',
  styleUrls: ['./cost-ft-travel.component.scss']
})
export class CostFtTravelComponent implements OnInit {

  constructor(private activateBackArrowSvc: ActivateBackArrowService,
              private router: Router,
              private shareDataSvc: ShareDataService) { }

  ngOnInit(): void {
  }

  onGroup() {
    let params: string;

    this.activateBackArrowSvc.setBackRoute('newbie/cost-ft-travel');
    params = '{"forumType":"topic","topic":"costFullTimeTravel","topicDesc":"How much does it cost to full-time travel?" }'
    this.shareDataSvc.setData(params);
    this.router.navigateByUrl('/forums');
  }
}
