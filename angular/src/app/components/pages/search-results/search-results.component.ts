import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent implements OnInit {

  constructor(private route: ActivatedRoute) {
    route.params.subscribe(async params => {
      if (params['q']) {
        console.warn(decodeURIComponent(params['q']));
        
        const options = {
          mirror: 'http://libgen.is',
          query: 'philosophy of religion',
          count: 5
        }

        try {
          //const data = await libgen.search(options);
        } catch (err) {
          console.warn(err);
        }
      
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
