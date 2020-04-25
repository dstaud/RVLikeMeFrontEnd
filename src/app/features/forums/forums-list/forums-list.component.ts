import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { ProfileService, IuserProfile } from '@services/data-services/profile.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { AuthenticationService } from '@services/data-services/authentication.service';
import { ThemeService } from '@services/theme.service';
import { ShareDataService } from '@services/share-data.service';

@Component({
  selector: 'app-forums-list',
  templateUrl: './forums-list.component.html',
  styleUrls: ['./forums-list.component.scss']
})
export class ForumsListComponent implements OnInit {
  groupListDisplayAttributes = [];
  theme: string;

  showSpinner: boolean = false;

  private profile: IuserProfile;
  private userProfile: Observable<IuserProfile>;
  private backPath: string;
  private groupsListFromUserProfile = [];
  private groupProfileDisplayAttributesFromGroup = [];

  constructor(private router: Router,
              private auth: AuthenticationService,
              private location: Location,
              private profileSvc: ProfileService,
              public translate: TranslateService,
              private activateBackArrowSvc: ActivateBackArrowService,
              private themeSvc: ThemeService,
              private shareDataSvc: ShareDataService,
              private elementRef: ElementRef) { }

  ngOnInit(): void {
    if (!this.auth.isLoggedIn()) {
      this.backPath = this.location.path().substring(1, this.location.path().length);
      this.activateBackArrowSvc.setBackRoute('*' + this.backPath);
      this.router.navigateByUrl('/signin');
    }

    this.listenForColorTheme();

    this.listenForUserProfile();
  }

  ngOnDestroy() {
  }

  // If user likes the comment, add to the total for likes for the comment
  onLikeMe() {
    this.router.navigateByUrl('connections');
  }


  // If user selects a group, configure query params and go to group forums
  onGroupSelect(groupItem: number) {
    let group = this.groupsListFromUserProfile[groupItem];
    let params: string;

    params = '{"_id":"' + group._id + '",' +
              '"forumType":"group",' +
              '"theme":"' + this.theme + '"}';

    this.shareDataSvc.setData(params);
    this.activateBackArrowSvc.setBackRoute('forums-list');
    this.router.navigateByUrl('/forums');
  }


  // Get groups from user's profile, if there are any
  private getGroups(): Array<Array<string>> {
    let groupsAttributes = [];

    if (this.profile.forums.length > 0) {
      this.groupsListFromUserProfile = this.profile.forums;

      for (let i=0; i < this.groupsListFromUserProfile.length; i++) {
        this.groupProfileDisplayAttributesFromGroup = this.getGroupDisplayAttributes(this.groupsListFromUserProfile[i]);
        groupsAttributes.push(this.groupProfileDisplayAttributesFromGroup);
      }
    }
    return groupsAttributes;
  }

  // Translate group codes to text that a user will understand for display in the template
  private getGroupDisplayAttributes(group: any): Array<string> {
    let name;
    let value;
    let forumItem;
    let groupProfileDisplayAttributesFromGroup = [];

    for (name in group) {
      if (name !== 'createdBy' && name !== 'createdAt' && name !== 'updatedAt' && name !== '_id' && name !== '__v') {
        value = group[name];
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


  // Listen for changes in color theme;
  private listenForColorTheme() {
    this.themeSvc.defaultGlobalColorTheme
    .pipe(untilComponentDestroyed(this))
    .subscribe(themeData => {
      this.theme = themeData.valueOf();
    });
  }


  // Listen for changes in Profile and take action
  private listenForUserProfile() {
    this.userProfile = this.profileSvc.profile;
    this.userProfile
    .pipe(untilComponentDestroyed(this))
    .subscribe(data => {
      this.profile = data;
      if (this.profile._id) {
        this.groupListDisplayAttributes = this.getGroups();
      }
    }, (error) => {
      console.error(error);
    });
  }
}
