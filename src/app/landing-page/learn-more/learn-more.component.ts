import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { Router } from '@angular/router';

import { HeaderVisibleService } from '@services/header-visibility.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';

@Component({
  selector: 'app-rvlm-learn-more',
  templateUrl: './learn-more.component.html',
  styleUrls: ['./learn-more.component.scss']
})
export class LearnMoreComponent implements OnInit {

  constructor(private headerVisibleSvc: HeaderVisibleService,
              private activateBackArrowSvc: ActivateBackArrowService,
              private router: Router) { }

/*   @Input() state: boolean;
  @Output() toggle = new EventEmitter<boolean>(); */

  ngOnInit() {
  }

  registerUser() {
    this.headerVisibleSvc.toggleHeaderVisible(true);
    this.headerVisibleSvc.toggleHeaderDesktopVisible(false);
    this.router.navigateByUrl('/register');
    this.activateBackArrowSvc.setBackRoute('landing-page');
  }

/*   close() {
    this.toggle.emit(!this.state);
  } */
}
