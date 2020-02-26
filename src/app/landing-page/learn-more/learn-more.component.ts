import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { HeaderVisibleService } from '@services/header-visibility.service';

@Component({
  selector: 'app-rvlm-learn-more',
  templateUrl: './learn-more.component.html',
  styleUrls: ['./learn-more.component.scss']
})
export class LearnMoreComponent implements OnInit {

  constructor(private headerVisibleSvc: HeaderVisibleService) { }

  @Input() state: boolean;
  @Output() toggle = new EventEmitter<boolean>();

  ngOnInit() {
    this.headerVisibleSvc.toggleSigninButtonVisible(true);
  }

  close() {
    this.toggle.emit(!this.state);
  }
}
