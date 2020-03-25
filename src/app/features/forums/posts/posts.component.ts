import { Component, OnInit } from '@angular/core';
import { ForumService } from '@services/data-services/forum.service';

@Component({
  selector: 'app-rvlm-posts',
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.scss']
})
export class PostsComponent implements OnInit {
  showSpinner = false;

  constructor(private forumSvc: ForumService) { }

  ngOnInit() {
  }

  private getPosts(forumID: string): void {
    this.forumSvc.getPosts(forumID)
    .subscribe(posts => {
      if (posts.length === 0) {
        console.log('no posts found!');
      } else {
        console.log('posts found!', posts);
      }
      this.showSpinner = false;
    }, error => {
      console.log(error);
      this.showSpinner = false;
    });
  }
}
