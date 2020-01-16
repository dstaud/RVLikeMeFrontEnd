import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RvRigComponent } from './rv-rig.component';

describe('RvRigComponent', () => {
  let component: RvRigComponent;
  let fixture: ComponentFixture<RvRigComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RvRigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RvRigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
