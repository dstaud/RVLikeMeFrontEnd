import { Component, OnInit,OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { trigger, transition, style, animate, state } from '@angular/animations';

import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { ShareDataService, Ipost } from '@services/share-data.service';
import { AuthenticationService } from '@services/data-services/authentication.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { UploadImageService } from '@services/data-services/upload-image.service';
import { HeaderVisibleService } from '@services/header-visibility.service';
import { ForumService } from '@services/data-services/forum.service';
import { SentryMonitorService } from '@services/sentry-monitor.service';
import { LinkPreviewService, IlinkPreview } from '@services/link-preview.service';
import { DeviceService } from '@services/device.service';

import { SharedComponent } from '@shared/shared.component';

@Component({
  selector: 'app-rvlm-update-post',
  templateUrl: './update-post.component.html',
  styleUrls: ['./update-post.component.scss'],
  animations: [
    trigger('addLinkSlideInOut', [
      state('in', style({
        overflow: 'hidden',
        height: '*',
        width: '100%'
      })),
      state('out', style({
        opacity: '0',
        overflow: 'hidden',
        height: '0px',
        width: '0px'
      })),
      transition('in => out', animate('400ms ease-in-out')),
      transition('out => in', animate('400ms ease-in-out'))
    ])
  ]
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
  addLinkOpen: string = 'out';
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
              private shared: SharedComponent,
              private forumSvc: ForumService,
              private device: DeviceService,
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

  ngOnDestroy() {}


  getClass() {
    let containerClass: string;
    let bottomSpacing: string;

    if (this.containerDialog) {
      containerClass = 'container-desktop';
    } else {
      if (this.device.iPhoneModelXPlus) {
        bottomSpacing = 'bottom-bar-spacing-xplus';
      } else {
        bottomSpacing = 'bottom-bar-spacing';
      }
      containerClass = 'container ' + bottomSpacing;
    }

    return containerClass;
  }


  onCancel() {
    this.formComplete.emit('canceled');
  }

  onAddLink() {
    this.addLinkOpen = this.addLinkOpen === 'out' ? 'in' : 'out';
    this.photoAndLinkActionsDisabled = true;
    this.addLinkInputEnabled = true;
    this.readyForPost = false;
  }


  onChangePhoto(event: any) {
    let fileType: string = 'post';

    this.showSpinner = true;
    this.forumSvc.deletePostImage(this.post.photoUrl)
    .pipe(untilComponentDestroyed(this))
    .subscribe(deleteResult => {
      this.post.photoUrl = null;
      this.uploadImageSvc.compressImageFile(event, (compressedFile: File) => {
        this.showSpinner = true;
        this.uploadImageSvc.uploadImage(compressedFile, fileType, (uploadedFileUrl: string) => {
          if (uploadedFileUrl === 'error') {
            this.shared.openSnackBar('There was a problem uploading your photo.  It is likely too large.','error',5000);
            this.showSpinner = false;
            this.post.photoUrl = '';
          } else {
            this.post.photoUrl = uploadedFileUrl;
            this.showSpinner = false;
            this.photoAndLinkActionsDisabled = true;
            this.readyForPost = true;
          }
        });
      });
    }, error => {
      console.error('UpdatePostComponent:onChangePhoto: error deleting image from AWS=', error);
      this.showSpinner = false;
      this.sentry.logError(error);
    });
 }


  onDeleteLink() {
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
  }



  onDeletePhoto() {
    this.showSpinner = true;
    this.forumSvc.deletePostImage(this.post.photoUrl)
    .pipe(untilComponentDestroyed(this))
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
    if (this.form.controls.link.valid) {
      if (this.form.controls.link.value) {
        this.showSpinner = true;
        this.linkPreviewSvc.getLinkPreview(this.form.controls.link.value)
        .pipe(untilComponentDestroyed(this))
        .subscribe(preview => {
          this.linkPreview = preview;
          this.post.link = this.linkPreview.url;
          this.post.linkTitle = this.linkPreview.title;
          this.post.linkDesc = this.linkPreview.description;
          this.post.linkImage = this.linkPreview.image;

          // if (this.linkPreview.url.substring(0,7) == 'http://') {
          //   this.linkPreview.url = this.linkPreview.url.substring(7,this.linkPreview.url.length);
          // } else if (this.form.controls.link.value.substring(0,8) === 'https://') {
          //   this.linkPreview.url = this.linkPreview.url.substring(8,this.linkPreview.url.length);
          // }

          if (this.linkPreview.url.substring(0,7) !== 'http://' && this.linkPreview.url.substring(0,8) !== 'https://' ) {
            this.post.link = 'https://' + this.linkPreview.url;
          } else if (this.linkPreview.url.substring(0,7) == 'http://') {
            this.post.link = 'https://' + this.linkPreview.url.substring(7,this.linkPreview.url.length);
          }

          if (!this.linkPreview.title) {
            this.linkPreview.title = this.linkPreview.url;
            this.post.linkTitle = this.linkPreview.url;
          }
          console.log('UpdatePostComponent:onLink: preview=', this.linkPreview)
          this.showLinkPreview = true;
          this.addLinkInputEnabled = false;
          this.readyForPost = true;
          this.showSpinner = false;
        }, error => {
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
          this.showSpinner = false;
        });
      } else {
        if (this.form.controls.post.value) {
          this.readyForPost = true;
        }
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
    let fileType: string = 'post';
    this.uploadImageSvc.compressImageFile(event, (compressedFile: File) => {
      this.showSpinner = true;
      this.uploadImageSvc.uploadImage(compressedFile, fileType, (uploadedFileUrl: string) => {
        if (uploadedFileUrl === 'error') {
          this.shared.openSnackBar('There was a problem uploading your photo.  It is likely too large.','error',5000);
          this.showSpinner = false;
          this.post.photoUrl = '';
        } else {
          this.post.photoUrl = uploadedFileUrl;
          this.showSpinner = false;
          this.photoAndLinkActionsDisabled = true;
          this.readyForPost = true;
        }
      });
    });
  }

  onPost() {
    console.log('UpdatePostComponent:onPost: link=', this.post.link, ' desc=', this.post.linkDesc, ' title=', this.post.linkTitle)
    this.forumSvc.updatePost(this.post.groupID, this.form.controls.post.value, this.post.photoUrl,
                            this.post.link, this.post.linkDesc, this.post.linkTitle, this.post.linkImage)
    .pipe(untilComponentDestroyed(this))
    .subscribe(postResult => {
      this.post.body = postResult.body;
      this.post.photoUrl = postResult.photoUrl;
      this.post.link = postResult.link;
      this.post.linkDesc = postResult.linkDesc;
      this.post.linkTitle = postResult.linkTitle;
      this.post.linkImage = postResult.linkImage;
      this.sharedDataSvc.setData('post', this.post);
      this.showSpinner = false;
      if (this.containerDialog) {
        this.formComplete.emit(this.post);
      } else {
        if (this.containerDialog) {
          this.router.navigateByUrl('forums/main');
        } else {
          this.router.navigateByUrl('forums/posts-main');
        }

      }
      this.addLinkOpen = this.addLinkOpen === 'out' ? 'in' : 'out';
    }, error => {
      console.error('PostsComponent:onUpdatePost: error updating post=', error);
      throw new Error(error);
    });
  }

  onText() {
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
