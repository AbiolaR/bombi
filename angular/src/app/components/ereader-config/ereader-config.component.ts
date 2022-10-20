import { Component, Input, OnInit } from '@angular/core';
import { UserRelatedData } from 'src/app/models/user-related-data';

@Component({
  selector: 'app-ereader-config',
  templateUrl: './ereader-config.component.html',
  styleUrls: ['./ereader-config.component.scss']
})
export class EReaderConfigComponent implements OnInit {

  @Input()
  userRelatedData: UserRelatedData = new UserRelatedData();

  activeEReader: number = 0;

  constructor() { }

  ngOnInit(): void {
    switch (this.userRelatedData.eReaderType) {
      case 'K': // Kindle
        this.activeEReader = 0;
        break;
      case 'T': // Tolino
        this.activeEReader = 1;
        break;
    }
  }

  setEReader(index: any): void {
    switch(index) {
      case 0: // Kindle
        this.userRelatedData.eReaderType = 'K';
        break;
      case 1: // Tolino
        this.userRelatedData.eReaderType = 'T';
        break;
    }
  }

}
