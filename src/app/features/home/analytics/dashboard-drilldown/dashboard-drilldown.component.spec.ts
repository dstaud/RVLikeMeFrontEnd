import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardDrilldownComponent } from './dashboard-drilldown.component';

describe('DashboardDrilldownComponent', () => {
  let component: DashboardDrilldownComponent;
  let fixture: ComponentFixture<DashboardDrilldownComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardDrilldownComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardDrilldownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
