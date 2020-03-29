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

  constructor() {}

  ngOnInit(): void {
    console.log('in comments', this.commentsIndex, this.comments)
  }
}
