import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { FormGroup, FormControl, FormBuilder} from '@angular/forms';

import { SharedComponent } from '@shared/shared.component';

export interface DialogData {
  name: string;
  other: string;
}

@Component({
  selector: 'app-other-dialog',
  templateUrl: './other-dialog.component.html',
  styleUrls: ['./other-dialog.component.scss']
})
export class OtherDialogComponent implements OnInit {
  form: FormGroup;

  constructor(private translate: TranslateService,
              public dialogRef: MatDialogRef<OtherDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: DialogData,
              fb: FormBuilder) {
                this.form = fb.group({
                  other: new FormControl('')
                });
    }

  ngOnInit() {
    this.form.get('other').setValue(this.data.other);
  }

  onNoClick(): void {
    this.dialogRef.close('canceled');
  }
}
