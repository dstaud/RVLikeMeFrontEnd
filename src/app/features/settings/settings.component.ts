import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

import { fadeAnimation } from '@shared/animations';

@Component({
  selector: 'app-rvlm-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  animations: [fadeAnimation]
})
export class SettingsComponent implements OnInit {

  constructor(private router: Router,
              private location: Location) {}

  ngOnInit(): void {
    if (this.location.path() === '/settings') {
      this.router.navigateByUrl('/settings/main');
    }
  }
}
