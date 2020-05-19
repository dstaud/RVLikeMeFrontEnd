import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';

import { Observable, throwError } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { ProfileService, IuserProfile, Iblog } from '@services/data-services/profile.service';
import { AuthenticationService } from '@services/data-services/authentication.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { LinkPreviewService, IlinkPreview } from '@services/link-preview.service';

@Component({
  selector: 'app-rvlm-blog-link',
  templateUrl: './blog-link.component.html',
  styleUrls: ['./blog-link.component.scss']
})
export class BlogLinkComponent implements OnInit {
  form: FormGroup;
  profile: IuserProfile;
  blogLinks: Array<Iblog> = [];
  showSpinner: boolean = false;
  showAddLink: boolean = false;
  showPreview: boolean = false;
  desktopUser: boolean = false;
  preview: IlinkPreview = {
    title: '',
    description: '',
    url: '',
    image: ''
  }

  private returnRoute: string;
  private userProfile: Observable<IuserProfile>;
  private regHyperlink = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/;

  constructor(private profileSvc: ProfileService,
              private authSvc: AuthenticationService,
              private location: Location,
              private router: Router,
              private linkPreviewSvc: LinkPreviewService,
              private activateBackArrowSvc: ActivateBackArrowService,
             fb: FormBuilder) {
              this.form = fb.group({
                linkDesc: new FormControl('',
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

    if (window.innerWidth > 600) {
      this.desktopUser = true;
      this.setReturnRoute();
    }

    if (!this.authSvc.isLoggedIn()) {
      backPath = this.location.path().substring(1, this.location.path().length);
      this.activateBackArrowSvc.setBackRoute('*' + backPath, 'forward');
      this.router.navigateByUrl('/?e=signin');
    } else {
      this.showSpinner = true;

      this.listenForUserProfile();
    }
  }

  ngOnDestroy() {}


  onAddLink() {
    this.showAddLink = !this.showAddLink;
  }


  onBack() {
    let route = '/' + this.returnRoute
    this.activateBackArrowSvc.setBackRoute('', 'backward');
    this.router.navigateByUrl(route);
  }


  onCancel() {
    this.showAddLink = false;
    this.showPreview = false;
    if (this.preview) {
      this.preview.description = '';
      this.preview.image = '';
      this.preview.title = '';
      this.preview.url = '';
    };
    this.form.reset();
  }


  onDelete(row: number) {
    console.log('BlogLinkComponent:onDelete: blogLinks=', this.blogLinks, ' row=', row)
    this.profileSvc.deleteBlogLinkFromProfile(this.profile._id, this.blogLinks[row]._id)
    .subscribe(profileResult => {
      console.log('BlogLinkComponent:onDelete: updated profile=', profileResult);
      this.profile = profileResult;
      this.profileSvc.getProfile();
    }, error => {
      console.error('BlogLinkComponent:onDelete: error deleting blog link from profile=', error);
      throw new Error(error);
    })
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

      if (!this.preview.title) {
        this.preview.title = this.preview.url;
      }

      this.showPreview = true;
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

    if (this.preview) {
      this.preview.description = '';
      this.preview.image = '';
      this.preview.title = '';
      this.preview.url = '';
    }
    this.form.reset();

    this.profileSvc.addBlogLinkToProfile(this.profile._id, link, this.form.controls.linkDesc.value)
    .subscribe(profileResult => {
      this.showSpinner = false;
      this.showAddLink = false;
      this.blogLinks = profileResult.blogLinks;
      this.form.patchValue({
        linkDesc: null,
        link: null
      });
      this.profileSvc.getProfile();
    }, error => {
      console.log('BlogLinkComponent:onSubmit: error=', error);
      this.showSpinner = false;
      throw Error(error);
    })
  }

  // Get user profile
  private listenForUserProfile() {
    this.userProfile = this.profileSvc.profile;
    this.userProfile
    .pipe(untilComponentDestroyed(this))
    .subscribe(profile => {
      this.profile = profile;
      this.blogLinks = profile.blogLinks;
      console.log('BlogLinkComponent:listenForUserProfile: blogLinks=', this.blogLinks)
      this.showSpinner = false;
    }, (error) => {
      console.error('BlogLinkComponent:listenForUserProfile: error getting profile ', error);
      this.showSpinner = false;
      throw new Error(error);
    });
  }


  private setReturnRoute() {
    let returnStack: Array<string> = [];
    let i: number;

    this.activateBackArrowSvc.route$
    .pipe(untilComponentDestroyed(this))
    .subscribe(data => {
      returnStack = data;
      i = returnStack.length - 1;
      if (returnStack.length > 0) {
        if (returnStack[i].substring(0, 1) === '*') {
            this.returnRoute = returnStack[i].substring(1, returnStack[i].length);
        } else {
          this.returnRoute = returnStack[i];
        }
      } else {
          this.returnRoute = '';
      }
      console.log('BlogLinkComponent:ngOnInit: Return Route=', this.returnRoute);
    }, error => {
      console.error('BlogLinkComponent:setReturnRoute: error setting return route ', error);
    });
  }
}