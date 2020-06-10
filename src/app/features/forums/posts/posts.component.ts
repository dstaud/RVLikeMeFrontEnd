import { Component, OnInit, OnDestroy, Input, ViewChild, HostListener} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { ViewportScroller } from '@angular/common';

import { Observable } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { TranslateService } from '@ngx-translate/core';

import { CommentsComponent } from './comments/comments.component';
import { AddPostComponent } from './add-post/add-post.component';
import { AddCommentComponent } from './comments/add-comment/add-comment.component';

import { ForumService, Icomments, Iposts } from '@services/data-services/forum.service';
import { ProfileService, IuserProfile } from '@services/data-services/profile.service';
import { ShareDataService, ImessageShareData, ImyStory, Ipost } from '@services/share-data.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { DesktopMaxWidthService } from '@services/desktop-max-width.service';

import { UpdatePostDialogComponent } from '@dialogs/update-post-dialog/update-post-dialog.component';
import { SentryMonitorService } from '@services/sentry-monitor.service';
import { LinkPreviewService, IlinkPreview } from '@services/link-preview.service';
import { DeviceService } from '@services/device.service';

import { SharedComponent } from '@shared/shared.component';

export type FadeState = 'visible' | 'hidden';

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

  //  Provide access to methods on the Add Post component
  @ViewChild(AddPostComponent)
  public addPost: AddPostComponent;

  //  Provide access to methods on the Add Post component
  @ViewChild(AddCommentComponent)
  public addComment: AddCommentComponent;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setDialogDimensions();
  }

  groupID: string;
  userID: string;
  displayName: string;
  yearOfBirth: number;
  rigLength: number;
  profileImageUrl = './../../../../assets/images/no-profile-pic.jpg';
  posts: Array<Iposts> = [];
  comments: Array<Array<Icomments>> = [];
  liked: Array<boolean> = [];
  userNewbie: boolean = false;
  forumType: string;
  desktopUser: boolean = false;

  addPostOpen: string = 'out';
  commentsOpen: Array<string> = [];

  showSpinner: boolean = false;
  showPosts: boolean = false;
  showFirstPost: boolean = false;
  showPostComments: Array<boolean> = [];
  showUpdatePost: Array<boolean> = [];
  showPreview: boolean = false;
  startCommentsIndex: Array<number> = [];
  fragmentLink="lk3";
  preview: IlinkPreview = {
    title: '',
    description: '',
    url: '',
    image: ''
  }

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
              private linkPreviewSvc: LinkPreviewService,
              private sentry: SentryMonitorService,
              private shared: SharedComponent,
              private viewportScroller: ViewportScroller,
              private device: DeviceService,
              private dialog: MatDialog) { }

  ngOnInit() {
    if (window.innerWidth > 600) {
      this.desktopUser = true;
    }

    this.listenForUserProfile();

    this.listenForDesktopMaxWidth();
  }

  ngOnDestroy() {}

  getClass() {
    let containerClass: string;
    let bottomSpacing: string;
    let theme: string;

    if (this.device.iPhoneModelXPlus) {
      bottomSpacing = 'bottom-bar-spacing-xplus';
    } else {
      bottomSpacing = 'bottom-bar-spacing';
    }

    containerClass = 'container ' + bottomSpacing;

    return containerClass;
  }


  onScrollToTop() {
    this.viewportScroller.scrollToAnchor('top');
  }

  // Get all posts for group passed from forums component.
  getPosts(groupID: string, forumType: string, profileImageUrl: string, displayName: string, yearOfBirth: number, rigLength: number): void {
    this.showSpinner = true;
    this.groupID = groupID;
    this.forumType = forumType;
    if (profileImageUrl) {
      this.profileImageUrl = profileImageUrl;
    }
    this.displayName = displayName;

    this.getPostsFromDatabase(yearOfBirth, rigLength);
  }


  // When user clicks to add a post, show the form
  onAddPost() {
    this.addPostOpen = this.addPostOpen === 'out' ? 'in' : 'out';
    if (this.desktopUser) {
      this.addPost.focusOnPostInput();
    }
    this.showFirstPost = false;
  }


  // When user clicks comment, open up the comments for viewing
  onComment(row: number) {
    this.commentsOpen[row] = this.commentsOpen[row] === 'out' ? 'in' : 'out';
    this.addComment.focusOnCommentInput();
    this.showPostComments[row] = !this.showPostComments[row];
  }


  onDeletePost(row: number) {
    let index: number;

    this.forumSvc.deletePost(this.posts[row]._id)
    .pipe(untilComponentDestroyed(this))
    .subscribe(forumResult => {
      this.posts.splice(row, 1);

    }, error => {
      this.shared.notifyUserMajorError();
      throw new Error(error);
    });
  }


  // When user clicks like, send update to server and turn off their ability to like again
  onLike(row: number): void {
    let reaction = 'like';

    this.forumSvc.addReaction(this.posts[row]._id, this.displayName, this.profileImageUrl, reaction)
    .pipe(untilComponentDestroyed(this))
    .subscribe(reactionResult => {
      this.posts[row].reactionCount++;
      this.liked[row] = true;
      this.showSpinner = false;
    }, error => {
      this.showSpinner = false;
      this.shared.notifyUserMajorError();
      throw new Error(error);
    });
  }


  onLink(row: number) {
    window.open(this.posts[row].link, '_blank');
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
      link: this.posts[row].link,
      linkDesc: this.posts[row].linkDesc,
      linkTitle: this.posts[row].linkTitle,
      linkImage: this.posts[row].linkImage,
      photoUrl: this.posts[row].postPhotoUrl,
      createdBy: this.posts[row].createdBy,
      createdAt: this.posts[row].createdAt
    }
    this.shareDataSvc.setData('post', post);

    if (this.windowWidth > 600) {
      this.openUpdatePostDialog((result: any) => {
        if (result !== 'canceled') {
          post = result;
          this.posts[row].body = post.body;
          this.posts[row].postPhotoUrl = post.photoUrl;
          this.posts[row].link = post.link;
          this.posts[row].linkDesc = post.linkDesc;
          this.posts[row].linkTitle = post.linkTitle;
          this.posts[row].linkImage = post.linkImage;
        }
      });
    } else {
      if (this.desktopUser) {
        this.activateBackArrowSvc.setBackRoute('forums/main', 'forward');
      } else {
        this.activateBackArrowSvc.setBackRoute('forums/posts-main', 'forward');
      }

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

    if (this.desktopUser) {
      this.activateBackArrowSvc.setBackRoute('forums/main', 'forward');
    } else {
      this.activateBackArrowSvc.setBackRoute('forums/posts-main', 'forward');
    }

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
    // let bodyEscaped = this.escapeJsonReservedCharacters(post.body);
    let photoUrl: string = '';
    let fragmentLink: string;
    let link: string = '';
    let linkDesc: string = '';
    let linkTitle: string = '';
    let linkImage: string = '';

    if (post.photoUrl !== 'undefined' && post.photoUrl !== undefined) {
      photoUrl = post.photoUrl;
    }

    link = post.link;
    if (post.link !== 'undefined' && post.link !== undefined && post.link !== null && post.link !== 'null' && post.link !== '') {
      if (post.link.substring(0,7) !== 'http://' && post.link.substring(0,8) !== 'https://' ) {
        link = 'https://' + this.preview.url;
      } else if (post.link.substring(0,7) == 'http://') {
        link = 'https://' + this.preview.url.substring(7,this.preview.url.length);
      }
    }

    if (post.linkDesc !== 'undefined' && post.linkDesc !== undefined) {
      linkDesc = post.linkDesc;
    }

    if (post.linkTitle !== 'undefined' && post.linkTitle !== undefined) {
      linkTitle = post.linkTitle;
    }

    if (post.linkImage !== 'undefined' && post.linkImage !== undefined) {
      linkImage = post.linkImage;
    }

    fragmentLink = 'lk' + this.fragmentNbr;
    this.fragmentNbr++;

    let newPost: Iposts = {
      _id: post._id,
      createdBy: post.createdBy,
      body: post.body,
      displayName: post.userDisplayName,
      profileImageUrl: post.userProfileUrl,
      postPhotoUrl: photoUrl,
      link: link,
      linkDesc: linkDesc,
      linkTitle: linkTitle,
      linkImage: linkImage,
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
  private getPostsFromDatabase(yearOfBirth, rigLength) {
    let post: Iposts;
    let comment: Icomments;
    let postComments: Array<Icomments> = [];

    this.posts = [];

    this.forumSvc.getPosts(this.groupID, yearOfBirth, rigLength)
    .pipe(untilComponentDestroyed(this))
    .subscribe(postResult => {
      console.log('post=', postResult)
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
        this.comments.push(postComments);
        this.commentsOpen.push('out');
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
          this.commentsOpen.push('out');
        }

        this.showPosts = true;
        this.showFirstPost = false;
        this.showSpinner = false;
      }
    }, error => {
      this.showSpinner = false;
      if (error.status === 404) {
        this.showFirstPost = true;
        this.showPosts = false;
      } else {
        this.shared.notifyUserMajorError();
        throw new Error(error);
      }
    });
  }


  private listenForDesktopMaxWidth() {
    this.desktopMaxWidthSvc.desktopMaxWidth
    .pipe(untilComponentDestroyed(this))
    .subscribe(maxWidth => {
      this.desktopMaxWidth = maxWidth;
      this.setDialogDimensions();
    }, (error) => {
      this.sentry.logError(JSON.stringify({"message":"unable to listen for desktop max width","error":error}));
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
      this.yearOfBirth = profile.yearOfBirth;
      this.rigLength = profile.rigLength;

      if (this.profile.aboutMe === 'newbie' || this.profile.aboutMe === 'dreamer') {
        this.userNewbie = true;
      }
    }, (error) => {
      this.sentry.logError('PostsComponent:listenForUserProfile: error getting profile ' + JSON.stringify(error));
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
