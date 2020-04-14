import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { Observable } from 'rxjs';

import { ThemeService } from '@services/theme.service';
import { ShareDataService } from '@services/share-data.service';

import { ActivateBackArrowService } from '@core/services/activate-back-arrow.service';

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
  @Input('displayName') displayName: string;
  @Input('userID') userID: string;
  @Input('profileImageUrl') profileImageUrl: string;

  @Output() showAllComments = new EventEmitter();

  constructor(private themeSvc: ThemeService,
              private shareDataSvc: ShareDataService,
              private activateBackArrowSvc: ActivateBackArrowService,
              private router: Router) {}

  ngOnInit(): void {
    // Listen for changes in color theme;
    this.themeSvc.defaultGlobalColorTheme
    .pipe(untilComponentDestroyed(this))
    .subscribe(themeData => {
      this.theme = themeData.valueOf();
    });

    console.log('CommentsComponent:ngOnInit: ', this.displayName, this.userID, this.profileImageUrl);
    console.log('commentsComponent.ngOnInit: comments=', this.comments);
  }

  ngOnDestroy() {}

  onYourStory(toUserID: string, toDisplayName: string, toProfileImageUrl: string) {
    let userParams = this.packageParamsForMessaging(toUserID, toDisplayName, toProfileImageUrl);
    let params = '{"userID":"' + toUserID + '",' +
                      '"userIdViewer":"' + this.userID + '",' +
                      '"params":' + userParams + '}';
    console.log('CommentsComponent:onYourStory: params=', params);
    this.activateBackArrowSvc.setBackRoute('forums-list');
    this.shareDataSvc.setData(params);
    this.router.navigateByUrl('/mystory');
  }


  // If user wants to see all comments, pass this up the chain
  onShowAll() {
    this.showAllComments.emit();
  }


  private packageParamsForMessaging(toUserID: string, toDisplayName: string, toProfileImageUrl: string): string {
    let params: string;
    console.log('PostsComponent:navigateToMessages: displayName=', this.displayName);
    params = '{"fromUserID":"' + this.userID + '",' +
              '"fromDisplayName":"' + this.displayName + '",' +
              '"fromProfileImageUrl":"' + this.profileImageUrl + '",' +
              '"toUserID":"' + toUserID + '",' +
              '"toDisplayName":"' + toDisplayName + '",' +
              '"toProfileImageUrl":"' + toProfileImageUrl + '"}';

    console.log('PostsComponent:navigateToMessages: params=', params);
    return params;
  }
}
