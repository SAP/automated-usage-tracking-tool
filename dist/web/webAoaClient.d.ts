import AOAClient from '../aoa/aoaClient';
export default class WebAoaClient extends AOAClient {
    constructor();
    static create(): WebAoaClient | null;
}
