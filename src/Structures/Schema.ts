import CLI from "./CLI";
import {ISchemaDependency, ISchemaInject, ISchemaOverride, ITemplateData, TSchemaProvider} from "../types";

class Schema {
    alias: string[];
    filename: string;
    description: string;
    template: ITemplateData;
    inject: ISchemaInject;
    dependencies: ISchemaDependency[];
    overrides: ISchemaOverride[];
    constructor(cli: CLI, schemaProvider: TSchemaProvider) {
        if (typeof schemaProvider === 'function') schemaProvider = schemaProvider(...cli.functionSchemaProps())
        if (!schemaProvider.alias) throw "Error occurred while parsing extensions. Schema alias not provided!";
        // if (!schemaProvider.filename) throw "Error occurred while parsing extensions. Schema filename not provided!";

        this.alias = Array.isArray(schemaProvider.alias) ? schemaProvider.alias : [schemaProvider.alias];
        this.filename = schemaProvider.filename || "{{ARGS.NAME}}";
        this.description = schemaProvider.description || "No description";
        this.template = schemaProvider.template || {
            content: "",
            fileExtension: '.txt'
        };
        this.inject = {
            import: schemaProvider.inject?.import || [],
            content: schemaProvider.inject?.content || [],
            export: schemaProvider.inject?.export || []
        };
        this.dependencies = schemaProvider.dependencies || [];
        this.overrides = schemaProvider.overrides || [];
    }

    get info() {
        return [`Alias: [${this.alias.join(", ")}]`,
        `Description: ${this.description}`,
        `Result file: ${this.filename}${this.template.fileExtension}`,
        `Dependencies: [${this.dependencies.map(dep => dep.alias).join(", ")}]`].join("\n");
    }

}


export default Schema;