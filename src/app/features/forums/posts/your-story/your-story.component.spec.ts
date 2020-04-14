import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { YourStoryComponent } from './your-story.component';

describe('YourStoryComponent', () => {
  let component: YourStoryComponent;
  let fixture: ComponentFixture<YourStoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ YourStoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(YourStoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
