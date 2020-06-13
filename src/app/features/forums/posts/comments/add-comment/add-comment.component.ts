import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';

import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { ForumService } from '@services/data-services/forum.service';

import { SharedComponent } from '@shared/shared.component';

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
              private shared: SharedComponent,
              fb: FormBuilder) {
              this.form = fb.group({
                comment: new FormControl('')
              });
   }

  ngOnInit(): void {
    // Subscribe to changes in the form.  Since only one field, as soon as user clicks on the add comment inpu, activate button.
    this.form.get('comment').valueChanges
    .pipe(untilComponentDestroyed(this))
    .subscribe(selectedValue => {
      this.postButtonActive = true;
    })
  }

  ngOnDestroy() {}


  // When user submits, send to the server.
  onSubmit() {
    this.postButtonActive = false;
    this.showSpinner = true;
    let comment = this.form.controls.comment.value;
    this.forumSvc.addComment(this.postID, this.displayName, this.profileImageUrl, comment)
    .pipe(untilComponentDestroyed(this))
    .subscribe(result => {
      this.doneWithAdd(result);
      this.showSpinner = false;
    }, error => {
      this.showSpinner = false;
      this.shared.notifyUserMajorError(error);
      throw new Error(JSON.stringify(error));
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

