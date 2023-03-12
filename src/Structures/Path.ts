import FileSearch from "./FileSearch";
import CLI from "./CLI";
import path from "path";

class Path {

    private _executionPath: string;
    private _projectPath: string;
    private _configPath: string;
    private _cli: CLI;


    static Join(...args: string[]) {
        return path.join(...args).replace(/\\/g, "/");
    }
    static Relative(from: string, to: string) {
        return path.relative(from, to).replace(/\\/g, "/");
    }

    resolveAlias(path: string) {
        const aliases = this._cli.config.aliases;
        for (const alias in aliases) {
            if (path.indexOf(alias) === 0) return path.replace(alias, aliases[alias]);
        }
        return path;

    }


    get PROJECT_PATH() {
        return this._projectPath;
    }
    get SRC_PATH() {
        return Path.Join(this.PROJECT_PATH, "src");
    }
    get CONFIG_PATH() {
        return Path.Join(this._configPath);
    }
    get NODE_MODULES_PATH() {
        return Path.Join(this.PROJECT_PATH, 'node_modules');
    }
    get ESLINT_CONFIG_PATH() {
        return Path.Join(this.PROJECT_PATH, ".eslintrc.json");
    }

    constructor(cli: CLI) {
        this._cli = cli;
        this._executionPath = process.cwd();
        const ConfigLocation = FileSearch.Up(process.cwd(), ({name}) => {
            return /carthus\.config/.test(name)
        });
        if (ConfigLocation.length !== 1) throw "Failed to find project path";
        this._configPath = path.join(ConfigLocation[0].path, ConfigLocation[0].name)
        this._projectPath = ConfigLocation[0].path;
    }
};

export default Path;