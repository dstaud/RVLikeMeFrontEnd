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

  @Input('titlesOnly')
  public titlesOnly: boolean;

  @ViewChild(CommentsComponent)
  public commentsComponent: CommentsComponent;

  @ViewChild(UpdatePostComponent)
  public updatePostComponent: UpdatePostComponent;

  showSpinner = false;
  postsResult: string;
  profileImageUrl = './../../../../assets/images/no-profile-pic.jpg';
  displayName: string
  showAddPost = false;
  showPosts = false;
  showFirstPost = false;
  showComments: Array<boolean> = [];
  showUpdatePost: Array<boolean> = [];
  currentRowUpdatePost: number;
  groupID: string;
  posts: Array<any> = [];
  comments: Array<Array<JSON>> = [];
  currentPostRow: number;
  userProfile: Observable<IuserProfile>;
  userID: string;

  private _show: boolean;

  constructor(private forumSvc: ForumService,
              private profileSvc: ProfileService) { }

  ngOnInit() {
    // Get user profile
    this.userProfile = this.profileSvc.profile;
    this.profileSvc.getProfile();

    this.userProfile
    .pipe(untilComponentDestroyed(this))
    .subscribe(profile => {
      console.log('in post component=', profile);
      this.userID = profile.userID;
    }, (error) => {
      console.error(error);
      console.log('error');
    });
  }

  ngOnDestroy() {}


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
                '"createdBy":"' + postResult[0].createdBy + '",' +
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


  postAddComplete(newPost: any): void {
    console.log('back in posts', newPost);
    if (newPost !== 'canceled') {
      this.posts.unshift(newPost);
      this.showUpdatePost.unshift(false);
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
    console.log('PUSHING NEW COMMENT=', comment);
    this.comments[this.currentPostRow].push(comment);
    this.showComments.push(false);
    console.log('UPDATED COMMENTS ARRAY=', this.comments);
    this.commentsComponent.setStartCommentsIndex();
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

  private escapeJsonReservedCharacters(string: string): string {
    let newString = string;
    newString = newString.replace(/"/g, "'").trim();
    newString = newString.replace(/\\/g, "|");
    newString = newString.replace(/\n/g, "\\n");
    console.log(string, newString);
    return newString;
  }
}
