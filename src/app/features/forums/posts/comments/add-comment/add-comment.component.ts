import { Component, OnInit, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';

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
    console.log('in comments', this.postID, this.title, this.displayName, this.profileImageUrl)
    this.windowWidth = window.innerWidth;
    this.windowHeight = window.innerHeight;

    let winH = this.windowHeight * .8;
    let fieldH = winH * .8;
    this.containerHeight = Math.round((this.windowHeight *.8) * .8) - 80;
    this.fieldHeight = this.containerHeight.toString() + 'px';
  }

  doneWithAdd(post: any) {
    let comment = '{"comment":"' + post.comments[post.comments.length-1].comment + '",' +
              '"displayName":"' + post.comments[post.comments.length-1].displayName + '",' +
              '"profileImageUrl":"' + post.comments[post.comments.length-1].profileImageUrl + '",' +
              '"createdAt":"' + post.comments[post.comments.length-1].createdAt + '"}';
    console.log('NEW COMMENT=', comment);
    let JSONComment = JSON.parse(comment);
    this.postCommentComplete.emit(JSONComment);
  }


  onSubmit() {
    this.showSpinner = true;
    let comment = this.form.controls.comment.value;
    this.forumSvc.addComment(this.postID, this.displayName, this.profileImageUrl, comment)
    .subscribe(postResult => {
      this.doneWithAdd(postResult);
      this.showSpinner = false;
    }, error => {
      console.log(error);
      this.showSpinner = false;
    });
  }
}

