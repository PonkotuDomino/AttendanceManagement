/*
 Google Apps Scritサーバーサイドのアプリケーションを記述する
 exportは禁止
*/

function doGet() {
    return HtmlService.createTemplateFromFile('index').evaluate();
}

// 初期処理
function getInitData(): any {
    const email = Session.getActiveUser().getEmail();
    if (!email || email.split('@')[1] !== 'mat-ltd.co.jp') {
        throw new Error('システムを利用する権限がありません。ログインユーザが正しいか確認してください。');
    }

    const userData = getUserData(email);
    if (!userData) {
        throw new Error('社員登録が行われていません。システム管理者に確認してください。');
    }

    return getUserData(email);
}

// 社員情報取得
function getUserData(email: string): any {
    // ユーザマスタ取得
    const userMasterSS = SpreadsheetApp.openById('1l5QRVxOc8puz6Zlx3-fNIG-6nx4w6ekvq6NGQmxGxxk');
    const userMasterSheet = userMasterSS.getSheetByName('0');
    const userMasterTextFinder = userMasterSheet.createTextFinder(email);
    const userMasterIndex = userMasterTextFinder.findNext().getRowIndex() + '';
    if (!userMasterIndex) {
        return null;
    }

    return JSON.parse(userMasterSheet.getRange('B' + userMasterIndex).getValue());
}

// ページ描画情報の取得
function getPageData(sheetId: string, conditions?: any): any {
    const spreadsheet = SpreadsheetApp.openById((conditions && (conditions.type === 'TimeSettings')) ? '19Eqx1c0S3tlDN3OAQmU8kMn_aXX9RPleKm5mcJ_1XEU' : sheetId);
    const sheet = spreadsheet.getSheetByName('0');
    const cell = sheet.getRange(2, 1, sheet.getLastRow() - 1, 2);

    return {
        data: convertArrayToObject(cell.getValues()),
        users: (conditions && ((conditions.role === 0) || (conditions.type === 'TimeSettings'))) ? getUsers(conditions.type) : []
    };
}

// 担当者一覧を取得
function getUsers(type: string): any {
    const spreadsheet = SpreadsheetApp.openById('1l5QRVxOc8puz6Zlx3-fNIG-6nx4w6ekvq6NGQmxGxxk');
    const sheet = spreadsheet.getSheetByName('0');
    const cell = sheet.getRange(2, 1, sheet.getLastRow() - 1, 2);
    const data = (cell.getValues() || []).map(d => JSON.parse(d[1]));
    return type === 'TimeSettings'
        ? data.map(d => { return { id: d['id'], name: d.name }; })
        : data.map(d => { return { sheetId: d[type + 'SheetId'], name: d.name }; });
}

// 2次元配列を連想配列に変換
function convertArrayToObject(values: string | any[]): any {
    const data = {};
    for (var i = 0; i < values.length; i++) {
        data[values[i][0]] = JSON.parse(values[i][1]);
    }
    return data;
}

function setData(conditions: any, value?: any): void {
    const email = Session.getActiveUser().getEmail();
    if (!conditions && (!email || email.split('@')[1] !== 'mat-ltd.co.jp')) {
        throw new Error('システムを利用する権限がありません。ログインユーザが正しいか確認してください。');
    }

    if (conditions.type === 'Commuting') {
        changeCommuting(email)
    } else if (conditions.type === 'WorkingHours') {
        changeWorkingHours(conditions.sheetId, conditions.yearMonth, value);
    } else if (conditions.type === 'Expenses') {
        changeExpenses(conditions.sheetId, conditions.yearMonth, value);
    } else if (conditions.type === 'TimeSettings') {
        changeTimeSettings(conditions.id, value)
    }
}

// 出退勤状態更新
function changeCommuting(email: string) {
    // 出退勤状態設定
    const userMasterSS = SpreadsheetApp.openById('1l5QRVxOc8puz6Zlx3-fNIG-6nx4w6ekvq6NGQmxGxxk');
    const userMasterSheet = userMasterSS.getSheetByName('0');
    const userMasterTextFinder = userMasterSheet.createTextFinder(email);
    const userMasterFindNext = userMasterTextFinder.findNext();
    if (!userMasterFindNext) {
        throw new Error('社員登録が行われていません。システム管理者に確認してください。');
    }
    const userMasterCell = userMasterSheet.getRange('B' + userMasterFindNext.getRowIndex());
    const userData = JSON.parse(userMasterCell.getValue());
    const isCommuting = !userData.commuting; // 変更後の状態
    userData.commuting = isCommuting;
    userMasterCell.setValue(JSON.stringify(userData));

    // 時刻設定
    const workingHoursSS = SpreadsheetApp.openById(userData.WorkingHoursSheetId);
    const workingHoursSheet = workingHoursSS.getSheetByName('0');
    const date = new Date();
    const yearMonth = date.getFullYear() + ('0' + (date.getMonth() + 1)).slice(-2);
    const workingHoursTextFinder = workingHoursSheet.createTextFinder(yearMonth);
    const workingHoursFindNext = workingHoursTextFinder.findNext();
    if (!workingHoursFindNext) {
        const lastRowIndex = workingHoursSheet.getLastRow() + 1;
        workingHoursSheet.getRange('A' + lastRowIndex).setValue('\'' + yearMonth);

        const thisMonthData = [];
        for (let index = 1; index <= (new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()); index++) {
            thisMonthData.push({
                date: index,
                start: (index === date.getDate()) ? ('0' + date.getHours()).slice(-2) + ('0' + date.getMinutes()).slice(-2) : '',
                end: '',
                leaveType: 0,
                notes: '',
                isChange: false,
                workTimeDivision: 1
            });
        }
        workingHoursSheet.getRange('B' + lastRowIndex).setValue(JSON.stringify(thisMonthData));
    } else {
        const workingHoursCell = workingHoursSheet.getRange('B' + workingHoursFindNext.getRowIndex());
        const workingHoursData = JSON.parse(workingHoursCell.getValue());
        workingHoursData[date.getDate() - 1][isCommuting ? 'start' : 'end'] = ('0' + date.getHours()).slice(-2) + ('0' + date.getMinutes()).slice(-2);
        workingHoursCell.setValue(JSON.stringify(workingHoursData));
    }
}

