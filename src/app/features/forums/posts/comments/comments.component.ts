import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-rvlm-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss']
})
export class CommentsComponent implements OnInit {

  @Input('postIndex')
  public postIndex: number;

  @Input('comments')
  public comments: [[]];

  @Input('startCommentsIndex')
  public startCommentsIndex: number;

  @Input('commentsLength')
  public commentsLength: number;

  @Output() showAllComments = new EventEmitter();

  constructor() {}

  ngOnInit(): void {
    console.log('CommentsComponent:ngOnInit: comments index=', this.postIndex, ' comments=', this.comments);
  }

  onShowAll() {
    this.showAllComments.emit();
  }
}
