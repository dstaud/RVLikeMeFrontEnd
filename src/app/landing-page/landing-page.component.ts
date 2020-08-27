import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Location } from '@angular/common';
import { FormGroup, FormControl, FormBuilder, Validators, AbstractControl } from '@angular/forms';

import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { take } from 'rxjs/operators';

import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { HeaderVisibleService } from '@services/header-visibility.service';
import { ShareDataService, Isignin, Iregister } from '@services/share-data.service';
import { SentryMonitorService } from '@services/sentry-monitor.service';
import { LikemeCountsService } from '@services/data-services/likeme-counts.service';
import { ForumService } from '@services/data-services/forum.service';

import { SigninDesktopDialogComponent } from '@dialogs/signin-desktop-dialog/signin-desktop-dialog.component';
import { RegisterDesktopDialogComponent } from '@dialogs/register-desktop-dialog/register-desktop-dialog.component';

import { inOutAnimation } from '@shared/animations';

export declare class FacebookParams {
  u: string;
}

@Component({
  selector: 'app-rvlm-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
  animations: [inOutAnimation]
})
export class LandingPageComponent implements OnInit {
  form: FormGroup;

  landingImage: string;
  cardNbr: number;
  logoClass: string;
  logoDesktopLeft: string;
  showLearnMoreDesktop: boolean = false;
  maxRvImageHeight = 'auto';
  maxRvImageWidth = '100%';
  desktopUser: boolean = false;
  heading: string;
  subHeading: string;
  badgeExperience: string;
  badgeLifestyle: string;
  badgeRig: string;
  nbrExperience = 0;
  nbrLifestyle = 0;
  nbrRig = 0;
  currentQuestion = 0;
  includeCounts = true;

  private windowWidth: number;
  private landingImageNbr: number;
  private routeSubscription: any;
  private install: boolean;
  private installDevice: string;
  private register: Iregister = {
    aboutMe: null,
    aboutMeGroup: null,
    rvUse: null,
    rvUseGroup: null,
    rigType: null,
    rigTypeGroup: null
  }

