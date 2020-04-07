import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DialogData {
  userID: string;
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
  windowScrolled: boolean;
  currentScroll: number

/*   scroll = (event: any): void => {
    // Here scroll is a variable holding the anonymous function
    // this allows scroll to be assigned to the event during onInit
    // and removed onDestroy
    // To see what changed:
    this.currentScroll = event.srcElement.scrollTop;
    console.log(event);
    console.log('I am scrolling ' + this.currentScroll);
  }; */

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

/*     // Add an event listener to window
    // Window can be defined in the pollyfiles.ts as:
    // if (window) {
    //    (window as any).global = window;
    // }
    window.addEventListener('scroll', this.scroll, true); //third parameter */

  }

/*   ngOnDestroy() {
    window.removeEventListener('scroll', this.scroll, true);
} */

  onMessage() {
    this.dialogRef.close('messages');
  }
}
