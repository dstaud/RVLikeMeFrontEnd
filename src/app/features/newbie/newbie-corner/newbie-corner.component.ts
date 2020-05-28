import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

import { Observable } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { AuthenticationService } from '@services/data-services/authentication.service';
import { DeviceService } from '@services/device.service';
import { ProfileService, IuserProfile } from '@services/data-services/profile.service';

import { InewbieTopic } from '@services/share-data.service';

export interface Itopics {
  _id: string;
  topicID: string;
  topicDesc: string;
}

@Component({
  selector: 'app-rvlm-newbie-corner',
  templateUrl: './newbie-corner.component.html',
  styleUrls: ['./newbie-corner.component.scss']
})
export class NewbieCornerComponent implements OnInit {
  @Output() topicSelected = new EventEmitter<InewbieTopic>();

  displayName: string;
  profileImageUrl: string;
  authorizedTopics: Array<Itopics> = [];

  private userProfile: Observable<IuserProfile>;

  constructor(private authSvc: AuthenticationService,
              private activateBackArrowSvc: ActivateBackArrowService,
              private location: Location,
              private profileSvc: ProfileService,
              private device: DeviceService,
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

  ngOnDestroy() {}


  getClass() {
    let containerClass: string;
    let bottomSpacing: string;

    if (this.device.iPhoneModelXPlus) {
      bottomSpacing = 'bottom-bar-spacing-xplus';
    } else {
      bottomSpacing = 'bottom-bar-spacing';
    }

    containerClass = 'container ' + bottomSpacing;

    return containerClass;
  }

  onTopicSelected(params: InewbieTopic) {
    console.log('HelpNewbieComponent:onTopicsSelected: sending up the chain=', params);
    this.topicSelected.emit(params);
  }

}
