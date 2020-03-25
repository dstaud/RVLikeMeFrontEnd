import { Component, OnInit, Input } from '@angular/core';
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

  form: FormGroup;

  constructor(private forumSvc: ForumService,
              fb: FormBuilder) {
              this.form = fb.group({
                title: new FormControl('', Validators.required),
                post: new FormControl('', Validators.required)
              });
  }

  ngOnInit() {
  }

  onCancel() {
    console.log('cancel');
  }

  onPost() {
    let postTitle = this.form.controls.title.value;
    let postText = this.form.controls.post.value;
    this.forumSvc.addPost(this.groupID, postTitle, postText, this.displayName, this.profileImageUrl)
    .subscribe(post => {
      console.log('POST RESULT=', post);
    }, error => {
      console.log(error);
    });
  }
}
