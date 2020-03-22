import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { TranslateService } from '@ngx-translate/core';

import { AuthenticationService } from '@services/data-services/authentication.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { ForumService } from '@services/data-services/forum.service';

@Component({
  selector: 'app-rvlm-forums',
  templateUrl: './forums.component.html',
  styleUrls: ['./forums.component.scss']
})
export class ForumsComponent implements OnInit {
  matchesDisplay = [];
  forumKey: string;
  showSpinner = false;

  private backPath = '';
  private routeSubscription: any;
  private queryParams: any;
  private forumName: string;

  constructor(public translate: TranslateService,
              private auth: AuthenticationService,
              private location: Location,
              private activateBackArrowSvc: ActivateBackArrowService,
              private router: Router,
              private route: ActivatedRoute,
              private forumSvc: ForumService) {
              }

  ngOnInit() {
    if (!this.auth.isLoggedIn()) {
      this.backPath = this.location.path().substring(1, this.location.path().length);
      this.activateBackArrowSvc.setBackRoute('*' + this.backPath);
      this.router.navigateByUrl('/signin');
    }

    // If coming from the connections page or user-query page, will get parameters that can be converted to JSON
    // Since the actual keys of the JSON object will be unknown, we iterate through to determine the keys and then
    // can use that to get the value from the original object as well.
    this.routeSubscription = this.route
    .queryParams
    .subscribe(params => {
      this.showSpinner = true;
      if (params.queryParam) {
        this.queryParams = JSON.parse(params.queryParam);
        console.log('FORUM PARAMS=', this.queryParams);
      }
      this.getGroup();
    });
  }

  private getGroup() {
    let param: string;
    let likeMe: string;
    let name: string;
    let value: string;
    let likeMeJson: string;
    let forumItem: string;

    this.showSpinner = true;
    this.forumKey = '';
    for (param in this.queryParams) {
      name = param;
      value = this.queryParams[param];
      if (value === 'true') {
        forumItem = 'forums.component.' + name;
      } else {
        if (name === 'yearOfBirth') {
          forumItem = 'forums.component.' + name;
        } else {
          forumItem = 'forums.component.list.' + name.toLowerCase() + '.' + value.toLowerCase();
        }
      }
      this.matchesDisplay.push(this.translate.instant(forumItem));
      likeMeJson = JSON.parse('{"name":"' + name + '","value":"' + value + '"}');
      if (this.forumKey) {
        this.forumKey = this.forumKey + '|';
      }
      this.forumKey = this.forumKey + name + ':' + value;
    }
    console.log(this.forumKey);
    console.log(this.matchesDisplay);

    this.forumSvc.getGroup(this.forumKey)
    .subscribe(data => {
      this.showSpinner = false;
      console.log('GROUP ', data);
    }, error => {
      if (error.status === 401) {
        this.createForum();
      } else {
        console.log(error);
      }
    });
  }

  private createForum() {
    this.forumSvc.addGroup(this.forumKey)
    .subscribe(data => {
      this.showSpinner = false;
      console.log('GROUP ADD ', data);
    }, error => {
      this.showSpinner = false;
      console.log(error);
    })
  }
}
