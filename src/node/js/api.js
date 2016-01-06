var ApiRequest = (function () {
    function ApiRequest(requestType, id) {
        this.requestType = requestType;
        this.id = id;
        this.apiUrl = 'https://api.themoviedb.org/3/';
        this.apiKey = '';
        this.options = { url: "", method: "GET" };
        switch (requestType) {
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
    return ApiRequest;
})();
var Poster = (function () {
    function Poster(pageUrl) {
        this.pageUrl = pageUrl;
        this.baseUrl = 'http://image.tmdb.org/t/p/w92';
        this.unknownImg = 'https://upload.wikimedia.org/wikipedia/commons/4/44/Question_mark_(black_on_white).png';
        if (pageUrl !== null) {
            this.url = this.baseUrl + this.pageUrl;
        }
        else {
            this.url = this.unknownImg;
        }
    }
    return Poster;
})();
