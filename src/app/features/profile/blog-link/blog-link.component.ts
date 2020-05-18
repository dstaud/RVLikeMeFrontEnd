import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';

import { Observable, throwError } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { ProfileService, IuserProfile, Iblog } from '@services/data-services/profile.service';
import { AuthenticationService } from '@services/data-services/authentication.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';

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
  desktopUser: boolean = false;

  private returnRoute: string;
  private userProfile: Observable<IuserProfile>;
  private regHyperlink = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/;

  constructor(private profileSvc: ProfileService,
              private authSvc: AuthenticationService,
              private location: Location,
              private router: Router,
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
  }


  onSubmit() {
    let  link: string;
    this.showSpinner = true;

    if (this.form.controls.link.value.substring(0,7) !== 'http://' && this.form.controls.link.value.substring(0,8) !== 'https://' ) {
      link = 'http://' + this.form.controls.link.value;
    } else {
      link = this.form.controls.link.value;
    }
    this.profileSvc.addBlogLinkToProfile(this.profile._id,
                                          this.form.controls.linkDesc.value,
                                          link)
    .subscribe(linkResult => {
      this.showSpinner = false;
      this.showAddLink = false;
      this.profileSvc.getProfile();
    }, error => {
      console.log('PersonalComponent:onSubmit: error=', error);
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
    }, (error) => {
      console.error('NewbieLinksComponent:listenForUserProfile: error getting profile ', error);
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
