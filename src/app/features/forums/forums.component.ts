import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-rvlm-forums',
  templateUrl: './forums.component.html',
  styleUrls: ['./forums.component.scss']
})
export class ForumsComponent implements OnInit {

  constructor(private router: Router,
              private location: Location) { }

  ngOnInit() {
    if(this.location.path() === '/forums') {
      this.router.navigateByUrl('/forums/main');
    }
  }

}
