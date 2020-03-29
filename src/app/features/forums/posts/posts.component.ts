import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, Input, Output} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
// import {FixedSizeVirtualScrollStrategy, VIRTUAL_SCROLL_STRATEGY} from '@angular/cdk/scrolling';
// import { trigger, state, style, animate, transition } from '@angular/animations';

import { Observable } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { TranslateService } from '@ngx-translate/core';

import { ForumService } from '@services/data-services/forum.service';

import { CommentDialogComponent } from '@dialogs/comment-dialog/comment-dialog.component';

export type FadeState = 'visible' | 'hidden';

/* export class CustomVirtualScrollStrategy extends FixedSizeVirtualScrollStrategy {
  constructor() {
    super(50, 250, 500);
  }
} */
@Component({
  selector: 'app-rvlm-posts',
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.scss']
  // changeDetection: ChangeDetectionStrategy.OnPush,
  // providers: [{provide: VIRTUAL_SCROLL_STRATEGY, useClass: CustomVirtualScrollStrategy}]
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

  @Input('titlesOnly')
  public titlesOnly: boolean;

  showSpinner = false;
  postsResult: string;
  profileImageUrl = './../../../../assets/images/no-profile-pic.jpg';
  displayName: string
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

  constructor(private forumSvc: ForumService,
              private dialog: MatDialog,) { }

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
    console.log('GETTING POSTS=', this.groupID);
    this.forumSvc.getPosts(this.groupID)
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
        let comments= [];
        let comment;
        for (let i=0; i < postResult[0].comments.length; i++) {
          comment = '{"comment":"' +postResult[0].comments[0].comment + '"}';
          comments.push(comment);
        }
        console.log('COMMENTS=', comments);
        post = '{"_id":"' + postResult[0]._id + '",' +
                '"title":"' + titleEscaped + '",' +
                '"body":"' + bodyEscaped + '",' +
                '"displayName":"' + postResult[0].userDisplayName + '",' +
                '"profileImageUrl":"' + postResult[0].userProfileUrl + '",' +
                '"commentCount":"' + postResult[0].comments.length + '",' +
                '"comments":[' + comments + '],' +
                '"createdAt":"' + postResult[0].createdAt + '"}';
        console.log('POST=', post)
        postJSON = JSON.parse(post);
        this.posts.push(postJSON);
        for (let i=1; i < postResult.length; i++) {
          let titleEscaped = this.escapeJsonReservedCharacters(postResult[i].title);
          let bodyEscaped = this.escapeJsonReservedCharacters(postResult[i].body);
          let comments= [];
          let comment;
          for (let j=0; j < postResult[i].comments.length; j++) {
            comment = '{"comment":"' +postResult[i].comments[j].comment + '"}';
            comments.push(comment);
          }
          post = '{"_id":"' + postResult[i]._id + '",' +
                  '"title":"' + titleEscaped + '",' +
                  '"body":"' + bodyEscaped + '",' +
                  '"displayName":"' + postResult[i].userDisplayName + '",' +
                  '"profileImageUrl":"' + postResult[i].userProfileUrl + '",' +
                  '"commentCount":"' + postResult[i].comments.length + '",' +
                  '"comments":[' + comments + '],' +
                  '"createdAt":"' + postResult[i].createdAt + '"}';
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

  openDialog(postID: string, title: string): void {
    let other = '';
    let selection = null;
    const dialogRef = this.dialog.open(CommentDialogComponent, {
      width: '250px',
      disableClose: true,
      data: {postID: postID, title: title }
    });

    dialogRef.afterClosed()
    .pipe(untilComponentDestroyed(this))
    .subscribe(result => {
      console.log('back from dialog');
/*       if (result) {
        if (this.aboutMeOther !== result && result !== 'canceled') {
          this.aboutMeOther = result;
          this.profile.aboutMe = '@' + result;
          this.updateAboutMe(event);
        }
      } else {
        if (this.aboutMeOther) {
          this.profile.aboutMe = null;
          this.updateAboutMe('');
          this.aboutMeOther = '';
          this.form.patchValue({
            aboutMe: null
          });
        } else {
          if (this.profile.aboutMe) {
            selection = this.profile.aboutMe;
          }
          this.form.patchValue({
            aboutMe: selection
          });
        }
      } */
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

  onLike(row: number): void {
    console.log('row=', row);
  }

  onComment(row: number) {
    console.log('row=', this.posts[row]);
    this.openDialog(this.posts[row]._id, this.posts[row].title);
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
