import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { ScrollToTopComponent } from './../../core/utilities/scroll-to-top/scroll-to-top.component';

export interface DialogData {
  myStory: string;
  displayName: string;
  profileImageUrl: string;
}

@Component({
  selector: 'app-your-story-dialog',
  templateUrl: './your-story-dialog.component.html',
  styleUrls: ['./your-story-dialog.component.scss']
})

export class YourStoryDialogComponent implements OnInit {


  userStory: string;
  userProfileImage: string;

  constructor(public dialogRef: MatDialogRef<YourStoryDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: DialogData) { }

  ngOnInit(): void {
    if (this.data.myStory) {
      this.userStory = this.data.myStory;
    } else {
      this.userStory = 'this user has not yet published a story';
    }
    if (this.data.profileImageUrl) {
      this.userProfileImage = this.data.profileImageUrl;
    } else {
      this.userProfileImage = './../../../assets/images/no-profile-pic.jpg';
    }
  }

}
