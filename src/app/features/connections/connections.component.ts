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
  private profileKeys = [];
  private profileValues = [];
  private likeme: IlikeMeCounts;
  private likemeProfile: Observable<IlikeMeCounts>;

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

    this.likemeProfile = this.likeMeCountsSvc.likeMeCounts;

    this.likemeProfile
    .pipe(untilComponentDestroyed(this))
    .subscribe(data => {
      console.log('in Connections component=', data);

      this.profileKeys = Object.keys(data);
      this.profileValues = Object.values(data);
      console.log('Profile Keys ', this.profileKeys);
      console.log('Profile Values ', this.profileValues);

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
