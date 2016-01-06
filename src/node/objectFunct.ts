/*************************
 2. Object functions
 *************************/
 
 /// <reference path="api.ts" />
 /// <reference path="globalVar.ts" />
 
interface jsonMovieResponse {
  original_title: string,
  id: string,
  poster_path: string,
  credits: any
}

interface jsonActorResponse {
  name: string,
  id: string,
  profile_path: string,
  movie_credits: any
}


// make a singular reference for this movie
class StackCard {
  gameID: number;
  player: string;
  type: string;
  name: string;
  id: string;
  poster: Poster;
  credits;
  
  constructor(jsonObject, data) {
    var cast;
    var nameKey: string;
    var creditsType: string;
    var creditsKey: string;
    var posterKey: string;
    
    if(data.type === "actors") {
      
      cast = jsonObject.movie_credits.cast;
      nameKey = "name";
      creditsKey = "original_title";
      creditsType = "movies";
      posterKey = 'profile_path';
      
    } else if (data.type === "movies"){
      
      cast = jsonObject.credits.cast;
      nameKey = "original_title";
      creditsKey = "name";
      creditsType = "actors";
      posterKey = 'poster_path';
      
    }
    
    // map a new array of movies actor has been in with only relevant details
    var credits = cast.map(function(obj){
      return {
        type: creditsType,
        name: obj[creditsKey],
        id: obj.id
      };
    });
    
    this.gameID = data.gameID;
    this.player = data.player;
    this.type = data.type;
    this.name = jsonObject[nameKey];
    this.id = jsonObject.id;
    this.poster = new Poster(jsonObject[posterKey]);
    this.credits = credits;
    
  }
}

/*
 * This function will create the game object
 * Each player will have and id that corresponds to a
 * incrementing number property in the player object,
 * and the value of that property will be their score.
 * we're also going to start storing the stack inside this
 * object.
 */



class Game {
  playerList: any;
  actorCount: number;
  isBacon: boolean;
  cardStack: StackCard[];
  
  constructor(public gameID: number,
              startingPlayer: string) {
  
    // Create an object that has usernames for each key and
    // a score for each value
    var players = {};
    players[startingPlayer] = 0;
  
    // Create a new game w/ ID from the gameNumber index
    //this.gameID = gameID;
    this.playerList = players;
    this.actorCount = 0;
    this.isBacon = false;
    this.cardStack = [];

  }
  
  pushCard(jsonObject, data) {
    // If this is the first actor, points and credit go to no one
    var stackcard = new StackCard(jsonObject, data);
  
    if(data.firstStackEmit !== true) { // If this is a new game
      this.playerList[data.player] += 100;
    }
    
    if(data.type === "actors") {// If this is an actors card
      this.actorCount += 1; 
    }
  
    // store this actor into the corresponding game in the gameStack
    this.cardStack.push(stackcard);
    
    return data;
  }
  
}

class GameStack {
  
  stack: Game[];
  gameCount: number;
  
  constructor() {
    this.stack = [];
    this.gameCount = 0;
  } 
  
  getGamelist() {
    return this.stack.map(function(obj: Game){
      return {
        gameID: obj.gameID,
        playerList: obj.playerList,
        starting: obj.cardStack[0].name || null
      }; 
    });
  }
  
  addGame(data){
    var game = new Game(this.gameCount, data.player);
    this.stack[this.gameCount] = game;
    this.gameCount++;
    return game.gameID;
  }
  
  getGame(gameID){
    return this.stack[gameID];
  }
 
}




/*   End of File  */