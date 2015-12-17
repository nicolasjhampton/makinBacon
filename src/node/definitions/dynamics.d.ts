/// <reference path="objectFunct.d.ts" />
/// <reference path="globalVar.d.ts" />
declare var createFirstStackObject: (jsonObject: any, data: any) => any;
declare var createStackObject: (jsonObject: any, data: any) => any;
declare var addActorToStack: (jsonObject: any, data: any) => void;
declare var addMovieToStack: (jsonObject: any, data: any) => void;
declare var checkBacon: (data: any) => any;
declare var returnBacon: (data: any) => {
    gameID: any;
    player: any;
    type: string;
    name: string;
    id: number;
    poster: string;
    credits: any[];
};
