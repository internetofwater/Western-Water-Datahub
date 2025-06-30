export type TspanContent = string | TspanData[];

export interface TspanData {
    dx?: string;
    dy?: string;
    'font-size'?: string;
    'font-weight'?: string;
    content: TspanContent;
}
