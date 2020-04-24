import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewbieTopicsComponent } from './newbie-topics.component';

describe('NewbieTopicsComponent', () => {
  let component: NewbieTopicsComponent;
  let fixture: ComponentFixture<NewbieTopicsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewbieTopicsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewbieTopicsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
