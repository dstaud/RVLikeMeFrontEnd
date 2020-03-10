import { Component, OnInit, OnDestroy } from '@angular/core';

import { Observable } from 'rxjs';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { TranslateService } from '@ngx-translate/core';

import { LikemeCountsService, IlikeMeCounts } from '@services/data-services/likeme-counts.service';

import { SharedComponent } from '@shared/shared.component';

@Component({
  selector: 'app-rvlm-likeme-counts',
  templateUrl: './likeme-counts.component.html',
  styleUrls: ['./likeme-counts.component.scss']
})
export class LikemeCountsComponent implements OnInit {
  allUserCount: number;

  private likeMeCounts: Observable<IlikeMeCounts>;

  constructor(private translate: TranslateService,
              private likeMeCountSvc: LikemeCountsService) { }

  ngOnInit() {
    this.likeMeCounts = this.likeMeCountSvc.likeMeCounts;
    this.likeMeCountSvc.getLikeMeCounts();

    this.likeMeCounts
    .pipe(untilComponentDestroyed(this))
    .subscribe(data => {
      console.log('in like me counts=', data);
      this.allUserCount = data.allUsersCount;
      console.log('User Count=', data.allUsersCount);
    });
  }

  ngOnDestroy() {}
}
