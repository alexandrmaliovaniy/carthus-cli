import * as fs from 'fs';
import * as path from 'path';

const CreateFileSync = (filePath: string, data: string) => {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, data, 'utf-8');
};


export default CreateFileSync;