import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PageTitleService } from './../../core/services/page-title.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {

  constructor(public translate$: TranslateService,
              private pageTitle$: PageTitleService) {
                console.log('launched about component');
              }

  ngOnInit() {
    this.pageTitle$.setPageTitle(this.translate$.instant('about.component.header'));
  }

}
