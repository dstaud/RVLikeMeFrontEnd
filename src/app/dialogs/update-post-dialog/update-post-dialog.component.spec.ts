import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdatePostDialogComponent } from './update-post-dialog.component';

describe('UpdatePostDialogComponent', () => {
  let component: UpdatePostDialogComponent;
  let fixture: ComponentFixture<UpdatePostDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdatePostDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdatePostDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
