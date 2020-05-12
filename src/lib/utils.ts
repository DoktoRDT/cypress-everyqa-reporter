import * as fs from 'fs';
import * as path from 'path';

export class Utils {
    static getEveryqaId(title: string) {
        const matchedId = title.match(/(?:^|\s)EQ-[0-9a-f]{24}(?:$|\s)/g);
        if (!matchedId) {
            return;
        }
        return matchedId[0].trim().slice(3);
    }

    static getScreenshotsObjectFromFolder(folderPath: string) {
        if (!fs.existsSync(folderPath)) {
            return {};
        }
        return fs.readdirSync(folderPath)
            .reduce((acc, screenshotName) => {
                const everyqaId = Utils.getEveryqaId(screenshotName);
                if (!everyqaId) {
                    return acc;
                }
                const screenshot: any = {
                    fieldname: 'attachments',
                    originalname: screenshotName,

                };
                screenshot.buffer = fs.readFileSync(folderPath + '/' + screenshotName);
                screenshot.mimetype = 'image/' + path.extname(screenshotName).slice(1);
                screenshot.size = screenshot.buffer.byteLength;
                if (!acc[everyqaId]) {
                    acc[everyqaId] = [];
                }
                acc[everyqaId].push(screenshot);
                return acc;
            }, {});
    }
}
