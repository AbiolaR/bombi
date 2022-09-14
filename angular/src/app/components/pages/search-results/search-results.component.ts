import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LibgenService } from 'src/app/services/libgen.service';


@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent implements OnInit {

  constructor(private route: ActivatedRoute, private libgenService: LibgenService) {
    route.params.subscribe(async params => {
      if (params['q']) {
        console.warn(decodeURIComponent(params['q']));
        
        libgenService.search(params['q']);
      
        /*try {
          const data = await libgen.search(options)
          let n = data.length;
          console.log('top ' + n + ' results for "' +
                      options.query + '"');
          while (n--){
            console.log('***********');
            console.log('Title: ' + data[n].title);
            console.log('Author: ' + data[n].author);
            console.log('Download: ' +
                        'http://gen.lib.rus.ec/book/index.php?md5=' +
                        data[n].md5.toLowerCase());
          }
          return true
        } catch (err) {
          return console.error(err)
        }*/


      }
    })
  }

  ngOnInit(): void {
  }

}
