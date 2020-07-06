import { startWith } from 'rxjs/operators';
import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Router } from '@angular/router';

import { Observable } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { ChartType, ChartOptions } from 'chart.js';
import { SingleDataSet } from 'ng2-charts';
import { TranslateService } from '@ngx-translate/core';

import { LikemeCountsService, IlikeMeCounts, IgroupByCounts } from '@services/data-services/likeme-counts.service';
import { ActivateBackArrowService } from '@core/services/activate-back-arrow.service';
import { ShareDataService, IdashboardDrilldown } from './../../../core/services/share-data.service';
import { SentryMonitorService } from '@services/sentry-monitor.service';

export interface Ilegend {
  label: string,
  color: string
}

@Component({
  selector: 'app-rvlm-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss']
})
export class AnalyticsComponent implements OnInit {
  @Input('control') control: string;
  @Input('theme') theme: string;

  controlData: Array<number> = [];
  controlLegends: Array<Ilegend> = [];
  allUsersCount: number;

  showSpinner: boolean = false;
  showAllUsersCount: boolean = false;

  // Pie Chart Configuration
  pieChartData: SingleDataSet = this.controlData;
  pieChartOptions: ChartOptions = {
    responsive: true,
    tooltips: {enabled: false}
  };
  pieChartType: ChartType = 'pie';
  pieChartLegend = false;
  pieChartPlugins = [];
  chartColor: Array<string> = ['green','red','blue','black','purple','orange','brown','gray']
  chartColors: Array<any> = [
    { backgroundColor: this.chartColor}
  ]

  private groupByCounts: Observable<IgroupByCounts>;
  private likeMeCounts: Observable<IlikeMeCounts>;

  constructor(private likeMeCountsSvc: LikemeCountsService,
              private translate: TranslateService,
              private router: Router,
              private shareDataSvc: ShareDataService,
              private sentry: SentryMonitorService,
              private activateBackArrowSvc: ActivateBackArrowService) {
  }

  ngOnInit(): void {
    this.listenForLikeMeCounts();

    this.listenForGroupByCounts(this.control);
  }

  ngOnDestroy() {}


  onChart() {
    let params:IdashboardDrilldown = {
      control: this.control
    }

    this.shareDataSvc.setData('dashboardDrilldown', params);

    this.activateBackArrowSvc.setBackRoute('home/dashboard', 'forward');
    this.router.navigateByUrl('/home/dashboard-drilldown');
  }


  private countsTotal(counts: IgroupByCounts, control): number {
    let total = 0;

    for (let i = 0; i < counts[control].length; i++) {
      total = total + counts[control][i].count;
    }

    return total;
  }


  private listenForGroupByCounts(control: string) {
    this.showSpinner = true;

    this.groupByCounts = this.likeMeCountsSvc.groupByCounts;
    this.groupByCounts
    .pipe(untilComponentDestroyed(this))
    .subscribe(counts => {
      if (counts[control][0]._id !== '' && this.controlLegends.length === 0) {

        this.processCounts(control, counts);


        this.showSpinner = false;
      }
    }, error => {
      this.sentry.logError('AnalyticsComponent:listenForGroupByCounts: error listening for Group By Counts=' + JSON.stringify(error));
      this.showSpinner = false;
    });
  }

  // Listen for Like Me counts for total user count
  private listenForLikeMeCounts() {
    this.likeMeCounts = this.likeMeCountsSvc.likeMeCounts;
    this.likeMeCounts
    .pipe(untilComponentDestroyed(this))
    .subscribe(data => {
      this.allUsersCount = data.allUsersCount;

      if (this.allUsersCount > 0) {
        // this.showAllUsersCount = true;
      }
    }, error => {
      this.sentry.logError(JSON.stringify({"message":"unable to listen for like me counts","error":error}));
    });
  }

