import CLI from "../Structures/CLI";
import {execSync} from 'child_process';
import * as fs from 'fs';
import * as path from "path";

const configExample = {
    "extensions": [
        "@carthus/react",
    ],
    "alias": {},
    "flag": {}
}

class InitExecutor {
    constructor(cli: CLI) {
        const withSb = cli.hasFlag('storybook');
        execSync(`npm install @carthus/cli @carthus/core @carthus/react ${withSb && "@carthus/storybook-react" || ""} --save`);
        withSb && configExample.extensions.push("@carthus/storybook-react");
        fs.writeFileSync(path.join(cli.path.PROJECT_PATH, 'carthus.config.json'), JSON.stringify(configExample, null, 2), "utf-8");
    }
};

export default InitExecutor;