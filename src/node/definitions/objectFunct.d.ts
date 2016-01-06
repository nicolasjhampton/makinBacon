/// <reference path="api.d.ts" />
/// <reference path="globalVar.d.ts" />
interface jsonMovieResponse {
    original_title: string;
    id: string;
    poster_path: string;
    credits: any;
}
interface jsonActorResponse {
    name: string;
    id: string;
    profile_path: string;
    movie_credits: any;
}
declare class StackCard {
    gameID: number;
    player: string;
    type: string;
    name: string;
    id: string;
    poster: Poster;
    credits: any;
    constructor(jsonObject: any, data: any);
}
declare class Game {
    gameID: number;
    playerList: any;
    actorCount: number;
    isBacon: boolean;
    cardStack: StackCard[];
    constructor(gameID: number, startingPlayer: string);
    pushCard(jsonObject: any, data: any): any;
}
declare class GameStack {
    stack: Game[];
    gameCount: number;
    constructor();
    getGamelist(): {
        gameID: number;
        playerList: any;
        starting: string;
    }[];
    addGame(data: any): number;
    getGame(gameID: any): Game;
}
