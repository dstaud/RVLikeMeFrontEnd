import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

import { fadeAnimation } from '@shared/animations';

@Component({
  selector: 'app-rvlm-newbie',
  templateUrl: './newbie.component.html',
  styleUrls: ['./newbie.component.scss'],
  animations: [fadeAnimation]
})
export class NewbieComponent implements OnInit {

  constructor(private router: Router,
              private location: Location) { }

  ngOnInit(): void {
    if (this.location.path() === '/newbie') {
      this.router.navigateByUrl('/newbie/newbie-corner');
    }
  }
}
