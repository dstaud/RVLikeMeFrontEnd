import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

import { TranslateService } from '@ngx-translate/core';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { Observable } from 'rxjs';

import { PostsComponent } from './../posts/posts.component';

import { AuthenticationService } from '@services/data-services/authentication.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { ForumService } from '@services/data-services/forum.service';
import { ProfileService, IuserProfile, IforumList } from '@services/data-services/profile.service';
import { ThemeService } from '@services/theme.service';
import { ShareDataService, IforumsMain } from '@services/share-data.service';
import { SentryMonitorService } from '@services/sentry-monitor.service';
import { DeviceService } from '@services/device.service';

@Component({
  selector: 'app-rvlm-posts-main',
  templateUrl: './posts-main.component.html',
  styleUrls: ['./posts-main.component.scss']
})
export class PostsMainComponent implements OnInit {

  //  Provide access to methods on the Posts component
  @ViewChild(PostsComponent)
  public posts: PostsComponent;

  groupProfileDisplayAttributesFromGroup = [];
  theme: string;
  forumType: string;
  topicID: string;
  topicDesc: string;
  desktopUser: boolean = false;

  showSpinner = false;
  showLessMatches = true;
  showMoreOption = false;

  private groupID: string;
  private groupProfileCodeAttributesFromGroup = [];
  private groupsListFromUserProfile = [];
  private yearOfBirthInGroup: boolean = false;

  // Interface for profile data
  private profile: IuserProfile;
  private userProfile: Observable<IuserProfile>;

