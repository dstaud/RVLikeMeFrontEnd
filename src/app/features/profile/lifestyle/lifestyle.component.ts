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

export interface Boondocking {
  value: string;
  viewValue: string;
}

export interface Traveling {
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
  showCampsWithMeSaveIcon = false;
  showBoondockingSaveIcon = false;
  showTravelingSaveIcon = false;
  otherRvUse: string;
  otherWorklife: string;
  otherCampsWithMe: string;
  otherBoondocking: string;
  otherTraveling: string;

  lifestyle: Ilifestyle = {
    aboutMe: null,
    rvUse: null,
    worklife: null,
    campsWithMe: null,
    boondocking: null,
    traveling: null
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
    {value: 'military', viewValue: 'lifestyle.component.list.worklife.military'},
    {value: 'work-travel', viewValue: 'lifestyle.component.list.worklife.work-travel'},
    {value: 'work-full-time', viewValue: 'lifestyle.component.list.worklife.work-full-time'},
    {value: 'work-part-time', viewValue: 'lifestyle.component.list.worklife.work-part-time'},
    {value: 'onleave', viewValue: 'lifestyle.component.list.worklife.onleave'},
    {value: 'workamp', viewValue: 'lifestyle.component.list.worklife.workamp'},
    {value: 'other', viewValue: 'lifestyle.component.list.worklife.other'}
  ];

  CampsWithMes: CampsWithMe[] = [
    {value: '', viewValue: ''},
    {value: 'single', viewValue: 'lifestyle.component.list.campswithme.single'},
    {value: 'partner', viewValue: 'lifestyle.component.list.campswithme.partner'},
    {value: 'children', viewValue: 'lifestyle.component.list.campswithme.children'},
    {value: 'family', viewValue: 'lifestyle.component.list.campswithme.family'},
    {value: 'friend', viewValue: 'lifestyle.component.list.campswithme.friend'},
    {value: 'other', viewValue: 'lifestyle.component.list.campswithme.other'}
  ];

  Boondockings: Boondocking[] = [
    {value: '', viewValue: ''},
    {value: 'most', viewValue: 'lifestyle.component.list.boondocking.most'},
    {value: 'alot', viewValue: 'lifestyle.component.list.boondocking.alot'},
    {value: 'some', viewValue: 'lifestyle.component.list.boondocking.some'},
    {value: 'while', viewValue: 'lifestyle.component.list.boondocking.while'},
    {value: 'haveto', viewValue: 'lifestyle.component.list.boondocking.haveto'},
    {value: 'rarely', viewValue: 'lifestyle.component.list.boondocking.rarely'},
    {value: 'never', viewValue: 'lifestyle.component.list.boondocking.never'},
    {value: 'want', viewValue: 'lifestyle.component.list.boondocking.want'}
  ];

  Travelings: Traveling[] = [
    {value: '', viewValue: ''},
    {value: 'countries', viewValue: 'lifestyle.component.list.traveling.countries'},
    {value: 'country', viewValue: 'lifestyle.component.list.traveling.country'},
    {value: 'regional', viewValue: 'lifestyle.component.list.traveling.regional'},
    {value: 'none', viewValue: 'lifestyle.component.list.traveling.none'},
    {value: 'other', viewValue: 'lifestyle.component.list.traveling.other'},
  ];

  constructor(private dataSvc: DataService,
              private translate: TranslateService,
              private shared: SharedComponent,
              private dialog: MatDialog,
              fb: FormBuilder) {
              this.form = fb.group({
                rvUse: new FormControl(''),
                worklife: new FormControl(''),
                campsWithMe: new FormControl(''),
                boondocking: new FormControl(''),
                traveling: new FormControl('')
              });
}

  ngOnInit() {
    this.dataSvc.getProfileLifestyle().subscribe(lifestyle => {
      this.lifestyle = lifestyle;

      // @ indicates user selected 'other' and this is what they entered
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
      if (this.lifestyle.campsWithMe) {
        if (this.lifestyle.campsWithMe.substring(0, 1) === '@') {
          this.otherCampsWithMe = this.lifestyle.campsWithMe.substring(1, this.lifestyle.campsWithMe.length);
          this.lifestyle.campsWithMe = 'other';
        }
      }
      if (this.lifestyle.boondocking) {
        if (this.lifestyle.boondocking.substring(0, 1) === '@') {
          this.otherBoondocking = this.lifestyle.boondocking.substring(1, this.lifestyle.boondocking.length);
          this.lifestyle.boondocking = 'other';
        }
      }
      if (this.lifestyle.traveling) {
        if (this.lifestyle.traveling.substring(0, 1) === '@') {
          this.otherTraveling = this.lifestyle.traveling.substring(1, this.lifestyle.traveling.length);
          this.lifestyle.traveling = 'other';
        }
      }

      // Update form with values from server
      this.form.patchValue({
        rvUse: this.lifestyle.rvUse,
        worklife: this.lifestyle.worklife,
        campsWithMe: this.lifestyle.campsWithMe,
        boondocking: this.lifestyle.boondocking,
        traveling: this.lifestyle.traveling
      });
    }, (err) => {
      // TODO: What to do with error handling here
      console.error(err);
    });
  }

/**** Help pop-up text ****/
 rvUseHelp() {
    this.helpMsg = this.translate.instant('lifestyle.component.helpRvUse');
    this.shared.openSnackBar(this.helpMsg, 'message');
  }

