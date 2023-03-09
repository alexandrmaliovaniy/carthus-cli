import {IFileSearchData, TFileSearchFilter} from "../types";
import fs from "fs";
import path from "path";

const SEARCH_IGNORE = ['node_modules'];

class FileSearch {
    static Up(startDirectory: string, filter: TFileSearchFilter, searchBoundaryPath = "/") {
        const matches: IFileSearchData[] = [];
        let prevPath = null;
        let currentPath = startDirectory;
        do {
            if (!fs.existsSync(currentPath)) return matches;
            const folderElements = fs.readdirSync(currentPath);
            for (let folderElement of folderElements) {
                try {
                    if (SEARCH_IGNORE.includes(folderElement)) continue;
                    const folderElementPath = path.join(currentPath, folderElement);
                    if (!fs.lstatSync(folderElementPath).isFile()) continue;
                    const res = {
                        name: folderElement,
                        path: currentPath,
                        relativePath: path.relative(startDirectory, currentPath)
                    };
                    if (filter(res)) matches.push(res);
                } catch (e) {
                    continue;
                }
            }
            prevPath = currentPath;
            currentPath = path.join(currentPath, '..');
        } while (currentPath !== prevPath && path.relative(prevPath, searchBoundaryPath) !== "");
        return matches;
    }
    static Down(startDirectory: string, filter: TFileSearchFilter, currentPath: string = startDirectory, match: IFileSearchData[] = []) {
        if (!fs.existsSync(startDirectory) || !fs.lstatSync(startDirectory).isDirectory()) return null;
        const folderElements = fs.readdirSync(currentPath);
        for(const folderElement of folderElements) {
            if (SEARCH_IGNORE.includes(folderElement)) continue;
            const folderElementPath = path.join(currentPath, folderElement);
            if (fs.lstatSync(folderElementPath).isFile()) {
                const res = {
                    name: folderElement,
                    path: currentPath,
                    relativePath: path.relative(startDirectory, folderElementPath)
                }
                if (filter(res)) match.push(res);
            } else {
                FileSearch.Down(startDirectory, filter, folderElementPath, match);
            }
        }
        return match;
    }
    static Dir(startDirectory: string, filter: TFileSearchFilter) {
        if (!fs.existsSync(startDirectory) || !fs.lstatSync(startDirectory).isDirectory()) return null;
        const match: IFileSearchData[] = [];
        const folderElements = fs.readdirSync(startDirectory);
        for(const folderElement of folderElements) {
            if (SEARCH_IGNORE.includes(folderElement)) continue;
            const folderElementPath = path.join(startDirectory, folderElement);
            if (fs.lstatSync(folderElementPath).isFile()) {
                const res = {
                    name: folderElement,
                    path: startDirectory,
                    relativePath: path.relative(startDirectory, folderElementPath)
                }
                if (filter(res)) match.push(res);
            }
        }
        return match;
    }
};

export default FileSearch;