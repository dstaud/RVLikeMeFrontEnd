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
    console.log('add-comment:ngOnInit: in comments', this.postID, this.title, this.displayName, this.profileImageUrl)
    console.log('add-comment:ngOnInit: displayName=', this.displayName);
    this.form.get('comment').valueChanges
    .subscribe(selectedValue => {
      this.postButtonActive = true;
    })
  }

  doneWithAdd(post: any) {
    let result = [];
    let postIndex = JSON.parse('{"postIndex":"' + this.postIndex + '"}');
    result.push(postIndex);
    result.push(post);
    this.form.reset('comment');
    this.showSmallFieldInitial = true;
    this.postButtonActive = false;
    console.log('add-comment:doneWithAdd: sending back ', result);
    this.postCommentComplete.emit(result);
/*     if (post !== 'canceled') {
      let comment = '{"comment":"' + post.comments[post.comments.length-1].comment + '",' +
      '"displayName":"' + post.comments[post.comments.length-1].displayName + '",' +
      '"profileImageUrl":"' + post.comments[post.comments.length-1].profileImageUrl + '",' +
      '"createdAt":"' + post.comments[post.comments.length-1].createdAt + '"}';
      console.log('add-comment:doneWithAdd: new comment=', comment);
      let JSONComment = JSON.parse(comment);
      this.postCommentComplete.emit(post.comments[post.comments.length-1]);
    } else {
      this.postCommentComplete.emit(post);
    } */
  }


  onSubmit() {
    this.postButtonActive = false;
    this.showSpinner = true;
    let comment = this.form.controls.comment.value;
    console.log('add-comment:onSubmit: displayName before Add=', this.displayName)
    this.forumSvc.addComment(this.postID, this.displayName, this.profileImageUrl, comment)
    .subscribe(result => {
      console.log('add-comment:onSubmit postResult=', result)
      this.doneWithAdd(result);
      this.showSpinner = false;
    }, error => {
      console.log(error);
      this.showSpinner = false;
    });
  }
}

