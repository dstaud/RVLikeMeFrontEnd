import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { InewbieTopic } from '@services/share-data.service';
import { TopicComponent } from './../newbie-topics/topic/topic.component';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  @ViewChild(TopicComponent)
  public topic: TopicComponent;

  constructor(private router: Router) { }

  ngOnInit(): void {
    if (window.innerWidth <= 600) {
      this.router.navigateByUrl('newbie/newbie-corner');
    }
  }

  onTopicSelected(topicParams: InewbieTopic) {
    this.topic.newbieInit(topicParams);
  }

}
