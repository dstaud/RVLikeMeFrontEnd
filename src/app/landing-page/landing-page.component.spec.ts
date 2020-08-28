import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from '../shared/shared.module';
import { TranslateService } from '@ngx-translate/core';
import { MatDialogModule } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';

import { LandingPageComponent } from './landing-page.component';

fdescribe('LandingPageComponent', () => {
  let component: LandingPageComponent;
  let fixture: ComponentFixture<LandingPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LandingPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatDialogModule],
      providers: [
        {
          provide: Router, useValue: {}
        },
        {
          provide: ActivatedRoute, useValue: {}
        }
     ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LandingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
