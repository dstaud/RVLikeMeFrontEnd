import { Component, OnInit, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

import { Observable } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { TranslateService } from '@ngx-translate/core';

import { ShareDataService } from '@services/share-data.service';
import { LikemeCountsService, IgroupByCounts } from '@services/data-services/likeme-counts.service';
import { AuthenticationService } from '@services/data-services/authentication.service';
import { ActivateBackArrowService } from '@services/activate-back-arrow.service';
import { DeviceService } from '@services/device.service';
import { SentryMonitorService } from '@services/sentry-monitor.service';

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
              private activateBackArrowSvc: ActivateBackArrowService,
              private authSvc: AuthenticationService,
              private location: Location,
              private router: Router,
              private sentry: SentryMonitorService,
              private device: DeviceService,
              private translate: TranslateService) {
                let backPath;
                let params: any;
                if (!this.authSvc.isLoggedIn()) {
                  backPath = this.location.path().substring(1, this.location.path().length);
                  this.activateBackArrowSvc.setBackRoute('*' + backPath, 'forward');
                  this.router.navigateByUrl('/?e=signin');
                } else {
                  params = this.shareDataSvc.getData('dashboardDrilldown');
                  if (params.control) {
                    this.control = params.control;

                    this.listenForGroupByCounts(this.control);
                  } else {
                    this.router.navigateByUrl('/home/dashboard');
                  }
                }
               }

  ngOnInit(): void {
    let self = this;

    window.onpopstate = function(event) {
      self.activateBackArrowSvc.setBackRoute('', 'backward');
    };

  }

  ngOnDestroy() {}


  getClass() {
    let containerClass: string;
    let bottomSpacing: string;

    if (this.device.iPhoneModelXPlus) {
      bottomSpacing = 'bottom-bar-spacing-xplus';
    } else {
      bottomSpacing = 'bottom-bar-spacing';
    }
    containerClass = 'container ' + bottomSpacing;

    return containerClass;
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
      if (counts[control][0]._id !== '') {
        this.processCounts(control, counts);
        this.showSpinner = false;
      }
    }, error => {
      this.sentry.logError('DashboardDrilldownComponent:listenForGroupByCounts: error=' + JSON.stringify(error));
      this.showSpinner = false;
    });
  }


  private processCounts(control: string, counts: IgroupByCounts) {
    let group: string = '';
    let totalCount = this.countsTotal(counts, control);
    let percentOfTotal: number = 0;

    for (let i=0; i < counts[control].length; i++) {
      percentOfTotal = Math.round(counts[control][i].count / totalCount * 100);
      if (counts[control][i]._id === null) {
        group = this.translate.instant('analytics.component.list.' + control.toLowerCase() +
                                '.notdefined') + ': ' + percentOfTotal + '%';
        this.groupData.push(group);
      } else if (counts[control][i]._id.startsWith('@')) {
        group = counts[control][i]._id.substring(1, counts[control][i]._id.length) + ': ' + percentOfTotal + '%';
        this.groupData.push(group);
      } else {
        group = this.translate.instant('analytics.component.list.' + control.toLowerCase() + '.' +
                                counts[control][i]._id.toLowerCase()) + ': ' + percentOfTotal + '%';
        this.groupData.push(group);
      }
    }
  }
}
