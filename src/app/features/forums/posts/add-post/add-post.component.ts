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

  showSpinner = false;

  form: FormGroup;

  constructor(private forumSvc: ForumService,
              fb: FormBuilder) {
              this.form = fb.group({
                post: new FormControl('', Validators.required)
              });
  }

  ngOnInit() {
  }

  // Whether canceled or posted, send the appropriate data back up the chain
  doneWithAdd(post: any) {
    this.postAddComplete.emit(post);
  }


  // When user clicks post, update the database
  onPost() {
    this.showSpinner = true;
    // let postTitle = this.form.controls.title.value;
    let postText = this.form.controls.post.value;
    this.forumSvc.addPost(this.groupID, postText, this.displayName, this.profileImageUrl)
    .subscribe(post => {
      this.doneWithAdd(post);
      this.showSpinner = false;
    }, error => {
      this.showSpinner = false;
      console.log('AddPostComponent:onPost: throw error ', error);
      throw new Error(error);
    });
  }
}
