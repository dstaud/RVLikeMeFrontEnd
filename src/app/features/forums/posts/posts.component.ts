import { Component, OnInit, OnDestroy, Input, ViewChild, HostListener} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { ViewportScroller } from '@angular/common';

import { Observable } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { TranslateService } from '@ngx-translate/core';

import { CommentsComponent } from './comments/comments.component';

import { ForumService, Icomments } from '@services/data-services/forum.service';
import { ProfileService, IuserProfile } from '@services/data-services/profile.service';
import { ShareDataService, ImessageShareData, ImyStory, Ipost } from '@services/share-data.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { DesktopMaxWidthService } from '@services/desktop-max-width.service';

import { UpdatePostDialogComponent } from '@dialogs/update-post-dialog/update-post-dialog.component';
import { SentryMonitorService } from '@services/sentry-monitor.service';

export type FadeState = 'visible' | 'hidden';

export interface Iposts {
  _id: string,
  createdBy: string,
  body: string,
  displayName: string,
  profileImageUrl: string,
  postPhotoUrl: string,
  commentCount: number,
  reactionCount: number,
  createdAt: Date,
  fragment?: string
}

@Component({
  selector: 'app-rvlm-posts',
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.scss'],
  animations: [
    trigger('addPostSlideInOut', [
      state('in', style({
        overflow: 'hidden',
        height: '*',
        width: '100%'
      })),
      state('out', style({
        opacity: '0',
        overflow: 'hidden',
        height: '0px',
        width: '0px'
      })),
      transition('in => out', animate('400ms ease-in-out')),
      transition('out => in', animate('400ms ease-in-out'))
    ]),
    trigger('commentSlideInOut', [
      state('in', style({
        overflow: 'hidden',
        height: '*',
        width: '100%'
      })),
      state('out', style({
        opacity: '0',
        overflow: 'hidden',
        height: '0px',
        width: '0px'
      })),
      transition('in => out', animate('400ms ease-in-out')),
      transition('out => in', animate('400ms ease-in-out'))
    ]),
  ]
})

export class PostsComponent implements OnInit {
  @Input('colorTheme') theme: string;

