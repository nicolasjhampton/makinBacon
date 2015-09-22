function checkActor (movieActors, actorChoice) {

  //set our test equal to false to start
  var match = false;

  // go through all the actors in the movie
  for(actor in movieActors) {

    // if any actor matches the choice, set match to true
    if (actorChoice === actor) {
      match = true;
    }
  }

  // return boolean result of test
  return match;
}
