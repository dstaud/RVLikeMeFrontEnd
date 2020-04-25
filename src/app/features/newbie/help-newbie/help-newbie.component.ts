import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { NewbieTopicsService } from '@services/data-services/newbie-topics.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { ShareDataService } from '@services/share-data.service';

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

  constructor(private newbieTopicsSvc: NewbieTopicsService,
              private shareDataSvc: ShareDataService,
              private activateBackArrowSvc: ActivateBackArrowService,
              private router: Router) { }

  ngOnInit(): void {
    let paramData: any;

    if (!this.shareDataSvc.getData()) {
      console.log('HelpNewbieTopics:ngOnInit: data=', this.shareDataSvc.getData());
      this.router.navigateByUrl('/home');
    } else {
      console.log('HelpNewbieTopics:ngOnInit: data=', this.shareDataSvc.getData());
      paramData = JSON.parse(this.shareDataSvc.getData());
      this.displayName = paramData.displayName;
      this.profileImageUrl = paramData.profileImageUrl;
    }

    this.getAuthorizedTopics();

    this.getTopics();

  }

  onTopic(topicID: string, topicDesc: string) {
    let params: string;

    console.log('HelpNewbieTopics:onTopic: checking topic=', topicID);
    if (!this.findTopic(topicID)) {
      console.log('HelpNewbieTopics:onTopic: topic not found, adding topic=', topicID);
      this.newbieTopicsSvc.addNewbieTopic(topicID,  topicDesc, this.displayName, this.profileImageUrl)
      .subscribe(topicResult => {
        console.log('HelpNewbieTopics:onTopic: topic added=', topicResult);
      }, error => {
        if (error.status === 403) {
          console.log('HelpNewbieTopics:onTopic: error=', error.message);
        } else {
          throw new Error(error);
        }
      });
    }

    params = '{"forumType":"topic","topic":"' + topicID + '","topicDesc":"' + topicDesc + '" }'
    this.shareDataSvc.setData(params);
    this.activateBackArrowSvc.setBackRoute('newbie/help-newbie');
    this.router.navigateByUrl('/forums');
  }


  private findTopic(topicID: string): boolean {
    let foundTopic: boolean = false;

    for (let i=0; i < this.authorizedTopics.length; i++) {
      if (topicID === this.authorizedTopics[i].topicID) {
        if (this.authorizedTopics[i]._id) {
          foundTopic = true;
          break;
        }
      }
    }
    return foundTopic;
  }


  private getAuthorizedTopics() {
    this.authorizedTopics.push(JSON.parse('{"_id":"","topicID":"internet","topicDesc":"Internet Connectivity"}'));
    this.authorizedTopics.push(JSON.parse('{"_id":"","topicID":"insurance","topicDesc":"Insuring an RV"}'));
    this.authorizedTopics.push(JSON.parse('{"_id":"","topicID":"costFullTimeTravel","topicDesc":"How much does it cost to full-time travel?"}'));
    this.authorizedTopics.push(JSON.parse('{"_id":"","topicID":"makingMoneyOnTheRoad","topicDesc":"Making money on the road"}'));
    this.authorizedTopics.push(JSON.parse('{"_id":"","topicID":"savingMoney","topicDesc":"Money-saving ideas"}'));
    this.authorizedTopics.push(JSON.parse('{"_id":"","topicID":"sellingHouse","topicDesc":"Selling house and possessions to go full-time"}'));
    this.authorizedTopics.push(JSON.parse('{"_id":"","topicID":"thingsYouNeedFullTime","topicDesc":"Things you need when going full-time"}'));
  }


  private getTopics() {
    this.newbieTopicsSvc.getNewbieTopics()
    .subscribe(topicsResult => {
      console.log('HelpNewbieTopicsComponent:getTopics: result=', topicsResult);
      for (let i=0; i < topicsResult.length; i++) {
        this.updateAuthorizedTopics(topicsResult[i].topicID, topicsResult[i]._id);
      }
      console.log('HelpNewbieTopicsComponent:getTopics: auth=', this.authorizedTopics);
    })
  }


  private updateAuthorizedTopics(topicID: string, _id: string) {
    for (let i=0; i < this.authorizedTopics.length; i++) {
      console.log('HelpNewbieTopicsComponent:updateAuthorizedTopics: looking for topic ', topicID)
      if (topicID === this.authorizedTopics[i].topicID) {
        console.log('HelpNewbieTopicsComponent:updateAuthorizedTopics: found id ', topicID)
        this.authorizedTopics[i]._id = _id;
        console.log('HelpNewbieTopicsComponent:updateAuthorizedTopics: updated array=', this.authorizedTopics[i]);
      }
    }
  }
}
