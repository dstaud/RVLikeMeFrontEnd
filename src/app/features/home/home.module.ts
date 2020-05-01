import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { ChartsModule } from 'ng2-charts';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { SharedModule } from '../../shared/shared.module';
import { ProfilePercentComponent } from './profile-percent/profile-percent.component';
import { LikemeCountsComponent } from './likeme-counts/likeme-counts.component';
import { AnalyticsComponent } from './analytics/analytics.component';

@NgModule({
  declarations: [
    HomeComponent,
    ProfilePercentComponent,
    LikemeCountsComponent,
    AnalyticsComponent
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    SharedModule,
    ReactiveFormsModule,
    ChartsModule
  ]
})
export class HomeModule { }
