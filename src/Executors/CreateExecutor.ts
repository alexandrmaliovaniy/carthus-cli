import CLI from "../Structures/CLI";
import DependencyInjection from "../Structures/DependencyInjection";
import OverrideInjection from "../Structures/OverrideInjection";
import Path from "../Structures/Path";
import * as path from "path";
import * as handlebars from 'handlebars';
var helpers = require('handlebars-helpers')({
    handlebars: {
        registerHelper(group) {
            handlebars.registerHelper(group);
        }
    }
});

class CreateExecutor {

    private _cli: CLI;
    private _initialInjection: DependencyInjection;
    private _dependencyInjections: DependencyInjection[] = [];
    private _overrideInjections: OverrideInjection[] = [];

    get cli() {
        return this._cli;
    }
    get dependencyInjections() {
        return this._dependencyInjections;
    }

    get overrideInjections() {
        return this._overrideInjections;
    }

    getEnvVariables(target: DependencyInjection) {
        /*
            ARGS: {
                ALIAS: schema alias
                NAME: user provided name
                PATH: result relative to cwd() path

                Additional props and flags:
                PROPS: [],
                FLAGS: {}
            }

            ORIGIN: {}
            PARENT: {}
            TARGET: {}

         */
        const origin = this._initialInjection;
        const parent = target.parentInjection;

        const [name, path, ...props] = this.cli.props;
        return {
            ARGS: {
                ALIAS: this.cli.cmd,
                NAME: name,
                PATH: path,
                PROPS: props,
                FLAGS: this.cli.flags
            },
            ORIGIN: {
                NAME: origin.schema.filename,
            },
            PARENT: {
                NAME: parent?.schema.filename || null
            },
            TARGET: {
                NAME: target.schema.filename
            },
            PATH_TO: {
                ORIGIN: Path.Relative(target.absolutePath, origin.absoluteFileNamePath),
                ORIGIN_FOLDER: Path.Relative(target.absolutePath, origin.absolutePath),
                PARENT: parent && Path.Relative(target.absolutePath, parent.absoluteFileNamePath) || null,
                PARENT_FOLDER: parent && Path.Relative(target.absolutePath, parent.absolutePath) || null
            },
            PATH_FROM: {
                ORIGIN: Path.Relative(origin.absolutePath, target.absoluteFileNamePath),
                ORIGIN_FOLDER: Path.Relative(origin.absolutePath, target.absolutePath),
                PARENT: parent && Path.Relative(parent.absolutePath, target.absoluteFileNamePath) || null,
                PARENT_FOLDER: parent && Path.Relative(parent.absolutePath, target.absolutePath) || null
            }
        }
    }

    constructor(cli: CLI) {
        // console.log("Create component with tag " + cli.cmd);
        this._cli = cli;
        this._initialInjection = new DependencyInjection(this, {
            alias: cli.cmd,
            path: cli.hasFlag('f') && path.join(cli.props[1], cli.props[0]) || cli.props[1]
        })
        this.UnwrapFileDependencyTree(this._initialInjection);
        this.Compile();
    }

    UnwrapFileDependencyTree(dependencyInjection: DependencyInjection) {
        this.dependencyInjections.push(dependencyInjection);
        dependencyInjection.schema.overrides.forEach(override => {
            this.overrideInjections.push(new OverrideInjection(this, dependencyInjection, override));
        });
        dependencyInjection.schema.dependencies.forEach(dependency => {
            this.UnwrapFileDependencyTree(new DependencyInjection(this, dependency, dependencyInjection));
        });
    }
    async Compile() {
        await this.CompileDependencies();
        await this.CompileOverrides();
    }
    async CompileDependencies() {
        for (let dep of this.dependencyInjections) {
            await dep.Compile();
        }
    }
    async CompileOverrides() {
        for (let override of this.overrideInjections) {
            await override.Compile();
        }
    }
}

export default CreateExecutor;