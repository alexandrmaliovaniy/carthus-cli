import {IArgv} from "../types";
import ListExecutor from "../Executors/ListExecutor";
import CreateExecutor from "../Executors/CreateExecutor";
import FileSearch from "./FileSearch";
import Path from "./Path";
import Config from "./Config";

class CLI {

    private _argv: IArgv;
    private _path: Path;
    private _config: Config;

    /**
     *
     * @param cmd - command to execute
     * @param argv -
     */
    static Execute(cmd: string, argv: IArgv) {

    }
    static get Argv() : IArgv {
        const [,, cmd, ...args] = process.argv;

        const props: IArgv['props'] = [];
        const flags: IArgv['flags'] = {};

        while (args.length > 0) {
            const param = args.shift();
            if (!param) continue;
            if (param.indexOf('-') === 0) {
                flags[param.slice(1)] = null;
                continue;
            }
            if (param.indexOf('--') === 0) {
                const val = args.shift();
                flags[param.slice(2)] = val ?? null;
                continue;
            }
            props.push(param);
        }
        return {cmd, props, flags};
    }

    get path() {
        return this._path;
    }

    get config() {
        return this._config;
    }

    get cmd() {
        return this._argv.cmd;
    }

    get props() {
        return this._argv.props;
    }
    get flags() {
        return this._argv.flags;
    }

    get functionSchemaProps() {
        const func = {
            LoadTemplate: (...args: any) => {
                return this.config.LoadTemplate(...args)
            },
            hasFlag: (...args: any) => this.hasFlag(...args)
        }
        return [func];
    }

    get overrideInjectProps() {

        return [];
    }

    hasFlag(name: string) {
        return name in this.flags;
    }

    constructor(argv?: IArgv) {
        this._argv = argv || CLI.Argv;
        this._path = new Path(this);
        this._config = new Config(this);
        Config.LoadCustomConfig(this.path.CONFIG_PATH)(this.config);
    }

    /**
     * Start function fires first, whe program starts.
     */
    Start() {
        if (this.cmd === "list") return new ListExecutor(this);
        new CreateExecutor(this);
    }



}

export default CLI;