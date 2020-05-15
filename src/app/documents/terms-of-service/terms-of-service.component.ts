import { Component, OnInit, Input } from '@angular/core';

import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { HeaderVisibleService } from '@services/header-visibility.service';

@Component({
  selector: 'app-terms-of-service',
  templateUrl: './terms-of-service.component.html',
  styleUrls: ['./terms-of-service.component.scss']
})
export class TermsOfServiceComponent implements OnInit {
  @Input('containerDialog') containerDialog: boolean;

  constructor(private headerVisibleSvc: HeaderVisibleService,
              private activateBackArrowSvc: ActivateBackArrowService) {
          if (!this.containerDialog) {
            this.headerVisibleSvc.toggleHeaderVisible(true);
          }
  }

  ngOnInit(): void {
  }

}
