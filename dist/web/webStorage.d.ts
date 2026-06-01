import Storage from '../common/storage';
export default class WebStorage extends Storage {
    constructor(location: string);
    protected initStorage(): void;
    protected read(): Storage;
    protected write(): void;
}
