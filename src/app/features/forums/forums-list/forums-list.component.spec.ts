import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ForumsListComponent } from './forums-list.component';

describe('ForumsListComponent', () => {
  let component: ForumsListComponent;
  let fixture: ComponentFixture<ForumsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ForumsListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForumsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
