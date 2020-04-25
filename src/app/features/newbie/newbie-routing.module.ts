import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NewbieComponent } from './newbie.component';
import { NewbieTopicsComponent } from './newbie-topics/newbie-topics.component';
import { HelpNewbieComponent } from './help-newbie/help-newbie.component';
import { NeedHelpNewbieComponent } from './need-help-newbie/need-help-newbie.component';
import { InternetComponent } from './newbie-topics/internet/internet.component';
import { InsuranceComponent } from './newbie-topics/insurance/insurance.component';
import { CostFtTravelComponent } from './newbie-topics/cost-ft-travel/cost-ft-travel.component';
import { ThingsNeedFtComponent } from './newbie-topics/things-need-ft/things-need-ft.component';
import { SellingHouseComponent } from './newbie-topics/selling-house/selling-house.component';
import { SavingMoneyComponent } from './newbie-topics/saving-money/saving-money.component';
import { MakingMoneyComponent } from './newbie-topics/making-money/making-money.component';

const routes: Routes = [
  { path: '', component: NewbieComponent,
    children: [
      { path: 'newbie-topics', component: NewbieTopicsComponent },
      { path: 'help-newbie', component: HelpNewbieComponent },
      { path: 'need-help-newbie', component: NeedHelpNewbieComponent },
      { path: 'internet', component: InternetComponent },
      { path: 'insurance', component: InsuranceComponent },
      { path: 'cost-ft-travel', component: CostFtTravelComponent },
      { path: 'making-money', component: MakingMoneyComponent },
      { path: 'saving-money', component: SavingMoneyComponent },
      { path: 'selling-house', component: SellingHouseComponent },
      { path: 'things-need-ft', component: ThingsNeedFtComponent }
    ]}
  ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NewbieRoutingModule { }
