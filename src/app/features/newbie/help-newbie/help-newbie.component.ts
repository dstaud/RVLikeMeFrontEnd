import { Component, OnInit } from '@angular/core';

export interface Itopics {
  _id: string;
  topicID: string;
  topicDesc: string;
}

@Component({
  selector: 'app-rvlm-help-newbie',
  templateUrl: './help-newbie.component.html',
  styleUrls: ['./help-newbie.component.scss']
})

export class HelpNewbieComponent implements OnInit {
  displayName: string;
  profileImageUrl: string;
  authorizedTopics: Array<Itopics> = [];

  constructor() { }

  ngOnInit(): void {
  }
}
