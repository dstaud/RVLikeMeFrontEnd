import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';

import { Observable, throwError } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { NewbieTopicsService, InewbieLinks } from '@services/data-services/newbie-topics.service';
import { ProfileService, IuserProfile } from '@services/data-services/profile.service';

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

  showSpinner: boolean = false;
  showAddLink: boolean = false;
  showLinkAuthor: boolean = false;
  showMenu: boolean = false;

  // Interface for profile data
  private userProfile: Observable<IuserProfile>;
  private regHyperlink = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/;

  constructor(private newbieTopicsSvc: NewbieTopicsService,
              private profileSvc: ProfileService,
              fb: FormBuilder) {
              this.form = fb.group({
                linkName: new FormControl('',
                              [Validators.required,
                                Validators.maxLength(40)]),
                link: new FormControl('', [Validators.required, Validators.pattern(this.regHyperlink)])
              });
  }

  ngOnInit(): void {
    this.listenForUserProfile();

    this.getNewbieLinks();

    this.topicDescSentence = 'newbie-topics.component.' + this.topicID + '2';
    console.log('NewbieLinksComponent:ngOnInit: topicDescSentence=', this.topicDescSentence);
  }

  ngOnDestroy() { }


  onAddLink() {
    this.showAddLink = !this.showAddLink;
  }


  onCancel() {
    this.linkAdded.emit('cancel');
    this.showAddLink = false;
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
      console.log('SuggestTopicComponent:onSubmit: link added=', linkResult);
      this.showSpinner = false;
      this.showAddLink = false;
      this.getNewbieLinks();
    }, error => {
      console.log('SuggestTopicComponent:onSubmit: error=', error);
      this.showSpinner = false;
      throw Error(error);
    })
    this.linkAdded.emit('submit');
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
      console.log('NewbieLinksComponent:getNewbieLinks: got links=', linkResult);
      this.newbieLinks = linkResult;
      console.log('NewbieLinksComponent:getNewbieLinks: newbieLInks=', this.newbieLinks);
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
    }, (error) => {
      console.error('HomeComponent:listenForUserProfile: error getting profile ', error);
      throw new Error(error);
    });
  }
}
