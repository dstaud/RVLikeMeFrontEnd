import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ThemeService } from '../../core/services/theme.service';
import { TranslateService } from '@ngx-translate/core';
import { PageTitleService } from './../../core/services/page-title.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(public translate: TranslateService,
              private themeService: ThemeService,
              private pageTitle: PageTitleService) { }

  ngOnInit() {
    this.pageTitle.setPageTitle(this.translate.instant('home.component.header'));
  }

}
