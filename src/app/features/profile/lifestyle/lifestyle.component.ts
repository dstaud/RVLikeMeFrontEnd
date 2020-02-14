import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators} from '@angular/forms';

import { TranslateService } from '@ngx-translate/core';

import { SharedComponent } from './../../../shared/shared.component';
import { DataService } from './../../../core/services/data-services/data.service';
import { Ilifestyle } from './../../../interfaces/lifestyle';

export interface RvLifestyle {
  value: string;
  viewValue: string;
}

export interface Worklife {
  value: string;
  viewValue: string;
}

export interface CampsWithMe {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-rvlm-lifestyle',
  templateUrl: './lifestyle.component.html',
  styleUrls: ['./lifestyle.component.scss']
})
export class LifestyleComponent implements OnInit {
  form: FormGroup;
  httpError = false;
  httpErrorText = '';
  helpMsg = '';
  showSpinner = false;
  showRvUseSpinner = false;
  showWorklifeSpinner = false;

  lifestyle: Ilifestyle = {
    aboutMe: '',
    rvUse: '',
    work: '',
    campsWithMe: ''
  };

  RvLifestyles: RvLifestyle[] = [
    {value: '', viewValue: ''},
    {value: 'FT', viewValue: 'lifestyle.component.list.rvuse.ft'},
    {value: 'FS', viewValue: 'lifestyle.component.list.rvuse.fs'},
    {value: 'FP', viewValue: 'lifestyle.component.list.rvuse.fp'},
    {value: 'PS', viewValue: 'lifestyle.component.list.rvuse.ps'},
    {value: 'NY', viewValue: 'lifestyle.component.list.rvuse.ny'},
  ];

  Worklives: Worklife[] = [
    {value: '', viewValue: ''},
    {value: 'retired', viewValue: 'lifestyle.component.list.worklife.retired'},
    {value: 'work-travel', viewValue: 'lifestyle.component.list.worklife.work-travel'},
    {value: 'work-full-time', viewValue: 'lifestyle.component.list.worklife.work-full-time'},
    {value: 'work-part-time', viewValue: 'lifestyle.component.list.worklife.work-part-time'}
  ];

  CampsWithMes: CampsWithMe[] = [
    {value: '', viewValue: ''},
    {value: 'single', viewValue: 'lifestyle.component.list.campswithme.single'},
    {value: 'partner', viewValue: 'lifestyle.component.list.campswithme.partner'},
    {value: 'children', viewValue: 'lifestyle.component.list.campswithme.children'},
    {value: 'family', viewValue: 'lifestyle.component.list.campswithme.family'},
    {value: 'friend', viewValue: 'lifestyle.component.list.campswithme.friend'}
  ];

  constructor(private dataSvc: DataService,
              private translate: TranslateService,
              private shared: SharedComponent,
              fb: FormBuilder) {
              this.form = fb.group({
                rvUse: new FormControl(''),
                work: new FormControl('')
/*                 use: new FormControl({value: ''}),
                retired: new FormControl({value: ''}),
                workRemote: new FormControl({value: ''}),
                workCamp: new FormControl({value: ''}),
                workAtLocation: new FormControl({value: ''}),
                occupation: new FormControl({value: ''}) */
              });
}

  ngOnInit() {
    this.dataSvc.getProfileLifestyle().subscribe(lifestyle => {
      this.lifestyle = lifestyle;
      this.form.patchValue({
        rvUse: this.lifestyle.rvUse,
        work: this.lifestyle.work
/*         use: this.lifestyle.use,
        retired: this.lifestyle.retired,
        workRemote: this.lifestyle.workRemote,
        workCamp: this.lifestyle.workCamp,
        workAtLocation: this.lifestyle.workAtLocation,
        occupation: this.lifestyle.occupation */
      });
    }, (err) => {
      console.error(err);
    });
  }

 rvUseHelp() {
    this.helpMsg = this.translate.instant('lifestyle.component.helpRvUse');
    this.shared.openSnackBar(this.helpMsg, 'message');
  }

  worklifeHelp() {
    this.helpMsg = this.translate.instant('lifestyle.component.helpWorklife');
    this.shared.openSnackBar(this.helpMsg, 'message');
  }

  updateRvUse(use: string) {
    this.showRvUseSpinner = true;
    this.lifestyle.rvUse = use;
    this.updateLifestyle('rvUse');
  }

  updateWorklife(work: string) {
    this.showWorklifeSpinner = true;
    this.lifestyle.work = work;
    this.updateLifestyle('work');
  }

  updateLifestyle(field: string) {
    this.httpError = false;
    this.httpErrorText = '';
    console.log('Update lifestyle ', this.lifestyle);
    this.dataSvc.updateProfileLifestyle(this.lifestyle)
    .subscribe ((responseData) => {
      if (field === 'rvUse') {
        this.showRvUseSpinner = false;
      }
      if (field === 'work') {
        this.showWorklifeSpinner = false;
      }
    }, error => {
      if (field === 'rvUse') {
        this.showRvUseSpinner = false;
      }
      if (field === 'work') {
        this.showWorklifeSpinner = false;
      }
      console.log('in error!', error);
      this.httpError = true;
      this.httpErrorText = 'An unknown error occurred.  Please refresh and try again.';
    });
  }

  public errorHandling = (control: string, error: string) => {
    return this.form.controls[control].hasError(error);
  }

}
