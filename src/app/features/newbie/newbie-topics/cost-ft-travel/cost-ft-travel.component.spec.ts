import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CostFtTravelComponent } from './cost-ft-travel.component';

describe('CostFtTravelComponent', () => {
  let component: CostFtTravelComponent;
  let fixture: ComponentFixture<CostFtTravelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CostFtTravelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CostFtTravelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
