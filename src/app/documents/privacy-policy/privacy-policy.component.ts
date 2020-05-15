import { Component, OnInit, AfterViewInit, Input } from '@angular/core';

import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { HeaderVisibleService } from '@services/header-visibility.service';

@Component({
  selector: 'app-privacy-policy',
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.scss']
})
export class PrivacyPolicyComponent implements OnInit {
  @Input('containerDialog') containerDialog: boolean;

  constructor(private headerVisibleSvc: HeaderVisibleService,
              private activateBackArrowSvc: ActivateBackArrowService) {
          if (!this.containerDialog) {
            this.headerVisibleSvc.toggleHeaderVisible(true);
          }
   }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    let scrollToTop = window.setInterval(() => {
      let pos = window.pageYOffset;
      if (pos > 0) {
          window.scrollTo(0, pos - 20); // how far to scroll on each step
      } else {
          window.clearInterval(scrollToTop);
      }
  }, 16);
  }
}
