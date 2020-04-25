import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SellingHouseComponent } from './selling-house.component';

describe('SellingHouseComponent', () => {
  let component: SellingHouseComponent;
  let fixture: ComponentFixture<SellingHouseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SellingHouseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SellingHouseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
