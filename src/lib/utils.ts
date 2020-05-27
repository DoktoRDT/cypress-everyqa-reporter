import * as fs from 'fs';
import * as path from 'path';

export class Utils {
    static getEveryqaId(title: string) {
        const matchedId = title.match(/(?:^|\s)\[EQ-[0-9a-f]{24}\](?:$|\s)/g);
        if (!matchedId) {
            return;
        }
        return matchedId[0].trim().slice(4, -1);
    }

    static getScreenshotsPaths(folderPath: string): string[] {
        if (!fs.existsSync(folderPath)) {
            return [];
        }
        return fs.readdirSync(folderPath)
            .reduce((acc, screenshotName) => {
                if (this.getEveryqaId(screenshotName)) {
                    acc.push(path.join(folderPath, screenshotName));
                }
                return acc;
            }, []);
    }
}
