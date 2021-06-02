/*
 Google Apps Scritサーバーサイドのアプリケーションを記述する
 exportは禁止
*/

function doGet() {
    return HtmlService.createTemplateFromFile('index').evaluate();
}

function getData(id: string) {
    // メールアドレスを取得
    const email = Session.getActiveUser().getEmail();
    if (!id && (!email || email.split('@')[1] !== 'mat-ltd.co.jp')) {
        return '{}';
    }
    const userId = id || email.split('@')[0].replace('.', '');

    // スプレッドシートからデータを取得
    const spreadsheet = SpreadsheetApp.openById('19TGC6GK0eIYw6g9hWdGwMMSLYm1ui9r2wft4HuJ3LpE');
    const sheet = spreadsheet.getSheetByName('0');
    const cell = sheet.getRange('A1');
    const data = JSON.parse(cell.getValue());
    const userData = data[userId] || {};
    if (!Object.keys(userData).length) {
        return JSON.stringify({
            data: {}
        });
    }

    // 今月のデータ有無確認。存在しない場合は作成
    const date = new Date;
    const yearMonth = date.getFullYear() + ('0' + (date.getMonth() + 1)).slice(-2);
    if (!userData.timeSheets[yearMonth]) {
        if (!userData.timeSheets) {
            userData.timeSheets = {};
        }

        const thisMonthData = [];
        for (let index = 1; index <= (new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()); index++) {
            thisMonthData.push({
                date: index,
                start: '',
                end: '',
                leaveType: 0,
                notes: '',
                isChange: 0,
                workTimeDivision: 1
            });
        }

        userData.timeSheets[yearMonth] = thisMonthData;
        data[userId] = userData;
        cell.setValue(JSON.stringify(data));
    }

    let users = {};
    if (data[userId].role === 0) {
        const spreadsheet = SpreadsheetApp.openById('1l5QRVxOc8puz6Zlx3-fNIG-6nx4w6ekvq6NGQmxGxxk');
        const sheet = spreadsheet.getSheetByName('ユーザマスタ');
        const cell = sheet.getRange('A1');
        users = JSON.parse(cell.getValue());
    }

    return JSON.stringify({
        data: userData,
        users: users
    });
}

function setData(value: string, conditions?: any) {
    const email = Session.getActiveUser().getEmail();
    if (!conditions && (!email || email.split('@')[1] !== 'mat-ltd.co.jp')) {
        return '{}';
    }
    const userId = ((conditions || {}).id) || email.split('@')[0].replace('.', '');

    const spreadsheet = SpreadsheetApp.openById('19TGC6GK0eIYw6g9hWdGwMMSLYm1ui9r2wft4HuJ3LpE');
    const sheet = spreadsheet.getSheetByName('0');
    const cell = sheet.getRange('A1');
    const data = JSON.parse(cell.getValue());
    if (!conditions) {
        data[userId] = JSON.parse(value);
    } else {
        if (conditions.type === 'commuting') {
            data[userId] = value;
        } else if (conditions.type === 'settings') {
            data[userId]['settings'] = value;
        } else if (conditions.type === 'timeSheets' || conditions.type === 'expenses') {
            data[userId][conditions.type][conditions.month] = JSON.parse(value);
        }
    }

    // 要検討
    let users = {};
    if (data[userId].role === 0) {
        const spreadsheet = SpreadsheetApp.openById('1l5QRVxOc8puz6Zlx3-fNIG-6nx4w6ekvq6NGQmxGxxk');
        const sheet = spreadsheet.getSheetByName('ユーザマスタ');
        const cell = sheet.getRange('A1');
        users = JSON.parse(cell.getValue());
    }

    const result = JSON.stringify(data);
    cell.setValue(result);

    return JSON.stringify({
        data: data[userId] || {},
        users: users || {}
    });
}

function createExpensesSheet(data: any, year: string, wareki: string, name: string) {
    const dates = wareki.split('/');
    const original = SpreadsheetApp.openById('1WMAP-LCQPwy_7afhZwpkq2JlgvgPhgNxKnuWbX5tn7A');　// ひな形取得
    const sheetName = original.getName() + '_' + name; // 新しいシート名
    const newSheet = original.copy(sheetName); // コピーを作成
    const folder = DriveApp.getFolderById('1eXIEqLosd8MJJ5jF0j4j3Pq8fOWq0ke7'); // 出力フォルダを取得
    const folderName = year + ('0' + dates[1]).slice(-2);
    const folderIterator = folder.getFoldersByName(folderName); // 対象フォルダのイテレータを取得
    const targetFolder = folderIterator.hasNext()
        ? folderIterator.next()
        : folder.createFolder(folderName); // 対象フォルダが存在する場合はフォルダを取得、存在しない場合は作成

    const existing = targetFolder.getFilesByName(sheetName); // すでにシートが存在するか確認し、存在すれば削除
    if (existing.hasNext()) {
        targetFolder.removeFile(existing.next());
    }
    targetFolder.addFile(DriveApp.getFileById(newSheet.getId())); // 対象フォルダにシートを追加

    // シート入力
    const targetSheet = newSheet.getSheetByName('交通費明細書');
    targetSheet.getRange('C2').setValue(dates[0] + '年');
    targetSheet.getRange('E2').setValue(dates[1] + '月');

    let myCarIndex = 0;
    let publicTransportIndex = 0;

    let total = 0;
    for (let index = 0; index < data.length; index++) {
        const d = data[index];
        let position = 0;
        if (d.means === '0') {
            position = 8 + myCarIndex;
            myCarIndex++;

            targetSheet.getRange('I' + position).setValue(d.distance);
        } else {
            position = 17 + publicTransportIndex;
            publicTransportIndex++;

            targetSheet.getRange('D' + position).setValue(d.meansDetails);
        }

        targetSheet.getRange('A' + position).setValue(year + '/' + dates[1] + '/' + d.day);
        targetSheet.getRange('B' + position).setValue(d.destination);
        targetSheet.getRange('C' + position).setValue(d.details);
        targetSheet.getRange('E' + position).setValue(d.from);
        targetSheet.getRange('G' + position).setValue(d.to);
        targetSheet.getRange('H' + position).setValue(d.trip === '0' ? '往復' : '片道');
        targetSheet.getRange('J' + position).setValue('\\' + (+d.amount || 0).toLocaleString());

        total += (+d.amount ?? 0);
        if (myCarIndex > 7 || publicTransportIndex > 7) {
            return '';
        }
    }

    targetSheet.getRange('G26').setValue('\\' + (+total || 0).toLocaleString());

    return newSheet.getUrl();
}