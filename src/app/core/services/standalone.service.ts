import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StandaloneService {
  standalone: boolean = false;

  constructor() { }

  setStandalone(standalone: boolean): void {
    this.standalone = standalone;
  }
}
