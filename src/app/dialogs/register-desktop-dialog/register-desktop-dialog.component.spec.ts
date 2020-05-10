import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterDesktopDialogComponent } from './register-desktop-dialog.component';

describe('RegisterDesktopDialogComponent', () => {
  let component: RegisterDesktopDialogComponent;
  let fixture: ComponentFixture<RegisterDesktopDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegisterDesktopDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterDesktopDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
