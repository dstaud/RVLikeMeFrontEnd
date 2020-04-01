import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { TranslateService } from '@ngx-translate/core';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { Observable } from 'rxjs';

import { AuthenticationService } from '@services/data-services/authentication.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { ForumService } from '@services/data-services/forum.service';
import { ProfileService, IuserProfile } from '@services/data-services/profile.service';
import { PostsComponent } from './posts/posts.component';


@Component({
  selector: 'app-rvlm-forums',
  templateUrl: './forums.component.html',
  styleUrls: ['./forums.component.scss']
})
export class ForumsComponent implements OnInit {

  //  Provide access to methods on the Posts component
  @ViewChild(PostsComponent)
  public posts: PostsComponent;

  matches = [];
  groupsListFromUserProfile = [];
  groupsAttributes = [];
  profileAttributesFromGroup = [];
  showSpinner = false;
  groupID: string;
  lessMatches = true;
  showMoreOption = false;
  showForumList = false;
  showForumPosts = false;
  titlesOnly = false;
  names: string;
  values: string;

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
      console.log('ForumsComponent:ngOnInit: got new profile data=', data);
      this.profile = data;
      if (this.profile._id) {
        this.groupsListFromUserProfile = this.profile.forums;
        console.log('ForumsComponent:ngOnInit: got Profile Data, so get all groups for user');
        this.getGroups();
      }
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
        if (params.queryParam.includes('groups')) {
          console.log('ForumsComponent:ngOnInit: back arrow groups. param=', params.queryParam);
          this.showForumList = true;
          this.showForumPosts = false;
          this.showSpinner = false;
        } else {
          let queryParams = JSON.parse(params.queryParam);
          console.log('ForumsComponent:ngOnInit: queryParams=', queryParams);
          this.getGroup(queryParams);
          this.showForumList = false;
          this.showForumPosts = true;
        }
      } else {
        console.log('ForumsComponent:ngOnInit: wait for groups');
        this.showForumList = true;
        this.showForumPosts = false;
        this.showSpinner = false;
      }
    });
  }

  ngOnDestroy() {}

  onLess() {
    this.lessMatches = true;
  }

  onMore() {
    this.lessMatches = false;
  }

  // queryParams sent fron connections page may contain one or more profile attributes that will define a group forum.
  // getGroup extracts these attributes and checks to server to see if a group exists for the combination of profile attributes.
  // If the group does exist, it asks the server for all posts for the group forum for display in the template.
  // If the group does not exist, it asks the server to create the group forum.
  private getGroup(queryParams: any): void {
    let docNotAMatch = false;
    let matchFound = false;

    this.showSpinner = true;

    console.log('ForumsComponent:getGroup: have query params and getting group attributes.  params=', queryParams);
    this.getGroupAttributes(true, queryParams);

    // If there are more than 3 attributes, show only three with ...more on the template.
    if (this.matches.length > 3) {
      this.showMoreOption = true;
    } else {
      this.showMoreOption = false;
    }

    // Check if group already exists
    this.forumSvc.getGroup(this.names, this.values)
    .subscribe(groupsFromServer => {
      console.log('ForumsComponent:getGroup: return from server, groupsFromServer=', groupsFromServer, ' groupsFromServer length=', groupsFromServer.length, ' profileAttributesFromGroup=', this.profileAttributesFromGroup);

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
          if (!this.profileAttributesFromGroup.includes(groupDocKeys[j])) {
            console.log('ForumsComponent:getGroup: profileAttributesFromGroup=', this.profileAttributesFromGroup, ' looking for groupDocKey=', groupDocKeys[j])

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
        console.log('ForumsComponent:getGroups: group already exists so get posts for the group');
        this.showForumPosts;
        this.posts.getPosts(this.groupID, this.profile.profileImageUrl, this.profile.displayName);
        this.showSpinner = false;
      } else {
        console.log('ForumsComponent:getGroups: group does not exist so create it')
        this.createGroupForum(this.names, this.values);
      }
    }, error => {
      // if no match at all, create the forum group
      if (error.status === 404) {
        console.log('404');
        this.createGroupForum(this.names, this.values);
      } else {
        console.log(error);
        this.showSpinner = false;
      }
    });
  }

  onSearch() {
    console.log('search');
  }

  onTitles() {
    this.titlesOnly = !this.titlesOnly;
  }

  onGroupSelect(groupItem: number) {
    let group = this.groupsListFromUserProfile[groupItem];
    let backParam;

    this.groupID = group._id;
    backParam = this.groupID + Math.floor(Math.random() * 10000);
    console.log('ForumsComponent:onGroupSelect: selected group ', group._id, '. Setting back to ', backParam);
    this.activateBackArrowSvc.setBackRoute('forums?groups=' + backParam);
    this.getGroupAttributes(false, group);
    console.log('GET POSTS=', this.groupID, this.profile.profileImageUrl, this.profile.displayName)
    this.showForumList = false;
    console.log('SHOWING POSTS');
    this.showForumPosts = true;
    this.posts.getPosts(this.groupID, this.profile.profileImageUrl, this.profile.displayName);
  }

  private getGroupAttributes(param: boolean, group: any) {
    let name;
    let value;
    let forumItem;

    this.names = '';
    this.values = '';
    this.matches = [];

    console.log('ForumsComponent:getGroupAttributes: param=', param, ' group=', group);
    for (name in group) {
      if (name !== 'createdBy' && name !== 'createdAt' && name !== 'updatedAt' && name !== '_id' && name !== '__v') {
        if (param) {
          console.log('ForumsComponent.getGroupAttributes: pushing on to profileAttributesFromGroup array: ', name);
          this.profileAttributesFromGroup.push(name);
        }
        value = group[name];
        console.log('ForumsComponent:getGroupAttributes: NAME=',name, 'VALUE=', value);
        if (value === 'true' || value === true) {
          forumItem = 'forums.component.' + name;
        } else {
          if (name === 'yearOfBirth') {
            forumItem = 'forums.component.' + name;
          } else {
            forumItem = 'forums.component.list.' + name.toLowerCase() + '.' + value.toLowerCase();
          }
        }
        this.matches.push(this.translate.instant(forumItem));
        if (this.names) {
          this.names = this.names + '|';
          this.values = this.values + '|';
        }
        this.names = this.names + name;
        this.values = this.values + value;
      }
    }
  }

  private getGroups() {
    console.log('ForumsComponent:getGroups: Groups for profile=', this.profile.forums);
    if (this.profile.forums.length === 0) {
      console.log('ForumsComponent:getGroups: Groups not found!');
    } else {
      this.groupsListFromUserProfile = this.profile.forums;
      this.groupsAttributes = []
      for (let i=0; i < this.groupsListFromUserProfile.length; i++) {
        console.log('ForumsComponent:getGroups: Getting attributes for ', this.groupsListFromUserProfile[i]);
        this.getGroupAttributes(false,this.groupsListFromUserProfile[i]);
        this.groupsAttributes.push(this.matches);
      }
      console.log('ForumsComponent:getGroups: Group found, Attributes=', this.groupsAttributes);
      // Gen random number
      let randomNbr = Math.floor(Math.random() * 10000);
    }
  }

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
    if (!groupFound) { // TODO: Is update coming back from server to update local groups array?
      console.log('ForumsComponent:updateProfileGroups: Group not found in Profile.  Adding this Group ID to Profile ', this.groupID);
      // this.profile.forums.push(this.groupID);
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
