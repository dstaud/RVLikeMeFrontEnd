import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import { TranslateService } from '@ngx-translate/core';

import { SharedComponent } from './../../../shared/shared.component';
import { DataService } from './../../../core/services/data-services/data.service';
import { Ilifestyle } from './../../../interfaces/lifestyle';
import { OtherDialogComponent } from './../../../dialogs/other-dialog.component';

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
  showRvUseSaveIcon = false;
  showWorklifeSaveIcon = false;
  otherRvUse: string;
  otherWorklife: string;

  lifestyle: Ilifestyle = {
    aboutMe: null,
    rvUse: null,
    worklife: null,
    campsWithMe: null
  };

  RvLifestyles: RvLifestyle[] = [
    {value: '', viewValue: ''},
    {value: 'FT', viewValue: 'lifestyle.component.list.rvuse.ft'},
    {value: 'FS', viewValue: 'lifestyle.component.list.rvuse.fs'},
    {value: 'FP', viewValue: 'lifestyle.component.list.rvuse.fp'},
    {value: 'PS', viewValue: 'lifestyle.component.list.rvuse.ps'},
    {value: 'NY', viewValue: 'lifestyle.component.list.rvuse.ny'},
    {value: 'other', viewValue: 'lifestyle.component.list.rvuse.other'}
  ];

  Worklives: Worklife[] = [
    {value: '', viewValue: ''},
    {value: 'retired', viewValue: 'lifestyle.component.list.worklife.retired'},
    {value: 'work-travel', viewValue: 'lifestyle.component.list.worklife.work-travel'},
    {value: 'work-full-time', viewValue: 'lifestyle.component.list.worklife.work-full-time'},
    {value: 'work-part-time', viewValue: 'lifestyle.component.list.worklife.work-part-time'},
    {value: 'other', viewValue: 'lifestyle.component.list.worklife.other'}
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
              private dialog: MatDialog,
              fb: FormBuilder) {
              this.form = fb.group({
                rvUse: new FormControl(''),
                worklife: new FormControl('')
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
      console.log('read=', this.lifestyle);
      if (this.lifestyle.rvUse) {
        if (this.lifestyle.rvUse.substring(0, 1) === '@') {
          this.otherRvUse = this.lifestyle.rvUse.substring(1, this.lifestyle.rvUse.length);
          this.lifestyle.rvUse = 'other';
        }
      }
      if (this.lifestyle.worklife) {
        if (this.lifestyle.worklife.substring(0, 1) === '@') {
          this.otherWorklife = this.lifestyle.worklife.substring(1, this.lifestyle.worklife.length);
          this.lifestyle.worklife = 'other';
        }
      }
      this.form.patchValue({
        rvUse: this.lifestyle.rvUse,
        worklife: this.lifestyle.worklife
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

  selectedSelectItem(control: string, event: string) {
    let name = '';
    if (event === 'other') {
      switch (control) {
        case 'rvUse':
          name = 'lifestyle.component.rvUseDesc';
          break;
        case 'worklife':
          name = 'lifestyle.component.worklifeDesc';
          break;
      }
      console.log('open dialog ', control, name, event);
      this.openDialog(control, name, event);
    } else {
      switch (control) {
        case 'rvUse':
          this.otherRvUse = '';
          this.updateRvUse(event);
          break;
        case 'worklife':
          this.otherWorklife = '';
          this.updateWorklife(event);
          break;
      }
    }
  }

  activatedSelectItem(control: string) {
    let name = '';
    switch (control) {
      case 'rvUse':
        if (this.otherRvUse) {
          name = 'lifestyle.component.rvUseDesc';
          this.openDialog(control, name, 'other');
        }
        break;
      case 'worklife':
        if (this.otherWorklife) {
          name = 'lifestyle.component.worklifeDesc';
          this.openDialog(control, name, 'other');
        }
        break;
      }
  }

  updateRvUse(use: string) {
    this.showRvUseSaveIcon = true;
    if (this.form.controls.rvUse.value === '') {
      this.lifestyle.rvUse = null;
      this.form.patchValue({ rvUse: null });
    } else {
      if (this.form.controls.rvUse.value !== 'other') {
        this.lifestyle.rvUse = this.form.controls.rvUse.value;
      }
    }
    this.updateLifestyle('rvUse');
  }

  updateWorklife(event: string) {
    this.showWorklifeSaveIcon = true;
    if (this.form.controls.worklife.value === '') {
      this.lifestyle.worklife = null;
      this.form.patchValue({ work: null });
    } else {
      if (this.form.controls.worklife.value !== 'other') {
        this.lifestyle.worklife = this.form.controls.worklife.value;
      }
    }
    this.updateLifestyle('worklife');
  }

  updateLifestyle(control: string) {
    this.httpError = false;
    this.httpErrorText = '';
    console.log('Update lifestyle ', this.lifestyle);
    this.dataSvc.updateProfileLifestyle(this.lifestyle)
    .subscribe ((responseData) => {
      console.log('update, control=', control);
      switch (control) {
        case 'rvUse':
          this.showRvUseSaveIcon = false;
          break;
        case 'worklife':
          this.showWorklifeSaveIcon = false;
          console.log('should be false');
          break;
      }
    }, error => {
      switch (control) {
        case 'rvUse':
          this.showRvUseSaveIcon = false;
          break;
        case 'worklife':
          this.showWorklifeSaveIcon = false;
          break;
      }
      console.log('in error!', error);
      this.httpError = true;
      this.httpErrorText = 'An unknown error occurred.  Please refresh and try again.';
    });
  }

  openDialog(control: string, name: string, event: string): void {
    let other = '';
    let selection = '';
    switch (control) {
      case 'rvUse':
        other = this.otherRvUse;
        break;
      case 'worklife':
        other = this.otherWorklife;
        break;
    }
    console.log ('other=', other);
    const dialogRef = this.dialog.open(OtherDialogComponent, {
      width: '250px',
      disableClose: true,
      data: {name: name, other: other }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed ', result);
      if (result) {
        if (result !== 'canceled') {
          switch (control) {
            case 'rvUse':
              if (this.otherRvUse !== result ) {
                console.log('in update ', result, control);
                this.otherRvUse = result;
                this.lifestyle.rvUse = '@' + result;
                this.updateRvUse(event);
                console.log('lifestyle=', this.lifestyle);
              }
              break;
            case 'worklife':
              if (this.otherWorklife !== result ) {
                console.log('in update ', result, control);
                this.otherWorklife = result;
                this.lifestyle.worklife = '@' + result;
                this.updateRvUse(event);
                console.log('lifestyle=', this.lifestyle);
              }
              break;
           }
        }
      } else {
        switch (control) {
          case 'rvUse':
            if (this.otherRvUse) {
              this.otherRvUse = '';
              this.lifestyle.rvUse = null;
              this.updateRvUse(event);
              this.form.patchValue({
                rvUse: null
              });
            } else {
              if (this.lifestyle.rvUse) {
                selection = this.lifestyle.rvUse;
              }
              this.form.patchValue({
                rvUse: selection
              });
            }
            break;
          case 'worklife':
            if (this.otherWorklife) {
              this.otherWorklife = '';
              this.lifestyle.worklife = null;
              this.updateWorklife(event);
              this.form.patchValue({
                work: null
              });
            } else {
              if (this.lifestyle.worklife) {
                selection = this.lifestyle.worklife;
              }
              this.form.patchValue({
                rvUse: selection
              });
            }
            break;
        }
      }
    });
  }

  public errorHandling = (control: string, error: string) => {
    return this.form.controls[control].hasError(error);
  }

}
