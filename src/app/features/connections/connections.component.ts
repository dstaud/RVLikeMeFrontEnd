import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { TranslateService } from '@ngx-translate/core';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { Observable } from 'rxjs';

import { ProfileService, IuserProfile } from '@services/data-services/profile.service';
import { LikemeCountsService, IlikeMeCounts } from '@services/data-services/likeme-counts.service';
import { AuthenticationService } from '@services/data-services/authentication.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';


@Component({
  selector: 'app-rvlm-connections',
  templateUrl: './connections.component.html',
  styleUrls: ['./connections.component.scss']
})
export class ConnectionsComponent implements OnInit {
  form: FormGroup;
  showSpinner = false;

  private backPath = '';
  private likeMeCounts = [];
  private likeMeDesc: string;
  private likeMeAnswer: string;
  private profileKeys = [];
  private profileValues = [];
  private likeMe: IlikeMeCounts;
  private likeMeProfile: Observable<IlikeMeCounts>;
  private profile: IuserProfile;
  private userProfile: Observable<IuserProfile>;

  constructor(private translate: TranslateService,
              private auth: AuthenticationService,
              private location: Location,
              private profileSvc: ProfileService,
              private likeMeCountsSvc: LikemeCountsService,
              private activateBackArrowSvc: ActivateBackArrowService,
              private router: Router,
              fb: FormBuilder) {
                this.form = fb.group({
                  language: ['en', Validators.required],
                  aboutMe: ['']
                });
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
      console.log('in Profile component=', data);
      this.profile = data;
    });

    this.likeMeProfile = this.likeMeCountsSvc.likeMeCounts;
    this.likeMeProfile
    .pipe(untilComponentDestroyed(this))
    .subscribe(data => {
      console.log('in Connections component=', data);

      this.profileKeys = Object.keys(data);
      this.profileValues = Object.values(data);

      for (let i = 1; i < this.profileKeys.length; i++ ) {
        if (this.profileValues[i]) {
          if (this.profile[this.profileKeys[i]] === true) {
            this.likeMeAnswer = this.translate.instant(
              'interests.component.' + this.profileKeys[i]
            );
            if (this.profileValues[i] === 1) {
              this.likeMeDesc = this.translate.instant(
                'connections.component.interest1'
              );
            } else {
              this.likeMeDesc = this.translate.instant(
                'connections.component.interest'
              );
            }
            console.log(this.profileValues[i] + ' ' + this.likeMeDesc + ' ' + this.likeMeAnswer);
          } else {
            if (this.profileValues[i] === 1) {
              this.likeMeDesc = this.translate.instant(
                'connections.component.' + this.profileKeys[i] + '1'
                );
            } else {
              this.likeMeDesc = this.translate.instant(
                'connections.component.' + this.profileKeys[i]
                );
            }
            this.likeMeAnswer = this.translate.instant(
              'profile.component.list.' + this.profileKeys[i].toLowerCase() + '.' + this.profile[this.profileKeys[i]].toLowerCase()
              );
            console.log(this.profileValues[i] + ' ' + this.likeMeDesc + ' ' + this.likeMeAnswer);
          }
        }
      }

/*       this.form.patchValue ({
        language: data.language,
      }); */

      this.showSpinner = false;
      this.form.enable();
    }, (error) => {
      this.showSpinner = false;
      console.error(error);
    });;
  }

  ngOnDestroy() {}
}
