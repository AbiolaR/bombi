import { pipeline } from "stream/promises";
import { BookBlob } from "../models/book-blob.model";
import { createReadStream, createWriteStream, readFileSync } from "fs";
import { convert, setPoolSize } from "node-ebook-converter";
import jszip from "jszip";
import sharp from "sharp";
import { Readable } from "stream";
import path from "path";

export class EpubToolsService {
    private static readonly CACHE_DIR = '/tmp/app.bombi/cache/';
    private static readonly CONVERTED_PREFIX = 'CONVERTED_';

    public static initialize() {
        setPoolSize(4);
    }

    public static async makeKindleCombatible(book: BookBlob) {
        await this.convertToAsync(book, 'mobi');
        await this.convertToAsync(book, 'epub', true);
    }

    public static async saveToDiskAsync(book: BookBlob) {        
        const filePath = path.resolve(this.CACHE_DIR, book.filename);       
        await pipeline(book.data, createWriteStream(filePath));
        book.data = createReadStream(filePath);
        return filePath;
    }

    public static async compressEpubAsync(filePath: string) {
        const fileContent = readFileSync(filePath);
        const jsZip = new jszip();
    
        const zip = await jsZip.loadAsync(fileContent);
        const jpgs = Object.keys(zip.files).filter(key => key.endsWith('.jpg'));
    
        for (const jpg of jpgs) {
            let buffer = await zip.files[jpg].async('nodebuffer');
            buffer = await sharp(buffer).jpeg({quality: 40}).toBuffer();
            zip.file(jpg, buffer);
        }
        const stream = zip.generateNodeStream({type:'nodebuffer', streamFiles:true}) as Readable;
        return await this.saveToDiskAsync(new BookBlob(stream, this.CACHE_DIR + filePath.split('/').pop()));
    }

    private static async convertToAsync(book: BookBlob, fileType: 'mobi' | 'epub', deleteOriginal = false) {
        book.filePath = book.filePath || await this.saveToDiskAsync(book);

        const extension = this.parseExtension(book.filePath);
        const inputPath = book.filePath;

        const filePath = book.filePath
                                .split('/').pop()
                                .replace(new RegExp(extension + '$'), fileType)
                                .replace(this.CACHE_DIR, '')
                                .replace(this.CONVERTED_PREFIX, '');

        book.filePath = this.CACHE_DIR + this.CONVERTED_PREFIX + filePath;

        book.filename = this.CONVERTED_PREFIX + book.filename
                                                    .split('/').pop()
                                                    .replace(new RegExp(extension + '$'), fileType)
                                                    .replace(this.CONVERTED_PREFIX, '');        

        try {
            await convert({ input: inputPath, output: book.filePath, delete: deleteOriginal });
        } catch (error) {
            console.error(error);
        }
    }

    private static parseExtension(filepath: string) {
        return filepath.slice((filepath.lastIndexOf(".") - 1 >>> 0) + 2);
    }
}