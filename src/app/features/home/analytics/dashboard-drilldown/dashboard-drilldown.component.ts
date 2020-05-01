import { Component, OnInit, OnDestroy } from '@angular/core';

import { Observable } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { TranslateService } from '@ngx-translate/core';

import { ShareDataService } from '@services/share-data.service';
import { LikemeCountsService, IgroupByCounts } from '@services/data-services/likeme-counts.service';

@Component({
  selector: 'app-rvlm-dashboard-drilldown',
  templateUrl: './dashboard-drilldown.component.html',
  styleUrls: ['./dashboard-drilldown.component.scss']
})
export class DashboardDrilldownComponent implements OnInit {
  control: string;
  showSpinner: boolean = false;
  groupData: Array<string> = [];

  private groupByCounts: Observable<IgroupByCounts>;

  constructor(private shareDataSvc: ShareDataService,
              private likeMeCountsSvc: LikemeCountsService,
              private translate: TranslateService) { }

  ngOnInit(): void {
    let params: any;

    params = this.shareDataSvc.getData();
    this.control = JSON.parse(params).control;

    console.log('DashboardDrilldownComponent:ngOnInit: control=', this.control);

    this.listenForGroupByCounts(this.control);
  }

  ngOnDestroy() {}

  private listenForGroupByCounts(control: string) {
    this.showSpinner = true;

    this.groupByCounts = this.likeMeCountsSvc.groupByCounts;
    this.groupByCounts
    .pipe(untilComponentDestroyed(this))
    .subscribe(counts => {
      console.log('DashboardDrilldownComponent:listenForGroupByCounts: data=', counts);
      if (counts[control][0]._id !== '') {
        this.processCounts(control, counts);
        this.showSpinner = false;
      }
    }, error => {
      console.log('DashboardDrilldownComponent:listenForGroupByCounts: error=', error);
      this.showSpinner = false;
      throw new Error(error);
    });
  }


  private processCounts(control: string, counts: IgroupByCounts) {
    let group: string = '';

    console.log('DashboardDrilldownComponent:processCounts: data=', counts);

    for (let i=0; i < counts[control].length; i++) {

      if (counts[control][i]._id === null) {
        group = this.translate.instant('analytics.component.list.' + control.toLowerCase() +
                                '.notdefined') + ': ' + counts[control][i].count + ' RVers';
        this.groupData.push(group);
      } else if (counts[control][i]._id.substring(0,1) === '@') {
        group = this.translate.instant('analytics.component.list.' + control.toLowerCase() +
                                '.other') + ': ' + counts[control][i].count + ' RVers';
        this.groupData.push(group);
      } else {
        group = this.translate.instant('analytics.component.list.' + control.toLowerCase() + '.' +
                                counts[control][i]._id.toLowerCase()) + ': ' + counts[control][i].count + ' RVers';
        this.groupData.push(group);
      }
    }

    console.log('DashboardDrilldownComponent:processCounts: counts label array=', this.groupData);
  }
}
