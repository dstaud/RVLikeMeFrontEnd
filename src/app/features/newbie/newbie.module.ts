import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NewbieRoutingModule } from './newbie-routing.module';
import { NewbieComponent } from './newbie.component';

import { SharedModule } from '@shared/shared.module';
import { NewbieTopicsComponent } from './newbie-topics/newbie-topics.component';
import { InternetComponent } from './newbie-topics/internet/internet.component';
import { HelpNewbieComponent } from './help-newbie/help-newbie.component';
import { InsuranceComponent } from './newbie-topics/insurance/insurance.component';
import { CostFtTravelComponent } from './newbie-topics/cost-ft-travel/cost-ft-travel.component';
import { MakingMoneyComponent } from './newbie-topics/making-money/making-money.component';
import { SavingMoneyComponent } from './newbie-topics/saving-money/saving-money.component';
import { SellingHouseComponent } from './newbie-topics/selling-house/selling-house.component';
import { ThingsNeedFtComponent } from './newbie-topics/things-need-ft/things-need-ft.component';
import { NeedHelpNewbieComponent } from './need-help-newbie/need-help-newbie.component';


@NgModule({
  declarations: [
    NewbieComponent,
    NewbieTopicsComponent,
    InternetComponent,
    HelpNewbieComponent,
    InsuranceComponent,
    CostFtTravelComponent,
    MakingMoneyComponent,
    SavingMoneyComponent,
    SellingHouseComponent,
    ThingsNeedFtComponent,
    NeedHelpNewbieComponent
  ],
  imports: [
    CommonModule,
    NewbieRoutingModule,
    SharedModule
  ]
})
export class NewbieModule { }
