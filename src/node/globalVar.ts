/************************
 2. global variables
 ************************/

// arrays of the actors and movies chosen (note: combined into stack)
var gameStack = [];

// newGame will let us know that the game has already started
// so we should come into the game in progress without resetting it
var newGame = true;

// Each game started will get a gameNumber ID, which will
// correspond with a socket route and it's storage position in the
// stack of games
var gameNumber = 0;
/*   End of File  */