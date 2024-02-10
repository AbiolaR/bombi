export class PocketBookProvider {
    shopId: number;
    alias: string;
    name: string;
    icon: string;

    constructor(shopId: number, alias: string, name: string, icon: string) {
        this.shopId = shopId;
        this.alias = alias;
        this.name = name;
        this.icon = icon;
    }
    
}