import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { TranslateService } from '@ngx-translate/core';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { Observable } from 'rxjs';

import { PostsComponent } from './posts/posts.component';

import { AuthenticationService } from '@services/data-services/authentication.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { ForumService } from '@services/data-services/forum.service';
import { ProfileService, IuserProfile } from '@services/data-services/profile.service';
import { ThemeService } from '@services/theme.service';


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
  showTitlesOnly = false;

  private backPath = '';
  private routeSubscription: any;


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
              private forumSvc: ForumService,
              private themeSvc: ThemeService) {
              }

  ngOnInit() {
    console.log('ForumsComponent:ngOnInit: in Forums Component!');
    if (!this.auth.isLoggedIn()) {
      this.backPath = this.location.path().substring(1, this.location.path().length);
      this.activateBackArrowSvc.setBackRoute('*' + this.backPath);
      this.router.navigateByUrl('/signin');
    }

    // Listen for changes in color theme;
    this.themeSvc.defaultGlobalColorTheme
    .pipe(untilComponentDestroyed(this))
    .subscribe(themeData => {
      this.theme = themeData.valueOf();
      console.log('ForumsComponent:ngOnInit: Theme=', this.theme);
    });

    // Listen for Profile changes
    this.userProfile = this.profileSvc.profile;
    this.userProfile
    .pipe(untilComponentDestroyed(this))
    .subscribe(data => {
      console.log('ForumsComponent:ngOnInit: got new profile data=', data);
      this.profile = data;
      if (this.profile._id) {
        this.groupsListFromUserProfile = this.profile.forums;
      }
    }, (error) => {
      console.error(error);
    });

    // Get parameters
    this.routeSubscription = this.route
    .queryParams
    .subscribe(params => {
      this.showSpinner = true;
      let queryParams = JSON.parse(params.queryParam);
      this.theme = queryParams.theme;
      console.log('ForumsComponent:ngOnInit: queryParams=', queryParams);
      this.getGroup(queryParams);
    });
  }

  ngOnDestroy() {}


  onSearch() {
    console.log('search');
  }

  // If coming from groups list, we know the user already has this group in their profile and we have the group ID
  // so get group information by key. Otherwise, queryParams sent from connections page may contain one or more profile attributes that will define a group forum.
  // getGroup extracts these attributes and checks to server to see if a group exists for the combination of profile attributes.
  // If the group does exist, it asks the server for all posts for the group forum for display in the template.
  // If the group does not exist, it asks the server to create the group forum.
  private getGroup(queryParams: any): void {
    let docNotAMatch = false;
    let matchFound = false;
    let keyValue;
    let names;
    let values;

    this.showSpinner = true;

    if (queryParams._id) {
      console.log('ForumsComponent:getGroup: Have group ID ', queryParams._id);
      this.groupID = queryParams._id;
      this.forumSvc.getGroupByID(queryParams._id)
      .subscribe(groupFromServer => {
        console.log('ForumsComponent:getGroup: got group by ID ', groupFromServer);
        this.groupProfileCodeAttributesFromGroup = this.getGroupCodeAttributes(groupFromServer);
        console.log('ForumsComponent:getGroup: group attributes ', this.groupProfileDisplayAttributesFromGroup);
        this.groupProfileDisplayAttributesFromGroup = this.getGroupDisplayAttributes(groupFromServer);
        console.log('ForumsComponent:getGroup: group DISPLAY attributes ',  this.groupProfileDisplayAttributesFromGroup);

        // If there are more than 3 attributes, show only three with ...more on the template.
        if (this.groupProfileDisplayAttributesFromGroup.length > 3) {
          this.showMoreOption = true;
        } else {
          this.showMoreOption = false;
        }

        console.log('ForumsComponent:getGroup: Get posts for the group');
        this.posts.getPosts(this.groupID, this.profile.profileImageUrl, this.profile.displayName);
        this.showSpinner = false;

      });
    } else {
      console.log('ForumsComponent:getGroup:: Do not have group id ', queryParams);
      console.log('ForumsComponent:getGroup: have query params and getting group attributes.  params=', queryParams);
      this.groupProfileCodeAttributesFromGroup = this.getGroupCodeAttributes(queryParams);
      console.log('ForumsComponent:getGroup: group attributes ', this.groupProfileDisplayAttributesFromGroup);
      this.groupProfileDisplayAttributesFromGroup = this.getGroupDisplayAttributes(queryParams);
      console.log('ForumsComponent:getGroup: group DISPLAY attributes ',  this.groupProfileDisplayAttributesFromGroup);


      // If there are more than 3 attributes, show only three with ...more on the template.
      if (this.groupProfileDisplayAttributesFromGroup.length > 3) {
        this.showMoreOption = true;
      } else {
        this.showMoreOption = false;
      }

      keyValue = this.getGroupKeyValueAttributes(queryParams).split('~');
      names = keyValue[0];
      values = keyValue[1];
      console.log('ForumsComponent:getGroup: queryParams=', queryParams, ' keyvalue=', keyValue, ' names=', names, ' values=', values);

      // Check if group already exists
      this.forumSvc.getGroup(names, values)
      .subscribe(groupsFromServer => {
        console.log('ForumsComponent:getGroup: return from server, groupsFromServer=', groupsFromServer, ' groupsFromServer length=', groupsFromServer.length, ' groupProfileCodeAttributesFromGroup=', this.groupProfileCodeAttributesFromGroup);

        // Query may return multiple group forums that include the specific name/value pairs user is looking for.
        // In Addition, any given group JSON returned may have multiple profile attributes (i.e. "aboutMe":"experienced", "yearOfBirth":"1960").
        // Look for exact match of combination of attributes, (i.e. same number of attributes and they are the same).
        for (let i = 0; i < groupsFromServer.length; i++) {
          let groupDocKeys = Object.keys(groupsFromServer[i]);
          console.log('ForumsComponent:getGroup: groupDocKeys=', groupDocKeys);
          docNotAMatch = false;

          // This parts confusing because have to look at each group forum from the server, which we know included our target profile attributes
          // selected by the user, and make sure that it does not have other attributes.
          for (let j = 0; j < groupDocKeys.length; j++) {

            // If the key, that we know is not our target attribute, is not one of the non-attributes (i.e. createdBy, _id, etc.), then we can ignore
            // this group because it is not an exact match.
            if (!this.groupProfileCodeAttributesFromGroup.includes(groupDocKeys[j])) {
              console.log('ForumsComponent:getGroup: groupProfileCodeAttributesFromGroup=', this.groupProfileCodeAttributesFromGroup, ' looking for groupDocKey=', groupDocKeys[j])

              if (groupDocKeys[j] !== 'createdBy' && groupDocKeys[j] !== 'createdAt' && groupDocKeys[j] !== 'updatedAt' && groupDocKeys[j] !== '_id' && groupDocKeys[j] !== '__v') {
                docNotAMatch = true;
              }
            }
          }

          // If no group forum documents found with additional keys the user did not target, then the group already exists
          // and all we have to do is make sure that the group is already in the user's profile group forum list.
          if (!docNotAMatch) {
            console.log('ForumsComponent:getGroup: group already exists, go to updateProfileGroups for groupID=', groupsFromServer[i]._id);
            matchFound = true;
            this.groupID = groupsFromServer[i]._id;
            this.updateProfileGroups();
            break;
          }
        }

        // if match found, display any posts; otherwise, create the group forum.
        if (matchFound) {
          console.log('ForumsComponent:getGroup: group already exists so get posts for the group');
          this.posts.getPosts(this.groupID, this.profile.profileImageUrl, this.profile.displayName);
          this.showSpinner = false;
        } else {
          console.log('ForumsComponent:getGroup: group does not exist so create it')
          this.createGroupForum(names, values);
        }
      }, error => {
        // if no match at all, create the forum group
        if (error.status === 404) {
          console.log('404');
          this.createGroupForum(names, values);
        } else {
          console.log(error);
          this.showSpinner = false;
        }
      });
    }
  }

  // Translate group codes to text that a user will understand for display in the template
  private getGroupDisplayAttributes(group: any): Array<string> {
    let name;
    let value;
    let forumItem;
    let groupProfileDisplayAttributesFromGroup = [];

    console.log('ForumsComponent:getGroupDisplayAttributes: group=', group);
    for (name in group) {
      if (name !== 'createdBy' && name !== 'createdAt' && name !== 'updatedAt' && name !== '_id' && name !== '__v') {
        value = group[name];
        console.log('ForumsComponent:getGroupDisplayAttributes: NAME=',name, 'VALUE=', value);
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

    console.log('ForumsComponent:getGroupCodeAttributes: group=', group);
    for (name in group) {
      if (name !== 'createdBy' && name !== 'createdAt' && name !== 'updatedAt' && name !== '_id' && name !== '__v') {
        console.log('ForumsComponent.getGroupCodeAttributes: pushing on to local array: ', name);
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
    console.log('ForumsComponent:getGroupDisplayAttributes: group=', group);
    for (name in group) {
      if (name !== 'createdBy' && name !== 'createdAt' && name !== 'updatedAt' && name !== '_id' && name !== '__v') {
        value = group[name];
        console.log('ForumsComponent:getGroupDisplayAttributes: NAME=',name, 'VALUE=', value);
        if (names) {
          names = names + '|';
          values = values + '|';
        }
        names = names + name;
        values = values + value;
      }
    }
    console.log('ForumsComponent:getGroupDisplayAttributes: names=', names, ' values=', values);
    return names + '~' + values;
  }


  // Create new group forum based on user's attribute match selections
  private createGroupForum(names: string, values: string): void {
    console.log('ForumsComponent:createGroupForum: For ', names, values);

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
    console.log('ForumsComponent:updateProfileGroups: Check if this group ', this.groupID, ' in users profile groups ', this.groupsListFromUserProfile)
    let groupFound = false;
    for (let i=0; i < this.groupsListFromUserProfile.length; i++) {
      console.log('ForumsComponent:updateProfileGroups: Check if this group ID ', this.groupID, ' is = group ID from object ', this.groupsListFromUserProfile[i]._id);
      if (this.groupsListFromUserProfile[i]._id === this.groupID) {
        console.log('updateProfileGroups: group ', this.groupID, ' = groupsListFromProfile ', this.groupsListFromUserProfile[i]._id)
        groupFound = true;
        break;
      }
    }
    if (!groupFound) {
      console.log('ForumsComponent:updateProfileGroups: Group not found in Profile.  Adding this Group ID to Profile ', this.groupID);
      this.profileSvc.addGroupToProfile(this.profile._id, this.groupID)
      .pipe(untilComponentDestroyed(this))
      .subscribe ((responseData) => {
        console.log('ForumsComponent:updateProfileGroups: Updated profile, response from server=', responseData);
        this.showSpinner = false;
      }, error => {
        console.log(error);
        this.showSpinner = false;
      });
    }
  }
}
