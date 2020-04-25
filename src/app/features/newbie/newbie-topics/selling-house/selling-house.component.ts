import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { ShareDataService } from '@services/share-data.service';

@Component({
  selector: 'app-selling-house',
  templateUrl: './selling-house.component.html',
  styleUrls: ['./selling-house.component.scss']
})
export class SellingHouseComponent implements OnInit {

  constructor(private activateBackArrowSvc: ActivateBackArrowService,
              private router: Router,
              private shareDataSvc: ShareDataService) { }

  ngOnInit(): void {
  }

  onGroup() {
    let params: string;

    this.activateBackArrowSvc.setBackRoute('newbie/selling-house');
    params = '{"forumType":"topic","topic":"sellingHouse","topicDesc":"Selling house and possessions to go full-time" }'
    this.shareDataSvc.setData(params);
    this.router.navigateByUrl('/forums');
  }
}
