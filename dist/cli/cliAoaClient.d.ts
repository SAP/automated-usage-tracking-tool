import AOAClient from '../aoa/aoaClient';
export default class CliAoaClient extends AOAClient {
    constructor();
    static create(): CliAoaClient | null;
}
