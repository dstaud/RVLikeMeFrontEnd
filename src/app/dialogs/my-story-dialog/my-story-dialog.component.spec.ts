import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyStoryDialogComponent } from './my-story-dialog.component';

describe('MyStoryDialogComponent', () => {
  let component: MyStoryDialogComponent;
  let fixture: ComponentFixture<MyStoryDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyStoryDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyStoryDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