  // Provide access to methods on comments component and update post component
  @ViewChild(CommentsComponent)
  public commentsComponent: CommentsComponent;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setDialogDimensions();
  }

  groupID: string;
  userID: string;
  displayName: string;
  profileImageUrl = './../../../../assets/images/no-profile-pic.jpg';
  posts: Array<Iposts> = [];
  comments: Array<Array<Icomments>> = [];
  liked: Array<boolean> = [];
  userNewbie: boolean = false;
  forumType: string;

  addPostOpen: string = 'out';
  commentsOpen: Array<string> = [];

  showSpinner = false;
  showPosts = false;
  showFirstPost = false;
  showPostComments: Array<boolean> = [];
  showUpdatePost: Array<boolean> = [];
  startCommentsIndex: Array<number> = [];
  fragmentLink="lk3";

  private windowWidth: any;
  private dialogWidth: number;
  private dialogWidthDisplay: string;
  private profile: IuserProfile;
  private userProfile: Observable<IuserProfile>;
  private desktopMaxWidth: number;
  private fragmentNbr: number = 0;

  constructor(private forumSvc: ForumService,
              private profileSvc: ProfileService,
              private translate: TranslateService,
              private shareDataSvc: ShareDataService,
              private activateBackArrowSvc: ActivateBackArrowService,
              private desktopMaxWidthSvc: DesktopMaxWidthService,
              private router: Router,
              private sentry: SentryMonitorService,
              private viewportScroller: ViewportScroller,
              private dialog: MatDialog) { }

  ngOnInit() {
    this.listenForUserProfile();

    this.listenForDesktopMaxWidth();
  }

  ngOnDestroy() {}

  onScrollToTop() {
    this.viewportScroller.scrollToAnchor('top');
  }

  // Get all posts for group passed from forums component.
  getPosts(groupID: string, forumType: string, profileImageUrl: string, displayName: string): void {
    this.showSpinner = true;
    this.groupID = groupID;
    this.forumType = forumType;
    if (profileImageUrl) {
      this.profileImageUrl = profileImageUrl;
    }
    this.displayName = displayName;

    this.getPostsFromDatabase();
    console.log('PostsComponent:getPosts: back from getting posts from db');
  }


  // When user clicks to add a post, show the form
  onAddPost() {
    this.addPostOpen = this.addPostOpen === 'out' ? 'in' : 'out';
    this.showFirstPost = false;
  }


  // When user clicks comment, open up the comments for viewing
  onComment(row: number) {
    this.commentsOpen[row] = this.commentsOpen[row] === 'out' ? 'in' : 'out';
    this.showPostComments[row] = !this.showPostComments[row];
  }


  // When user clicks like, send update to server and turn off their ability to like again
  onLike(row: number): void {
    let reaction = 'like';

    this.forumSvc.addReaction(this.posts[row]._id, this.displayName, this.profileImageUrl, reaction)
    .subscribe(reactionResult => {
      this.posts[row].reactionCount++;
      this.liked[row] = true;
      this.showSpinner = false;
    }, error => {
      this.showSpinner = false;
      console.error('PostsComponent:onLike: throw error ', error);
      throw new Error(error);
    });
  }


  // When user clicks to show all comments, set the start index to zero
  onShowAllComments(row) {
    this.startCommentsIndex[row] = 0;
  }


  onUpdatePost(row: number) {
    let post: Ipost = {
      groupID: this.posts[row]._id,
      userDisplayName: this.posts[row].displayName,
      userProfileUrl: this.posts[row].profileImageUrl,
      body: this.posts[row].body,
      photoUrl: this.posts[row].postPhotoUrl,
      createdBy: this.posts[row].createdBy,
      createdAt: this.posts[row].createdAt
    }
    this.shareDataSvc.setData('post', post);

    if (this.windowWidth > 600) {
      this.openUpdatePostDialog((result: any) => {
        console.log('PostsComponent:onUpdatePost: back from dialog. result=', result);
        if (result !== 'canceled') {
          console.log('PostsComponent:onUpdatePost: result=', result);
          post = result;
          this.posts[row].body = post.body;
          this.posts[row].postPhotoUrl = post.photoUrl;
        }
      });
    } else {
      this.activateBackArrowSvc.setBackRoute('forums/main', 'forward');
      this.router.navigateByUrl('/forums/update-post');
    }

  }

  // When user clicks to see the story of another user, navigate to myStory page
  onYourStory(toUserID: string, toDisplayName: string, toProfileImageUrl: string) {
    let userParams:ImessageShareData = this.packageParamsForMessaging(toUserID, toDisplayName, toProfileImageUrl);
    let params:ImyStory = {
      userID: toUserID,
      userIdViewer: this.userID,
      params: userParams
    }

    // let params = '{"userID":"' + toUserID + '",' +
    //                   '"userIdViewer":"' + this.userID + '",' +
    //                   '"params":' + userParams + '}';

    this.activateBackArrowSvc.setBackRoute('forums/main', 'forward');
    this.shareDataSvc.setData('myStory', params);
    this.router.navigateByUrl('/profile/mystory');
  }


  // After submits their post, this is called from child component
  postAddComplete(newPost: any): void {
    if (newPost !== 'canceled') {
      let post = this.createPostsArrayEntry(newPost);
      this.posts.unshift(post);
      this.comments.unshift([]);
      this.showUpdatePost.unshift(false);
      this.showPostComments.unshift(false);
      this.startCommentsIndex.unshift(0);
      this.showPosts = true;
    }
    this.addPostOpen = this.addPostOpen === 'out' ? 'in' : 'out';
  }


  // After user posts a comment, update the appropriate arrays
  postCommentComplete(post: any) {
    let currentRow = post[0].postIndex;
    let newComment = this.createCommentsArrayEntry(post[1].comments[post[1].comments.length-1]);

    if (this.posts[currentRow].commentCount == 0) {
        this.comments[currentRow] = [];
    }

    this.comments[currentRow].push(newComment);
    this.posts[currentRow].commentCount++;
    if (this.comments[currentRow].length > 4) {
      this.startCommentsIndex[currentRow]++
    }
  }


  // After submits their post, this is called from child component
  postUpdateComplete(postResult: any): void {
    let postIndex = postResult[0].postIndex;
    let post = postResult[1];

    if (post !== 'canceled') {
      this.posts[postIndex].body = post.body;
    }
    this.showUpdatePost[postIndex] = false;
  }


  // Check if user already liked the post
  private checkIfLiked(reactions: any): boolean {
    let reactionMatch = false;

    for (let i=0; i < reactions.length; i++) {
      if (reactions[i].createdBy === this.userID) {
        reactionMatch = true;
        break;
      }
    }
    return reactionMatch;
  }


  private createCommentsArrayEntry(comment): Icomments {
    let newComment: Icomments = {
      comment: comment.comment,
      displayName: comment.displayName,
      profileImageUrl: comment.profileImageUrl,
      createdAt: comment.createdAt,
      createdBy: comment.createdBy
    }

    return newComment;
  }


  private createPostsArrayEntry(post): Iposts {
    let bodyEscaped = this.escapeJsonReservedCharacters(post.body);
    let photoUrl: string = '';
    let fragmentLink: string;


    if (post.photoUrl !== 'undefined') {
      photoUrl = post.photoUrl;
    }

    fragmentLink = 'lk' + this.fragmentNbr;
    this.fragmentNbr++;

    let newPost: Iposts = {
      _id: post._id,
      createdBy: post.createdBy,
      body: bodyEscaped,
      displayName: post.userDisplayName,
      profileImageUrl: post.userProfileUrl,
      postPhotoUrl: photoUrl,
      commentCount: post.comments.length,
      reactionCount: post.reactions.length,
      createdAt: post.createdAt,
      fragment: fragmentLink
    }

    return newPost;
  }


  private escapeJsonReservedCharacters(string: string): string {
    let newString = string;
    newString = newString.replace(/"/g, "'").trim();
    newString = newString.replace(/\\/g, "|");
    newString = newString.replace(/\n/g, "\\n");
    return newString;
  }


  // Get all posts for the group
  private getPostsFromDatabase() {
    let post: Iposts;
    let comment: Icomments;
    let postComments: Array<Icomments> = [];

    this.posts = [];

    this.forumSvc.getPosts(this.groupID)
    .pipe(untilComponentDestroyed(this))
    .subscribe(postResult => {
      if (postResult.length === 0) {
        this.showPosts = false;
        this.showFirstPost = true;
        this.showSpinner = false;
      } else {
        this.comments= [];
        for (let j=0; j < postResult[0].comments.length; j++) {
          comment = this.createCommentsArrayEntry(postResult[0].comments[j]);
          postComments.push(comment);
          this.liked.push(this.checkIfLiked(postResult[0].reactions));
        }
        post = this.createPostsArrayEntry(postResult[0]);
        this.posts.push(post);
        this.commentsOpen.push('out');
        this.comments.push(postComments);
        this.showPostComments.push(false);
        if (postComments.length > 4) {
          this.startCommentsIndex.push(postComments.length - 4);
        } else {
          this.startCommentsIndex.push(0);
        }
        for (let i=1; i < postResult.length; i++) {
          postComments = [];
          for (let j=0; j < postResult[i].comments.length; j++) {
            comment = this.createCommentsArrayEntry(postResult[i].comments[j]);
            postComments.push(comment);
            this.commentsOpen.push('out');
          }
          post = this.createPostsArrayEntry(postResult[i]);
          this.posts.push(post);
          this.showUpdatePost.push(false);
          this.showPostComments.push(false);

          if (postComments.length > 4) {
            this.startCommentsIndex.push(postComments.length - 4);
          } else {
            this.startCommentsIndex.push(0);
          }
          this.liked.push(this.checkIfLiked(postResult[i].reactions));
          this.comments.push(postComments);
        }

        this.showPosts = true;
        this.showFirstPost = false;
        this.showSpinner = false;
      }
    }, error => {
      this.showSpinner = false;
      console.error('PostsComponent:getPosts: throw error ', error);
      throw new Error(error);
    });
  }


  private listenForDesktopMaxWidth() {
    this.desktopMaxWidthSvc.desktopMaxWidth
    .pipe(untilComponentDestroyed(this))
    .subscribe(maxWidth => {
      this.desktopMaxWidth = maxWidth;
      this.setDialogDimensions();
    }, (error) => {
      this.sentry.logError({"message":"unable to listen for desktop max width","error":error});
      this.desktopMaxWidth = 1140;
      this.setDialogDimensions();
    });
  }


  // Get user profile
  // Get user's ID and store for use in determining what posts or comments can edit
  private listenForUserProfile() {
    this.userProfile = this.profileSvc.profile;
    this.userProfile
    .pipe(untilComponentDestroyed(this))
    .subscribe(profile => {
      this.profile = profile;
      this.userID = profile.userID;

      if (this.profile.aboutMe === 'newbie' || this.profile.aboutMe === 'dreamer') {
        this.userNewbie = true;
      }
    }, (error) => {
      console.error('PostsComponent:listenForUserProfile: error getting profile ', error);
      throw new Error(error);
    });
  }

  private openUpdatePostDialog(cb: CallableFunction): void {
    const dialogRef = this.dialog.open(UpdatePostDialogComponent, {
      width: '400px',
      height: '550px',
      disableClose: true
    });

    dialogRef.afterClosed()
    .pipe(untilComponentDestroyed(this))
    .subscribe(result => {
        cb(result);
    });
  }

  private packageParamsForMessaging(toUserID: string, toDisplayName: string, toProfileImageUrl: string): ImessageShareData {
    // let params: string;
    // params = '{"fromUserID":"' + this.userID + '",' +
    //           '"fromDisplayName":"' + this.displayName + '",' +
    //           '"fromProfileImageUrl":"' + this.profileImageUrl + '",' +
    //           '"toUserID":"' + toUserID + '",' +
    //           '"toDisplayName":"' + toDisplayName + '",' +
    //           '"toProfileImageUrl":"' + toProfileImageUrl + '"}';

    let params: ImessageShareData = {
      fromUserID: this.userID,
      fromDisplayName: this.displayName,
      fromProfileImageUrl: this.profileImageUrl,
      toUserID: toUserID,
      toDisplayName: toDisplayName,
      toProfileImageUrl: toProfileImageUrl
    }

    return params;
  }


  // Get window size to determine how to present dialog windows
  private setDialogDimensions() {
    this.windowWidth = window.innerWidth;
    if (this.windowWidth > 600) {
      if (this.windowWidth > this.desktopMaxWidth) {
        this.dialogWidth = this.desktopMaxWidth * .95;
      } else {
        this.dialogWidth = this.windowWidth * .95;
      }
      this.dialogWidthDisplay = this.dialogWidth.toString() + 'px';
    }
  }
}
