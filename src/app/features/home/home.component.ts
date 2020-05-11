import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-rvlm-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(private router: Router,
              private location: Location) { }

  ngOnInit() {
    if (this.location.path() === '/home') {
      this.router.navigateByUrl('/home/dashboard');
    }
  }

}
