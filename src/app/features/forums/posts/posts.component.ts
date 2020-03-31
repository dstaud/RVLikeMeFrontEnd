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
  showComments: Array<boolean> = [];
  groupID: string;
  posts: Array<any> = [];
  comments: Array<Array<JSON>> = [];

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
    console.log('INITIAL ARRAY=', this.comments);
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
    let comment: string;
    let postComments: Array<JSON> = [];

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
        this.comments= [];
        console.log('COMMENTS BEFORE = ', this.comments);
        for (let j=0; j < postResult[0].comments.length; j++) {
          comment = '{"comment":"' + postResult[0].comments[j].comment + '",' +
          '"displayName":"' + postResult[0].comments[j].displayName + '",' +
          '"profileImageUrl":"' + postResult[0].comments[j].profileImageUrl + '",' +
          '"createdAt":"' + postResult[0].comments[j].createdAt + '"}';
          console.log('HAVE A COMMENT! ', comment);
          postComments.push(JSON.parse(comment));
          this.showComments.push(false);
        }
        post = '{"_id":"' + postResult[0]._id + '",' +
                '"title":"' + titleEscaped + '",' +
                '"body":"' + bodyEscaped + '",' +
                '"displayName":"' + postResult[0].userDisplayName + '",' +
                '"profileImageUrl":"' + postResult[0].userProfileUrl + '",' +
                '"commentCount":"' + postResult[0].comments.length + '",' +
                '"comments":"0",' +
                '"reactionCount":"' + postResult[0].reactions.length + '",' +
                '"createdAt":"' + postResult[0].createdAt + '"}';
        console.log('POST=', post)
        postJSON = JSON.parse(post);
        this.posts.push(postJSON);
        console.log('PUSH TO COMMENTS ', postComments);
        this.comments.push(postComments);
        console.log('COMMENTS = ', this.comments);
        for (let i=1; i < postResult.length; i++) {
          let titleEscaped = this.escapeJsonReservedCharacters(postResult[i].title);
          let bodyEscaped = this.escapeJsonReservedCharacters(postResult[i].body);
          let comment;
          postComments = [];
          for (let j=0; j < postResult[i].comments.length; j++) {
            comment = '{"comment":"' + postResult[i].comments[j].comment + '",' +
                      '"displayName":"' + postResult[i].comments[j].displayName + '",' +
                      '"profileImageUrl":"' + postResult[i].comments[j].profileImageUrl + '",' +
                      '"createdAt":"' + postResult[i].comments[j].createdAt + '"}';
            console.log('HAVE A COMMENT! ', comment);
            postComments.push(JSON.parse(comment));
            this.showComments.push(false);
          }
          post = '{"_id":"' + postResult[i]._id + '",' +
                  '"title":"' + titleEscaped + '",' +
                  '"body":"' + bodyEscaped + '",' +
                  '"displayName":"' + postResult[i].userDisplayName + '",' +
                  '"profileImageUrl":"' + postResult[i].userProfileUrl + '",' +
                  '"commentCount":"' + postResult[i].comments.length + '",' +
                  '"comments":"' + i + '",' +
                  '"reactionCount":"' + postResult[i].reactions.length + '",' +
                  '"createdAt":"' + postResult[i].createdAt + '"}';
          postJSON = JSON.parse(post);
          this.posts.push(postJSON);
          console.log('PUSH TO COMMENTS ', postComments);
          this.comments.push(postComments);
          console.log('COMMENTS = ', this.comments);
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

  OpenAddCommentDialog(postID: string, title: string, post: number): void {
    let other = '';
    let selection = null;
    let dialogRef: any;

    dialogRef = this.dialog.open(CommentDialogComponent, {
      width: '250px',
      disableClose: true,
      data: {
        postID: postID,
        title: title,
        displayName: this.displayName,
        profileImageUrl: this.profileImageUrl
      }
    });

    dialogRef.afterClosed()
    .pipe(untilComponentDestroyed(this))
    .subscribe(commentResult => {
      console.log('back from dialog', commentResult);
      if (commentResult !== 'canceled') {
          console.log('PUSHING NEW COMMENT=', commentResult);
          this.comments[post].push(commentResult);
          this.showComments.push(false);
          console.log('UPDATED COMMENTS ARRAY=', this.comments);
      }
    });
  }

  postAddComplete(newPost: any): void {
    console.log('back in posts', newPost);
    this.posts.unshift(newPost);
    // this.getPosts(this.groupID, this.profileImageUrl, this.displayName);
    this.showAddPost = false;
  }

  onLike(row: number): void {
    console.log('row=', row);
    let reaction = 'like';
    this.forumSvc.addReaction(this.posts[row]._id, this.displayName, this.profileImageUrl, reaction)
    .subscribe(reactionResult => {
      console.log('REACTION RESULT=', reactionResult);
      this.showSpinner = false;
    }, error => {
      console.log(error);
      this.showSpinner = false;
    });
  }

  onAddComment(row: number) {
    console.log('row=', this.posts[row]);
    this.OpenAddCommentDialog(this.posts[row]._id, this.posts[row].title, row);
  }

  onComment(row: number) {
    console.log('row=', this.posts[row]);
    this.showComments[row] = !this.showComments[row];
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
