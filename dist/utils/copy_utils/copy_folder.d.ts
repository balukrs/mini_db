type Props = {
    source: string;
    destination: string;
};
declare class CopyFolders {
    source: string;
    destination: string;
    error: string;
    copied: number;
    progress: number;
    private _activeCopy;
    constructor({ source, destination }: Props);
    private _copyInit;
    copyFolder(): Promise<void>;
}
export default CopyFolders;
//# sourceMappingURL=copy_folder.d.ts.map