import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { PageTitleService } from '../../core/services/page-title.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  pageTitle: Observable<string>;

  @Output() public sidenavToggle = new EventEmitter();

  constructor(private pageTitle$: PageTitleService) {
    this.pageTitle = this.pageTitle$.pageTitle$;
   }

  ngOnInit() {
  }

  public onToggleSidenav = () => {
    this.sidenavToggle.emit();
  }
}
