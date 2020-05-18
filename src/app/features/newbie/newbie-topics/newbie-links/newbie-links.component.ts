import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

import { Observable, throwError } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { NewbieTopicsService, InewbieLinks } from '@services/data-services/newbie-topics.service';
import { ProfileService, IuserProfile } from '@services/data-services/profile.service';
import { UserTypeService } from '@services/user-type.service';
import { ActivateBackArrowService } from '@core/services/activate-back-arrow.service';
import { AuthenticationService } from '@services/data-services/authentication.service';
import { ShareDataService, ImessageShareData, ImyStory } from '@services/share-data.service';
import { LinkPreviewService, IlinkPreview } from '@services/link-preview.service';

@Component({
  selector: 'app-rvlm-newbie-links',
  templateUrl: './newbie-links.component.html',
  styleUrls: ['./newbie-links.component.scss']
})
export class NewbieLinksComponent implements OnInit {
  @Input('topicID') topicID: string;

  @Input('topicDesc') topicDesc: string;

  @Output() linkAdded = new EventEmitter()

  form: FormGroup;
  profile: IuserProfile;
  newbieLinks: Array<InewbieLinks> = [];
  topicDescSentence: string;
  userType: string;
  profileImageUrl: string = './../../../../../assets/images/no-profile-pic.jpg';
  showPreview: boolean = false;
  preview: IlinkPreview = {
    title: '',
    description: '',
    url: '',
    image: ''
  }

  showSpinner: boolean = false;
  showAddLink: boolean = false;
  showLinkAuthor: boolean = false;
  showMenu: boolean = false;

  // Interface for profile data
  private userProfile: Observable<IuserProfile>;
  private regHyperlink = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/;

  constructor(private newbieTopicsSvc: NewbieTopicsService,
              private profileSvc: ProfileService,
              private userTypeSvc: UserTypeService,
              private activateBackArrowSvc: ActivateBackArrowService,
              private authSvc: AuthenticationService,
              private location: Location,
              private linkPreviewSvc: LinkPreviewService,
              private shareDataSvc: ShareDataService,
              private router: Router,
              fb: FormBuilder) {
              this.form = fb.group({
                linkName: new FormControl('',
                              [Validators.required,
                                Validators.maxLength(40)]),
                link: new FormControl('', [Validators.required, Validators.pattern(this.regHyperlink)])
              });
  }

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
      this.listenForUserProfile();

      this.listenForUserType();

      this.getNewbieLinks();

