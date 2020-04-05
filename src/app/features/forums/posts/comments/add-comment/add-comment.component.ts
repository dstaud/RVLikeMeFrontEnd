import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';

import { ForumService } from '@services/data-services/forum.service';

@Component({
  selector: 'app-rvlm-add-comment',
  templateUrl: './add-comment.component.html',
  styleUrls: ['./add-comment.component.scss']
})
export class AddCommentComponent implements OnInit {

  @Input('postIndex')
  public postIndex: number;

  @Input('postID')
  public postID: string;

  @Input('postTitle')
  public title: string;

  @Input('displayName')
  public displayName: string;

  @Input('profileImageUrl')
  public profileImageUrl: string;

  @Output() postCommentComplete = new EventEmitter()

  form: FormGroup;
  showSpinner = false;
  postButtonActive = false;
  showSmallFieldInitial = true;

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
    // Subscribe to changes in the form.  Since only one field, as soon as user clicks on the add comment inpu, activate button.
    this.form.get('comment').valueChanges
    .subscribe(selectedValue => {
      this.postButtonActive = true;
    })
  }


  // When done with add, send the information back up the chain
  doneWithAdd(post: any) {
    let result = [];
    let postIndex = JSON.parse('{"postIndex":"' + this.postIndex + '"}');
    result.push(postIndex);
    result.push(post);
    this.form.reset('comment');
    this.showSmallFieldInitial = true;
    this.postButtonActive = false;
    this.postCommentComplete.emit(result);
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
      console.log(error);
      this.showSpinner = false;
    });
  }
}

