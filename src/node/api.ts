/************************
 1.5 themoviedb api variables
 ************************/
 
 
 interface options {
   url: string,
   method: string
 }
 
 class ApiRequest {
    apiUrl: string;
    apiKey: string;
    options: options; 
              
    constructor(public requestType: string, 
                public id: number) {
                  
      // Beginning Url for all api requests, using version 3 of api
      this.apiUrl = 'https://api.themoviedb.org/3/';
      
      // our api key for api.themoviedb.org/3/
      // Go get your own!   
      this.apiKey = '';
      
      this.options = {url:"", method:"GET"};
               
      switch(requestType) {
        case 'popular':
              this.options.url = this.apiUrl + 'person/popular?page=' + this.id + '&api_key=' + this.apiKey;
          break;
          
        case 'actors':
              this.options.url = this.apiUrl + 'person/' + this.id + '?api_key=' + this.apiKey + '&append_to_response=movie_credits';
          break;
    
        case 'movies':
              this.options.url = this.apiUrl + 'movie/' + this.id + '?api_key=' + this.apiKey + '&append_to_response=credits';   
          break;
      } 
    }

        
 }
 

class Poster {
  baseUrl: string;
  unknownImg: string;
  url: string;
  
  constructor(public pageUrl: string) {
    
    // Beginning Url for all pictures from api
    this.baseUrl = 'http://image.tmdb.org/t/p/w92';

    // If we get no image we'll send a generic question mark image from wikipedia
    this.unknownImg = 'https://upload.wikimedia.org/wikipedia/commons/4/44/Question_mark_(black_on_white).png';
    
    if(pageUrl !== null) {

      this.url = this.baseUrl + this.pageUrl;

    } else {

      this.url = this.unknownImg;

    }
  }
}
 
/*   End of File  */