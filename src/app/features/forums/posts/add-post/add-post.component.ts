import { UploadImageService } from '@services/data-services/upload-image.service';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { trigger, transition, style, animate, state } from '@angular/animations';

import { ForumService } from '@services/data-services/forum.service';
import { LinkPreviewService, IlinkPreview } from '@services/link-preview.service';


@Component({
  selector: 'app-rvlm-add-post',
  templateUrl: './add-post.component.html',
  styleUrls: ['./add-post.component.scss'],
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

export class AddPostComponent implements OnInit {
  @Input('groupID') groupID: string;
  @Input('displayName') displayName: string;
  @Input('profileImageUrl') profileImageUrl: string;
  @Input('yearOfBirth') yearOfBirth: number;
  @Input('rigLength') rigLength: number;

  @Output() postAddComplete = new EventEmitter<string>();

  form: FormGroup;
  postPhotoUrl: string = '';
  postLink: string = '';
  readyForPost: boolean = false;
  showSpinner = false;
  photoAndLinkActionsDisabled = false;
  addLinkInputEnabled: boolean = false;
  showLinkPreview: boolean = false;
  addLinkOpen: string = 'out';
  linkPreview: IlinkPreview = {
    title: '',
    description: '',
    url: '',
    image: ''
  }
  noPreview: string = '';

  private regHyperlink = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/;

  constructor(private forumSvc: ForumService,
              private uploadImageSvc: UploadImageService,
              private linkPreviewSvc: LinkPreviewService,
              fb: FormBuilder) {
              this.form = fb.group({
                post: new FormControl(''),
                link: new FormControl('', Validators.pattern(this.regHyperlink))
              });
  }

  ngOnInit() {
  }


  onAddLink() {
    this.addLinkOpen = this.addLinkOpen === 'out' ? 'in' : 'out';
    this.photoAndLinkActionsDisabled = true;
    this.addLinkInputEnabled = true;
  }

  // Whether canceled or posted, send the appropriate data back up the chain
  onDoneWithAdd(post: any) {
    this.photoAndLinkActionsDisabled = false;
    this.postPhotoUrl = '';
    this.postLink = '';
    if (this.linkPreview) {
      this.linkPreview.description = '';
      this.linkPreview.image = '';
      this.linkPreview.title = '';
      this.linkPreview.url = '';
    }
    this.showLinkPreview = false;
    this.addLinkInputEnabled = false;
    this.form.reset();
    this.postAddComplete.emit(post);
    if (this.addLinkOpen === 'in') {
      this.addLinkOpen = 'out';
    }
  }


  onLink() {
    if (this.form.controls.link.valid) {
      if (this.form.controls.link.value) {
        this.showSpinner = true;
        this.linkPreviewSvc.getLinkPreview(this.form.controls.link.value)
        .subscribe(preview => {
          this.linkPreview = preview;
          this.postLink = this.form.controls.link.value;
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
          this.photoAndLinkActionsDisabled = true;
          this.readyForPost = true;
          this.showSpinner = false;
          this.addLinkOpen = this.addLinkOpen === 'out' ? 'in' : 'out';
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
          this.photoAndLinkActionsDisabled = true;
          this.readyForPost = true;
          this.showSpinner = false;
          this.addLinkOpen = this.addLinkOpen === 'out' ? 'in' : 'out';
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
    this.photoAndLinkActionsDisabled = true;
    let fileType: string = 'post';
    this.uploadImageSvc.compressImageFile(event, (compressedFile: File) => {
      this.showSpinner = true;
      this.uploadImageSvc.uploadImage(compressedFile, fileType, (uploadedFileUrl: string) => {
        this.postPhotoUrl = uploadedFileUrl;
        this.readyForPost = true;
        this.showSpinner = false;
      });
    });
  }


  // When user clicks post, update the database
  onPost() {
    this.showSpinner = true;
    let postText = this.form.controls.post.value;
    this.forumSvc.addPost(this.groupID, postText, this.displayName, this.profileImageUrl, this.postPhotoUrl,
                          this.linkPreview.url, this.linkPreview.description, this.linkPreview.title, this.linkPreview.image,
                          this.yearOfBirth, this.rigLength)
    .subscribe(post => {
      this.onDoneWithAdd(post);
      this.showSpinner = false;
    }, error => {
      this.showSpinner = false;
      console.error('AddPostComponent:onPost: throw error ', error);
      throw new Error(error);
    });
  }


  onTextEntered() {
    if (this.form.controls.post.value) {
      if (this.addLinkInputEnabled && !this.form.controls.link.valid) {
        this.readyForPost = false;
      } else {
        this.readyForPost = true;
      }
    } else {
      if (this.postPhotoUrl || this.postLink) {
        this.readyForPost = true;
      } else {
        this.readyForPost = false;
      }
    }
  }
}
