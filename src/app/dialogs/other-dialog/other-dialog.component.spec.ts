import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherDialogComponent } from './other-dialog.component';

describe('OtherDialogComponent', () => {
  let component: OtherDialogComponent;
  let fixture: ComponentFixture<OtherDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OtherDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OtherDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
