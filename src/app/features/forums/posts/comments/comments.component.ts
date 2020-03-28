import { Component, OnInit, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';

import { ForumService } from '@services/data-services/forum.service';

@Component({
  selector: 'app-rvlm-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss']
})
export class CommentsComponent implements OnInit {

  @Input('postID')
  public postID: string;

  @Input('postTitle')
  public title: string;

  @Output() formComplete = new EventEmitter()
  public formCompleted: string;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.windowWidth = window.innerWidth;
    this.windowHeight = window.innerHeight;

    this.containerHeight = Math.round((this.windowHeight *.8) * .8);
    this.fieldHeight = this.containerHeight.toString() + 'px';
  }


  form: FormGroup;
  showSpinner = false;
  fieldHeight: string;

  private containerHeight: number
  private windowWidth: number;
  private windowHeight: number;


  constructor(private forumSvc: ForumService,
              fb: FormBuilder) {
              this.form = fb.group({
                comment: new FormControl('')
              });
   }

  ngOnInit(): void {
    console.log('in comments', this.postID, this.title)
    this.windowWidth = window.innerWidth;
    this.windowHeight = window.innerHeight;

    let winH = this.windowHeight * .8;
    let fieldH = winH * .8;
    this.containerHeight = Math.round((this.windowHeight *.8) * .8) - 80;
    this.fieldHeight = this.containerHeight.toString() + 'px';
  }

  onCancel() {
    this.formCompleted = 'canceled';
    this.formComplete.emit(this.formCompleted);
  }

  onSubmit() {
    this.showSpinner = true;
    let comment = this.form.controls.comment.value;
    this.forumSvc.addComment(this.postID, comment)
    .subscribe(commentResult => {
      console.log('COMMENT RESULT=', commentResult);
      // this.doneWithAdd('saved');
      this.showSpinner = false;
    }, error => {
      console.log(error);
      this.showSpinner = false;
    });
  }
}
