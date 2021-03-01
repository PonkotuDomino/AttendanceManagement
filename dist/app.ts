/*
 Google Apps Scritサーバーサイドのアプリケーションを記述する
 exportは禁止
*/

function doGet() {
    return HtmlService.createTemplateFromFile("index").evaluate();
}

function getData() {
    // メールアドレスを取得
    const email = Session.getActiveUser().getEmail();
    if (!email || email.split('@')[1] !== 'mat-ltd.co.jp') {
        return '{}';
    }

    // スプレッドシートからデータを取得
    const spreadsheet = SpreadsheetApp.openById('19TGC6GK0eIYw6g9hWdGwMMSLYm1ui9r2wft4HuJ3LpE');
    const sheet = spreadsheet.getSheetByName('0');
    const cell = sheet.getRange("A1");
    const data = JSON.parse(cell.getValue());
    const userData = data[email.split('@')[0].replace('.', '')] || {};

    // 今月のデータ有無確認。存在しない場合は作成
    const date = new Date;
    const yearMonth = date.getFullYear() + ('0' + (date.getMonth() + 1)).slice(-2);
    if (!userData.workingTime[yearMonth]) {
        if (!userData.workingTime) {
            userData.workingTime = {};
        }

        const thisMonthData = [];
        for (let index = 1; index <= (new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()); index++) {
            thisMonthData.push({
                date: index,
                start: '',
                end: '',
                leaveType: 0,
                notes: '',
                isChange: 0
            });
        }

        userData.workingTime[yearMonth] = thisMonthData;
        data[email.split('@')[0].replace('.', '')] = userData;
        cell.setValue(JSON.stringify(data));
    }

    return JSON.stringify(userData);
}

function setData(value: string) {
    const email = Session.getActiveUser().getEmail();
    if (!email || email.split('@')[1] !== 'mat-ltd.co.jp') {
        return {};
    }

    const spreadsheet = SpreadsheetApp.openById('19TGC6GK0eIYw6g9hWdGwMMSLYm1ui9r2wft4HuJ3LpE');
    const sheet = spreadsheet.getSheetByName('0');
    const cell = sheet.getRange("A1");
    const data = JSON.parse(cell.getValue());
    data[email.split('@')[0].replace('.', '')] = JSON.parse(value);
    cell.setValue(JSON.stringify(data));
}