      this.topicDescSentence = 'newbie-topics.component.' + this.topicID + '2';
    }
  }

  ngOnDestroy() { }


  onAddLink() {
    this.showAddLink = !this.showAddLink;
  }


  onCancel() {
    this.linkAdded.emit('cancel');
    if (this.preview) {
      this.preview.description = '';
      this.preview.image = '';
      this.preview.title = '';
      this.preview.url = '';
    }
    this.showPreview = false;
    this.form.reset();
    this.showAddLink = false;
  }


  onLink() {
    this.linkPreviewSvc.getLinkPreview(this.form.controls.link.value)
    .subscribe(preview => {
      console.log('BlogLinkComponent:onLink: preview=', preview);
      this.preview = preview;
      if (this.preview.url.substring(0,7) == 'http://') {
        this.preview.url = this.preview.url.substring(7,this.preview.url.length);
      } else if (this.form.controls.link.value.substring(0,8) === 'https://') {
        this.preview.url = this.preview.url.substring(8,this.preview.url.length);
      }
      this.showPreview = true;

      if (!this.preview.title) {
        this.preview.title = this.preview.url;
      }

    }, error => {
      console.log('BlogLinkComponent:onLink: no link found');
      this.preview.url = this.form.controls.link.value;
      if (this.preview.url.substring(0,7) == 'http://') {
        this.preview.url = this.preview.url.substring(7,this.preview.url.length);
      } else if (this.form.controls.link.value.substring(0,8) === 'https://') {
        this.preview.url = this.preview.url.substring(8,this.preview.url.length);
      }
      this.preview.title = this.preview.url;
      this.form.reset();
      this.showPreview = false;
    })
  }


  onSubmit() {
    let  link: string;
    this.showSpinner = true;

    if (this.form.controls.link.value.substring(0,7) !== 'http://' && this.form.controls.link.value.substring(0,8) !== 'https://' ) {
      link = 'http://' + this.form.controls.link.value;
    } else {
      link = this.form.controls.link.value;
    }
    this.newbieTopicsSvc.addNewbieLink(this.topicID,
                                        this.form.controls.linkName.value,
                                        link,
                                        this.profile.displayName,
                                        this.profile.profileImageUrl)
    .subscribe(linkResult => {
      this.showSpinner = false;
      this.showAddLink = false;
      if (this.preview) {
        this.preview.description = '';
        this.preview.image = '';
        this.preview.title = '';
        this.preview.url = '';
      }
      this.form.reset();
      this.getNewbieLinks();
    }, error => {
      console.log('NewbieLinksComponent:onSubmit: error=', error);
      this.showSpinner = false;
      throw Error(error);
    })
    this.linkAdded.emit('submit');
  }


  // When user clicks to see the story of another user, navigate to myStory page
  onYourStory(row: string) {
    let userParams:ImessageShareData = this.packageParamsForMessaging(row);
    let params:ImyStory = {
      userID: this.newbieLinks[row].createdBy,
      userIdViewer: this.profile.userID,
      params: userParams,
      topicID: this.topicID,
      topicDesc: this.topicDesc
    }

    // let params = '{"userID":"' + this.newbieLinks[row].createdBy + '",' +
    //                   '"userIdViewer":"' + this.profile._id + '",' +
    //                   '"params":' + userParams + ',' +
    //                   '"topicID":"' + this.topicID + '",' +
    //                   '"topicDesc":"' + this.topicDesc + '"}';
    // console.log('NewbieLinksComponent:onYourStory: parmas=', params);
    this.activateBackArrowSvc.setBackRoute('newbie/topic', 'forward');
    this.shareDataSvc.setData('myStory', params);
    this.router.navigateByUrl('/profile/mystory');
  }

  private getNewbieLinks() {
    this.newbieLinks = [];

    this.showSpinner = true;

    this.newbieTopicsSvc.getNewbieLinks(this.topicID)
    .subscribe(linkResult => {
      if (linkResult.length > 0) {
        this.showMenu = true;
      } else {
        this.showMenu = false;
      }
      this.newbieLinks = linkResult;
      this.showSpinner = false;
    }, error => {
      console.log('NewbieLinksComponent:getNewbieLinks: error=', error);
      this.showSpinner = false;
      throw new Error(error);
    })
  }


  // Get user profile
  private listenForUserProfile() {
    this.userProfile = this.profileSvc.profile;
    this.userProfile
    .pipe(untilComponentDestroyed(this))
    .subscribe(profile => {
      this.profile = profile;

      if (this.profile.profileImageUrl) {
        this.profileImageUrl = this.profile.profileImageUrl;
      }

    }, (error) => {
      console.error('NewbieLinksComponent:listenForUserProfile: error getting profile ', error);
      throw new Error(error);
    });
  }


  private listenForUserType() {
    this.userTypeSvc.userType
    .pipe(untilComponentDestroyed(this))
    .subscribe(type => {
      this.userType = type;
    }, (error) => {
      console.error('NewbieLinksComponent:listenForUserType: error ', error);
      throw new Error(error);
    });
  }


  private packageParamsForMessaging(row): ImessageShareData {
    let params:ImessageShareData = {
      fromUserID: this.profile.userID,
      fromDisplayName: this.profile.displayName,
      fromProfileImageUrl: this.profile.profileImageUrl,
      toUserID: this.newbieLinks[row].createdBy,
      toDisplayName: this.newbieLinks[row].createdByDisplayName,
      toProfileImageUrl: this.newbieLinks[row].createdByProfileImageUrl
    }

    // let params: string;
    // params = '{"fromUserID":"' + this.profile._id + '",' +
    //           '"fromDisplayName":"' + this.profile.displayName + '",' +
    //           '"fromProfileImageUrl":"' + this.profile.profileImageUrl + '",' +
    //           '"toUserID":"' + this.newbieLinks[row].createdBy + '",' +
    //           '"toDisplayName":"' + this.newbieLinks[row].createdByDisplayName + '",' +
    //           '"toProfileImageUrl":"' + this.newbieLinks[row].createdByProfileImageUrl + '"}';

    return params;
  }
}
