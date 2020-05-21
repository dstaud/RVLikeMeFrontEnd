import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IphoneInstallComponent } from './iphone-install.component';

describe('IphoneInstallComponent', () => {
  let component: IphoneInstallComponent;
  let fixture: ComponentFixture<IphoneInstallComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IphoneInstallComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IphoneInstallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
