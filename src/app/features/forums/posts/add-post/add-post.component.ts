import { UploadImageService } from '@services/data-services/upload-image.service';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';

import { ForumService } from '@services/data-services/forum.service';


@Component({
  selector: 'app-rvlm-add-post',
  templateUrl: './add-post.component.html',
  styleUrls: ['./add-post.component.scss']
})
export class AddPostComponent implements OnInit {

  @Input('groupID') groupID: string;

  @Input('displayName') displayName: string;

  @Input('profileImageUrl') profileImageUrl: string;

  @Output() postAddComplete = new EventEmitter<string>();

  form: FormGroup;
  postPhotoUrl: string;
  formCompleted: boolean = false;
  showSpinner = false;

  constructor(private forumSvc: ForumService,
              private uploadImageSvc: UploadImageService,
              fb: FormBuilder) {
              this.form = fb.group({
                post: new FormControl('')
              });
  }

  ngOnInit() {
  }

  // Whether canceled or posted, send the appropriate data back up the chain
  onDoneWithAdd(post: any) {
    this.postAddComplete.emit(post);
  }


  // As user to upload image, compress and orient the image and upload to server to store.  Save the URL to store with the post
  onPhoto(event: any) {
    let fileType: string = 'post';
    this.uploadImageSvc.compressImageFile(event, (compressedFile: File) => {
      this.showSpinner = true;
      this.uploadImageSvc.uploadImage(compressedFile, fileType, (uploadedFileUrl: string) => {
        this.postPhotoUrl = uploadedFileUrl;
        this.formCompleted = true;
        this.showSpinner = false;
      });
    });
  }


  // When user clicks post, update the database
  onPost() {
    this.showSpinner = true;
    // let postTitle = this.form.controls.title.value;
    let postText = this.form.controls.post.value;
    this.forumSvc.addPost(this.groupID, postText, this.displayName, this.profileImageUrl, this.postPhotoUrl)
    .subscribe(post => {
      this.onDoneWithAdd(post);
      this.showSpinner = false;
    }, error => {
      this.showSpinner = false;
      console.log('AddPostComponent:onPost: throw error ', error);
      throw new Error(error);
    });
  }


  onTextEntered() {
    this.formCompleted = true;
  }
}
