/***********************
 8. randomizer functions
 ***********************/

 var random = function (type) {

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

   return getApiOptions('actors', chosenActor.id);

 };
 /*   End of File  */