import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MakingMoneyComponent } from './making-money.component';

describe('MakingMoneyComponent', () => {
  let component: MakingMoneyComponent;
  let fixture: ComponentFixture<MakingMoneyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MakingMoneyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MakingMoneyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
