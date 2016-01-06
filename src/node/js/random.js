var random = function (type) {
    if (type) {
        return Math.floor((Math.random() * 100) + 1);
    }
    else {
        return Math.floor((Math.random() * 20));
    }
};
var getRandomActor = function (pageJSONObject) {
    var chosenActor = pageJSONObject.results[random(false)];
    var actorRequest = new ApiRequest('actors', chosenActor.id);
    return actorRequest.options;
};
