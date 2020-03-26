import { Component, ChangeDetectionStrategy, OnInit, OnDestroy} from '@angular/core';
import {FixedSizeVirtualScrollStrategy, VIRTUAL_SCROLL_STRATEGY} from '@angular/cdk/scrolling';
// import { trigger, state, style, animate, transition } from '@angular/animations';

import { Observable } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { TranslateService } from '@ngx-translate/core';

import { ForumService } from '@services/data-services/forum.service';

export type FadeState = 'visible' | 'hidden';

export class CustomVirtualScrollStrategy extends FixedSizeVirtualScrollStrategy {
  constructor() {
    super(50, 250, 500);
  }
}
@Component({
  selector: 'app-rvlm-posts',
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{provide: VIRTUAL_SCROLL_STRATEGY, useClass: CustomVirtualScrollStrategy}]
/*   animations: [
    trigger('state', [
      state(
        'visible',
        style({
          opacity: '1'
        })
      ),
      state(
        'hidden',
        style({
          opacity: '0'
        })
      ),
      transition('* => visible', [animate('500ms ease-out')]),
      transition('visible => hidden', [animate('500ms ease-out')])
    ])
  ] */
})

export class PostsComponent implements OnInit {
  showSpinner = false;
  postsResult: string;
  profileImageUrl = './../../../../assets/images/no-profile-pic.jpg';
  displayName: string;
  showAddPost = false;
  showPosts = false;
  showFirstPost = false;
  groupID: string;
  posts = [];
/*   state: FadeState;
  set showAddPost(value: boolean) {
    if (value) {
      this._show = value;
      this.state = 'visible';
    } else {
      this.state = 'hidden';
    }
  } */

  private _show: boolean;

  constructor(private forumSvc: ForumService) { }

  ngOnInit() {
  }

  ngOnDestroy() {}

/*   animationDone(event: AnimationEvent) {
    console.log('EVENT=', event)
    if (event.fromState === 'visible' && event.toState === 'hidden') {
      this._show = false;
    }
  } */

  addPost(): void {
    this.showAddPost = true;
  }

  getPosts(groupID: string, profileImageUrl: string, displayName: string): void {
    let post: string;
    let postJSON: JSON;

    this.showSpinner = true;
    this.groupID = groupID;
    if (profileImageUrl) {
      this.profileImageUrl = profileImageUrl;
    }
    this.displayName = displayName;
    this.posts = [];
    this.forumSvc.getPosts(groupID)
    .pipe(untilComponentDestroyed(this))
    .subscribe(postResult => {
      console.log('RESULT=', postResult);
      if (postResult.length === 0) {
        this.showPosts = false;
        this.showFirstPost = true;
        this.postsResult = 'Be the first to add a post for this group!';
        this.showSpinner = false;
      } else {
        let titleEscaped = this.escapeJsonReservedCharacters(postResult[0].title);
        let bodyEscaped = this.escapeJsonReservedCharacters(postResult[0].body);
        post = '{"title":"' + titleEscaped +
                '","body":"' + bodyEscaped +
                '","displayName":"' + postResult[0].userDisplayName +
                '","profileImageUrl":"' + postResult[0].userProfileUrl +
                '","createdAt":"' + postResult[0].createdAt +
                '"}';
        postJSON = JSON.parse(post);
        this.posts.push(postJSON);
        for (let i=1; i < postResult.length; i++) {
          let titleEscaped = this.escapeJsonReservedCharacters(postResult[i].title);
          let bodyEscaped = this.escapeJsonReservedCharacters(postResult[i].body);
          post = '{"title":"' + titleEscaped +
                    '","body":"' + bodyEscaped +
                    '","displayName":"' + postResult[i].userDisplayName +
                    '","profileImageUrl":"' + postResult[i].userProfileUrl +
                    '","createdAt":"' + postResult[i].createdAt +
                    '"}';
          postJSON = JSON.parse(post);
          this.posts.push(postJSON);
        }
        console.log('POSTS=', this.posts);
        this.showPosts = true;
        this.showFirstPost = false;
        this.showSpinner = false;
      }
    }, error => {
      console.log(error);
      this.showSpinner = false;
    });
  }

  postAddComplete(event: string): void {
    console.log('back in posts', event);
    if (event ==='saved') {
      console.log('getting posts');
      this.getPosts(this.groupID, this.profileImageUrl, this.displayName);
    }
    this.showAddPost = false;
  }

  private escapeJsonReservedCharacters(string: string): string {
    let newString = string;
    newString = newString.replace(/"/g, "'").trim();
    newString = newString.replace(/\\/g, "|");
    newString = newString.replace(/\n/g, "\\n");
    console.log(string, newString);
    return newString;
  }
}