  // Get window size to determine how to present register, signon and learn more
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setImageBasedOnScreenWidth();
  }

  constructor(private activateBackArrowSvc: ActivateBackArrowService,
              private headerVisibleSvc: HeaderVisibleService,
              private dialog: MatDialog,
              private route: ActivatedRoute,
              private sentry: SentryMonitorService,
              private location: Location,
              private forumSvc: ForumService,
              private likeCountsSvc: LikemeCountsService,
              private shareDataSvc: ShareDataService,
              private router: Router,
              private fb: FormBuilder) {
        if (window.innerWidth > 600) {
          this.desktopUser = true;
        }

        this.form = fb.group({
          howRV: new FormControl('dreaming'),
          travel: new FormControl(''),
          rig: new FormControl('')
        });
  }

  ngOnInit() {
    let params: Isignin;

    // Randomly pick one of 3 landing page RV images
    // this.landingImageNbr = Math.floor(Math.random() * 3) + 1;
    this.landingImageNbr = 1;
    this.cardNbr = Math.floor(Math.random() * 4) + 1;

    params = this.shareDataSvc.getData('signin');
    this.install = params.install;
    this.installDevice = params.installDevice;

    this.setImageBasedOnScreenWidth();

    this.listenForParameters();
  }

  ngOnDestroy() {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }


  // When user selects register, if mobile, go to register component.
  // If desktop, present register component in dialog and take action when registration complete.
  onRegisterUser() {
    if (this.windowWidth > 600) {
      this.openRegisterDialog((result: string) => {
        if (result === 'complete') {
          this.onSignIn();
        }
      });
    } else {
      this.headerVisibleSvc.toggleHeaderVisible(true);
      this.headerVisibleSvc.toggleHeaderDesktopVisible(false);
      this.router.navigateByUrl('/register');
      this.activateBackArrowSvc.setBackRoute('', 'forward');
    }
  }


  // When user selects signin, if mobile, go to signin component.
  // If desktop, present signin component in dialog and take action when signin complete.
  onSignIn() {
    let param: Isignin = {
      fromLandingPage: true,
      install: this.install,
      installDevice: this.installDevice
    }
    this.shareDataSvc.setData('signin', param) // To indicate to signin page coming from landing page
    if (this.windowWidth > 600) {
      this.openSigninDialog((result: string) => {

        if (result === 'complete') {
          this.activateBackArrowSvc.setBackRoute('', 'forward');
          this.headerVisibleSvc.toggleHeaderDesktopVisible(true);
          this.router.navigateByUrl('/home/main');
        }
      });
    } else {
      this.headerVisibleSvc.toggleHeaderVisible(true);
      this.headerVisibleSvc.toggleHeaderDesktopVisible(false);
      this.router.navigateByUrl('/signin');
      this.activateBackArrowSvc.setBackRoute('', 'forward');
    }
  }

  onRegister() {
    this.shareDataSvc.setData('register', this.register);
    this.router.navigateByUrl('/register');
  }

  onExperience(answer: string) {
    if (this.includeCounts) {
      this.likeCountsSvc.getAboutMeCounts(answer)
      .pipe(take(1))
      .subscribe(count => {
        this.nbrExperience = count;
      }, error => {
        console.error(error);
      });
    } else {
      let self = this;
      setTimeout(function () {
        self.nbrExperience = 1;
      }, 1000);
    }

    this.currentQuestion++;
    switch (answer) {
      case 'dreamer': {
        this.heading = 'Our Newbie Corner connects you with experienced RVers who can help you!';
        this.subHeading = 'Which of these best describes your plans?'
        this.badgeExperience = 'Other Dreamers';
        break;
      }
      case 'newbie': {
        this.heading = 'Our Newbie Corner connects you with experienced RVers who can help you!';
        this.subHeading = 'Which of these best describes your plans?'
        this.badgeExperience = 'Other Newbies';
        break;
      }
      case 'experienced': {
        this.heading = 'We create targeted groups to connect you with other RVers';
        this.subHeading = 'Which of these best describes how you do RV Life?'
        this.badgeExperience = 'Other RVers';
        break;
      }
    }

    this.register.aboutMe = answer;
    this.getGroup('aboutMe', this.register.aboutMe, 'aboutMeGroup');

  }

  onLifestyle(answer: string) {
    if (this.includeCounts) {
      this.likeCountsSvc.getRvUseCounts(answer)
      .pipe(take(1))
      .subscribe(count => {
        this.nbrLifestyle = count;
      }, error => {
        console.error(error);
      });
    } else {
      let self = this;
      setTimeout(function () {
        self.nbrLifestyle = 1;
      }, 1000);
    }

    this.currentQuestion++;
    switch (answer) {
      case 'fttravel': {
        if (this.register.aboutMe === 'experienced') {
          this.heading = 'We have a group for experienced full-time travelers';
        } else {
          this.heading = 'We have a group for newbie / wanna-be full-time travelers';
        }
        this.badgeLifestyle = 'Other FT Travelers';
        this.register.rvUse = 'FTN';
        break;
      }
      case 'pttravel': {
        if (this.register.aboutMe === 'experienced') {
          this.heading = 'We have a group for experienced part-time travelers';
        } else {
          this.heading = 'We have a group for newbie / wanna-be part-time travelers';
        }
        this.badgeLifestyle = 'Other PT Travelers';
        this.register.rvUse = 'PS';
        break;
      }
      case 'fs': {
        if (this.register.aboutMe === 'experienced') {
          this.heading = 'We have a group for experienced stationary RVers';
        } else {
          this.heading = 'We have a group for those starting out stationary';
        }
        this.badgeLifestyle = 'Other Stationaries';
        this.register.rvUse = 'FS';
        break;
      }
    }

    this.getGroup('rvUse', this.register.rvUse, 'rvUseGroup');

  }

  onRig(answer: string) {
    if (this.includeCounts) {
      this.likeCountsSvc.getRigCounts(answer)
      .pipe(take(1))
      .subscribe(count => {
        this.nbrRig = count;
      }, error => {
        console.error(error);
      });
    } else {
      let self = this;
      setTimeout(function () {
        self.nbrRig = 1;
      }, 1000);
    }

    this.currentQuestion++;
    switch (answer) {
      case 'A': {
        if (this.register.rvUse === 'FTN') {
          this.heading = 'We have a group for RVers full-time traveling in a Class A!';
        } else if (this.register.rvUse === 'PS') {
          this.heading = 'We have a group for RVers part-time traveling in a Class A!';
        } else {
          this.heading = 'We have a group for RVers stationary in a Class A!';
        }
        this.badgeRig = 'Other Class As';
        this.register.rigType = 'A';
        break;
      }
      case 'B': {
        if (this.register.rvUse === 'FTN') {
          this.heading = 'We have a group for RVers full-time traveling in a Class B!';
        } else if (this.register.rvUse === 'PS') {
          this.heading = 'We have a group for RVers part-time traveling in a Class B!';
        } else {
          this.heading = 'We have a group for RVers stationary in a Class B!';
        }
        this.badgeRig = 'Other Class Bs';
        this.register.rigType = 'B';
        break;
      }
      case 'C': {
        if (this.register.rvUse === 'FTN') {
          this.heading = 'We have a group for RVers full-time traveling in a Class C!';
        } else if (this.register.rvUse === 'PS') {
          this.heading = 'We have a group for RVers part-time traveling in a Class C!';
        } else {
          this.heading = 'We have a group for RVers stationary in a Class C!';
        }
        this.badgeRig = 'Other Class Cs';
        this.register.rigType = 'C';
        break;
      }
      case 'FW': {
        if (this.register.rvUse === 'FTN') {
          this.heading = 'We have a group for RVers full-time traveling with a Fifth Wheel!';
        } else if (this.register.rvUse === 'PS') {
          this.heading = 'We have a group for RVers part-time traveling with a Fifth Wheel!';
        } else {
          this.heading = 'We have a group for RVers stationary with a Fifth Wheel!';
        }
        this.badgeRig = 'Other Fifth Wheels';
        this.register.rigType = 'FW';
        break;
      }
      case 'TT': {
        if (this.register.rvUse === 'FTN') {
          this.heading = 'We have a group for RVers full-time traveling with a Travel Trailer!';
        } else if (this.register.rvUse === 'PS') {
          this.heading = 'We have a group for RVers part-time traveling with a Travel Trailer!';
        } else {
          this.heading = 'We have a group for RVers stationary with a Travel Trailer!';
        }
        this.badgeRig = 'Other Travel Trailers';
        this.register.rigType = 'TT';
        break;
      }
      case 'cool': {
        if (this.register.rvUse === 'FTN') {
          this.heading = 'We have a group for RVers full-time traveling in all kinds of RVs!';
        } else if (this.register.rvUse === 'PS') {
          this.heading = 'We have a group for RVers part-time traveling in all kinds of RVs!';
        } else {
          this.heading = 'We have a group for RVers stationary in all kinds of RVs!';
        }
        this.badgeRig = 'Other Cool Rigs';
        this.register.rigType = 'V';
        break;
      }
    }

    this.getGroup('rigType', this.register.rigType, 'rigTypeGroup');
  }

  private getGroup(name: string, value: string, group: string) {
    let docNotAMatch = false;
    let groupDocKeys: any;

    this.forumSvc.getGroup(name, value)
    .pipe(untilComponentDestroyed(this))
    .subscribe(forums => {
      // Query may return multiple group forums that include the specific name/value pairs user is looking for.
      // In Addition, any given group JSON returned may have multiple profile attributes (i.e. "aboutMe":"experienced", "yearOfBirth":"1960").
      // Look for exact match of combination of attributes, (i.e. same number of attributes and they are the same).
      for (let i = 0; i < forums.length; i++) {
        groupDocKeys = Object.keys(forums[i]);
        docNotAMatch = false;

        // This parts confusing because have to look at each group forum from the server, which we know included our target profile attributes
        // selected by the user, and make sure that it does not have other attributes.
        for (let j = 0; j < groupDocKeys.length; j++) {

          // If the key, that we know is not our target attribute, is not one of the non-attributes (i.e. createdBy, _id, etc.), then we can ignore
          // this group because it is not an exact match.
          if (groupDocKeys[j] !== name) {
            if (!this.reservedField(groupDocKeys[j])) {
              docNotAMatch = true;
            }
          }
        }

        // If no group forum documents found with additional keys the user did not target, then the group already exists
        // and all we have to do is make sure that the group is already in the user's profile group forum list.
        if (!docNotAMatch) {
          this.register[group] = forums[i]._id;
          break;
        }
      }
    }, error => {
      this.sentry.logError('LandingPageComponent:getAboutMeGroup: error getting group for name="' + name + '", value="' + value + '"' + JSON.stringify(error));
    });
  }

  private reservedField(name: string): boolean {
    if (name === 'createdBy' || name === 'createdAt' || name === 'updatedAt' || name === '_id' ||
        name === '__v' || name === 'theme' || name === 'forumType' || name === 'topicID' || name === 'topicDesc') {

      return true;
    } else { return false }
  }

  private listenForParameters() {
    this.routeSubscription = this.route
    .queryParams
    .pipe(untilComponentDestroyed(this))
    .subscribe(params => {
      if (params.e === 'signin') {
        if (this.windowWidth > 600) {
          this.openSigninDialog((result: string) => {
            if (result === 'complete') {
              // this.activateBackArrowSvc.setBackRoute('', 'forward');
              this.headerVisibleSvc.toggleHeaderDesktopVisible(true);

              if (!this.location.path()) {
                this.router.navigateByUrl('/home/main');
              }
            }
          });
        } else {
          this.activateBackArrowSvc.setBackRoute('', 'forward');
          this.router.navigateByUrl('/signin');
        }
      } else if (params.e === 'register') {
        if (this.windowWidth > 600) {
          this.openRegisterDialog((result: string) => {
            if (result === 'complete') {
              this.onSignIn();
            }
          });
        } else {
          this.activateBackArrowSvc.setBackRoute('', 'forward');
          this.router.navigateByUrl('/register');
        }
      }
    }, error => {
      this.sentry.logError('Landing-page:listenForParameters: could not read parameters.  error=' + error);
    });
  }


  // For Desktop users, present register / signin as a dialog
  private openRegisterDialog(cb: CallableFunction): void {
    const dialogRef = this.dialog.open(RegisterDesktopDialogComponent, {
      width: '400px',
      height: '550px',
      disableClose: true,
      hasBackdrop: true
    });

    dialogRef.afterClosed()
    .pipe(untilComponentDestroyed(this))
    .subscribe(result => {
        cb(result);
    });
  }

  private openSigninDialog(cb: CallableFunction): void {
    const dialogRef = this.dialog.open(SigninDesktopDialogComponent, {
      width: '400px',
      height: '550px',
      disableClose: true,
      hasBackdrop: true
    });

    dialogRef.afterClosed()
    .pipe(untilComponentDestroyed(this))
    .subscribe(result => {
        cb(result);
    });
  }

  private setImageBasedOnScreenWidth() {
    this.windowWidth = window.innerWidth;

    if (this.windowWidth > 600) {
      this.landingImage = 'landing-image' + this.landingImageNbr + '.jpeg';
    } else {
      this.landingImage = 'landing-imageM' + this.landingImageNbr + '.jpeg';
    }
  }
}
