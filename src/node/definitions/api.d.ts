interface options {
    url: string;
    method: string;
}
declare class ApiRequest {
    requestType: string;
    id: number;
    apiUrl: string;
    apiKey: string;
    options: options;
    constructor(requestType: string, id: number);
}
declare class Poster {
    pageUrl: string;
    baseUrl: string;
    unknownImg: string;
    url: string;
    constructor(pageUrl: string);
}
