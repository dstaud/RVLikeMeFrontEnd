import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfilePercentComponent } from './profile-percent.component';

describe('OtherUsersComponent', () => {
  let component: ProfilePercentComponent;
  let fixture: ComponentFixture<ProfilePercentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfilePercentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfilePercentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
