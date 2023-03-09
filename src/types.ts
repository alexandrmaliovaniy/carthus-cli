import {COMPONENT_TYPES, RESERVED_COMPONENT_NAMES} from "./const/Reserved";
import Schema from "./Structures/Schema";
import DependencyInjection from "./Structures/DependencyInjection";
import OverrideInjection from "./Structures/OverrideInjection";

export type TComponentOverrideFunction = (...args: any) => string;
export type TComponentOverrideProp = string | TComponentOverrideFunction;

export interface ISchemaInject {
    import: TComponentOverrideProp[];
    content: TComponentOverrideProp[];
    export: TComponentOverrideProp[];
}
export interface ISchemaDependency {
    alias: string;
    path: string;
    filename?: string;
    inject?: ISchemaInject;
}

export interface ISearchMatch {
    path?: string;
    match?: string | string[] | ((data: IFileSearchData) => boolean);
    up?: boolean;
    down?: boolean;
}

export interface ISchemaOverride {
    search: ISearchMatch | ISearchMatch[]
    inject: ISchemaInject;
}

// export interface TTemplate {
//     extension: string;
//     content: string;
// }

// export type TFunctionalComponent = (components: TComponent[]) => TComponent

// export interface TComponent {
//     alias: string[];
//     name: string;
//     template: TTemplate;
//     inject: ISchemaInject;
//     dependencies: TComponentDependency[];
//     overrides: TComponentOverride[];
// }

// export interface TConfig {
//     extensions: Array<TComponent | TFunctionalComponent>;
//     alias: { [key: string] : string }
//     inject?: TComponentInjection;
// }

// export interface TCLIArgs {
//     props: string[];
//     flags: {[key: string] : string | null};
// }

// export type TCLICmd = typeof RESERVED_COMPONENT_NAMES[number];

// export interface TComponentTreeNode {
//     component: TComponent;
//     children: TComponentTreeNode[]
// }
//
// export interface TFileSchema {
//     path: string;
//     component: TComponent;
// }

export interface ITemplateData {
    content?: string;
    fileExtension?: string;
}

export interface ISchemaJSONData {
    alias?: string | string[];
    description?: string;
    filename?: string;
    template?: ITemplateData;
    inject?: ISchemaInject;
    dependencies?: ISchemaDependency[];
    overrides?: ISchemaOverride[];
}

export type TSchemaFunctionData = (...args: any[]) => ISchemaJSONData;
export type TSchemaProvider = ISchemaJSONData | TSchemaFunctionData;

export interface IArgv {
    cmd: string;
    props: string[];
    flags: { [key: string]: string | boolean | null }
}
export interface IFileSearchData {
    name: string;
    path: string;
    relativePath: string;
}

export type TFileSearchFilter = (el: IFileSearchData) => boolean;

export interface ISchemaDependencyTreeMeta {
    fileInjections: Schema[],
    dependencyInjections: DependencyInjection[],
    overrideInjections: OverrideInjection[],
}