import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';

import { ForumService } from '@services/data-services/forum.service';


@Component({
  selector: 'app-rvlm-add-post',
  templateUrl: './add-post.component.html',
  styleUrls: ['./add-post.component.scss']
})
export class AddPostComponent implements OnInit {

  @Input('groupID')
  public groupID: string;

  @Input('displayName')
  public displayName: string;

  @Input('profileImageUrl')
  public profileImageUrl: string;

  @Output() postAddComplete = new EventEmitter<string>();

  showSpinner = false;

  form: FormGroup;

  constructor(private forumSvc: ForumService,
              fb: FormBuilder) {
              this.form = fb.group({
                // title: new FormControl('', Validators.required),
                post: new FormControl('', Validators.required)
              });
  }

  ngOnInit() {
  }

  // Whether canceled or posted, send the appropriate data back up the chain
  doneWithAdd(post: any) {
    console.log('add-postComponent:doneWithAdd: post=', post);
    this.postAddComplete.emit(post);
  }


  // When user clicks post, update the database
  onPost() {
    this.showSpinner = true;
    // let postTitle = this.form.controls.title.value;
    let postText = this.form.controls.post.value;
    this.forumSvc.addPost(this.groupID, postText, this.displayName, this.profileImageUrl)
    .subscribe(post => {
      console.log('add-postComponent:onPost: post result=', post);
      this.doneWithAdd(post);
      this.showSpinner = false;
    }, error => {
      console.log(error);
      this.showSpinner = false;
    });
  }
}
