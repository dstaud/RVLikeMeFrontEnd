import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LikemeCountsComponent } from './likeme-counts.component';

describe('LikemeCountsComponent', () => {
  let component: LikemeCountsComponent;
  let fixture: ComponentFixture<LikemeCountsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LikemeCountsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LikemeCountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
