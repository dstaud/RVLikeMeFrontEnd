import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';

import { take, takeUntil } from 'rxjs/operators';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { TranslateService } from '@ngx-translate/core';

import { DataService } from './../../../core/services/data-services/data.service';
import { Irig } from './../../../interfaces/rig';

export interface RVType {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-rvlm-rv-rig',
  templateUrl: './rv-rig.component.html',
  styleUrls: ['./rv-rig.component.scss']
})
export class RvRigComponent implements OnInit {
  rig: Irig;
  form: FormGroup;
  RVTypes: RVType[] = [
    {value: 'class-a', viewValue: 'Class A'},
    {value: 'class-b', viewValue: 'Class B'},
    {value: 'class-c', viewValue: 'Class C'},
    {value: 'fifth-wheel', viewValue: 'Fifth Wheel'},
    {value: 'travel-trailer', viewValue: 'Travel Trailer'},
    {value: 'none', viewValue: 'none'}
    ];

  constructor(private dataSvc: DataService,
              private translate: TranslateService,
              fb: FormBuilder) {
              this.form = fb.group({
                type: new FormControl({value: ''}),
                year: new FormControl({value: ''}),
                brand: new FormControl({value: ''}),
                model: new FormControl({value: ''}),
                other: new FormControl({value: ''}),
                lengthInFeet: new FormControl({value: ''}),
                heightInFeet: new FormControl({value: ''}),
                dieselOrGas: new FormControl({value: ''}),
                towing: new FormControl({value: ''}),
                toad: new FormControl({value: ''})
              });
}

  ngOnInit() {
    this.dataSvc.getProfilePersonal()
    .pipe(take(1))
    .subscribe(rig => {
      this.rig = rig;
      this.form.patchValue({
        type: this.rig.type,
        year: this.rig.year,
        brand: this.rig.brand,
        model: this.rig.model,
        other: this.rig.other,
        lengthInFeet: this.rig.lengthInFeet,
        heightInFeet: this.rig.heightInFeet,
        dieselOrGas: this.rig.dieselOrGas,
        towing: this.rig.towing,
        toad: this.rig.toad
      });
    }, (err) => {
      console.error(err);
    });
  }

  public changeType(val) {
    console.log(val);
/*     this.rig.setValue(e.target.value, {
      onlySelf: true
    }) */
  }
  public errorHandling = (control: string, error: string) => {
    return this.form.controls[control].hasError(error);
  }
}
