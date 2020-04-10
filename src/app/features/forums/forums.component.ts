import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Location } from '@angular/common';

import { TranslateService } from '@ngx-translate/core';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

import { PostsComponent } from './posts/posts.component';

import { AuthenticationService } from '@services/data-services/authentication.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { ForumService } from '@services/data-services/forum.service';
import { ProfileService, IuserProfile } from '@services/data-services/profile.service';
import { ThemeService } from '@services/theme.service';
import { ShareDataService } from '@services/share-data.service';


@Component({
  selector: 'app-rvlm-forums',
  templateUrl: './forums.component.html',
  styleUrls: ['./forums.component.scss']
})
export class ForumsComponent implements OnInit {

  //  Provide access to methods on the Posts component
  @ViewChild(PostsComponent)
  public posts: PostsComponent;

  groupID: string;
  groupProfileDisplayAttributesFromGroup = [];
  groupListDisplayAttributes = [];
  groupProfileCodeAttributesFromGroup = [];
  groupsListFromUserProfile = [];
  theme: string;

  showSpinner = false;
  showLessMatches = true;
  showMoreOption = false;

  private backPath = '';
  private routeSubscription: any;
  private navSubscription: any;


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
              private shareDataSvc: ShareDataService,
              private forumSvc: ForumService,
              private themeSvc: ThemeService) {
              }

  ngOnInit() {
    if (!this.auth.isLoggedIn()) {
      this.backPath = this.location.path().substring(1, this.location.path().length);
      this.activateBackArrowSvc.setBackRoute('*' + this.backPath);
      this.router.navigateByUrl('/signin');
    }

    this.navSubscription = this.router.events
    .pipe(
      filter(event => event instanceof NavigationEnd)
    )
    .subscribe(() => window.scrollTo(0,0));

    // Listen for changes in color theme;
    this.themeSvc.defaultGlobalColorTheme
    .pipe(untilComponentDestroyed(this))
    .subscribe(themeData => {
      this.theme = themeData.valueOf();
    });

    // Listen for Profile changes
    this.userProfile = this.profileSvc.profile;
    this.userProfile
    .pipe(untilComponentDestroyed(this))
    .subscribe(data => {
      this.profile = data;
      if (this.profile._id) {
        this.groupsListFromUserProfile = this.profile.forums;
      }
    }, (error) => {
      console.error(error);
    });

    // Get parameters
/*     this.routeSubscription = this.route
    .queryParams
    .subscribe(params => {
      this.showSpinner = true;
      let queryParams = JSON.parse(params.queryParam);
      this.theme = queryParams.theme;
      this.getGroup();
    }); */
    this.getGroup();
  }

  ngOnDestroy() {
    this.navSubscription.unsubscribe();
    // this.routeSubscription.unsubscribe();
  }


  onSearch() {
    console.log('search');
  }

  // If coming from groups list, we know the user already has this group in their profile and we have the group ID
  // so get group information by key. Otherwise, queryParams sent from connections page may contain one or more profile attributes that will define a group forum.
  // getGroup extracts these attributes and checks to server to see if a group exists for the combination of profile attributes.
  // If the group does exist, it asks the server for all posts for the group forum for display in the template.
  // If the group does not exist, it asks the server to create the group forum.
  private getGroup(): void {
    let docNotAMatch = false;
    let matchFound = false;
    let keyValue;
    let names;
    let values;
    let data: any;

    if (!this.shareDataSvc.getData()) {
      console.log('ForumsComponent:getGroup: no parameters');
      this.router.navigateByUrl('/forums-list');
    } else {
      data = JSON.parse(this.shareDataSvc.getData());

      this.showSpinner = true;

      if (data._id) {
        this.groupID = data._id;
        this.forumSvc.getGroupByID(data._id)
        .subscribe(groupFromServer => {
          this.groupProfileCodeAttributesFromGroup = this.getGroupCodeAttributes(groupFromServer);
          this.groupProfileDisplayAttributesFromGroup = this.getGroupDisplayAttributes(groupFromServer);

          // If there are more than 3 attributes, show only three with ...more on the template.
          if (this.groupProfileDisplayAttributesFromGroup.length > 3) {
            this.showMoreOption = true;
          } else {
            this.showMoreOption = false;
          }

          this.posts.getPosts(this.groupID, this.profile.profileImageUrl, this.profile.displayName);
          this.showSpinner = false;

        });
      } else {
        this.groupProfileCodeAttributesFromGroup = this.getGroupCodeAttributes(data);
        this.groupProfileDisplayAttributesFromGroup = this.getGroupDisplayAttributes(data);

        // If there are more than 3 attributes, show only three with ...more on the template.
        if (this.groupProfileDisplayAttributesFromGroup.length > 3) {
          this.showMoreOption = true;
        } else {
          this.showMoreOption = false;
        }

        keyValue = this.getGroupKeyValueAttributes(data).split('~');
        names = keyValue[0];
        values = keyValue[1];

        // Check if group already exists
        this.forumSvc.getGroup(names, values)
        .subscribe(groupsFromServer => {

          // Query may return multiple group forums that include the specific name/value pairs user is looking for.
          // In Addition, any given group JSON returned may have multiple profile attributes (i.e. "aboutMe":"experienced", "yearOfBirth":"1960").
          // Look for exact match of combination of attributes, (i.e. same number of attributes and they are the same).
          for (let i = 0; i < groupsFromServer.length; i++) {
            let groupDocKeys = Object.keys(groupsFromServer[i]);
            docNotAMatch = false;

            // This parts confusing because have to look at each group forum from the server, which we know included our target profile attributes
            // selected by the user, and make sure that it does not have other attributes.
            for (let j = 0; j < groupDocKeys.length; j++) {

              // If the key, that we know is not our target attribute, is not one of the non-attributes (i.e. createdBy, _id, etc.), then we can ignore
              // this group because it is not an exact match.
              if (!this.groupProfileCodeAttributesFromGroup.includes(groupDocKeys[j])) {

                if (!this.reservedField(groupDocKeys[j])) {
                  docNotAMatch = true;
                }
              }
            }

            // If no group forum documents found with additional keys the user did not target, then the group already exists
            // and all we have to do is make sure that the group is already in the user's profile group forum list.
            if (!docNotAMatch) {
              matchFound = true;
              this.groupID = groupsFromServer[i]._id;
              this.updateProfileGroups();
              break;
            }
          }

          // if match found, display any posts; otherwise, create the group forum.
          if (matchFound) {
            this.posts.getPosts(this.groupID, this.profile.profileImageUrl, this.profile.displayName);
            this.showSpinner = false;
          } else {
            this.createGroupForum(names, values);
          }
        }, error => {
          // if no match at all, create the forum group
          if (error.status === 404) {
            this.createGroupForum(names, values);
          } else {
            console.log(error);
            this.showSpinner = false;
          }
        });
      }
    }


  }

  // Translate group codes to text that a user will understand for display in the template
  private getGroupDisplayAttributes(group: any): Array<string> {
    let name;
    let value;
    let forumItem;
    let groupProfileDisplayAttributesFromGroup = [];

    for (name in group) {
      if (!this.reservedField(name)) {
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

  // Extract profile attribute codes from groups and push to an array
  private getGroupCodeAttributes(group: any): Array<string> {
    let name;
    let groupProfileCodeAttributesFromGroup = [];

    for (name in group) {
      if (!this.reservedField(name)) {
        groupProfileCodeAttributesFromGroup.push(name);
      }
    }
    return groupProfileCodeAttributesFromGroup;
  }

  // extract key/value pairs of profile attributes with user values from groups
  private getGroupKeyValueAttributes(group: any): string {
    let name;
    let value;
    let names;
    let values;

    names = '';
    values = '';
    for (name in group) {
      if (!this.reservedField(name)) {
        value = group[name];
        if (names) {
          names = names + '|';
          values = values + '|';
        }
        names = names + name;
        values = values + value;
      }
    }
    return names + '~' + values;
  }


  // Create new group forum based on user's attribute match selections
  private createGroupForum(names: string, values: string): void {
    this.forumSvc.addGroup(names, values)
    .subscribe(group => {
      this.groupID = group._id;
      this.updateProfileGroups();
      this.posts.getPosts(this.groupID, this.profile.profileImageUrl, this.profile.displayName);
    }, error => {
      console.log(error);
      this.showSpinner = false;
    });
  }

  // Update group forum array in user's profile with new group they are associated with.
  private updateProfileGroups() {
    let groupFound = false;
    for (let i=0; i < this.groupsListFromUserProfile.length; i++) {
      if (this.groupsListFromUserProfile[i]._id === this.groupID) {
        groupFound = true;
        break;
      }
    }
    if (!groupFound) {
      console.log('ForumsComponent:updateProfileGroups: group not in profile, calling add ', this.groupID, ' to profile for ', this.profile._id);
      this.profileSvc.addGroupToProfile(this.profile._id, this.groupID)
      .pipe(untilComponentDestroyed(this))
      .subscribe ((responseData) => {
        this.profileSvc.getProfile();
        this.showSpinner = false;
      }, error => {
        console.log('ForumsComponent:updateProfileGroups: got an error adding group to profile ', error);
        console.log(error);
        this.showSpinner = false;
      });
    }
  }

  private reservedField(name: string): boolean {
    if (name === 'createdBy' || name === 'createdAt' || name === 'updatedAt' || name === '_id' || name === '__v' || name === 'theme') {
      return true;
    } else { return false }
  }
}
