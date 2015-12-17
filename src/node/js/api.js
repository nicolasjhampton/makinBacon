var getApiOptions = function (optionsRequest, idOrPage) {
    var apiKey = '';
    var apiUrl = 'https://api.themoviedb.org/3/';
    switch (optionsRequest) {
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
    }
};
var getPosterUrl = function (pageUrl) {
    var posterUrl = 'http://image.tmdb.org/t/p/w92';
    var unknownImg = 'https://upload.wikimedia.org/wikipedia/commons/4/44/Question_mark_(black_on_white).png';
    if (pageUrl !== null) {
        return posterUrl + pageUrl;
    }
    else {
        return unknownImg;
    }
};
