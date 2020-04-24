import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ActivateBackArrowService } from '@services/activate-back-arrow.service';


@Component({
  selector: 'app-rvlm-newbie',
  templateUrl: './newbie.component.html',
  styleUrls: ['./newbie.component.scss']
})
export class NewbieComponent implements OnInit {

  constructor(private activateBackArrowSvc: ActivateBackArrowService,
              private router: Router) { }

  ngOnInit(): void {
  }

  onFAQ() {

  }


  onLikeMe() {
    this.activateBackArrowSvc.setBackRoute('newbie');
    this.router.navigateByUrl('/connections');
  }


  onProfile() {
    this.activateBackArrowSvc.setBackRoute('newbie');
    this.router.navigateByUrl('/profile');
  }


  onTopics() {
    this.activateBackArrowSvc.setBackRoute('newbie');
    this.router.navigateByUrl('/newbie-topics');
  }
}
