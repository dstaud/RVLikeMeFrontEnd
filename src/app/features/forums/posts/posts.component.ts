import { Component, OnInit, OnDestroy, Input, ViewChild, HostListener} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { Observable } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { TranslateService } from '@ngx-translate/core';

import { ForumService } from '@services/data-services/forum.service';
import { ProfileService, IuserProfile } from '@services/data-services/profile.service';

import { CommentsComponent } from './comments/comments.component';

import { UpdatePostDialogComponent } from '@dialogs/update-post-dialog/update-post-dialog.component';
import { YourStoryDialogComponent } from '@dialogs/your-story-dialog/your-story-dialog.component';

export type FadeState = 'visible' | 'hidden';
@Component({
  selector: 'app-rvlm-posts',
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.scss']
})

export class PostsComponent implements OnInit {

  @Input('colorTheme') theme: string;

  // Provide access to methods on comments component and update post component
  @ViewChild(CommentsComponent)
  public commentsComponent: CommentsComponent;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.windowWidth = window.innerWidth;
    if (this.windowWidth > 600) {
      if (this.windowWidth > 1140) {
        this.dialogWidth = 1140 * .95;
      } else {
        this.dialogWidth = this.windowWidth * .95;
      }
      this.dialogWidthDisplay = this.dialogWidth.toString() + 'px';
    }
  }

  groupID: string;
  userID: string;
  displayName: string;
  profileImageUrl = './../../../../assets/images/no-profile-pic.jpg';
  posts: Array<any> = [];
  comments: Array<Array<JSON>> = [];
  currentPostRow: number;
  userProfile: Observable<IuserProfile>;
  profile: IuserProfile;
  liked: Array<boolean> = [];

  showSpinner = false;
  showAddPost = false;
  showPosts = false;
  showFirstPost = false;
  showPostComments: Array<boolean> = [];
  showUpdatePost: Array<boolean> = [];
  startCommentsIndex: Array<number> = [];

  private windowWidth: any;
  private dialogWidth: number;
  private dialogWidthDisplay: string;

  constructor(private forumSvc: ForumService,
              private profileSvc: ProfileService,
              private router: Router,
              private dialog: MatDialog) { }

  ngOnInit() {
    // Get user profile
    this.userProfile = this.profileSvc.profile;
    // this.profileSvc.getProfile();

    // Get user's ID and store for use in determining what posts or comments can edit
    this.userProfile
    .pipe(untilComponentDestroyed(this))
    .subscribe(profile => {
      console.log('PostsComponent:ngOnInit: got new profile data=', profile);
      this.profile = profile;
      this.userID = profile.userID;
    }, (error) => {
      console.error(error);
      console.log('error');
    });

    // Get window size to determine how to present dialog windows
    this.windowWidth = window.innerWidth;
    if (this.windowWidth > 600) {
      if (this.windowWidth > 1140) {
        this.dialogWidth = 1140 * .95;
      } else {
        this.dialogWidth = this.windowWidth * .95;
      }
      this.dialogWidthDisplay = this.dialogWidth.toString() + 'px';
    }
  }

  ngOnDestroy() {}


  // Get all posts for group passed from forums component.
  getPosts(groupID: string, profileImageUrl: string, displayName: string): void {
    let post: JSON;
    let comment: JSON;
    let postComments: Array<JSON> = [];

    this.showSpinner = true;
    this.groupID = groupID;
    if (profileImageUrl) {
      this.profileImageUrl = profileImageUrl;
    }
    this.displayName = displayName;

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
      console.log(error);
      this.showSpinner = false;
    });
  }


  // When user clicks like, send update to server and turn off their ability to like again
  onLike(row: number): void {
    console.log('row=', row);
    let reaction = 'like';

    this.forumSvc.addReaction(this.posts[row]._id, this.displayName, this.profileImageUrl, reaction)
    .subscribe(reactionResult => {
      this.posts[row].reactionCount++;
      this.liked[row] = true;
      this.showSpinner = false;
    }, error => {
      console.log(error);
      this.showSpinner = false;
    });
  }


  // When user clicks comment, open up the comments for viewing
  onComment(row: number) {
    this.showPostComments[row] = !this.showPostComments[row];
  }

  onYourStory(userID: string) {
    this.showSpinner = true;
    this.profileSvc.getMyStory(userID)
    .subscribe(myStoryResult => {
      this.openMyStoryDialog(userID, myStoryResult.myStory, myStoryResult.displayName, myStoryResult.profileImageUrl)
      this.showSpinner = false;
    }, error => {
      console.log(error);
      this.showSpinner = false;
    });
  }

  // When user clicks to show all comments, set the start index to zero
  onShowAllComments() {
    this.startCommentsIndex[this.currentPostRow] = 0;
  }


  // When user clicks to add a post, show the form
  onAddPost() {
    this.showAddPost = true;
    this.showFirstPost = false;
  }


  // Open dialog to display selected user's story
  openMyStoryDialog(userID: string, myStory: string, displayName: string, profileImageUrl: string): void {
    const dialogRef = this.dialog.open(YourStoryDialogComponent, {
      width: '80vh',
      maxHeight: '90vh',
      data: { userID: userID, myStory: myStory, displayName: displayName, profileImageUrl: profileImageUrl }
    });

    dialogRef.afterClosed()
    .pipe(untilComponentDestroyed(this))
    .subscribe(result => {
      if (result === 'messages') {
        this.navigateToMessages(userID);
      }
    });
  }


  // Open dialog for user to update their post
  openUpdatePostDialog(row: number): void {
    const dialogRef = this.dialog.open(UpdatePostDialogComponent, {
      width: this.dialogWidthDisplay,
      height: '80%',
      disableClose: true,
      data: { post: this.posts[row].body }
    });

    dialogRef.afterClosed()
    .pipe(untilComponentDestroyed(this))
    .subscribe(result => {
      if (result !== 'canceled') {
        this.forumSvc.updatePost(this.posts[row]._id, result)
        .subscribe(postResult => {
          this.posts[row].body = postResult.body;
          this.showSpinner = false;
        }, error => {
          console.log(error);
          this.showSpinner = false;
        });
      } else {
        this.showSpinner = false;
      }
    });
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
      this.currentPostRow = 0;
    }
    this.showAddPost = false;
  }


  // After submits their post, this is called from child component
  postUpdateComplete(postResult: any): void {
    let postIndex = postResult[0].postIndex;
    let post = postResult[1];

    if (post !== 'canceled') {
      // this.posts[postIndex].title = post.title;
      this.posts[postIndex].body = post.body;
    }
    this.showUpdatePost[postIndex] = false;
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


  private checkIfLiked(reactions: any): boolean {
    let reactionMatch = false;

    console.log('PostsComponent:checkIfLiked: reactions=', reactions);
    for (let i=0; i < reactions.length; i++) {
      if (reactions[i].createdBy === this.userID) {
        reactionMatch = true;
        break;
      }
    }
    return reactionMatch;
  }

  private escapeJsonReservedCharacters(string: string): string {
    let newString = string;
    newString = newString.replace(/"/g, "'").trim();
    newString = newString.replace(/\\/g, "|");
    newString = newString.replace(/\n/g, "\\n");
    console.log(string, newString);
    return newString;
  }

  private createPostsArrayEntry(post): JSON {
    // let titleEscaped = this.escapeJsonReservedCharacters(post.title);
    let bodyEscaped = this.escapeJsonReservedCharacters(post.body);

    let newPost = '{"_id":"' + post._id + '",' +
    '"createdBy":"' + post.createdBy + '",' +
    // '"title":"' + titleEscaped + '",' +
    '"body":"' + bodyEscaped + '",' +
    '"displayName":"' + post.userDisplayName + '",' +
    '"profileImageUrl":"' + post.userProfileUrl + '",' +
    '"commentCount":"' + post.comments.length + '",' +
    '"reactionCount":"' + post.reactions.length + '",' +
    '"createdAt":"' + post.createdAt + '"}';
    return JSON.parse(newPost);
  }

  private createCommentsArrayEntry(comment): JSON {
    let newComment = '{"comment":"' + comment.comment + '",' +
    '"displayName":"' + comment.displayName + '",' +
    '"profileImageUrl":"' + comment.profileImageUrl + '",' +
    '"createdAt":"' + comment.createdAt + '"}';
    return JSON.parse(newComment);
  }

  private navigateToMessages(userID: string): void {
    let params: string;

    params = '{"userID":"' + userID + '"}';
    console.log('YourStoryDialogComponent:onMessage: params=', params);
    this.router.navigate(['/messages'], { queryParams: { queryParam: params }});
  }
}
