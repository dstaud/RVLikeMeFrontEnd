import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';

import { ForumService } from '@services/data-services/forum.service';

@Component({
  selector: 'app-rvlm-add-comment',
  templateUrl: './add-comment.component.html',
  styleUrls: ['./add-comment.component.scss']
})
export class AddCommentComponent implements OnInit {
  @Input('postIndex') postIndex: number;
  @Input('postID') postID: string;
  @Input('postTitle') title: string;
  @Input('displayName') displayName: string;
  @Input('profileImageUrl') profileImageUrl: string;

  @Output() postCommentComplete = new EventEmitter()

  @ViewChild('comment') commentInput: ElementRef;
  focusOnCommentInput(): void {
    this.commentInput.nativeElement.focus();
  }

  form: FormGroup;
  textAreaRows: number = 1;
  showSpinner = false;
  postButtonActive = false;
  showSmallFieldInitial = true;


  constructor(private forumSvc: ForumService,
              fb: FormBuilder) {
              this.form = fb.group({
                comment: new FormControl('')
              });
   }

  ngOnInit(): void {
    // Subscribe to changes in the form.  Since only one field, as soon as user clicks on the add comment inpu, activate button.
    this.form.get('comment').valueChanges
    .subscribe(selectedValue => {
      this.postButtonActive = true;
    })
  }


  // When user submits, send to the server.
  onSubmit() {
    this.postButtonActive = false;
    this.showSpinner = true;
    let comment = this.form.controls.comment.value;
    this.forumSvc.addComment(this.postID, this.displayName, this.profileImageUrl, comment)
    .subscribe(result => {
      this.doneWithAdd(result);
      this.showSpinner = false;
    }, error => {
      this.showSpinner = false;
      console.error('AddCommentComponent:onSubmit: throw error ', error);
      throw new Error(error);
    });
  }


  // When done with add, send the information back up the chain
  private doneWithAdd(post: any) {
    let result = [];
    let postIndex = JSON.parse('{"postIndex":"' + this.postIndex + '"}');
    result.push(postIndex);
    result.push(post);
    this.form.reset('comment');
    this.showSmallFieldInitial = true;
    this.postButtonActive = false;
    this.postCommentComplete.emit(result);
  }
}

