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
import { LinkPreviewService, IlinkPreview } from '@services/link-preview.service';

@Component({
  selector: 'app-rvlm-update-post',
  templateUrl: './update-post.component.html',
  styleUrls: ['./update-post.component.scss']
})
export class UpdatePostComponent implements OnInit {
  @Input('containerDialog') containerDialog: boolean;

  // When user is in desktop mode, tell dialog container form is complete, through the reference obtained through the selector
  @Output() formComplete = new EventEmitter()

  form: FormGroup;
  post: Ipost;
  readyForPost: boolean = true;
  photoAndLinkActionsDisabled: boolean = false;
  addLinkInputEnabled: boolean = false;
  showLinkPreview: boolean = false;
  linkPreview: IlinkPreview = {
    title: '',
    description: '',
    url: '',
    image: ''
  }

  showSpinner: boolean = false;

  private regHyperlink = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/;

  constructor(private sharedDataSvc: ShareDataService,
              private activateBackArrowSvc: ActivateBackArrowService,
              private authSvc: AuthenticationService,
              private location: Location,
              private router: Router,
              private sentry: SentryMonitorService,
              private linkPreviewSvc: LinkPreviewService,
              private headerVisibleSvc: HeaderVisibleService,
              private uploadImageSvc: UploadImageService,
              private forumSvc: ForumService,
              fb: FormBuilder) {
                this.form = fb.group({
                  post: new FormControl(''),
                  link: new FormControl('', Validators.pattern(this.regHyperlink))
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
      if (!this.post.body && !this.post.photoUrl && !this.post.link){
        this.router.navigateByUrl('forums/forums-list');
      } else {
        this.form.patchValue({ post: this.post.body });
        if (this.post.photoUrl || this.post.link) {
          this.photoAndLinkActionsDisabled = true;
        }
        if (this.post.link) {
          this.linkPreview = {
            url: this.post.link,
            description: this.post.linkDesc,
            title: this.post.linkTitle,
            image: this.post.linkImage
          }
          this.showLinkPreview = true;
          this.photoAndLinkActionsDisabled = true;
        }
      }
    }
  }


  onCancel() {
    console.log('UpdatePostComonent:onCancel:')
    this.formComplete.emit('canceled');
  }

  onAddLink() {
    console.log('UpdatePostComonent:onAddLink:')
    this.photoAndLinkActionsDisabled = true;
    this.addLinkInputEnabled = true;
    this.readyForPost = false;
  }


  onChangePhoto(event: any) {
    console.log('UpdatePostComonent:onChangePhoto:')
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
          this.photoAndLinkActionsDisabled = true;
          this.readyForPost = true;
        });
      });
    }, error => {
      console.error('UpdatePostComponent:onChangePhoto: error deleting image from AWS=', error);
      this.showSpinner = false;
      this.sentry.logError(error);
    });
 }


  onDeleteLink() {
    console.log('UpdatePostComonent:onDeleteLink:')
    this.linkPreview = {
      url: '',
      title: '',
      description: '',
      image: ''
    }
    this.post.link = '';
    this.post.linkDesc = '';
    this.post.linkTitle = '';
    this.post.linkImage = '';
    if (this.form.controls.post.value) {
      this.readyForPost = true;
    } else {
      this.readyForPost = false;
    }
    this.photoAndLinkActionsDisabled = false;
    this.showLinkPreview = false;
    console.log('UpdatePostComponent:onDeleteLink: post=', this.post);
  }



  onDeletePhoto() {
    console.log('UpdatePostComonent:onDeletePhoto:')
    this.showSpinner = true;
    this.forumSvc.deletePostImage(this.post.photoUrl)
    .subscribe(deleteResult => {
      this.post.photoUrl = null;
      this.photoAndLinkActionsDisabled = false;
      this.showSpinner = false;
      if (this.form.controls.post.value) {
        this.readyForPost = true;
      } else {
        this.readyForPost = false;
      }
    }, error => {
      console.error('UpdatePostComponent:onDeletePhoto: error deleting image from AWS=', error);
      this.showSpinner = false;
      this.sentry.logError(error);
    });
  }


  onLink() {
    console.log('UpdatePostComonent:onLink:')
    if (this.form.controls.link.valid) {
      if (this.form.controls.link.value) {
        this.linkPreviewSvc.getLinkPreview(this.form.controls.link.value)
        .subscribe(preview => {
          console.log('AddPostComponent:onLink: preview=', preview);
          this.linkPreview = preview;
          console.log('AppPostComponent:onLink: url=', this.linkPreview.url);
          this.post.link = this.linkPreview.url;
          if (this.linkPreview.url.substring(0,7) == 'http://') {
            this.linkPreview.url = this.linkPreview.url.substring(7,this.linkPreview.url.length);
          } else if (this.form.controls.link.value.substring(0,8) === 'https://') {
            this.linkPreview.url = this.linkPreview.url.substring(8,this.linkPreview.url.length);
          }

          if (!this.linkPreview.title) {
            this.linkPreview.title = this.linkPreview.url;
          }

          this.showLinkPreview = true;
          this.addLinkInputEnabled = false;
          this.readyForPost = true;
        }, error => {
          console.log('AddPostComponent:onLink: no link found');
          this.linkPreview.url = this.form.controls.link.value;
          if (this.linkPreview.url.substring(0,7) == 'http://') {
            this.linkPreview.url = this.linkPreview.url.substring(7,this.linkPreview.url.length);
          } else if (this.form.controls.link.value.substring(0,8) === 'https://') {
            this.linkPreview.url = this.linkPreview.url.substring(8,this.linkPreview.url.length);
          }
          this.linkPreview.title = this.linkPreview.url;
          this.form.reset();
          this.showLinkPreview = true;
          this.addLinkInputEnabled = false;
          this.readyForPost  = true;
        });
      } else {
        this.readyForPost = true;
        this.showLinkPreview = false;
        this.addLinkInputEnabled = false;
        this.photoAndLinkActionsDisabled = false;
      }
    } else {
      this.readyForPost = false;
    }
  }


  // As user to upload image, compress and orient the image and upload to server to store.  Save the URL to store with the post
  onPhoto(event: any) {
    console.log('UpdatePostComonent:onPhoto:')
    let fileType: string = 'post';
    this.uploadImageSvc.compressImageFile(event, (compressedFile: File) => {
      this.showSpinner = true;
      this.uploadImageSvc.uploadImage(compressedFile, fileType, (uploadedFileUrl: string) => {
        this.post.photoUrl = uploadedFileUrl;
        this.showSpinner = false;
        this.photoAndLinkActionsDisabled = true;
        this.readyForPost = true;
      });
    });
  }

  onPost() {
    this.forumSvc.updatePost(this.post.groupID, this.form.controls.post.value, this.post.photoUrl,
                            this.post.link, this.post.linkDesc, this.post.linkTitle, this.post.linkImage)
    .subscribe(postResult => {
      console.log('UpdatePostComponent:onPost: result=', postResult);
      this.post.body = postResult.body;
      this.post.photoUrl = postResult.photoUrl;
      this.post.link = postResult.link;
      this.post.linkDesc = postResult.linkDesc;
      this.post.linkTitle = postResult.linkTitle;
      this.post.linkImage = postResult.linkImage;
      this.sharedDataSvc.setData('post', this.post);
      this.showSpinner = false;
      if (this.containerDialog) {
        console.log('UpdatePostComponent:onPost: send back=', this.post);
        this.formComplete.emit(this.post);
      } else {
        this.router.navigateByUrl('forums/main');
      }
    }, error => {
      console.error('PostsComponent:onUpdatePost: error updating post=', error);
      throw new Error(error);
    });
  }

  onText() {
    console.log('UpdatePostComonent:onText:')
    if (this.form.controls.post.value) {
      if (this.addLinkInputEnabled && !this.form.controls.link.valid) {
        this.readyForPost = false;
      } else {
        this.readyForPost = true;
      }
    } else {
      if (this.post.photoUrl || this.post.link) {
        this.readyForPost = true;
      } else {
        this.readyForPost = false;
      }
    }
  }
}
