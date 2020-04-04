import { Component, OnInit, OnDestroy, Input, ViewChild} from '@angular/core';

import { Observable } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { TranslateService } from '@ngx-translate/core';

import { ForumService } from '@services/data-services/forum.service';
import { ProfileService, IuserProfile } from '@services/data-services/profile.service';

import { CommentsComponent } from './comments/comments.component';
import { UpdatePostComponent } from './update-post/update-post.component';
import { ConstantPool } from '@angular/compiler';

export type FadeState = 'visible' | 'hidden';
@Component({
  selector: 'app-rvlm-posts',
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.scss']
})

export class PostsComponent implements OnInit {

  // If titlesOnly is true, then only display titles of posts
  @Input('titlesOnly')
  public titlesOnly: boolean;

  // Provide access to methods on comments component and update post component
  @ViewChild(CommentsComponent)
  public commentsComponent: CommentsComponent;

  @ViewChild(UpdatePostComponent)
  public updatePostComponent: UpdatePostComponent;

  groupID: string;
  userID: string;
  displayName: string;
  profileImageUrl = './../../../../assets/images/no-profile-pic.jpg';
  posts: Array<any> = [];
  comments: Array<Array<JSON>> = [];
  currentPostRow: number;
  userProfile: Observable<IuserProfile>;
  liked: Array<boolean> = [];

  showSpinner = false;
  showAddPost = false;
  showPosts = false;
  showFirstPost = false;
  showPostComments: Array<boolean> = [];
  showUpdatePost: Array<boolean> = [];
  startCommentsIndex: Array<number> = [];


  constructor(private forumSvc: ForumService,
              private profileSvc: ProfileService) { }

  ngOnInit() {
    // Get user profile
    this.userProfile = this.profileSvc.profile;
    // this.profileSvc.getProfile();

    // Get user's ID and store for use in determining what posts or comments can edit
    this.userProfile
    .pipe(untilComponentDestroyed(this))
    .subscribe(profile => {
      console.log('PostsComponent:ngOnInit: got new profile data=', profile);
      this.userID = profile.userID;
    }, (error) => {
      console.error(error);
      console.log('error');
    });
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
    console.log('PostsComponent:getPosts: Get posts for group=', this.groupID);
    this.forumSvc.getPosts(this.groupID)
    .pipe(untilComponentDestroyed(this))
    .subscribe(postResult => {
      console.log('PostsComponent:getPosts: Got posts=', postResult);
      if (postResult.length === 0) {
        this.showPosts = false;
        this.showFirstPost = true;
        this.showSpinner = false;
      } else {
        this.comments= [];
        console.log('PostsComponent:getPosts: Comments array before=', this.comments);
        for (let j=0; j < postResult[0].comments.length; j++) {
          comment = this.createCommentsArrayEntry(postResult[0].comments[j]);
          console.log('PostsComponent:getPosts: Comments array adding new comment=', comment);
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
        console.log('PostsComponent:getPosts: Comments array added new comment=', this.comments);
        for (let i=1; i < postResult.length; i++) {
          postComments = [];
          for (let j=0; j < postResult[i].comments.length; j++) {
            comment = this.createCommentsArrayEntry(postResult[i].comments[j]);
            console.log('PostsComponent:getPosts: PostComments Array, adding new comment=', comment);
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
          console.log('PostsComponent:getPosts: Post Comments array adding new comment=', postComments);
          this.comments.push(postComments);
          console.log('PostsComponent:getPosts: Comments array adding new comment=', this.comments);
        }
        console.log('PostsComponent:getPosts: Posts=', this.posts);
        console.log('PostsComponent:getPosts: Reactions=', this.liked);
        console.log('PostsComponent:getPosts: showPostComments array=', this.showPostComments);
        this.showPosts = true;
        this.showFirstPost = false;
        this.showSpinner = false;
      }
    }, error => {
      console.log(error);
      this.showSpinner = false;
    });
  }


  postAddComplete(newPost: any): void {
    console.log('PostsComponent:postAddComplete: new post=', newPost);
    if (newPost !== 'canceled') {
      let post = this.createPostsArrayEntry(newPost);
      this.posts.unshift(post);
      console.log('PostsComponent:postAddComplete: new post added.  Current posts array=', this.posts);
      this.comments.unshift([]);
      this.showUpdatePost.unshift(false);
      this.showPostComments.push(false);
      this.startCommentsIndex.push(0);
      console.log('PostsComponent:postAddComplete after push to showPostComments=', this.showPostComments);
      this.showPosts = true;
      this.currentPostRow = 0;
    }
    this.showAddPost = false;
  }

  postUpdateComplete(post: any): void {
/*     console.log('back in posts', post.title, post.body);
    this.posts[this.currentRowUpdatePost].title = post.title;
    this.posts[this.currentRowUpdatePost].body = post.body;
    this.showUpdatePost[this.currentRowUpdatePost] = false; */
  }

  postCommentComplete(comment: any) {
    let currentRow = comment.postIndex;
    let newComment = this.createCommentsArrayEntry(comment);
    console.log('PostsComponent:postCommentComplete: new comment=', newComment);
    console.log('PostsComponent:postCommentComplete: currentPostRow=', currentRow, ' posts=', this.posts);
    if (this.posts[currentRow].commentCount == 0) {
        console.log('PostsComponent:postCommentComplete: initialize comments array.');
        this.comments[currentRow] = [];
    }

    console.log('PostsComponent:postCommentComplete: push on to ', this.comments[currentRow], '=',comment, ' index=' + currentRow);
    this.comments[currentRow].push(newComment);
    console.log('PostsComponent:postCommentComplete: pushed. comments=', this.comments);
    this.posts[currentRow].commentCount++;
    console.log('PostsComponent:postCommentComplete: comments length=', this.comments[currentRow].length), ' index before=', this.startCommentsIndex[currentRow];
    if (this.comments[currentRow].length > 4) {
      this.startCommentsIndex[currentRow]++
    }
    console.log('PostsComponent:postCommentComplete: index after=', this.startCommentsIndex[currentRow]);
  }

  onLike(row: number): void {
    console.log('row=', row);
    let reaction = 'like';

    this.forumSvc.addReaction(this.posts[row]._id, this.displayName, this.profileImageUrl, reaction)
    .subscribe(reactionResult => {
      console.log('REACTION RESULT=', reactionResult);
      this.posts[row].reactionCount++;
      this.liked[row] = true;
      this.showSpinner = false;
    }, error => {
      console.log(error);
      this.showSpinner = false;
    });
  }

  onComment(row: number) {
    this.showPostComments[row] = !this.showPostComments[row];
  }

  onShowAllComments() {
    console.log('PostsComponent:onShowAllComments: current row=', this.currentPostRow, ' before start index=', this.startCommentsIndex);
    this.startCommentsIndex[this.currentPostRow] = 0;
    console.log('PostsComponent:onShowAllComments: current row=', this.currentPostRow, ' after start index=', this.startCommentsIndex);
  }

  onAddPost() {
    this.showAddPost = true;
    this.showFirstPost = false;
  }

  updatePost(row: number) {
/*     console.log('update post', row);
    this.currentRowUpdatePost = row;
    this.showUpdatePost[row] = true;
    this.updatePostComponent.populatePost(); */
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
    let titleEscaped = this.escapeJsonReservedCharacters(post.title);
    let bodyEscaped = this.escapeJsonReservedCharacters(post.body);

    let newPost = '{"_id":"' + post._id + '",' +
    '"createdBy":"' + post.createdBy + '",' +
    '"title":"' + titleEscaped + '",' +
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
}
