import { Component, OnInit, OnDestroy, Input } from '@angular/core';

import { Observable } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { ChartType, ChartOptions } from 'chart.js';
import { SingleDataSet, Label, monkeyPatchChartJsLegend, monkeyPatchChartJsTooltip } from 'ng2-charts';
import { TranslateService } from '@ngx-translate/core';

import { LikemeCountsService, IlikeMeCounts, IgroupByCounts } from '@services/data-services/likeme-counts.service';

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

  legend1: boolean = false;
  legend2: boolean = false;
  legend3: boolean = false;
  legend4: boolean = false;

  legend1Text: string = '';
  legend2Text: string = '';
  legend3Text: string = '';
  legend4Text: string = '';

  controlData: Array<number> = [];
  controlLegends: Array<Ilegend> = [];
  allUsersCount: number;

  showSpinner: boolean = false;
  showAllUsersCount: boolean = false;

  // Pie
  // pieChartData: SingleDataSet;
  pieChartData: SingleDataSet = this.controlData;
  pieChartOptions: ChartOptions = {
    responsive: true,
    tooltips: {enabled: false}
  };

  pieChartType: ChartType = 'pie';
  pieChartLegend = false;
  pieChartPlugins = [];

  chartColor: Array<string> = ['green','red','blue','black','yellow','orange','brown']

  chartColors: Array<any> = [
    { backgroundColor: this.chartColor}
  ]

  private groupByCounts: Observable<IgroupByCounts>;
  private likeMeCounts: Observable<IlikeMeCounts>;

  constructor(private likeMeCountsSvc: LikemeCountsService,
                      public translate: TranslateService) {
      // monkeyPatchChartJsTooltip();
      // monkeyPatchChartJsLegend();
  }

  ngOnInit(): void {
    console.log('AnalyticsComponent:ngOnInit:')
    this.listenForLikeMeCounts();

    this.listenForGroupByCounts(this.control);
  }

  ngOnDestroy() {}

  onChart(event: any) {
    console.log('Chart=', event);
  }

  private listenForGroupByCounts(control: string) {
    let legend: string = '';

    this.showSpinner = true;

    this.groupByCounts = this.likeMeCountsSvc.groupByCounts;
    this.groupByCounts
    .pipe(untilComponentDestroyed(this))
    .subscribe(counts => {
      console.log('AnalyticsComponent:listenForGroupByCounts: data=', counts);
      if (counts[control][0]._id !== '' && this.controlLegends.length === 0) {

        console.log('AnalyticsComponent:listenForGroupByCounts: data=', counts);
        for (let i=0; i < counts[control].length; i++) {
          this.controlData.push(counts[control][i].count);
          if (counts[control][i]._id === null) {
            legend = '{"label":"' + this.translate.instant('analytics.component.list.' + control.toLowerCase() +
                                    '.notdefined') + ': ' + counts[control][i].count + ' RVers' + '",' +
                      '"color":"' + this.chartColor[i] + '"}';
            this.controlLegends.push(JSON.parse(legend));
          } else if (counts[control][i]._id.substring(0,1) === '@') {
            legend = '{"label":"' + this.translate.instant('analytics.component.list.' + control.toLowerCase() +
                                    '.other') + ': ' + counts[control][i].count + ' RVers' + '",' +
                      '"color":"' + this.chartColor[i] + '"}';
            this.controlLegends.push(JSON.parse(legend));
          } else {
            legend = '{"label":"' + this.translate.instant('analytics.component.list.' + control.toLowerCase() + '.' +
                                    counts[control][i]._id.toLowerCase()) + ': ' + counts[control][i].count + ' RVers' + '",' +
                      '"color":"' + this.chartColor[i] + '"}';
            this.controlLegends.push(JSON.parse(legend));
          }
        }

        console.log('AnalyticsComponent:listenForGroupByCounts: counts array=', this.controlData);
        console.log('AnalyticsComponent:listenForGroupByCounts: counts label array=', this.controlLegends);

        this.legend4Text = '';

        this.showSpinner = false;
      }
    }, error => {
      console.log('AnalyticsComponent:listenForGroupByCounts: error=', error);
      this.showSpinner = false;
      throw new Error(error);
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
        this.showAllUsersCount = true;
      }

    }, (error) => {
      console.error(error);
    });
  }
}
