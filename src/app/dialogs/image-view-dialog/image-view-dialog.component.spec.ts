import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageViewDialogComponent } from './image-view-dialog.component';

describe('OtherDialogComponent', () => {
  let component: ImageViewDialogComponent;
  let fixture: ComponentFixture<ImageViewDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImageViewDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageViewDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
