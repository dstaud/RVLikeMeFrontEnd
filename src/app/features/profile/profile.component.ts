import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DataService } from './../../core/services/data.service';
import { Iuser } from './../../interfaces/user';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  user: Iuser;

  constructor(private dataSvc: DataService,
              public translate: TranslateService) {
              console.log('launched profile component');
              }

  ngOnInit() {
    this.dataSvc.getUserProfile().subscribe(user => {
      this.user = user;
      console.log(this.user);
    }, (err) => {
      console.error(err);
    });
  }

}
