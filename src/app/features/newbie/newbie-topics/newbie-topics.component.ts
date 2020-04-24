import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ActivateBackArrowService } from '@services/activate-back-arrow.service';

@Component({
  selector: 'app-rvlm-newbie-topics',
  templateUrl: './newbie-topics.component.html',
  styleUrls: ['./newbie-topics.component.scss']
})
export class NewbieTopicsComponent implements OnInit {

  constructor(private activateBackArrowSvc: ActivateBackArrowService,
              private router: Router) { }

  ngOnInit(): void {
  }

  onTopic(topic: string) {
    let params: string

    switch(topic) {
      case 'internet': {
        this.activateBackArrowSvc.setBackRoute('newbie/newbie-topics');
        this.router.navigateByUrl('/newbie/internet');
        break;
      }
   }
  }
}
