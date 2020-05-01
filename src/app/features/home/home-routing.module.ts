import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home.component';
import { DashboardComponent } from './analytics/dashboard/dashboard.component';
import { DashboardDrilldownComponent } from './analytics/dashboard-drilldown/dashboard-drilldown.component';

const routes: Routes = [
  { path: '', component: HomeComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'dashboard-drilldown', component: DashboardDrilldownComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
