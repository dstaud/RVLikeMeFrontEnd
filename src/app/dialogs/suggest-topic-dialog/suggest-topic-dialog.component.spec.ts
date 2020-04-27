import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SuggestTopicDialogComponent } from './suggest-topic-dialog.component';

describe('SuggestTopicDialogComponent', () => {
  let component: SuggestTopicDialogComponent;
  let fixture: ComponentFixture<SuggestTopicDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SuggestTopicDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SuggestTopicDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
