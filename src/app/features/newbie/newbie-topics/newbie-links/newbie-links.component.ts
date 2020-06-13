import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { trigger, transition, style, animate, state } from '@angular/animations';

import { Observable, throwError } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { NewbieTopicsService, InewbieLinks } from '@services/data-services/newbie-topics.service';
import { ProfileService, IuserProfile } from '@services/data-services/profile.service';
import { UserTypeService } from '@services/user-type.service';
import { ActivateBackArrowService } from '@core/services/activate-back-arrow.service';
import { AuthenticationService } from '@services/data-services/authentication.service';
import { ShareDataService, ImessageShareData, ImyStory, InewbieTopic } from '@services/share-data.service';
import { LinkPreviewService, IlinkPreview } from '@services/link-preview.service';
import { SentryMonitorService } from '@services/sentry-monitor.service';

import { SharedComponent } from '@shared/shared.component';

@Component({
  selector: 'app-rvlm-newbie-links',
  templateUrl: './newbie-links.component.html',
  styleUrls: ['./newbie-links.component.scss'],
  animations: [
    trigger('addLinkSlideInOut', [
      state('in', style({
        overflow: 'hidden',
        height: '*',
        width: '100%'
      })),
      state('out', style({
        opacity: '0',
        overflow: 'hidden',
        height: '0px',
        width: '0px'
      })),
      transition('in => out', animate('400ms ease-in-out')),
      transition('out => in', animate('400ms ease-in-out'))
    ])
  ]
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
  readyToSave: boolean = false;
  profileImageUrl: string = './../../../../../assets/images/no-profile-pic.jpg';
  showPreview: boolean = false;
  addLinkOpen: string = 'out';
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
  showLinkPreview: boolean = false;

  // Interface for profile data
  private userProfile: Observable<IuserProfile>;
  private regHyperlink = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/;

  constructor(private newbieTopicsSvc: NewbieTopicsService,
              private profileSvc: ProfileService,
              private userTypeSvc: UserTypeService,
              private activateBackArrowSvc: ActivateBackArrowService,
              private authSvc: AuthenticationService,
              private location: Location,
              private sentry: SentryMonitorService,
              private linkPreviewSvc: LinkPreviewService,
              private shared: SharedComponent,
              private shareDataSvc: ShareDataService,
              private router: Router,
              fb: FormBuilder) {
              this.form = fb.group({
                // linkName: new FormControl('',
                //               [Validators.required,
                //                 Validators.maxLength(40)]),
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

  initialize(params: InewbieTopic) {
    this.topicID = params.topicID;
    this.topicDesc = params.topicDesc;

    this.getNewbieLinks();

    this.topicDescSentence = 'newbie-topics.component.' + this.topicID + '2';
  }

  onAddLink() {
    this.showAddLink = !this.showAddLink;
    this.addLinkOpen = this.addLinkOpen === 'out' ? 'in' : 'out';
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
    this.readyToSave = false;
    this.addLinkOpen = this.addLinkOpen === 'out' ? 'in' : 'out';
  }


  onGoLink(url: string) {
    window.open(url, '_blank');
  }

  onLink() {
    if (this.form.controls.link.valid) {
      if (this.form.controls.link.value) {
        this.showSpinner = true;
        this.linkPreviewSvc.getLinkPreview(this.form.controls.link.value)
        .pipe(untilComponentDestroyed(this))
        .subscribe(preview => {
          this.preview = preview;

          // An https site cannot launch an http site.  So appending https.  Most sites are https, but if not, it will fail to launch it.
          if (this.preview.url.substring(0,7) !== 'http://' && this.preview.url.substring(0,8) !== 'https://' ) {
            this.preview.url = 'https://' + this.preview.url;
          } else if (this.preview.url.substring(0,7) == 'http://') {
            this.preview.url = 'https://' + this.preview.url.substring(7,this.preview.url.length);
          }

          this.readyToSave = true;
          this.showPreview = true;
          this.showSpinner = false;

          if (!this.preview.title) {
            this.preview.title = this.preview.url;
          }

        }, error => {

          this.sentry.logError('Error getting link preview=' + error)
          this.preview.url = this.form.controls.link.value;

          // An https site cannot launch an http site.  So appending https.  Most sites are https, but if not, it will fail to launch it.
          if (this.preview.url.substring(0,7) !== 'http://' && this.preview.url.substring(0,8) !== 'https://' ) {
            this.preview.url = 'https://' + this.preview.url;
          } else if (this.preview.url.substring(0,7) == 'http://') {
            this.preview.url = 'https://' + this.preview.url.substring(7,this.preview.url.length);
          }

          this.preview.title = this.preview.url;
          this.readyToSave = true;
          this.showPreview = true;
          this.showSpinner = false;
        });
      } else {
        this.readyToSave = false;
      }
    } else {
      this.readyToSave = false;
    }
  }


  onSubmit() {
    let  link: string;
    this.showSpinner = true;

    link = this.preview.url;

    if (link.substring(0,7) !== 'http://' && link.substring(0,8) !== 'https://' ) {
      link = 'http://' + link;
    }

    this.newbieTopicsSvc.addNewbieLink(this.topicID,
                                        this.preview.title,
                                        link,
                                        this.preview.description,
                                        this.preview.image,
                                        this.profile.displayName,
                                        this.profile.profileImageUrl)
    .pipe(untilComponentDestroyed(this))
    .subscribe(linkResult => {
      this.showSpinner = false;
      this.showPreview = false;
      this.showAddLink = false;
      this.readyToSave = false;
      if (this.preview) {
        this.preview.description = '';
        this.preview.image = '';
        this.preview.title = '';
        this.preview.url = '';
      }
      this.addLinkOpen = this.addLinkOpen === 'out' ? 'in' : 'out';
      this.form.reset();
      this.getNewbieLinks();
    }, error => {
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

    this.activateBackArrowSvc.setBackRoute('newbie/topic', 'forward');
    this.shareDataSvc.setData('myStory', params);
    this.router.navigateByUrl('/profile/mystory');
  }

  private getNewbieLinks() {
    this.newbieLinks = [];

    this.showSpinner = true;

    this.newbieTopicsSvc.getNewbieLinks(this.topicID)
    .pipe(untilComponentDestroyed(this))
    .subscribe(linkResult => {
      if (linkResult.length > 0) {
        this.showMenu = true;
      } else {
        this.showMenu = false;
      }
      this.newbieLinks = linkResult;
      this.showSpinner = false;
    }, error => {
      this.showSpinner = false;
      this.shared.notifyUserMajorError(error);
      throw new Error(JSON.stringify(error));
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
      this.sentry.logError('NewbieLinksComponent:listenForUserProfile: error getting profile=' + JSON.stringify(error));
    });
  }


  private listenForUserType() {
    this.userTypeSvc.userType
    .pipe(untilComponentDestroyed(this))
    .subscribe(type => {
      this.userType = type;
    }, (error) => {
      this.sentry.logError('NewbieLinksComponent:listenForUserType: error=' + JSON.stringify(error));
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

    return params;
  }
}
