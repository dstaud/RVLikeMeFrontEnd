import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewbieComponent } from './newbie.component';

describe('NewbieComponent', () => {
  let component: NewbieComponent;
  let fixture: ComponentFixture<NewbieComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewbieComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewbieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
