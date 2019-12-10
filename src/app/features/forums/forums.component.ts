import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PageTitleService } from './../../core/services/page-title.service';

@Component({
  selector: 'app-forums',
  templateUrl: './forums.component.html',
  styleUrls: ['./forums.component.scss']
})
export class ForumsComponent implements OnInit {

  constructor(public translate: TranslateService,
              private pageTitle: PageTitleService) {
              console.log('launched forums component');
              }

  ngOnInit() {
    this.pageTitle.setPageTitle(this.translate.instant('forums.component.header'));
  }

}
