import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PageTitleService } from './../../core/services/page-title.service';

@Component({
  selector: 'app-connections',
  templateUrl: './connections.component.html',
  styleUrls: ['./connections.component.scss']
})
export class ConnectionsComponent implements OnInit {

  constructor(public translate: TranslateService,
              private pageTile: PageTitleService) {
                console.log('launched connections component');
              }

  ngOnInit() {
    this.pageTile.setPageTitle(this.translate.instant('connections.component.header'));
  }

}
