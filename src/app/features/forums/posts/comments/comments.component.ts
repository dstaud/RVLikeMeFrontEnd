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
  public comments: [];

  startCommentsIndex: number = 0;

  constructor() {}

  ngOnInit(): void {
    console.log('in comments', this.commentsIndex, this.comments);
    if (this.comments.length > 4) {
      this.startCommentsIndex = this.comments.length - 4;
    }
  }
}
