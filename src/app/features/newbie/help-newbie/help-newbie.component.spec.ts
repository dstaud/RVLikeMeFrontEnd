import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpNewbieComponent } from './help-newbie.component';

describe('HelpNewbieTopicsComponent', () => {
  let component: HelpNewbieComponent;
  let fixture: ComponentFixture<HelpNewbieComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HelpNewbieComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HelpNewbieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
