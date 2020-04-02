import { Component, OnInit, OnDestroy, Input, ViewChild} from '@angular/core';

import { Observable } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { TranslateService } from '@ngx-translate/core';

import { ForumService } from '@services/data-services/forum.service';
import { ProfileService, IuserProfile } from '@services/data-services/profile.service';

import { CommentsComponent } from './comments/comments.component';
import { UpdatePostComponent } from './update-post/update-post.component';

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
  postsResult: string;
  currentRowUpdatePost: number;
  posts: Array<any> = [];
  comments: Array<Array<JSON>> = [];
  currentPostRow: number;
  userProfile: Observable<IuserProfile>;
  liked: Array<boolean> = [];

  showSpinner = false;
  showAddPost = false;
  showPosts = false;
  showFirstPost = false;
  showComments: Array<boolean> = [];
  showUpdatePost: Array<boolean> = [];

  private _show: boolean;

  constructor(private forumSvc: ForumService,
              private profileSvc: ProfileService) { }

  ngOnInit() {
    // Get user profile
    this.userProfile = this.profileSvc.profile;
    this.profileSvc.getProfile();

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
    console.log('PostsComponent:getPosts: Get posts for group=', this.groupID);
    this.forumSvc.getPosts(this.groupID)
    .pipe(untilComponentDestroyed(this))
    .subscribe(postResult => {
      console.log('PostsComponent:getPosts: Got posts=', postResult);
      if (postResult.length === 0) {
        this.showPosts = false;
        this.showFirstPost = true;
        this.postsResult = 'Be the first to add a post for this group!';
        this.showSpinner = false;
      } else {
        let titleEscaped = this.escapeJsonReservedCharacters(postResult[0].title);
        let bodyEscaped = this.escapeJsonReservedCharacters(postResult[0].body);
        this.comments= [];
        console.log('PostsComponent:getPosts: Comments array before=', this.comments);
        for (let j=0; j < postResult[0].comments.length; j++) {
          comment = '{"comment":"' + postResult[0].comments[j].comment + '",' +
          '"displayName":"' + postResult[0].comments[j].displayName + '",' +
          '"profileImageUrl":"' + postResult[0].comments[j].profileImageUrl + '",' +
          '"createdAt":"' + postResult[0].comments[j].createdAt + '"}';
          console.log('PostsComponent:getPosts: Comments array adding new comment=', comment);
          postComments.push(JSON.parse(comment));
          this.showComments.push(false);
          this.liked.push(this.checkIfLiked(postResult[0].reactions));
        }
        post = '{"_id":"' + postResult[0]._id + '",' +
                '"createdBy":"' + postResult[0].createdBy + '",' +
                '"title":"' + titleEscaped + '",' +
                '"body":"' + bodyEscaped + '",' +
                '"displayName":"' + postResult[0].userDisplayName + '",' +
                '"profileImageUrl":"' + postResult[0].userProfileUrl + '",' +
                '"commentCount":"' + postResult[0].comments.length + '",' +
                '"comments":"0",' +
                '"reactionCount":"' + postResult[0].reactions.length + '",' +
                '"createdAt":"' + postResult[0].createdAt + '"}';
        console.log('PostsComponent:getPosts: Adding new post to array=', post)
        postJSON = JSON.parse(post);
        this.posts.push(postJSON);
        this.comments.push(postComments);
        console.log('PostsComponent:getPosts: Comments array added new comment=', this.comments);
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
            console.log('PostsComponent:getPosts: PostComments Array, adding new comment=', comment);
            postComments.push(JSON.parse(comment));
            this.showComments.push(false);
          }
          post = '{"_id":"' + postResult[i]._id + '",' +
                  '"createdBy":"' + postResult[i].createdBy + '",' +
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
          this.showUpdatePost.push(false);
          this.liked.push(this.checkIfLiked(postResult[i].reactions));
          console.log('PostsComponent:getPosts: Post Comments array adding new comment=', postComments);
          this.comments.push(postComments);
          console.log('PostsComponent:getPosts: Comments array adding new comment=', this.comments);
        }
        console.log('PostsComponent:getPosts: Posts=', this.posts);
        console.log('PostsComponent:getPosts: Reactions=', this.liked);
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
      this.posts.unshift(newPost);
      console.log('PostsComponent:postAddComplete: new post added.  Current posts array=', this.posts);
      this.showUpdatePost.unshift(false);
      this.showFirstPost = false;
      this.showPosts = true;
    }
    this.showAddPost = false;
  }

  postUpdateComplete(post: any): void {
    console.log('back in posts', post.title, post.body);
    this.posts[this.currentRowUpdatePost].title = post.title;
    this.posts[this.currentRowUpdatePost].body = post.body;
    this.showUpdatePost[this.currentRowUpdatePost] = false;
  }

  postCommentComplete(comment: any) {
    console.log('PostsComponent:postCommentComplete: push new comment=', comment);
    this.comments[this.currentPostRow].push(comment);
    this.showComments.push(false);
    console.log('PostsComponent:postCommentComplete: row=', this.currentPostRow, ' before count=', this.posts[this.currentPostRow].commentCount);
    this.posts[this.currentPostRow].commentCount++;
    this.commentsComponent.setStartCommentsIndex();
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
    console.log('row=', this.posts[row]);
    this.showComments[row] = !this.showComments[row];
    this.currentPostRow = row;
  }

  updatePost(row: number) {
    console.log('update post', row);
    this.currentRowUpdatePost = row;
    this.showUpdatePost[row] = true;
    this.updatePostComponent.populatePost();
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
}
