declare class Dymo {
    constructor();
    static get url(): string;
    static getPrinters(): Promise<{
        success: boolean;
        data: unknown;
    }>;
    static renderLabel(xml: string): Promise<{
        success: boolean;
        data: unknown;
    }>;
    static printLabel(printer: string, xml: string, parameters: LabelParameters): Promise<{
        success: boolean;
        data?: undefined;
    } | {
        success: boolean;
        data: unknown;
    }>;
    static createLabelParameters(parameters: LabelParameters): string;
}
type LabelParameters = {
    copies: number | null;
    jobTitle: string | null;
    flowDirection: 'LeftToRight' | 'RightToLeft' | null;
    printQuality: 'Text' | 'BarcodeAndGraphics' | 'Auto' | null;
    twinTurboRoll: 'Left' | 'Right' | 'Auto' | null;
};
export default Dymo;
export { LabelParameters };
