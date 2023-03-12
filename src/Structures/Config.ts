import CLI from "./CLI";
import fs from "fs";
import {ITemplateData, TSchemaProvider} from "../types";
import Schema from "./Schema";
import path from "path";

class Config {

    private _cli;
    private _schemas: Schema[] = [];
    private _aliases: Record<string, string> = {};
    private _flags: Record<string, Record<string, string>> = {};

    static LoadJsonConfig(config: Config, override: any) {
        if (override.alias) {
            const aliases = Object.keys(override.alias);
            aliases.forEach(alias => config.AddAlias(alias, override.alias[alias]))
        }
        if (override.flag) {
            const aliases = Object.keys(override.flag);
            aliases.forEach(alias => config.SetFlags(alias, override.flag[alias]))
        }
        config.LoadSchema((override.extensions || []).map(e => {
            if (e.startsWith("./")) return require(path.join(config.cli.path.PROJECT_PATH, e));
            return require(e)
        }).flat());
    }

    static LoadCustomConfig(path: string) {
        if (!fs.existsSync(path) || fs.lstatSync(path).isDirectory()) throw "Error occurred while loading config";
        const override = require(path);
        if (typeof override == 'object') return (config: Config) => Config.LoadJsonConfig(config, override)
        if (typeof override == 'function') return override;
        throw "Error occurred while reading config";

    }

    constructor(cli: CLI) {
        this._cli = cli;
    }

    get cli() {
        return this._cli;
    }
    get aliases() {
        return this._aliases;
    }

    get flags() {
        return this._flags;
    }

    get schemas() {
        return this._schemas;
    }

    LoadSchema(extension: TSchemaProvider[] | TSchemaProvider): void {
        if (Array.isArray(extension)) return extension.forEach(ext => this.LoadSchema(ext));
        this._schemas.push(new Schema(this._cli, extension));
    }

    AddAlias(alias: string, path: string) {
        if (alias in this._aliases) throw `Alias "${alias}" already registered`;
        this._aliases[alias] = path;
    }
    SetFlags(cmd: string, flags: Record<string, string>) {
        if (this.cli.cmd === cmd) {
            Object.assign(this.cli.flags, flags)
        }
    }
    Override(alias: string, overrideFunc: (schema: Schema) => Schema) {
        const schema = this.FindSchema(alias);
        if (!schema) throw `Schema "${alias}" not fount and can't be overwritten`;
        const schemaIndex = this._schemas.findIndex(schema => schema.alias.includes(alias));
        this._schemas[schemaIndex] = overrideFunc(schema as Schema);
        return this._schemas[schemaIndex];
    }

    FindSchema(schemaAlias: string) {
        const schema = this._schemas.find(schema => schema.alias.includes(schemaAlias));
        if (!schema) return null;
        return new Schema(this.cli, {
            ...schema,
            alias: [...schema.alias],
            inject: {
                import: [...schema.inject.import],
                content: [...schema.inject.content],
                export: [...schema.inject.export]
            },
            dependencies: [...schema.dependencies],
            overrides: [...schema.overrides],
        })
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