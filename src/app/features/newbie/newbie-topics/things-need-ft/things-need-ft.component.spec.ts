import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThingsNeedFtComponent } from './things-need-ft.component';

describe('ThingsNeedFtComponent', () => {
  let component: ThingsNeedFtComponent;
  let fixture: ComponentFixture<ThingsNeedFtComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThingsNeedFtComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThingsNeedFtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
