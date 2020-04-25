import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NeedHelpNewbieComponent } from './need-help-newbie.component';

describe('NeedHelpNewbieComponent', () => {
  let component: NeedHelpNewbieComponent;
  let fixture: ComponentFixture<NeedHelpNewbieComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NeedHelpNewbieComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NeedHelpNewbieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
