import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

import { DeviceService } from '@services/device.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';

@Component({
  selector: 'app-rvlm-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  iPhoneXPlus = false;

  @Output() public sidenavToggle = new EventEmitter();

  constructor(private deviceSvc: DeviceService,
              private activateBackArrowSvc: ActivateBackArrowService,
              private router: Router) { }

  ngOnInit() {
    // Make adjustment for extra space needed for iPhonePlus models
    this.iPhoneXPlus = this.deviceSvc.iPhoneModelXPlus;
  }


  onRoute() {
    this.activateBackArrowSvc.setBackRoute('');
  }


  onToggleSidenav = () => {
    this.sidenavToggle.emit();
  }
}
