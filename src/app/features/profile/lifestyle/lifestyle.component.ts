import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder} from '@angular/forms';

import { TranslateService } from '@ngx-translate/core';

import { DataService } from './../../../core/services/data-services/data.service';
import { Ilifestyle } from './../../../interfaces/lifestyle';

@Component({
  selector: 'app-rvlm-lifestyle',
  templateUrl: './lifestyle.component.html',
  styleUrls: ['./lifestyle.component.scss']
})
export class LifestyleComponent implements OnInit {
  lifestyle: Ilifestyle;
  form: FormGroup;

  constructor(private dataSvc: DataService,
              private translate: TranslateService,
              fb: FormBuilder) {
              this.form = fb.group({
                use: new FormControl({value: ''}),
                retired: new FormControl({value: ''}),
                workRemote: new FormControl({value: ''}),
                workCamp: new FormControl({value: ''}),
                workAtLocation: new FormControl({value: ''}),
                occupation: new FormControl({value: ''})
              });
}

  ngOnInit() {
    this.dataSvc.getProfilePersonal().subscribe(user => {
      this.lifestyle = user;
      this.form.patchValue({
        use: this.lifestyle.use,
        retired: this.lifestyle.retired,
        workRemote: this.lifestyle.workRemote,
        workCamp: this.lifestyle.workCamp,
        workAtLocation: this.lifestyle.workAtLocation,
        occupation: this.lifestyle.occupation
      });
    }, (err) => {
      console.error(err);
    });
  }

  public errorHandling = (control: string, error: string) => {
    return this.form.controls[control].hasError(error);
  }

}
