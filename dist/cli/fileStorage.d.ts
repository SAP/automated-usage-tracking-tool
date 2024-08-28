/// <reference types="node/fs" />
import Storage from '../common/storage';
export default class FileStorage extends Storage {
    constructor(location: string);
    protected initStorage(): void;
    protected read(): Storage;
    protected write(): void;
}
