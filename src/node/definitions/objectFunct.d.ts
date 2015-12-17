/// <reference path="api.d.ts" />
declare var createGameList: () => {
    gameID: any;
    playerList: any;
    starting: any;
}[];
declare var createGame: (startingPlayer: any) => number;
declare var createMovieObject: (jsonObject: any, data: any) => {
    gameID: any;
    player: any;
    type: string;
    name: any;
    id: any;
    poster: string;
    credits: any;
};
declare var createActorObject: (jsonObject: any, data: any) => {
    gameID: any;
    player: any;
    type: string;
    name: any;
    id: any;
    poster: string;
    credits: any;
};
