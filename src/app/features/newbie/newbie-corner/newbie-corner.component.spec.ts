import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewbieCornerComponent } from './newbie-corner.component';

describe('NewbieCornerComponent', () => {
  let component: NewbieCornerComponent;
  let fixture: ComponentFixture<NewbieCornerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewbieCornerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewbieCornerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
