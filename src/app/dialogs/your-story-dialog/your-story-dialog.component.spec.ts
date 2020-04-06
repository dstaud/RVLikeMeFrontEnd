import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { YourStoryDialogComponent } from './your-story-dialog.component';

describe('YourStoryDialogComponent', () => {
  let component: YourStoryDialogComponent;
  let fixture: ComponentFixture<YourStoryDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ YourStoryDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(YourStoryDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
