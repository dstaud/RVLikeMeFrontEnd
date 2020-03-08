import { Component, OnInit, Output, EventEmitter } from '@angular/core';

import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { DeviceService } from '@services/device.service';

@Component({
  selector: 'app-rvlm-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  iPhoneXPlus = false;

  @Output() public sidenavToggle = new EventEmitter();

  constructor(private activateBackArrowSvc: ActivateBackArrowService,
              private deviceSvc: DeviceService) { }

  ngOnInit() {
    this.iPhoneXPlus = this.deviceSvc.iPhoneModelXPlus;
  }

  public onToggleSidenav = () => {
    this.sidenavToggle.emit();
  }
}
