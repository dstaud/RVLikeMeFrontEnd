import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-rvlm-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss']
})
export class CommentsComponent implements OnInit {

  @Input('postCommentsIndex')
  public commentsIndex: number;

  @Input('comments')
  public comments: Array<Array<JSON>>;

  startCommentsIndex: number = 0;
  commentsLength: number = 0;

  constructor() {}

  ngOnInit(): void {
    console.log('CommentsComponent:ngOnInit: comments index=', this.commentsIndex, ' comments=', this.comments);
    this.setStartCommentsIndex();
  }

  setStartCommentsIndex() {
    console.log('CommentsComponent:setStartCommentsIndex: comments now ', this.comments);
    console.log('CommentsComponent:setStartCommentsIndex: commentsIndex now ', this.commentsIndex);
    if (!this.comments) {
      this.commentsLength = 0;
    } else {
      this.commentsLength = this.comments.length;
      if (this.comments.length > 4) {
        this.startCommentsIndex = this.comments.length - 4;
      }
    }
  }
}
