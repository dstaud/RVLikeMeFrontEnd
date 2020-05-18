import { UploadImageService } from '@services/data-services/upload-image.service';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';

import { ForumService } from '@services/data-services/forum.service';
import { LinkPreviewService, IlinkPreview } from '@services/link-preview.service';


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
  postPhotoUrl: string = '';
  formCompleted: boolean = false;
  showSpinner = false;
  actionsDisabled = false;
  linkEntry: boolean = false;
  showPreview: boolean = false;
  preview: IlinkPreview = {
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
    this.actionsDisabled = true;
    this.linkEntry = true;
    // need a way to let them enter the link and need a way to store it and then present it.
  }


  // Whether canceled or posted, send the appropriate data back up the chain
  onDoneWithAdd(post: any) {
    this.actionsDisabled = false;
    this.postPhotoUrl = '';
    if (this.preview) {
      this.preview.description = '';
      this.preview.image = '';
      this.preview.title = '';
      this.preview.url = '';
    }
    this.showPreview = false;
    this.form.reset();
    this.postAddComplete.emit(post);
  }


  // As user to upload image, compress and orient the image and upload to server to store.  Save the URL to store with the post
  onPhoto(event: any) {
    this.actionsDisabled = true;
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
    let postText = this.form.controls.post.value;
    this.forumSvc.addPost(this.groupID, postText, this.displayName, this.profileImageUrl, this.postPhotoUrl, this.preview.url)
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
    this.formCompleted = true;
  }

  onLink() {
    let postValue: string;

    this.linkPreviewSvc.getLinkPreview(this.form.controls.link.value)
    .subscribe(preview => {
      console.log('AddPostComponent:onLink: preview=', preview);
      this.preview = preview;
      console.log('AppPostComponent:onLink: url=', this.preview.url);
      if (this.preview.url.substring(0,7) == 'http://') {
        this.preview.url = this.preview.url.substring(7,this.preview.url.length);
      } else if (this.form.controls.link.value.substring(0,8) === 'https://') {
        this.preview.url = this.preview.url.substring(8,this.preview.url.length);
      }

      if (!this.preview.title) {
        this.preview.title = this.preview.url;
      }

      this.showPreview = true;
      this.linkEntry = false;
      this.formCompleted = true;
    }, error => {
      console.log('AddPostComponent:onLink: no link found');
      this.preview.url = this.form.controls.link.value;
      if (this.preview.url.substring(0,7) == 'http://') {
        this.preview.url = this.preview.url.substring(7,this.preview.url.length);
      } else if (this.form.controls.link.value.substring(0,8) === 'https://') {
        this.preview.url = this.preview.url.substring(8,this.preview.url.length);
      }
      this.preview.title = this.preview.url;
      this.form.reset();
      this.showPreview = true;
      this.linkEntry = false;
      this.formCompleted = true;

    })
  }
}
