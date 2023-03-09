import CLI from "./CLI";
import fs from "fs";
import {ITemplateData, TSchemaProvider} from "../types";
import Schema from "./Schema";
import path from "path";

class Config {

    private _cli;
    private _schemas: Schema[] = [];
    private _aliases = [];

    static LoadCustomConfig(path: string) {
        if (!fs.existsSync(path) || fs.lstatSync(path).isDirectory()) throw "Error occurred while loading maverick.config.js";
        const overrideFunc = require(path);
        if (typeof overrideFunc !== 'function') throw "Error occurred while reading maverick.config.js";
        return overrideFunc;
    }

    constructor(cli: CLI) {
        this._cli = cli;
    }

    get cli() {
        return this._cli;
    }

    get schemas() {
        return this._schemas;
    }

    LoadSchema(extension: TSchemaProvider[] | TSchemaProvider): void {
        if (Array.isArray(extension)) return extension.forEach(ext => this.LoadSchema(ext));
        this._schemas.push(new Schema(this._cli, extension));
    }

    FindSchema(schemaAlias: string) {
        const schema = this._schemas.find(schema => schema.alias.includes(schemaAlias));
        if (!schema) return null;
        return {
            ...schema,
            alias: [...schema.alias],
            inject: {
                import: [...schema.inject.import],
                content: [...schema.inject.content],
                export: [...schema.inject.export]
            },
            dependencies: [...schema.dependencies],
            overrides: [...schema.overrides],
        }
    }

    LoadTemplate(...templatePath: string[]): ITemplateData {
        const filePath = path.join(...templatePath);
        return {
            fileExtension: path.extname(filePath),
            content: fs.readFileSync(filePath, 'utf-8')
        }
    }


};

export default Config;