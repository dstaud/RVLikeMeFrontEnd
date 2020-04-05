import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';

import { ForumService } from '@services/data-services/forum.service';

@Component({
  selector: 'app-rvlm-update-post',
  templateUrl: './update-post.component.html',
  styleUrls: ['./update-post.component.scss']
})
export class UpdatePostComponent implements OnInit {

  @Input('postIndex')
  public postIndex: number;

  @Input('postID')
  public postID: string;

  @Input('postTitle')
  public postTitle: string;

  @Input('postBody')
  public postBody: string;


  @Output() postUpdateComplete = new EventEmitter<any>();

  form: FormGroup;
  showSpinner = false;

  constructor(private forumSvc: ForumService,
    fb: FormBuilder) {
    this.form = fb.group({
      title: new FormControl('', Validators.required),
      body: new FormControl('', Validators.required)
    });
}

  ngOnInit(): void {
    console.log(this.postID, this.postTitle, this.postBody)
  }

  populatePost() {
    this.form.patchValue({ 'title': this.postTitle });
    this.form.patchValue({ 'body': this.postBody });
  }

  doneWithUpdate(post: any) {
    let result = [];
    let postIndex = JSON.parse('{"postIndex":"' + this.postIndex + '"}');
    result.push(postIndex);
    result.push(post);
    console.log('update-post:doneWithUpdate: result=', result);
    this.postUpdateComplete.emit(result);
  }

  onPost() {
    this.showSpinner = true;
    let postTitle = this.form.controls.title.value;
    let postBody = this.form.controls.body.value;
    this.forumSvc.updatePost(this.postID, postTitle, postBody)
    .subscribe(postResult => {
      console.log('update-post:onPost post result=', postResult);
      this.doneWithUpdate(postResult);
      this.showSpinner = false;
    }, error => {
      console.log(error);
      this.showSpinner = false;
    });
  }
}
