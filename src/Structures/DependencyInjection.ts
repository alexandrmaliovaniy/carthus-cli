import CLI from "./CLI";
import Schema from "./Schema";
import CreateExecutor from "../Executors/CreateExecutor";
import * as path from 'path';
import {ISchemaDependency, ISchemaInject, TComponentOverrideProp} from "../types";
import Prettier from "./Prettier";
import * as handlebars from 'handlebars';
import fs from "fs";
import CreateFile from "../Utils/CreateFile";
import Path from "./Path";

class DependencyInjection {
    private _exec: CreateExecutor;
    private _parentInjection: DependencyInjection | null;
    private _path: string;
    private _alias: string;
    private _filename: string | undefined;
    private _inject: ISchemaInject | undefined;
    private _schema: Schema;


    get schema() {
        return this._schema;
    }
    get path() {
        return this._path;
    }

    get relativePath(): string {
        if (!this._parentInjection) return this.path;
        return Path.Join(this._parentInjection.relativePath, this.path);
    }

    get absolutePath(): string {
        return Path.Join(process.cwd(), this.relativePath);
    }

    get relativeFileNamePath() {
        return Path.Join(this.relativePath, this.schema.filename);
    }

    get relativeFilePath(): string {
        return this.relativeFileNamePath + this.schema.template.fileExtension || ".txt";
    }

    get absoluteFileNamePath() {
        return Path.Join(this.absolutePath, this.schema.filename);
    }

    get absoluteFilePath(): string {
        return this.absoluteFileNamePath + this.schema.template.fileExtension || ".txt";
    }

    get parentInjection() {
        return this._parentInjection;
    }

    get exec() {
        return this._exec;
    }

    constructor(exec: CreateExecutor, dependency: ISchemaDependency, parentInjection: DependencyInjection | null = null) {
        this._exec = exec;
        this._parentInjection = parentInjection;
        this._schema = exec.cli.config.FindSchema(dependency.alias)!;
        this._alias = dependency.alias;
        this._filename = dependency.filename;
        this._inject = dependency.inject;
        if (!this.schema) throw `Schema ${dependency.alias} not found`;
        if (dependency.inject) {
            this.MergeInject(dependency.inject);
        }
        const [name, path, ...props] = this.exec.cli.props;
        this._path = handlebars.compile(dependency.path)({
            ARGS: {
                ALIAS: this.exec.cli.cmd,
                NAME: name,
                PATH: path,
                PROPS: props,
                FLAGS: this.exec.cli.flags
            },
        });
    }
    async Compile() {
        const cImports = this.CompileInjectOverrides("", this.schema.inject.import).trim();
        const cContent = this.CompileInjectOverrides(this.schema.template.content || "", this.schema.inject.content).trim();
        const cExports = this.CompileInjectOverrides("", this.schema.inject.export).trim();

        const cFile = cImports.concat('\n\n').concat(cContent).concat('\n\n').concat(cExports);
        const env = this.exec.getEnvVariables(this);
        const tFile = handlebars.compile(handlebars.compile(cFile)(env))(env).trim();
        const result = await Prettier.Prettify(this.exec.cli.path.ESLINT_CONFIG_PATH, tFile);
        const filePath = handlebars.compile(this.absoluteFilePath)(env);
        CreateFile(filePath, result);
    }

    MergeInject(inject: ISchemaInject) {
        this.schema.inject = {
            import: [...this.schema.inject.import, ...(inject.import || [])],
            content: [...this.schema.inject.content, ...(inject.content || [])],
            export: [...this.schema.inject.export, ...(inject.export || [])],
        }
    }
    private CompileInjectOverrides(startText: string, overrides: TComponentOverrideProp[]) {
        for (const override of overrides) {
            if (typeof override !== 'function') {
                startText = startText.concat("\n").concat(override);
            }
            else {
                startText = override(startText, ...this.exec.cli.overrideInjectProps);
            }
        }
        return startText;
    }
};

export default DependencyInjection;