import CreateExecutor from "../Executors/CreateExecutor";
import DependencyInjection from "./DependencyInjection";
import {ISchemaInject, ISchemaOverride, ISearchMatch, TComponentOverrideProp} from "../types";
import path from "path";
import FileSearch from "./FileSearch";
import fs from "fs";
import * as handlebars from 'handlebars';
import CreateFile from "../Utils/CreateFile";
import Prettier from "./Prettier";
import {log} from "handlebars";

class OverrideInjection {

    private _exec: CreateExecutor;
    private _parentInjection: DependencyInjection;
    private _search: ISearchMatch[];
    private _inject: ISchemaInject | null;


    get exec() {
        return this._exec;
    }

    constructor(exec: CreateExecutor, parentInjection: DependencyInjection, override: ISchemaOverride) {
        this._exec = exec;
        this._parentInjection = parentInjection;
        if (!override.search) throw "Override 'search' property is not specified";
        if (!override.inject) throw "Override 'inject' property is not specified";
        this._search = Array.isArray(override.search) ? override.search : [override.search];
        this._inject = override.inject;
    }

    SearchFile(search: ISearchMatch[]) {
        let basePath = this._parentInjection.absolutePath;
        while (search.length > 0) {
            const searchRule = search.shift();
            const searchPath = path.join(basePath, searchRule?.path || "");
            const result = searchRule?.up ?
                FileSearch.Up(searchPath, searchRule.match, this.exec.cli.path.PROJECT_PATH)
                : searchRule?.down ?
                    FileSearch.Down(searchPath, searchRule.match)
                    :
                    FileSearch.Dir(searchPath, searchRule.match);

            if (!result) return null;
            if (search.length === 0) return result;
            basePath = result[0].path;
        }
    }

    async Compile() {
        const fileMatches = this.SearchFile(this._search);
        if (!fileMatches || fileMatches?.length === 0) return null;
        const fileMatch = fileMatches[0];

        const filePath = path.join(fileMatch.path, fileMatch.name);

        const file = fs.readFileSync(filePath, 'utf-8');

        const fileImportsMatch = Array.from(file.matchAll(/^(?!\/)\s*import\s+.+/gm));
        const fileExportsMatch = Array.from(file.matchAll(/^(?!\/)\s*export\s*/gm));
        const lastImport = fileImportsMatch.pop();
        const firstExport = fileExportsMatch.shift();
        const importEndIndex = lastImport && lastImport.index !== undefined ? lastImport.index + lastImport[0].length : 0;
        const exportStartIndex = firstExport && firstExport.index !== undefined ? firstExport.index : file.length;
        const parentInjection = this._parentInjection;
        const env = this.exec.getEnvVariables({
            get schema() {
                return {
                    filename: fileMatch.name
                }
            },
            get absolutePath(): string {
                return fileMatch.path;
            },
            get absoluteFilePath() {
                return filePath;
            },
            get absoluteFileNamePath() {
                return filePath.split('.').slice(0, -1).join('.');
            },
            get parentInjection() {
                return parentInjection;
            }
        });

        const fileImports = file.slice(0, importEndIndex);
        const fileContent = file.slice(importEndIndex, exportStartIndex);
        const fileExports = file.slice(exportStartIndex, file.length);

        const cFileImports = this.CompileInjectOverrides(fileImports, this._inject?.import || []).trim();
        const cFileContent = this.CompileInjectOverrides(fileContent, this._inject?.content || []).trim();
        const cFileExports = this.CompileInjectOverrides(fileExports, this._inject?.export || []).trim();

        const cFile = cFileImports.concat('\n\n').concat(cFileContent).concat('\n\n').concat(cFileExports);

        const tFile = handlebars.compile(handlebars.compile(cFile)(env))(env);
        const result = await Prettier.Prettify(this.exec.cli.path.ESLINT_CONFIG_PATH, tFile);

        CreateFile(filePath, result)
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

export default OverrideInjection;