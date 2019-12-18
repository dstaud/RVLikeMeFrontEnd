import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-learn-more',
  templateUrl: './learn-more.component.html',
  styleUrls: ['./learn-more.component.scss']
})
export class LearnMoreComponent implements OnInit {

  constructor() { }

  @Input() state: boolean;
  @Output() toggle = new EventEmitter<boolean>();

  ngOnInit() {
  }

  close() {
    console.log('close button');
    this.toggle.emit(!this.state);
  }
}
