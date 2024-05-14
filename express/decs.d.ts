declare module "node-ebook-converter" {
    function convert(options: ConversionOptions): Promise<void>;
    function setPoolSize(size: number): void;

    interface ConversionOptions {
        input: string,
        output: string,
        delete?: boolean,
        silent?: boolean
    }
}