  constructor(public translate: TranslateService,
              private authSvc: AuthenticationService,
              private location: Location,
              private profileSvc: ProfileService,
              private activateBackArrowSvc: ActivateBackArrowService,
              private router: Router,
              private shareDataSvc: ShareDataService,
              private forumSvc: ForumService,
              private sentry: SentryMonitorService,
              private device: DeviceService,
              private themeSvc: ThemeService) { }

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
    } else {
      if (window.innerWidth > 600) {
        this.desktopUser = true;
      }

      this.listenForChangeInColorTheme();

      this.listenForUserProfile();
      console.log('PostsMainComponent:ngOnInit calling getGroupParams')
      this.getGroupParams();
    }
  }

  ngOnDestroy() {}


  getClass() {
    let containerClass: string;
    let bottomSpacing: string;
    let theme: string;

    if (this.device.iPhoneModelXPlus) {
      bottomSpacing = 'bottom-bar-spacing-xplus';
    } else {
      bottomSpacing = 'bottom-bar-spacing';
    }

    containerClass = 'container ' + bottomSpacing;

    return containerClass;
  }



  getGroup(paramData: any) {
    let yearOfBirth: number;
    let rigLength: number;
    let keyValue: Array<string>;
    let names: string;
    let values: string;

    this.forumType = paramData.forumType;
    this.showSpinner = true;
    if (paramData.forumType === 'topic') {

      this.forumSvc.getGroupByTopic(paramData.topicID)
      .pipe(untilComponentDestroyed(this))
      .subscribe(groupFromServer => {
        this.groupID = groupFromServer._id;
        this.topicID = groupFromServer.topic;
        this.topicDesc = groupFromServer.topicDesc;
        this.posts.getPosts(this.groupID, this.forumType, this.profile.profileImageUrl, this.profile.displayName, null, null);
        this.showSpinner = false;
      }, error => {
        if (error.status === 404) {
          this.forumSvc.addGroupTopic(paramData.topicID, paramData.topicDesc)
          .pipe(untilComponentDestroyed(this))
          .subscribe(groupTopic => {
            this.groupID = groupTopic._id;
            this.topicID = groupTopic.topic;
            this.topicDesc = groupTopic.topicDesc;
            this.posts.getPosts(this.groupID, this.forumType, this.profile.profileImageUrl, this.profile.displayName, null, null);
            this.showSpinner = false;
          })
        }
      });
    } else {
      if (paramData._id) {
        console.log('getting group by ID=', paramData._id);
        this.groupID = paramData._id;
        this.forumSvc.getGroupByID(paramData._id)
        .pipe(untilComponentDestroyed(this))
        .subscribe(groupFromServer => {
          this.groupProfileCodeAttributesFromGroup = this.getGroupCodeAttributes(groupFromServer);
          this.groupProfileDisplayAttributesFromGroup = this.getGroupDisplayAttributes(groupFromServer);
          yearOfBirth = this.groupHasRangeAttribute(groupFromServer, 'yearOfBirth');
          rigLength = this.groupHasRangeAttribute(groupFromServer, 'rigLength');

          // If there are more than 3 attributes, show only three with ...more on the template.
          if (this.groupProfileDisplayAttributesFromGroup.length > 3) {
            this.showMoreOption = true;
          } else {
            this.showMoreOption = false;
          }

          console.log('main get posts yob=', yearOfBirth);
          this.posts.getPosts(this.groupID, this.forumType, this.profile.profileImageUrl, this.profile.displayName, yearOfBirth, rigLength);
          this.showSpinner = false;

        }, error => {
          this.router.navigateByUrl('/forums/forums-list');
        });
      } else {
        this.groupProfileCodeAttributesFromGroup = this.getGroupCodeAttributes(paramData);
        this.groupProfileDisplayAttributesFromGroup = this.getGroupDisplayAttributes(paramData);

        // If there are more than 3 attributes, show only three with ...more on the template.
        if (this.groupProfileDisplayAttributesFromGroup.length > 3) {
          this.showMoreOption = true;
        } else {
          this.showMoreOption = false;
        }

        keyValue = this.getGroupKeyValueAttributes(paramData).split('~');
        names = keyValue[0];
        values = keyValue[1];
        console.log('PostsMainComponent:getGroup: calling check on name=', names, ' value=', values)
        this.checkIfUserProfileHasGroupAndUpdate(names, values);
      }
    }
  }
  // Create new group forum based on user's attribute match selections
  private createGroupForum(names: string, values: string, yearOfBirth: number, rigType: number): void {
    this.forumSvc.addGroup(names, values)
    .pipe(untilComponentDestroyed(this))
    .subscribe(group => {
      this.groupID = group._id;
      this.updateProfileGroups();
      this.posts.getPosts(this.groupID, this.forumType, this.profile.profileImageUrl, this.profile.displayName, yearOfBirth, rigType);
    }, error => {
      this.showSpinner = false;
      console.error('ForumsComponentcreateGroupForum: throw error ', error);
      throw new Error(error);
    });
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


  // If coming from groups list, we know the user already has this group in their profile and we have the group ID
  // so get group information by key. Otherwise, queryParams sent from connections page will contain one or more profile attributes that will define a group forum.
  // getGroupParams extracts these attributes and checks to server to see if a group exists for the combination of profile attributes.
  // If the group does exist, it asks the server for all posts for the group forum for display in the template.
  // If the group does not exist, it asks the server to create the group forum.
  // For Desktop, if the user goes directly to /forums/main, there is a race condition getting profile information and will kick it back to message-list.
  // That is OK.  Do not change.
  getGroupParams(groupID?: string): void {
    let paramData: IforumsMain;
    let index: number;
    let forumsList: Array<IforumList>

    if (groupID) {
      paramData = {
        _id: groupID,
        forumType: 'group'
      }
    } else {
      paramData = this.shareDataSvc.getData('forumsMain');
    }

    console.log('PostsMainComponent:getGroupParams: paramData=', paramData);
    if (!this.valuesExist(paramData)) {
      if (this.desktopUser) {
        // If no parameters, default to a random group (assuming have profile data)
        if (this.profile.forums.length > 0) {
          console.log('PostsMainComponent:getGroupParams: this.profile.forums=', this.profile.forums);
          index = Math.floor(Math.random() * this.profile.forums.length - 1) + 1;
          forumsList = this.profile.forums;
          console.log('profile forums 0=', forumsList[index]._id)
          paramData = {
            _id: forumsList[index]._id,
            forumType: 'group'
          }
          console.log('PostsMainComponent:getGroupParams: desktop user, going to getGroup')
          this.getGroup(paramData);

        } else {
          console.log('PostsMainComponent:getGroupParams: desktop user, no profile forums, going to list');
          this.router.navigateByUrl('/forums/forums-list');
        }
      } else {
        console.log('PostsMainComponent:getGroupParams: device user and no data, going to list');
        this.router.navigateByUrl('/forums/forums-list');
      }
    } else {
      console.log('PostsMainComponent:getGroupParams: device user going to getGroup params=', paramData);
      this.getGroup(paramData);
    }
  }


  private groupHasRangeAttribute(groups: any, attribute: string): number {
    let rangeAttribute: number = null;
    let name;

    console.log('group=', groups)
    for (name in groups) {
      if (name === attribute) {
        rangeAttribute = this.profile[attribute];
      }
    }
    console.log('group yearofBirth=', rangeAttribute)
    return rangeAttribute
  }

  private checkIfUserProfileHasGroupAndUpdate(names: string, values: string) {
    let matchFound: boolean = false;
    let docNotAMatch = false;
    let yearOfBirthInGroup: boolean = false;
    let rigLengthInGroup: boolean = false;
    let yearOfBirth: number;
    let rigLength: number;
    let groupDocKeys: any;

    console.log('PostsMainComponent:checkIfUserProfileHasGroupAndUpdate:');

    // Check if group already exists
    this.forumSvc.getGroup(names, values)
    .pipe(untilComponentDestroyed(this))
    .subscribe(groupsFromServer => {

      console.log('PostsMainComponent:checkIfUserProfileHasGroupAndUpdate: this.groupProfileCodeAttributesFromGroup=', this.groupProfileCodeAttributesFromGroup)
      // Query may return multiple group forums that include the specific name/value pairs user is looking for.
      // In Addition, any given group JSON returned may have multiple profile attributes (i.e. "aboutMe":"experienced", "yearOfBirth":"1960").
      // Look for exact match of combination of attributes, (i.e. same number of attributes and they are the same).
      console.log('PostsMainComponent:checkIfUserProfileHasGroupAndUpdate: groupsFromServer.length=', groupsFromServer.length)
      for (let i = 0; i < groupsFromServer.length; i++) {
        console.log('PostsMainComponent:checkIfUserProfileHasGroupAndUpdate: groupsFromServer=', groupsFromServer[i])
        groupDocKeys = Object.keys(groupsFromServer[i]);
        docNotAMatch = false;
        console.log('PostsMainComponent:checkIfUserProfileHasGroupAndUpdate: groupDocKeys=', groupDocKeys)
        // This parts confusing because have to look at each group forum from the server, which we know included our target profile attributes
        // selected by the user, and make sure that it does not have other attributes.
        for (let j = 0; j < groupDocKeys.length; j++) {

          // If the key, that we know is not our target attribute, is not one of the non-attributes (i.e. createdBy, _id, etc.), then we can ignore
          // this group because it is not an exact match.
          console.log('PostsMainComponent:checkIfUserProfileHasGroupAndUpdate: In Loop. groupDocKeys[j]=', groupDocKeys[j], ' j=', j)
          if (this.groupProfileCodeAttributesFromGroup.includes(groupDocKeys[j])) {
            if (groupDocKeys[j] === 'yearOfBirth') {
              console.log('PostsMainComponent:checkIfUserProfileHasGroupAndUpdate: In Loop. groupDocKeys[j] = year of birth', groupDocKeys[j], ' j=', j)
              yearOfBirthInGroup = true;
            }

            if (groupDocKeys[j] === 'rigLength') {
              console.log('PostsMainComponent:checkIfUserProfileHasGroupAndUpdate: In Loop. groupDocKeys[j] = rigLength', groupDocKeys[j], ' j=', j)
              rigLengthInGroup = true;
            }

          } else {
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
        if (yearOfBirthInGroup) {
          yearOfBirth = this.profile.yearOfBirth;
          console.log('PostsMainComponent:checkIfUserProfileHasGroupAndUpdate: match found and year of birth=', yearOfBirth);
        } else {
          yearOfBirth = null
        }

        if (rigLengthInGroup) {
          rigLength = this.profile.rigLength;
          console.log('PostsMainComponent:checkIfUserProfileHasGroupAndUpdate: martch found and rig length=', rigLength);
        } else {
          rigLength = null;
        }


        this.posts.getPosts(this.groupID, this.forumType, this.profile.profileImageUrl, this.profile.displayName, yearOfBirth, rigLength);
        this.showSpinner = false;
      } else {
        console.log('PostsMainComponent:checkIfUserProfileHasGroupAndUpdate: Adding group for names=', names, ' values=', values)
        this.createGroupForum(names, values, yearOfBirth, rigLength);
      }
    }, error => {
      // if no match at all, create the forum group
      if (error.status === 404) {
        console.log('PostsMainComponent:checkIfUserProfileHasGroupAndUpdate: No match at all. Adding group for names=', names, ' values=', values)
        this.createGroupForum(names, values, yearOfBirth, rigLength);
      } else {
        this.showSpinner = false;
        console.error('ForumsMainComponent:getGroup: throw error ', error);
        throw new Error(error);
      }
    });
  }


  // Translate group codes to text that a user will understand for display in the template
  private getGroupDisplayAttributes(group: any): Array<string> {
    let name;
    let value;
    let forumItem;
    let groupProfileDisplayAttributesFromGroup = [];
    console.log('ForumsListComponent:getGroupDisplayAttributes: group=', group);
    for (name in group) {
      if (name !== 'createdBy' && name !== 'createdAt' && name !== 'updatedAt' && name !== '_id' && name !== '__v' && name !== 'forumType') {
        value = group[name];
        if (value === 'true' || value === true) {
          forumItem = 'forums.component.' + name;
        } else {
          if (name === 'rigManufacturer' || name === 'rigBrand') {
            forumItem = this.translate.instant('forums.component.' + name) + ' ' + value;
          } else {
            if (name === 'yearOfBirth' || name === 'rigLength') {
              forumItem = 'forums.component.' + name;
            } else {
              forumItem = 'forums.component.list.' + name.toLowerCase() + '.' + value.toLowerCase();
            }
          }
        }
        if (name === 'rigManufacturer' || name === 'rigBrand') {
          groupProfileDisplayAttributesFromGroup.push(forumItem);
        } else {
          groupProfileDisplayAttributesFromGroup.push(this.translate.instant(forumItem));
        }
      }
    }
    return groupProfileDisplayAttributesFromGroup;
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


  // Listen for changes in color theme;
  private listenForChangeInColorTheme() {
    this.themeSvc.defaultGlobalColorTheme
    .pipe(untilComponentDestroyed(this))
    .subscribe(themeData => {
      this.theme = themeData.valueOf();
    }, error => {
      this.sentry.logError({"message":"unable to listen for color theme","error":error});
    });
  }


  // Listen for Profile changes
  private listenForUserProfile() {
    this.userProfile = this.profileSvc.profile;
    this.userProfile
    .pipe(untilComponentDestroyed(this))
    .subscribe(data => {
      this.profile = data;
      if (this.profile._id) {
        this.groupsListFromUserProfile = this.profile.forums;
      }
    }, error => {
      console.error('ForumsMainComponent:listenForUserProfile: error getting profile ', error);
      throw new Error(error);
    });
  }


  private reservedField(name: string): boolean {
    if (name === 'createdBy' || name === 'createdAt' || name === 'updatedAt' || name === '_id' ||
        name === '__v' || name === 'theme' || name === 'forumType' || name === 'topicID' || name === 'topicDesc') {
      return true;
    } else { return false }
  }


  // Update group forum array in user's profile with new group they are associated with.
  private updateProfileGroups() {
    console.log('PostsMain:updateProfileGroups: groups=', this.groupsListFromUserProfile)
    let groupFound = false;
    for (let i=0; i < this.groupsListFromUserProfile.length; i++) {
      if (this.groupsListFromUserProfile[i]._id === this.groupID) {
        groupFound = true;
        break;
      }
    }
    if (!groupFound) {
      console.log('PostsMain:updateProfileGroups: adding to profile id=', this.profile._id, ' group=', this.groupID);
      this.profileSvc.addGroupToProfile(this.profile._id, this.groupID)
      .pipe(untilComponentDestroyed(this))
      .subscribe ((responseData) => {
        console.log('PostsMain:updateProfileGroups: added group profile=', this.profile)
        this.profileSvc.getProfile();
        this.showSpinner = false;
      }, error => {
        this.showSpinner = false;
        console.error('ForumsMainComponent:updateProfileGroups: throw error ', error);
        throw new Error(error);
      });
    }
  }


  private valuesExist(params: IforumsMain): boolean {
    let foundValue: boolean = false;
    let keys = Object.keys(params);
    let values = Object.values(params);

    values.forEach((item: any) => {
      if (item) {
        foundValue = true;
      }
    });

    return foundValue;
  }
}

