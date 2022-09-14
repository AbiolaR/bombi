import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import axios, { Axios } from 'axios'

@Injectable({
  providedIn: 'root'
})
export class LibgenService {

  constructor(private http: HttpClient) { }

  public search(query: string) {
    
    this.getIDs(query);
    //return this.http.get<any>(`http://libgen.is/search.php?req=${query}&lg_topic=libgen&open=0&view=simple&res=100&phrase=1&column=def`)
  }



  private getIDs(query: string): number[] {
    const ids: number[] = [];

    const regex = new RegExp(/(?<=file\.php\?id=)(.*)(?=">)/g);

    var config = {
      method: 'get',
      url: `https://libgen.li/index.php?req=the+tiger+at+midnight&columns%5B%5D=t&columns%5B%5D=a&columns%5B%5D=s&columns%5B%5D=y&columns%5B%5D=p&columns%5B%5D=i&objects%5B%5D=f&topics%5B%5D=l&topics%5B%5D=c&topics%5B%5D=f&topics%5B%5D=a&topics%5B%5D=m&topics%5B%5D=r&topics%5B%5D=s&res=25&covers=on&filesuns=all`,
    };

    axios(config)
    .then(function (response) {
      console.log(JSON.stringify(response.data));
    })
    .catch(function (error) {
      console.log(error);
    });

    /*this.http.get<any>('https://libgen.li/index.php?req=the+tiger+at+midnight&columns%5B%5D=t&columns%5B%5D=a&columns%5B%5D=s&columns%5B%5D=y&columns%5B%5D=p&columns%5B%5D=i&objects%5B%5D=f&topics%5B%5D=l&topics%5B%5D=c&topics%5B%5D=f&topics%5B%5D=a&topics%5B%5D=m&topics%5B%5D=r&topics%5B%5D=s&res=25&covers=on&filesuns=all', {headers: httpHeaders}).subscribe(data => {
      console.log(data);
    })*/

    return ids;
  }
}
