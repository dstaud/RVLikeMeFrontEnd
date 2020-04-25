import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { ShareDataService } from '@services/share-data.service';

@Component({
  selector: 'app-rvlm-internet',
  templateUrl: './internet.component.html',
  styleUrls: ['./internet.component.scss']
})
export class InternetComponent implements OnInit {

  constructor(private activateBackArrowSvc: ActivateBackArrowService,
              private router: Router,
              private shareDataSvc: ShareDataService) { }

  ngOnInit(): void {
  }

  onGroup() {
    let params: string;

    this.activateBackArrowSvc.setBackRoute('newbie/internet');
    params = '{"forumType":"topic","topic":"internet","topicDesc":"Internet Connectivity" }'
    this.shareDataSvc.setData(params);
    this.router.navigateByUrl('/forums');
  }
}
