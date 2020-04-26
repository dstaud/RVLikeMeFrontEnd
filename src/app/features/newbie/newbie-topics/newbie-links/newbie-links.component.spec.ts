import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewbieLinksComponent } from './newbie-links.component';

describe('NewbieLinksComponent', () => {
  let component: NewbieLinksComponent;
  let fixture: ComponentFixture<NewbieLinksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewbieLinksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewbieLinksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
