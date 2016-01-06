/***********************
 8. randomizer functions
 ***********************/
 
 /// <reference path="api.ts" />

 var random = function (type: boolean) {

   if(type) {
     // true is for page
     return Math.floor((Math.random() * 100) + 1);
   } else {
     // false is for actor
     return Math.floor((Math.random() * 20));
   }

 };

 var getRandomActor = function (pageJSONObject) {

   var chosenActor = pageJSONObject.results[random(false)];
   
   var actorRequest = new ApiRequest('actors', chosenActor.id);

   return actorRequest.options;

 };
 /*   End of File  */