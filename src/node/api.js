/************************
 7. themoviedb api variables
 ************************/

/*
 * All the variables for the movie database are factored out
 * and self-contained in this switch function, for easy update.
 */
var getApiOptions = function (optionsRequest, idOrPage) {

  // our api key for api.themoviedb.org/3/
  // Go get your own!
  var apiKey = '';

  // Beginning Url for all api requests, using version 3 of api
  var apiUrl = 'https://api.themoviedb.org/3/';

  // Beginning Url for all pictures from api
  var posterUrl = 'http://image.tmdb.org/t/p/w92';

  // If we get no image we'll send a generic question mark image from wikipedia
  var unknownImg = 'https://upload.wikimedia.org/wikipedia/commons/4/44/Question_mark_(black_on_white).png';

  switch(optionsRequest) {

    case 'popular':
       return {
                url: apiUrl + 'person/popular?page=' + idOrPage + '&api_key=' + apiKey,
                method: "GET"
              };
       break;

    case 'actors':
       return {
                url: apiUrl + 'person/' + idOrPage + '?api_key=' + apiKey + '&append_to_response=movie_credits',
                method: "GET"
              };
       break;

    case 'movies':
       return {
                url: apiUrl + 'movie/' + idOrPage + '?api_key=' + apiKey + '&append_to_response=credits',
                method: "GET"
              };
       break;

    case 'poster':
       if(idOrPage !== null) {

         return posterUrl + idOrPage;

       } else {

         return unknownImg;

       }
       break;
  }
};
/*   End of File  */