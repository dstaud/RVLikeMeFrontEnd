import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ActivateBackArrowService } from './../../core/services/activate-back-arrow.service';

@Component({
  selector: 'app-rvlm-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  @Output() public sidenavToggle = new EventEmitter();

  constructor(private activateBackArrowSvc: ActivateBackArrowService) { }

  ngOnInit() {

  }

  public onToggleSidenav = () => {
    this.sidenavToggle.emit();
  }
}
