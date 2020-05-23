import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { AuthenticationService } from '@services/data-services/authentication.service';

import { InewbieTopic } from '@services/share-data.service';

export interface Itopics {
  _id: string;
  topicID: string;
  topicDesc: string;
}

@Component({
  selector: 'app-rvlm-help-newbie',
  templateUrl: './help-newbie.component.html',
  styleUrls: ['./help-newbie.component.scss']
})

export class HelpNewbieComponent implements OnInit {
  @Output() topicSelected = new EventEmitter<InewbieTopic>();

  displayName: string;
  profileImageUrl: string;
  authorizedTopics: Array<Itopics> = [];

  constructor(private authSvc: AuthenticationService,
              private activateBackArrowSvc: ActivateBackArrowService,
              private location: Location,
              private router: Router) { }

  ngOnInit(): void {
    let backPath;
    let self = this;
    window.onpopstate = function(event) {
      self.activateBackArrowSvc.setBackRoute('', 'backward');
    };

    if (!this.authSvc.isLoggedIn()) {
      backPath = this.location.path().substring(1, this.location.path().length);
      this.activateBackArrowSvc.setBackRoute('*' + backPath, 'forward');
      this.router.navigateByUrl('/?e=signin');
    }
  }

  onTopicSelected(params: InewbieTopic) {
    console.log('HelpNewbieComponent:onTopicsSelected: sending up the chain=', params);
    this.topicSelected.emit(params);
  }
}
