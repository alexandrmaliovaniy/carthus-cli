import FileSearch from "./FileSearch";
import CLI from "./CLI";
import path from "path";

class Path {

    private _executionPath: string;
    private _projectPath: string;


    static Join(...args: string[]) {
        return path.join(...args).replace(/\\/g, "/");
    }
    static Relative(from: string, to: string) {
        return path.relative(from, to).replace(/\\/g, "/");
    }


    get PROJECT_PATH() {
        return this._projectPath;
    }
    get SRC_PATH() {
        return Path.Join(this.PROJECT_PATH, "src");
    }
    get CONFIG_PATH() {
        return Path.Join(this.PROJECT_PATH, "maverick.config.js");
    }
    get ESLINT_CONFIG_PATH() {
        return Path.Join(this.PROJECT_PATH, ".eslintrc.json");
    }

    constructor(cli: CLI) {
        this._executionPath = process.cwd();
        const maverickConfigLocation = FileSearch.Up(process.cwd(), ({name}) => {
            return /maverick\.config/.test(name)
        });
        if (maverickConfigLocation.length !== 1) throw "Failed to find project path";
        this._projectPath = maverickConfigLocation[0].path;
    }
};

export default Path;