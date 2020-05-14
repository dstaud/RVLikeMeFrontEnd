import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';

import { ShareDataService, Ipost } from '@services/share-data.service';
import { AuthenticationService } from '@services/data-services/authentication.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { UploadImageService } from '@services/data-services/upload-image.service';
import { HeaderVisibleService } from '@services/header-visibility.service';
import { ForumService } from '@services/data-services/forum.service';
import { SentryMonitorService } from '@services/sentry-monitor.service';

@Component({
  selector: 'app-rvlm-update-post',
  templateUrl: './update-post.component.html',
  styleUrls: ['./update-post.component.scss']
})
export class UpdatePostComponent implements OnInit {
  @Input('containerDialog') containerDialog: boolean;

  // When user is in desktop mode, tell dialog container form is complete, through the reference obtained through the selector
  @Output() formComplete = new EventEmitter()
  public formCompleted: string;


  form: FormGroup;
  post: Ipost;

  showSpinner: boolean = false;

  constructor(private sharedDataSvc: ShareDataService,
              private activateBackArrowSvc: ActivateBackArrowService,
              private authSvc: AuthenticationService,
              private location: Location,
              private router: Router,
              private sentry: SentryMonitorService,
              private headerVisibleSvc: HeaderVisibleService,
              private uploadImageSvc: UploadImageService,
              private forumSvc: ForumService,
              fb: FormBuilder) {
                this.form = fb.group({
                  post: new FormControl('')
                });
              if (this.containerDialog) {
                this.headerVisibleSvc.toggleHeaderVisible(false);
                this.headerVisibleSvc.toggleHeaderDesktopVisible(false);
              } else {
                this.headerVisibleSvc.toggleHeaderVisible(true);
                this.headerVisibleSvc.toggleHeaderDesktopVisible(false);
              }
    }

  ngOnInit(): void {
    console.log('UpdatePostComponent:ngOnInit:')
    let backPath;
    let self = this;
    window.onpopstate = function(event) {
      self.activateBackArrowSvc.setBackRoute('', 'backward');
    };

    if (!this.authSvc.isLoggedIn()) {
      backPath = this.location.path().substring(1, this.location.path().length);
      this.activateBackArrowSvc.setBackRoute('*' + backPath, 'forward');
      this.router.navigateByUrl('/?e=signin');
    } else {
      this.post = this.sharedDataSvc.getData('post');
      console.log('UpdatePostComponent:ngOnInit: get data=', this.post);
      if (!this.post.body){
        this.router.navigateByUrl('forums/forums-list');
      } else {
        this.form.patchValue({ post: this.post.body });
      }
    }
  }


  onCancel() {
    this.formComplete.emit('canceled');
  }


  onChangePhoto(event: any) {
    let fileType: string = 'post';

    this.showSpinner = true;
    this.forumSvc.deletePostImage(this.post.photoUrl)
    .subscribe(deleteResult => {
      this.post.photoUrl = null;
      this.uploadImageSvc.compressImageFile(event, (compressedFile: File) => {
        this.showSpinner = true;
        this.uploadImageSvc.uploadImage(compressedFile, fileType, (uploadedFileUrl: string) => {
          this.post.photoUrl = uploadedFileUrl;
          this.showSpinner = false;
        });
      });
    }, error => {
      console.error('UpdatePostComponent:onChangePhoto: error deleting image from AWS=', error);
      this.showSpinner = false;
      this.sentry.logError(error);
    });
 }


  onDeletePhoto() {
    this.showSpinner = true;
    this.forumSvc.deletePostImage(this.post.photoUrl)
    .subscribe(deleteResult => {
      this.post.photoUrl = null;
      this.showSpinner = false;
    }, error => {
      console.error('UpdatePostComponent:onDeletePhoto: error deleting image from AWS=', error);
      this.showSpinner = false;
      this.sentry.logError(error);
    });
  }


  // As user to upload image, compress and orient the image and upload to server to store.  Save the URL to store with the post
  onPhoto(event: any) {
    let fileType: string = 'post';
    this.uploadImageSvc.compressImageFile(event, (compressedFile: File) => {
      this.showSpinner = true;
      this.uploadImageSvc.uploadImage(compressedFile, fileType, (uploadedFileUrl: string) => {
        this.post.photoUrl = uploadedFileUrl;
        this.showSpinner = false;
      });
    });
  }

  onPost() {
    console.log('UpdatePostComponent:onPost: updating body=', this.form.controls.post.value, ' photo=', this.post.photoUrl);
    this.forumSvc.updatePost(this.post.groupID, this.form.controls.post.value, this.post.photoUrl)
    .subscribe(postResult => {
      this.post.body = postResult.body;
      this.sharedDataSvc.setData('post', this.post);
      this.showSpinner = false;
      if (this.containerDialog) {
        this.formComplete.emit(this.post);
      } else {
        this.router.navigateByUrl('forums/main');
      }
    }, error => {
      console.error('PostsComponent:onUpdatePost: error updating post=', error);
      throw new Error(error);
    });
  }
}
