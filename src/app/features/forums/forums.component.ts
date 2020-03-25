import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { TranslateService } from '@ngx-translate/core';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { Observable } from 'rxjs';

import { AuthenticationService } from '@services/data-services/authentication.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { ForumService } from '@services/data-services/forum.service';
import { ProfileService, IuserProfile } from '@services/data-services/profile.service';

@Component({
  selector: 'app-rvlm-forums',
  templateUrl: './forums.component.html',
  styleUrls: ['./forums.component.scss']
})
export class ForumsComponent implements OnInit {
  matches = [];
  forumKey: string;
  showSpinner = false;

  private backPath = '';
  private routeSubscription: any;
  private queryParams: any;
  private forumID: string;

  // Interface for profile data
  profile: IuserProfile;

  userProfile: Observable<IuserProfile>;

  constructor(public translate: TranslateService,
              private auth: AuthenticationService,
              private location: Location,
              private profileSvc: ProfileService,
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

    this.userProfile = this.profileSvc.profile;

    this.userProfile
    .pipe(untilComponentDestroyed(this))
    .subscribe(data => {
      this.profile = data;
    }, (error) => {
      console.error(error);
    });

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
        this.getGroup();
      } else {
        this.getGroups();
        this.showSpinner = false;
      }
    });
  }

  ngOnDestroy() {}


  private getGroup(): void {
    let param: string;
    let name: string;
    let value: string;
    let names = '';
    let values = '';
    let forumItem: string;
    let nameArray = [];
    let docNotAMatch = false;
    let matchFound = false;

    this.showSpinner = true;
    this.forumKey = '';
    for (param in this.queryParams) {
      name = param;
      nameArray.push(name);
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
      this.matches.push(this.translate.instant(forumItem));
      if (names) {
        names = names + '|';
        values = values + '|';
      }
      names = names + name;
      values = values + value;
    }
    console.log(names, values);
    console.log(this.matches);

    // Check if group already exists
    this.forumSvc.getGroup(names, values)
    .subscribe(group => {
      console.log('GROUP ', group, group.length);

      // Query may return multiple because may be super-sets but want an exact match so check if extraneous fields returned.
      for (let i = 0; i < group.length; i++) {
        let rec = Object.keys(group[i]);
        console.log('REC=', rec);
        docNotAMatch = false;
        for (let j = 0; j < rec.length; j++) {
          if (!nameArray.includes(rec[j])) {
            if (rec[j] !== 'createdBy' && rec[j] !== 'createdAt' && rec[j] !== 'updatedAt' && rec[j] !== '_id' && rec[j] !== '__v') {
              console.log('EXTRA FIELD=', rec[j]);
              docNotAMatch = true;
            }
          }
        }
        if (!docNotAMatch) {
          matchFound = true;
          this.forumID = group[i]._id;
          console.log('MATCH FOUND!', this.forumID);
          break;
        }
      }

      // if no exact match, create the forum group
      if (matchFound) {
        this.getPosts(this.forumID);
      } else {
        this.createForum(names, values);
      }
    }, error => {
      // if no match at all, create the forum group
      if (error.status === 404) {
        console.log('404');
        this.createForum(names, values);
      } else {
        console.log(error);
        this.showSpinner = false;
      }
    });
  }

  private getGroups() {
    console.log('FORUMS=', this.profile.forums);
    this.forumSvc.getGroups(this.profile.forums)
    .subscribe(groups => {
      if (groups.length === 0) {
        console.log('groups not found!');
      } else {
        console.log('groups found!', groups);
      }
      this.showSpinner = false;
    }, error => {
      if (error.status === 404) {
        console.log('404');
        this.showSpinner = false;
      } else {
      console.log(error);
      this.showSpinner = false;
      }
    });
  }

  private createForum(names: string, values: string): void {
    this.forumSvc.addGroup(names, values)
    .subscribe(group => {
      this.forumID = group._id;
      console.log('GROUP ADD ', this.forumID);
      this.profile.forums.push(this.forumID);
      this.profileSvc.updateProfile(this.profile)
      .pipe(untilComponentDestroyed(this))
      .subscribe ((responseData) => {
        console.log('updated profile = ', responseData);
        this.getPosts(this.forumID);
        this.showSpinner = false;
      }, error => {
        console.log(error);
        this.showSpinner = false;
      });
    }, error => {
      console.log(error);
      this.showSpinner = false;
    });
  }
}
