import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';

import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { Observable } from 'rxjs';

import { ThemeService } from '@services/theme.service';

@Component({
  selector: 'app-rvlm-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss']
})
export class CommentsComponent implements OnInit {

  @Input('postIndex') postIndex: number;

  @Input('comments') comments: [[]];

  @Input('startCommentsIndex') startCommentsIndex: number;

  @Input('commentsLength') commentsLength: number;

  @Input('colorTheme') theme: string;

  @Output() showAllComments = new EventEmitter();

  constructor(private themeSvc: ThemeService) {}

  ngOnInit(): void {
    // Listen for changes in color theme;
    this.themeSvc.defaultGlobalColorTheme
    .pipe(untilComponentDestroyed(this))
    .subscribe(themeData => {
      this.theme = themeData.valueOf();
    });
  }

  ngOnDestroy() {}

  // If user wants to see all comments, pass this up the chain
  onShowAll() {
    this.showAllComments.emit();
  }
}
