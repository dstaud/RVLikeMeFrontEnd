import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { ThemeService } from '@services/theme.service';
import { ShareDataService, ImessageShareData, ImyStory } from '@services/share-data.service';

import { ActivateBackArrowService } from '@core/services/activate-back-arrow.service';
import { SentryMonitorService } from '@services/sentry-monitor.service';
import { Icomments } from '@services/data-services/forum.service';

@Component({
  selector: 'app-rvlm-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss']
})
export class CommentsComponent implements OnInit {

  @Input('postIndex') postIndex: number;
  @Input('comments') comments: Array<Icomments> = [];
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
              private sentry: SentryMonitorService,
              private router: Router) {}

  ngOnInit(): void {
    this.listenForColorTheme();
  }

  ngOnDestroy() {}


  // If user wants to see all comments, pass this up the chain
  onShowAll() {
    this.showAllComments.emit();
  }


  // If user clicks to see story of another user, go to MyStory component
  onYourStory(toUserID: string, toDisplayName: string, toProfileImageUrl: string) {
    let userParams:ImessageShareData = this.packageParamsForMessaging(toUserID, toDisplayName, toProfileImageUrl);
    let params:ImyStory = {
      userID: toUserID,
      userIdViewer: this.userID,
      params: userParams
    }

    // this.activateBackArrowSvc.setBackRoute('forums/forums-list', 'forward');
    this.shareDataSvc.setData('myStory', params);
    this.router.navigateByUrl('/profile/mystory');
  }


  // Listen for changes in color theme;
  private listenForColorTheme() {
    this.themeSvc.defaultGlobalColorTheme
    .pipe(untilComponentDestroyed(this))
    .subscribe(themeData => {
      this.theme = themeData.valueOf();
    }, error => {
      this.sentry.logError({"message":"unable to listen for color theme","error":error});
    });
  }


  private packageParamsForMessaging(toUserID: string, toDisplayName: string, toProfileImageUrl: string): ImessageShareData {
    let params:ImessageShareData = {
      fromUserID: this.userID,
      fromDisplayName: this.displayName,
      fromProfileImageUrl: this.profileImageUrl,
      toUserID: toUserID,
      toDisplayName: toDisplayName,
      toProfileImageUrl: toProfileImageUrl
    }

    // let params: string;
    // params = '{"fromUserID":"' + this.userID + '",' +
    //           '"fromDisplayName":"' + this.displayName + '",' +
    //           '"fromProfileImageUrl":"' + this.profileImageUrl + '",' +
    //           '"toUserID":"' + toUserID + '",' +
    //           '"toDisplayName":"' + toDisplayName + '",' +
    //           '"toProfileImageUrl":"' + toProfileImageUrl + '"}';

    return params;
  }


}
