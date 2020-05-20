import { Component, OnInit, Input } from '@angular/core';

import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { HeaderVisibleService } from '@services/header-visibility.service';
import { DeviceService } from '@services/device.service';

@Component({
  selector: 'app-terms-of-service',
  templateUrl: './terms-of-service.component.html',
  styleUrls: ['./terms-of-service.component.scss']
})
export class TermsOfServiceComponent implements OnInit {
  @Input('containerDialog') containerDialog: boolean;

  constructor(private headerVisibleSvc: HeaderVisibleService,
              private activateBackArrowSvc: ActivateBackArrowService,
              private device: DeviceService) {
          if (!this.containerDialog) {
            this.headerVisibleSvc.toggleHeaderVisible(true);
          }
  }

  ngOnInit(): void {
  }

  getClass() {
    let containerClass: string;
    let bottomSpacing: string;

    if (this.containerDialog) {
      containerClass = 'container-desktop';
    } else {
      if (this.device.iPhoneModelXPlus) {
        bottomSpacing = 'bottom-bar-spacing-xplus';
      } else {
        bottomSpacing = 'bottom-bar-spacing';
      }
      containerClass = 'container ' + bottomSpacing;
    }

    return containerClass;
  }
}
