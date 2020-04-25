import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { ShareDataService } from '@services/share-data.service';

@Component({
  selector: 'app-rvlm-insurance',
  templateUrl: './insurance.component.html',
  styleUrls: ['./insurance.component.scss']
})
export class InsuranceComponent implements OnInit {

  constructor(private activateBackArrowSvc: ActivateBackArrowService,
              private router: Router,
              private shareDataSvc: ShareDataService) { }

  ngOnInit(): void {
  }

  onGroup() {
    let params: string;

    this.activateBackArrowSvc.setBackRoute('newbie/insurance');
    params = '{"forumType":"topic","topic":"insurance","topicDesc":"Insuring an RV" }'
    this.shareDataSvc.setData(params);
    this.router.navigateByUrl('/forums');
  }

}
