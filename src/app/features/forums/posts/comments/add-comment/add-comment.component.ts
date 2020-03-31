import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';

import { ForumService } from '@services/data-services/forum.service';

@Component({
  selector: 'app-rvlm-add-comment',
  templateUrl: './add-comment.component.html',
  styleUrls: ['./add-comment.component.scss']
})
export class AddCommentComponent implements OnInit {

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
    console.log('in comments', this.postID, this.title, this.displayName, this.profileImageUrl)
    console.log('ngInit=', this.displayName);
    this.form.get('comment').valueChanges
    .subscribe(selectedValue => {
      this.postButtonActive = true;
    })
  }

  doneWithAdd(post: any) {
    this.form.reset('comment');
    this.showSmallFieldInitial = true;
    this.postButtonActive = false;
    if (post !== 'canceled') {
      let comment = '{"comment":"' + post.comments[post.comments.length-1].comment + '",' +
      '"displayName":"' + post.comments[post.comments.length-1].displayName + '",' +
      '"profileImageUrl":"' + post.comments[post.comments.length-1].profileImageUrl + '",' +
      '"createdAt":"' + post.comments[post.comments.length-1].createdAt + '"}';
      console.log('NEW COMMENT=', comment);
      let JSONComment = JSON.parse(comment);
      this.postCommentComplete.emit(JSONComment);
    } else {
      this.postCommentComplete.emit(post);
    }
  }


  onSubmit() {
    this.postButtonActive = false;
    this.showSpinner = true;
    let comment = this.form.controls.comment.value;
    console.log('displayName before Add=', this.displayName)
    this.forumSvc.addComment(this.postID, this.displayName, this.profileImageUrl, comment)
    .subscribe(postResult => {
      console.log('POST RESULT=', postResult)
      this.doneWithAdd(postResult);
      this.showSpinner = false;
    }, error => {
      console.log(error);
      this.showSpinner = false;
    });
  }
}

