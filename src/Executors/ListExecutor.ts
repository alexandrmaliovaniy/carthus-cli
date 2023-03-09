import CLI from "../Structures/CLI";

/**
 * Output list of included in config schemas
 */
class ListExecutor {
    constructor(cli: CLI) {
        cli.config.schemas.forEach(schema => console.log(schema.info, "\n"));
    }
};

export default ListExecutor;