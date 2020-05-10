import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SigninDesktopDialogComponent } from './signin-desktop-dialog.component';

describe('SigninDesktopDialogComponent', () => {
  let component: SigninDesktopDialogComponent;
  let fixture: ComponentFixture<SigninDesktopDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SigninDesktopDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SigninDesktopDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