  private processCounts(control: string, counts: IgroupByCounts) {
    let legend: string = '';
    let otherCount: number = 0;
    let percentOfTotal: number = 0;
    let totalCount: number = 0;
    let otherPercent: number = 100;

    totalCount = this.countsTotal(counts, control);

    if (control === 'rigType') {
      this.processRigTypeCounts(control, counts);
    } else {
      for (let i=0; i < counts[control].length; i++) {
        if (counts[control][i]._id === null || counts[control][i]._id === 'null' || counts[control][i]._id.startsWith('@')) {
          otherCount = otherCount + counts[control][i].count;
        } else {
          percentOfTotal = Math.round(counts[control][i].count / totalCount * 100);
          this.controlData.push(percentOfTotal);
          otherPercent = otherPercent - percentOfTotal;
          if (counts[control][i]._id === null) {
            legend = '{"label":"' + this.translate.instant('analytics.component.list.' + control.toLowerCase() +
                                    '.notdefined') + ': ' + percentOfTotal + '%' + '",' +
                      '"color":"' + this.chartColor[i] + '"}';
            this.controlLegends.push(JSON.parse(legend));
          } else if (counts[control][i]._id.startsWith('@')) {
            legend = '{"label":"' + this.translate.instant('analytics.component.list.' + control.toLowerCase() +
                                    '.other') + ': ' + percentOfTotal + '%' + '",' +
                      '"color":"' + this.chartColor[i] + '"}';
            this.controlLegends.push(JSON.parse(legend));
          } else {
            legend = '{"label":"' + this.translate.instant('analytics.component.list.' + control.toLowerCase() + '.' +
                                    counts[control][i]._id.toLowerCase()) + ': ' + percentOfTotal + '%' + '",' +
                      '"color":"' + this.chartColor[i] + '"}';
            this.controlLegends.push(JSON.parse(legend));
          }
        }
      }
      if (otherPercent > 0) {
        legend = '{"label":"' + this.translate.instant('analytics.component.list.' + control.toLowerCase() + '.other') +
                  ': ' + otherPercent + '%' + '",' +
                  '"color":"' + this.chartColor[counts[control].length - 1] + '"}';
        this.controlLegends.push(JSON.parse(legend));
        this.controlData.push(otherPercent);
      }
    }
  }


  // Special processing for rigType because there are too many for a dashboard.  Aggregating them into smaller categories
  private processRigTypeCounts(control: string, counts: IgroupByCounts) {
    let legend: string = '';
    let motorhomeCount: number = 0;
    let trailerCount: number = 0;
    let otherCount: number = 0;
    let percentOfTotal: number = 0;
    let totalCount: number = 0;
    let otherPercent: number = 100;

    totalCount = this.countsTotal(counts, control);

    for (let i=0; i < counts[control].length; i++) {
      if (counts[control][i]._id === null || counts[control][i]._id === 'null' || counts[control][i]._id.startsWith('@')) {
        otherCount = otherCount + counts[control][i].count;
      } else if (counts[control][i]._id.toLowerCase() === 'a' ||
          counts[control][i]._id.toLowerCase() === 'b' ||
          counts[control][i]._id.toLowerCase() === 'c' ||
          counts[control][i]._id.toLowerCase() === 'sc' ||
          counts[control][i]._id.toLowerCase() === 'van' ||
          counts[control][i]._id.toLowerCase() === 'cb' ||
          counts[control][i]._id.toLowerCase() === 'tc') {
            motorhomeCount = motorhomeCount + counts[control][i].count;
      } else if (counts[control][i]._id.toLowerCase() === 'fw' ||
                  counts[control][i]._id.toLowerCase() === 'tt' ||
                  counts[control][i]._id.toLowerCase() === 'ft') {
            trailerCount = trailerCount + counts[control][i].count;
      } else {
            otherCount = otherCount + counts[control][i].count;
      }
    }

    percentOfTotal = Math.round(motorhomeCount / totalCount * 100);
    this.controlData.push(percentOfTotal);
    otherPercent = otherPercent - percentOfTotal;

    percentOfTotal = Math.round(trailerCount / totalCount * 100);
    this.controlData.push(percentOfTotal);
    otherPercent = otherPercent - percentOfTotal;

    this.controlData.push(otherPercent);

    legend = '{"label":"' + this.translate.instant('analytics.component.list.rigtypeagg.motorhome') + ': ' +
              this.controlData[0] + '%'+ '","color":"' + this.chartColor[0] + '"}';
    this.controlLegends.push(JSON.parse(legend));
    legend = '{"label":"' + this.translate.instant('analytics.component.list.rigtypeagg.trailer') + ': ' +
              this.controlData[1] + '%'+ '","color":"' + this.chartColor[1] + '"}';
    this.controlLegends.push(JSON.parse(legend));
    legend = '{"label":"' + this.translate.instant('analytics.component.list.rigtypeagg.other') + ': ' +
              this.controlData[2] + '%' + '","color":"' + this.chartColor[2] + '"}';
    this.controlLegends.push(JSON.parse(legend));
  }
}
