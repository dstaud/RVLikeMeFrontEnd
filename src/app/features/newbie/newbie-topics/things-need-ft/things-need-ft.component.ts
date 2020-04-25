import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { ShareDataService } from '@services/share-data.service';

@Component({
  selector: 'app-things-need-ft',
  templateUrl: './things-need-ft.component.html',
  styleUrls: ['./things-need-ft.component.scss']
})
export class ThingsNeedFtComponent implements OnInit {

  constructor(private activateBackArrowSvc: ActivateBackArrowService,
              private router: Router,
              private shareDataSvc: ShareDataService) { }

  ngOnInit(): void {
  }

  onGroup() {
    let params: string;

    this.activateBackArrowSvc.setBackRoute('newbie/selling-house');
    params = '{"forumType":"topic","topic":"thingsYouNeedFullTime","topicDesc":"Things you need when going full-time" }'
    this.shareDataSvc.setData(params);
    this.router.navigateByUrl('/forums');
  }
}
