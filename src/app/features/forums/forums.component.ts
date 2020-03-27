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
  groups = [];
  groupsAttributes = [];
  nameArray = [];
  showSpinner = false;
  groupID: string;
  lessMatches = true;
  showMoreOption = false;
  showForumList = false;
  showForumPosts = false;
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
        let queryParams = JSON.parse(params.queryParam);
        console.log('FORUM PARAMS=', queryParams);
        this.getGroup(queryParams);
        this.showForumList = false;
        console.log('SHOWING POSTS');
        this.showForumPosts = true;
      } else {
        this.showForumList = true;
        this.showForumPosts = false;
        this.getGroups();
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

  private getGroup(queryParams: any): void {
    let docNotAMatch = false;
    let matchFound = false;

    console.log('In GetGroup, query Params=', queryParams)
    this.showSpinner = true;
    this.getGroupAttributes(true, queryParams);

    if (this.matches.length > 3) {
      this.showMoreOption = true;
    } else {
      this.showMoreOption = false;
    }

    console.log(this.names, this.values);
    console.log(this.matches);

    // Check if group already exists
    this.forumSvc.getGroup(this.names, this.values)
    .subscribe(group => {
      console.log('GROUP ', group, group.length);

      // Query may return multiple because may be super-sets but want an exact match so check if extraneous fields returned.
      for (let i = 0; i < group.length; i++) {
        let rec = Object.keys(group[i]);
        docNotAMatch = false;
        for (let j = 0; j < rec.length; j++) {
          if (!this.nameArray.includes(rec[j])) {
            if (rec[j] !== 'createdBy' && rec[j] !== 'createdAt' && rec[j] !== 'updatedAt' && rec[j] !== '_id' && rec[j] !== '__v') {
              console.log('EXTRA FIELD=', rec[j]);
              docNotAMatch = true;
            }
          }
        }
        if (!docNotAMatch) {
          matchFound = true;
          this.groupID = group[i]._id;
          console.log('MATCH FOUND!', this.groupID);
          this.updateProfileGroups();
          break;
        }
      }

      // if match found, display any posts; otherwise, create the group forum.
      if (matchFound) {
        console.log('GET POSTS=', this.groupID, this.profile.profileImageUrl, this.profile.displayName)
        this.showForumPosts;
        this.posts.getPosts(this.groupID, this.profile.profileImageUrl, this.profile.displayName);
        this.showSpinner = false;
      } else {
        this.createForum(this.names, this.values);
      }
    }, error => {
      // if no match at all, create the forum group
      if (error.status === 404) {
        console.log('404');
        this.createForum(this.names, this.values);
      } else {
        console.log(error);
        this.showSpinner = false;
      }
    });
  }

  onSearch() {
    console.log('search');
  }

  onGroupSelect(groupItem: number) {
    let group = this.groups[groupItem];

    this.groupID = group._id;
    console.log('original', this.groups);
    console.log('new', this.groupsAttributes);
    console.log('GROUPID=', this.groupID, group, groupItem);
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
    for (name in group) {
      if (name !== 'createdBy' && name !== 'createdAt' && name !== 'updatedAt' && name !== '_id' && name !== '__v') {
        if (param) {
          this.nameArray.push(name);
        }
        value = group[name];
        console.log('NAME=',name, 'VALUE=', value);
        if (value === true) {
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
    console.log('FORUMS=', this.profile.forums);
    this.forumSvc.getGroups(this.profile.forums)
    .subscribe(groups => {
      if (groups.length === 0) {
        console.log('groups not found!');
      } else {
        console.log('groups found!', groups);
        this.groups = groups;
        this.groupsAttributes = [];
        for (let i=0; i < groups.length; i++) {
          this.getGroupAttributes(false,groups[i]);
          console.log('MATCHES=', this.matches, i);
          this.groupsAttributes.push(this.matches);
        }
        console.log('GROUPS=', this.groupsAttributes);
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
    let profileImageUrl
    this.forumSvc.addGroup(names, values)
    .subscribe(group => {
      this.groupID = group._id;
      this.updateProfileGroups();
    }, error => {
      console.log(error);
      this.showSpinner = false;
    });
  }

  private updateProfileGroups() {
    console.log('GROUP=', this.groupID);
    console.log('GROUPS=', this.profile.forums);
    if (this.profile.forums.indexOf(this.groupID) === -1) {
      console.log('GROUP ADD ', this.groupID);
      this.profile.forums.push(this.groupID);
      this.profileSvc.updateProfile(this.profile)
      .pipe(untilComponentDestroyed(this))
      .subscribe ((responseData) => {
        console.log('updated profile = ', responseData);
        this.showSpinner = false;
      }, error => {
        console.log(error);
        this.showSpinner = false;
      });
    }
  }
}
