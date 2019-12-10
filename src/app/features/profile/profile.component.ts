import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PageTitleService } from './../../core/services/page-title.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  constructor(public translate: TranslateService,
              private pageTitle: PageTitleService) {
              console.log('launched profile component');
              }

  ngOnInit() {
    this.pageTitle.setPageTitle(this.translate.instant('profile.component.header'));
  }

}
