import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterDesktopComponent } from './footer-desktop.component';

describe('FooterDesktopComponent', () => {
  let component: FooterDesktopComponent;
  let fixture: ComponentFixture<FooterDesktopComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FooterDesktopComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FooterDesktopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
