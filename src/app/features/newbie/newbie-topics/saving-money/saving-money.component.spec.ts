import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SavingMoneyComponent } from './saving-money.component';

describe('SavingMoneyComponent', () => {
  let component: SavingMoneyComponent;
  let fixture: ComponentFixture<SavingMoneyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SavingMoneyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SavingMoneyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
