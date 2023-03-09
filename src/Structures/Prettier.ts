import fs from "fs";

const {ESLint} = require('eslint')

class Prettier {
    static async Prettify(configPath: string, code: string) {
        if (!configPath || !fs.existsSync(configPath) || fs.lstatSync(configPath).isFile()) return code;
        const eslint = new ESLint({
            overrideConfigFile: configPath,
            fix: true
        });

        const lints = await eslint.lintText(code);
        return lints[0].output || lints[0].source || code;
    }
};

export default Prettier;