import { Component, OnInit, Input } from '@angular/core';

import { IlinkPreview } from '@services/link-preview.service';

@Component({
  selector: 'app-rvlm-preview-link',
  templateUrl: './preview-link.component.html',
  styleUrls: ['./preview-link.component.scss']
})
export class PreviewLinkComponent implements OnInit {
  @Input('linkPreview') preview: IlinkPreview;

  constructor() { }

  ngOnInit(): void {
  }

}
