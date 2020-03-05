import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DesktopDialogComponent } from './desktop-dialog.component';

describe('DesktopDialogComponent', () => {
  let component: DesktopDialogComponent;
  let fixture: ComponentFixture<DesktopDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DesktopDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DesktopDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
