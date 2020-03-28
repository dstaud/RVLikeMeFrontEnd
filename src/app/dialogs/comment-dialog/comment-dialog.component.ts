import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { CommentsComponent } from './../../features/forums/posts/comments/comments.component';

export interface DialogData {
  postID: string;
  title: string
}

@Component({
  selector: 'app-comment-dialog',
  templateUrl: './comment-dialog.component.html',
  styleUrls: ['./comment-dialog.component.scss']
})
export class CommentDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<CommentsComponent>,
              @Inject(MAT_DIALOG_DATA) public data: DialogData) { }

  ngOnInit(): void {
  }

  formComplete(event: string) {
    this.dialogRef.close(event);
  }

  onNoClick(): void {
    this.dialogRef.close('canceled');
  }
}
