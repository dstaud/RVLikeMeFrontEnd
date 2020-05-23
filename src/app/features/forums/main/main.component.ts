import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { PostsMainComponent } from './../posts-main/posts-main.component';

@Component({
  selector: 'app-rvlm-forums-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  @ViewChild(PostsMainComponent)
  public postsMain: PostsMainComponent;

  constructor(private router: Router) {
              }

  ngOnInit() {
    if (window.innerWidth <= 600) {
      this.router.navigateByUrl('forums/posts-main');
    }
  }

  onGroupSelected(groupID: string) {
    this.postsMain.getGroup(groupID);
  }
}