  worklifeHelp() {
    this.helpMsg = this.translate.instant('lifestyle.component.helpWorklife');
    this.shared.openSnackBar(this.helpMsg, 'message');
  }

  campsWithMeHelp() {
    this.helpMsg = this.translate.instant('lifestyle.component.helpCampsWithMe');
    this.shared.openSnackBar(this.helpMsg, 'message');
  }

  boondockingHelp() {
    this.helpMsg = this.translate.instant('lifestyle.component.helpBoondocking');
    this.shared.openSnackBar(this.helpMsg, 'message');
  }

  travelingHelp() {
    this.helpMsg = this.translate.instant('lifestyle.component.helpTraveling');
    this.shared.openSnackBar(this.helpMsg, 'message');
  }
  /**************************/

  /**** Drop-down selection processing ****/
  selectedSelectItem(control: string, event: string) {
    let name = '';

    // If user chose other, set description for dialog
    if (event === 'other') {
      switch (control) {
        case 'rvUse':
          name = 'lifestyle.component.rvUseDesc';
          break;
        case 'worklife':
          name = 'lifestyle.component.worklifeDesc';
          break;
        case 'campsWithMe':
          name = 'lifestyle.component.campsWithMeDesc';
          break;
        case 'boondocking':
          name = 'lifestyle.component.boondockingDesc';
          break;
        case 'traveling':
          name = 'lifestyle.component.travelingDesc';
          break;
      }
      this.openDialog(control, name, event);
    } else {

      // If user did not choose other, call the correct update processor for the field selected
      switch (control) {
        case 'rvUse':
          this.otherRvUse = '';
          this.updateRvUse(event);
          break;
        case 'worklife':
          this.otherWorklife = '';
          this.updateWorklife(event);
          break;
        case 'campsWithMe':
          this.otherCampsWithMe = '';
          this.updateCampsWithMe(event);
          break;
        case 'boondocking':
          this.otherBoondocking = '';
          this.updateBoondocking(event);
          break;
        case 'traveling':
          this.otherTraveling = '';
          this.updateTraveling(event);
          break;
      }
    }
  }
  /****************************************/

