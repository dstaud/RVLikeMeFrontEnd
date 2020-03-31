import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { AddCommentComponent } from './../../features/forums/posts/comments/add-comment/add-comment.component';

export interface DialogData {
  postID: string;
  title: string;
  displayName: string;
  profileImageUrl: string;
}

@Component({
  selector: 'app-comment-dialog',
  templateUrl: './comment-dialog.component.html',
  styleUrls: ['./comment-dialog.component.scss']
})
export class CommentDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<AddCommentComponent>,
              @Inject(MAT_DIALOG_DATA) public data: DialogData) { }

  ngOnInit(): void {
    console.log('in dialog', this.data.postID, this.data.title, this.data.displayName, this.data.profileImageUrl);
  }

  postCommentComplete(event: string) {
    this.dialogRef.close(event);
  }

  onNoClick(): void {
    this.dialogRef.close('canceled');
  }
}