// 出退勤表更新
function changeWorkingHours(sheetId: string, yearMonth: string, value: any) {
    const workingHoursSS = SpreadsheetApp.openById(sheetId);
    const workingHoursSheet = workingHoursSS.getSheetByName('0');
    const workingHoursTextFinder = workingHoursSheet.createTextFinder(yearMonth);
    const workingHoursFindNext = workingHoursTextFinder.findNext();
    if (!workingHoursFindNext) {
        throw new Error('出退勤表の取得に失敗しました。システム管理者に確認してください。');
    }
    workingHoursSheet.getRange('B' + workingHoursFindNext.getRowIndex()).setValue(JSON.stringify(value));
}

// 交通費精算更新
function changeExpenses(sheetId: string, yearMonth: string, value: any) {
    const expensesSS = SpreadsheetApp.openById(sheetId);
    const expensesSheet = expensesSS.getSheetByName('0');
    const expensesTextFinder = expensesSheet.createTextFinder(yearMonth);
    const expensesFindNext = expensesTextFinder.findNext();
    if (!expensesFindNext) {
        const lastRowIndex = expensesSheet.getLastRow() + 1;
        expensesSheet.getRange('A' + lastRowIndex).setValue(yearMonth);
        expensesSheet.getRange('B' + lastRowIndex).setValue(JSON.stringify(value));
    } else {
        expensesSheet.getRange('B' + expensesFindNext.getRowIndex()).setValue(JSON.stringify(value));
    }
}

// 時間設定マスタ更新
function changeTimeSettings(id: string, value: any) {
    // 出退勤状態設定
    const timeSettingsSS = SpreadsheetApp.openById('19Eqx1c0S3tlDN3OAQmU8kMn_aXX9RPleKm5mcJ_1XEU');
    const timeSettingsSheet = timeSettingsSS.getSheetByName('0');
    const timeSettingsTextFinder = timeSettingsSheet.createTextFinder(id);
    const timeSettingsFindNext = timeSettingsTextFinder.findNext();
    if (!timeSettingsFindNext) {
        throw new Error('時間設定マスタに登録されていません。システム管理者に確認してください。');
    }
    timeSettingsSheet.getRange('B' + timeSettingsFindNext.getRowIndex()).setValue(JSON.stringify(value));
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

// 出退勤リセットバッチ処理
// 毎日早朝6時くらい？
function resetCommuting() {
    // ユーザマスタ取得
    const userMasterSS = SpreadsheetApp.openById('1l5QRVxOc8puz6Zlx3-fNIG-6nx4w6ekvq6NGQmxGxxk');
    const userMasterSheet = userMasterSS.getSheetByName('0');
    const userMasterCells = userMasterSheet.getRange("B2:B" + userMasterSheet.getLastRow());
    const userMasterData = (userMasterCells.getValues() || []).map(d => JSON.parse(d[0]));
    for (let index = 0; index < userMasterData.length; index++) {
        const userData = userMasterData[index];
        if (userData.commuting) {
            userData.commuting = false;
            userMasterSheet.getRange("B" + (index + 2)).setValue(JSON.stringify(userData));

            const workingHoursSS = SpreadsheetApp.openById(userData.WorkingHoursSheetId);
            const workingHoursSheet = workingHoursSS.getSheetByName('0');
            const date = new Date();
            const yearMonth = date.getFullYear() + ('0' + (date.getMonth() + 1)).slice(-2);
            const workingHoursTextFinder = workingHoursSheet.createTextFinder(yearMonth);
            const workingHoursFindNext = workingHoursTextFinder.findNext();
            const workingHoursCell = workingHoursSheet.getRange('B' + workingHoursFindNext.getRowIndex());
            const workingHoursData = JSON.parse(workingHoursCell.getValue());
            workingHoursData[date.getDate() - 2]['end'] = '1800';
            workingHoursData[date.getDate() - 2]['notes'] = '退勤忘れ ' + workingHoursData[date.getDate() - 2]['notes'];
            workingHoursCell.setValue(JSON.stringify(workingHoursData));
        }
    }
}