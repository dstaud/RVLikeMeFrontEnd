import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { ProfileService, IuserProfile } from '@services/data-services/profile.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { AuthenticationService } from '@services/data-services/authentication.service';
import { ThemeService } from '@services/theme.service';


@Component({
  selector: 'app-forums-list',
  templateUrl: './forums-list.component.html',
  styleUrls: ['./forums-list.component.scss']
})
export class ForumsListComponent implements OnInit {
  groupListDisplayAttributes = [];
  groupsListFromUserProfile = [];
  groupProfileDisplayAttributesFromGroup = [];
  theme: string;

  showSpinner: boolean = false;

  private profile: IuserProfile;
  private userProfile: Observable<IuserProfile>;
  private backPath: string;

  constructor(private router: Router,
              private auth: AuthenticationService,
              private location: Location,
              private profileSvc: ProfileService,
              public translate: TranslateService,
              private activateBackArrowSvc: ActivateBackArrowService,
              private themeSvc: ThemeService) { }

  ngOnInit(): void {
    if (!this.auth.isLoggedIn()) {
      this.backPath = this.location.path().substring(1, this.location.path().length);
      this.activateBackArrowSvc.setBackRoute('*' + this.backPath);
      this.router.navigateByUrl('/signin');
    }

    // Listen for changes in color theme;
    console.log('ForumsListComponent:ngOnInit: getting theme');
    this.themeSvc.defaultGlobalColorTheme
    .pipe(untilComponentDestroyed(this))
    .subscribe(themeData => {
      this.theme = themeData.valueOf();
      console.log('ForumsListComponent:ngOnInit: Theme=', this.theme);
    });

    console.log('ForumsListComponent:ngOnInit: getting profile');
    this.userProfile = this.profileSvc.profile;
    this.userProfile
    .pipe(untilComponentDestroyed(this))
    .subscribe(data => {
      console.log('ForumsListComponent:ngOnInit: got new profile data=', data);
      this.profile = data;
      if (this.profile._id) {
        // this.groupsListFromUserProfile = this.profile.forums;
        console.log('ForumsListComponent:ngOnInit: got Profile Data, so get all groups for user');
        this.groupListDisplayAttributes = this.getGroups();
        console.log('ForumsListComponent:ngOnInit: got groups and attributes for display ', this.groupListDisplayAttributes);
      }
    }, (error) => {
      console.error(error);
    });
  }

  ngOnDestroy() {}

  onLikeMe() {
    this.router.navigateByUrl('connections');
  }

  private getGroups(): Array<Array<string>> {
    let groupsAttributes = [];

    console.log('ForumsListComponent:getGroups: Groups for profile=', this.profile.forums);
    if (this.profile.forums.length === 0) {
      console.log('ForumsListComponent:getGroups: Groups not found!');
    } else {
      this.groupsListFromUserProfile = this.profile.forums;

      for (let i=0; i < this.groupsListFromUserProfile.length; i++) {
        console.log('ForumsListComponent:getGroups: Getting attributes for ', this.groupsListFromUserProfile[i]);
        this.groupProfileDisplayAttributesFromGroup = this.getGroupDisplayAttributes(this.groupsListFromUserProfile[i]);
        groupsAttributes.push(this.groupProfileDisplayAttributesFromGroup);
      }
      console.log('ForumsListComponent:getGroups: Group found, Attributes=', groupsAttributes);
    }
    return groupsAttributes;
  }


  onGroupSelect(groupItem: number) {
    let group = this.groupsListFromUserProfile[groupItem];
    let queryParams: string;

    this.activateBackArrowSvc.setBackRoute('forums-list');
    console.log('ForumsListComponent:onGroupSelect: navigating', group);
    queryParams = '{"_id":"' + group._id + '",' +
                  '"theme":"' + this.theme + '"}';
    console.log('ForumsListComponent:onGroupSelect: query params=', queryParams);
    this.router.navigate(['/forums'], { queryParams: { queryParam: queryParams }});
  }

  // Translate group codes to text that a user will understand for display in the template
  private getGroupDisplayAttributes(group: any): Array<string> {
    let name;
    let value;
    let forumItem;
    let groupProfileDisplayAttributesFromGroup = [];

    console.log('ForumsListComponent:getGroupDisplayAttributes: group=', group);
    for (name in group) {
      if (name !== 'createdBy' && name !== 'createdAt' && name !== 'updatedAt' && name !== '_id' && name !== '__v') {
        value = group[name];
        console.log('ForumsListComponent:getGroupDisplayAttributes: NAME=',name, 'VALUE=', value);
        if (value === 'true' || value === true) {
          forumItem = 'forums.component.' + name;
        } else {
          if (name === 'yearOfBirth') {
            forumItem = 'forums.component.' + name;
          } else {
            forumItem = 'forums.component.list.' + name.toLowerCase() + '.' + value.toLowerCase();
          }
        }
        groupProfileDisplayAttributesFromGroup.push(this.translate.instant(forumItem));
      }
    }
    return groupProfileDisplayAttributesFromGroup;
  }

}