  /**** Automatically pop-up the 'other' dialog with the correct control and name when use clicks on select if other ****/
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
      case 'campsWithMe':
        if (this.otherCampsWithMe) {
          name = 'lifestyle.component.campsWithMeDesc';
          this.openDialog(control, name, 'other');
        }
        break;
      case 'boondocking':
        if (this.otherBoondocking) {
          name = 'lifestyle.component.boondockingDesc';
          this.openDialog(control, name, 'other');
        }
        break;
      case 'traveling':
        if (this.otherTraveling) {
          name = 'lifestyle.component.travelingDesc';
          this.openDialog(control, name, 'other');
        }
        break;
      }
  }
  /**********************************************************************************************************************/

  /**** Field auto-update processing ****/
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
      this.form.patchValue({ worklife: null });
    } else {
      if (this.form.controls.worklife.value !== 'other') {
        this.lifestyle.worklife = this.form.controls.worklife.value;
      }
    }
    this.updateLifestyle('worklife');
  }

  updateCampsWithMe(event: string) {
    this.showCampsWithMeSaveIcon = true;
    if (this.form.controls.campsWithMe.value === '') {
      this.lifestyle.campsWithMe = null;
      this.form.patchValue({ campsWithMe: null });
    } else {
      if (this.form.controls.campsWithMe.value !== 'other') {
        this.lifestyle.campsWithMe = this.form.controls.campsWithMe.value;
      }
    }
    this.updateLifestyle('campsWithMe');
  }

  updateBoondocking(event: string) {
    this.showBoondockingSaveIcon = true;
    if (this.form.controls.boondocking.value === '') {
      this.lifestyle.boondocking = null;
      this.form.patchValue({ boondocking: null });
    } else {
      if (this.form.controls.boondocking.value !== 'other') {
        this.lifestyle.boondocking = this.form.controls.boondocking.value;
      }
    }
    this.updateLifestyle('boondocking');
  }

  updateTraveling(event: string) {
    this.showTravelingSaveIcon = true;
    if (this.form.controls.traveling.value === '') {
      this.lifestyle.traveling = null;
      this.form.patchValue({ traveling: null });
    } else {
      if (this.form.controls.traveling.value !== 'other') {
        this.lifestyle.traveling = this.form.controls.traveling.value;
      }
    }
    this.updateLifestyle('traveling');
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
          break;
        case 'campsWithMe':
          this.showCampsWithMeSaveIcon = false;
          break;
        case 'boondocking':
          this.showBoondockingSaveIcon = false;
          break;
        case 'traveling':
          this.showTravelingSaveIcon = false;
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
        case 'campsWithMe':
          this.showCampsWithMeSaveIcon = false;
          break;
        case 'boondocking':
          this.showBoondockingSaveIcon = false;
          break;
        case 'traveling':
          this.showTravelingSaveIcon = false;
          break;
      }
      console.log('in error!', error);
      this.httpError = true;
      this.httpErrorText = 'An unknown error occurred.  Please refresh and try again.';
    });
  }
  /**************************************/

  /**** 'Other' Dialog ****/
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
      case 'campsWithMe':
        other = this.otherCampsWithMe;
        break;
      case 'boondocking':
        other = this.otherBoondocking;
        break;
      case 'traveling':
        other = this.otherTraveling;
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
                this.otherRvUse = result;
                this.lifestyle.rvUse = '@' + result;
                this.updateRvUse(event);
              }
              break;
            case 'worklife':
              if (this.otherWorklife !== result ) {
                this.otherWorklife = result;
                this.lifestyle.worklife = '@' + result;
                this.updateWorklife(event);
              }
              break;
            case 'campsWithMe':
              if (this.otherCampsWithMe !== result ) {
                this.otherCampsWithMe = result;
                this.lifestyle.campsWithMe = '@' + result;
                this.updateCampsWithMe(event);
              }
              break;
            case 'boondocking':
              if (this.otherBoondocking !== result ) {
                this.otherBoondocking = result;
                this.lifestyle.boondocking = '@' + result;
                this.updateBoondocking(event);
              }
              break;
            case 'traveling':
              if (this.otherTraveling !== result ) {
                this.otherTraveling = result;
                this.lifestyle.traveling = '@' + result;
                this.updateTraveling(event);
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
              this.form.patchValue({rvUse: null});
            } else {
              if (this.lifestyle.rvUse) {
                selection = this.lifestyle.rvUse;
              }
              this.form.patchValue({rvUse: selection});
            }
            break;
          case 'worklife':
            if (this.otherWorklife) {
              this.otherWorklife = '';
              this.lifestyle.worklife = null;
              this.updateWorklife(event);
              this.form.patchValue({worklife: null});
            } else {
              if (this.lifestyle.worklife) {
                selection = this.lifestyle.worklife;
              }
              this.form.patchValue({worklife: selection});
            }
            break;
          case 'campsWithMe':
            if (this.otherCampsWithMe) {
              this.otherCampsWithMe = '';
              this.lifestyle.campsWithMe = null;
              this.updateCampsWithMe(event);
              this.form.patchValue({campsWithMe: null});
            } else {
              if (this.lifestyle.campsWithMe) {
                selection = this.lifestyle.campsWithMe;
              }
              this.form.patchValue({campsWithMe: selection});
            }
            break;
          case 'boondocking':
            if (this.otherBoondocking) {
              this.otherBoondocking = '';
              this.lifestyle.boondocking = null;
              this.updateBoondocking(event);
              this.form.patchValue({boondocking: null});
            } else {
              if (this.lifestyle.boondocking) {
                selection = this.lifestyle.boondocking;
              }
              this.form.patchValue({boondocking: selection});
            }
            break;
          case 'traveling':
            if (this.otherTraveling) {
              this.otherTraveling = '';
              this.lifestyle.traveling = null;
              this.updateTraveling(event);
              this.form.patchValue({traveling: null});
            } else {
              if (this.lifestyle.traveling) {
                selection = this.lifestyle.traveling;
              }
              this.form.patchValue({traveling: selection});
            }
            break;
        }
      }
    });
  }
  /************************/


  public errorHandling = (control: string, error: string) => {
    return this.form.controls[control].hasError(error);
  }

}
