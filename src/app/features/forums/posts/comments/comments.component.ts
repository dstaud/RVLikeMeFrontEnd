import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-rvlm-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss']
})
export class CommentsComponent implements OnInit {
  form: FormGroup;

  @Output() formComplete = new EventEmitter()
  public formCompleted: string;

  constructor(fb: FormBuilder) {
              this.form = fb.group({
                comment: new FormControl('')
              });
   }

  ngOnInit(): void {
  }

  onCancel() {
    this.formCompleted = 'canceled';
    this.formComplete.emit(this.formCompleted);
  }

  onSubmit() {
    console.log('save comment');
  }
}
