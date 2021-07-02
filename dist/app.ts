/*
 Google Apps Scritサーバーサイドのアプリケーションを記述する
 exportは禁止
*/

function doGet() {
    return HtmlService.createTemplateFromFile('index').evaluate();
}

// 初期処理
// 初期表示時のログインユーザ情報を取得
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
    const spreadsheetId = sheetId || getMasterSheetId(conditions || {});
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    const sheet = spreadsheet.getSheetByName('0');
    const cell = sheet.getRange(2, 1, sheet.getLastRow() - 1, 2);

    return {
        data: convertArrayToObject(cell.getValues()),
        users: (conditions && (conditions.role === 0)) ? getUsers() : [],
        timeSettings: (conditions && (conditions.type === 'UserMaster')) ? getTimeSettings() : []
    };
}

// マスタシートID取得
function getMasterSheetId(condition?: any) {
    switch (condition.type) {
        case 'TimeSettingsMaster':
            return '19Eqx1c0S3tlDN3OAQmU8kMn_aXX9RPleKm5mcJ_1XEU';
        case 'UserMaster':
            return '1l5QRVxOc8puz6Zlx3-fNIG-6nx4w6ekvq6NGQmxGxxk';
        default:
            return '';
    }
}

// 担当者一覧を取得
function getUsers(): any {
    const spreadsheet = SpreadsheetApp.openById('1l5QRVxOc8puz6Zlx3-fNIG-6nx4w6ekvq6NGQmxGxxk');
    const sheet = spreadsheet.getSheetByName('0');
    const cell = sheet.getRange(2, 1, sheet.getLastRow() - 1, 2);
    const data = (cell.getValues() || []).map(d => {
        return {
            ...(JSON.parse(d[1])),
            email: d[0]
        }
    });

    return data;
}

// 時間設定一覧を取得
function getTimeSettings(): any {
    const spreadsheet = SpreadsheetApp.openById('19Eqx1c0S3tlDN3OAQmU8kMn_aXX9RPleKm5mcJ_1XEU');
    const sheet = spreadsheet.getSheetByName('0');
    const cell = sheet.getRange(2, 1, sheet.getLastRow() - 1, 2);
    return convertArrayToObject(cell.getValues());
}

// 2次元配列を連想配列に変換
function convertArrayToObject(values: any[]): any {
    const data = {};
    for (var i = 0; i < values.length; i++) {
        data[values[i][0]] = JSON.parse(values[i][1]);
    }
    return data;
}

// データ更新
function setData(conditions: any, value?: any): void {
    const email = Session.getActiveUser().getEmail();
    if (!conditions && (!email || email.split('@')[1] !== 'mat-ltd.co.jp')) {
        throw new Error('システムを利用する権限がありません。ログインユーザが正しいか確認してください。');
    }

    if (conditions.type === 'Commuting') {
        changeCommuting(email, value);
    } else if (conditions.type === 'WorkingHours') {
        changeWorkingHours(conditions.sheetId, conditions.yearMonth, value);
    } else if (conditions.type === 'Expenses') {
        changeExpenses(conditions.sheetId, conditions.yearMonth, value);
    } else if (conditions.type === 'TimeSettingsMaster') {
        changeTimeSettingsMaster(conditions.id, value)
    } else if (conditions.type === 'UserMaster') {
        changeUserMaster(conditions.email, value)
    }
}

// 出退勤状態更新
function changeCommuting(email: string, currentContent: string): void {
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
    userData.currentContent = currentContent;
    userMasterCell.setValue(JSON.stringify(userData));

    // 時刻設定
    const workingHoursSS = SpreadsheetApp.openById(userData.workingHoursSheetId);
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
                notes: currentContent,
                isChange: false,
                workTimeDivision: 1
            });
        }
        workingHoursSheet.getRange('B' + lastRowIndex).setValue(JSON.stringify(thisMonthData));
    } else {
        const workingHoursCell = workingHoursSheet.getRange('B' + workingHoursFindNext.getRowIndex());
        const workingHoursData = JSON.parse(workingHoursCell.getValue());
        workingHoursData[date.getDate() - 1][isCommuting ? 'start' : 'end'] = ('0' + date.getHours()).slice(-2) + ('0' + date.getMinutes()).slice(-2);
        workingHoursData[date.getDate() - 1]['notes'] = currentContent;
        workingHoursCell.setValue(JSON.stringify(workingHoursData));
    }
}

// 出退勤表更新
function changeWorkingHours(sheetId: string, yearMonth: string, value: any): void {
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
function changeExpenses(sheetId: string, yearMonth: string, value: any): void {
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
function changeTimeSettingsMaster(id: string, value: any): void {
    // 出退勤状態設定
    const timeSettingsMasterSS = SpreadsheetApp.openById('19Eqx1c0S3tlDN3OAQmU8kMn_aXX9RPleKm5mcJ_1XEU');
    const timeSettingsMasterSheet = timeSettingsMasterSS.getSheetByName('0');
    const timeSettingsMasterTextFinder = timeSettingsMasterSheet.createTextFinder(id);
    const timeSettingsMasterFindNext = timeSettingsMasterTextFinder.findNext();
    if (!timeSettingsMasterFindNext) {
        throw new Error('時間設定マスタに登録されていません。システム管理者に確認してください。');
    }
    timeSettingsMasterSheet.getRange('B' + timeSettingsMasterFindNext.getRowIndex()).setValue(JSON.stringify(value));
}

// ユーザマスタ追加/更新
function changeUserMaster(email: string, value: any): void {
    const userMasterSS = SpreadsheetApp.openById('1l5QRVxOc8puz6Zlx3-fNIG-6nx4w6ekvq6NGQmxGxxk');
    const userMasterSheet = userMasterSS.getSheetByName('0');
    const userMasterTextFinder = userMasterSheet.createTextFinder(email);
    const userMasterFindNext = userMasterTextFinder.findNext();
    if (!userMasterFindNext) {
        const userMasterLastRowIndex = userMasterSheet.getLastRow() + 1;
        userMasterSheet.getRange('A' + userMasterLastRowIndex).setValue(email);
        const sheetIds = createNewSheet(value.name);
        const userData = {
            id: value.id,  // id
            name: value.name,  // 名前
            role: +value.role,  // 権限
            commuting: false,  // 出勤有無
            currentContent: '', // 最近の業務内容
            defaultTimeSetings: 1, // 基本時間設定
            paidHolidayTotalTime: +value.paidHolidayTotalTime,  // 有給残時間
            workingHoursSheetId: sheetIds.workinHours,
            expensesSheetId: sheetIds.expenses,
            paidHolidaySheetId: sheetIds.paidHoliday,
        };
        userMasterSheet.getRange('B' + userMasterLastRowIndex).setValue(JSON.stringify(userData));
        
        // 時間設定
        const timeSettingsMasterSS = SpreadsheetApp.openById('19Eqx1c0S3tlDN3OAQmU8kMn_aXX9RPleKm5mcJ_1XEU');
        const timeSettingsMasterSheet = timeSettingsMasterSS.getSheetByName('0');
        const timeSettingsLastRowIndex = timeSettingsMasterSheet.getLastRow() + 1;
        timeSettingsMasterSheet.getRange('A' + timeSettingsLastRowIndex).setValue(value.id);
        timeSettingsMasterSheet.getRange('B' + timeSettingsLastRowIndex).setValue(JSON.stringify([{ "no": 1, "restTimeFrom2": "", "restTimeFrom1": "1200", "workStartTime": "0900", "name": "社内", "workEndTime": "1800", "restTimeTo3": "", "restTimeFrom3": "", "restTimeTo1": "1300", "restTimeTo2": "", "interval": "15" }]));
    } else {
        const userMasterCell = userMasterSheet.getRange('B' + userMasterFindNext.getRowIndex());
        let userMasterData = JSON.parse(userMasterCell.getValue());
        userMasterData = {
            ...userMasterData,
            name: value.name,  // 名前
            role: +value.role,  // 権限
            defaultTimeSetings: +value.defaultTimeSetings,
            paidHolidayTotalTime: +value.paidHolidayTotalTime,  // 有給残時間
        };
        userMasterCell.setValue(JSON.stringify(userMasterData));
    }
}

// 新しいスプレッドシートを作成
function createNewSheet(name: string) {
    const original = SpreadsheetApp.openById('1GeHdS3Sqk-qKO-T--L3xl17g9h9Yogdey6dScxaFbxs');　// ひな形取得

    // 出退勤
    const newWorkingHoursSheet = original.copy(name); // コピーを作成
    const workingHoursFolder = DriveApp.getFolderById('1sejeXDbmrVGYz119RPg878jnJCRomlDu'); // 出力フォルダを取得
    const workingHoursExisting = workingHoursFolder.getFilesByName(name); // すでにシートが存在するか確認し、存在すれば削除
    if (workingHoursExisting.hasNext()) {
        workingHoursFolder.removeFile(workingHoursExisting.next());
    }
    workingHoursFolder.addFile(DriveApp.getFileById(newWorkingHoursSheet.getId())); // 対象フォルダにシートを追加

    // 交通費精算
    const newExpensesSheet = original.copy(name); // コピーを作成
    const expensesFolder = DriveApp.getFolderById('1stRm8FzrkWnVUMK5ujVbNftGxBtkg44y'); // 出力フォルダを取得
    const expensesExisting = expensesFolder.getFilesByName(name); // すでにシートが存在するか確認し、存在すれば削除
    if (expensesExisting.hasNext()) {
        expensesFolder.removeFile(expensesExisting.next());
    }
    expensesFolder.addFile(DriveApp.getFileById(newExpensesSheet.getId())); // 対象フォルダにシートを追加

    // 有給管理
    const newPaidHolidaySheet = original.copy(name); // コピーを作成
    const paidHolidayFolder = DriveApp.getFolderById('1LhoApxj91fmOnrq7QTLehaYy7khYmrHp'); // 出力フォルダを取得
    const paidHolidayExisting = paidHolidayFolder.getFilesByName(name); // すでにシートが存在するか確認し、存在すれば削除
    if (paidHolidayExisting.hasNext()) {
        paidHolidayFolder.removeFile(paidHolidayExisting.next());
    }
    paidHolidayFolder.addFile(DriveApp.getFileById(newPaidHolidaySheet.getId())); // 対象フォルダにシートを追加

    return {
        workinHours: newWorkingHoursSheet.getId(),
        expenses: newExpensesSheet.getId(),
        paidHoliday: newPaidHolidaySheet.getId()
    }
}

// 勤務表のスプレッドシートを作成
function createWorkingHoursSheet(data: any, date: string, id: string, name: string): string {
    const dates = date.split('/');
    const original = SpreadsheetApp.openById('1NTWfjsbha2JrJgmUeY1UPDWI_eMw8vw8TA3rNaj_8CI');　// ひな形取得
    const sheetName = original.getName() + '_' + name; // 新しいシート名
    const newSheet = original.copy(sheetName); // コピーを作成
    const folder = DriveApp.getFolderById('1ypVPiaT05_T-UE1WbL0zYLwP05JViddY'); // 出力フォルダを取得
    const folderName = dates[0] + ('0' + dates[1]).slice(-2);
    const folderIterator = folder.getFoldersByName(folderName); // 対象フォルダのイテレータを取得
    const targetFolder = folderIterator.hasNext()
        ? folderIterator.next()
        : folder.createFolder(folderName); // 対象フォルダが存在する場合はフォルダを取得、存在しない場合は作成

    const existing = targetFolder.getFilesByName(sheetName); // すでにシートが存在するか確認し、存在すれば削除
    if (existing.hasNext()) {
        targetFolder.removeFile(existing.next());
    }
    targetFolder.addFile(DriveApp.getFileById(newSheet.getId())); // 対象フォルダにシートを追加

    const timeSettings = getTimeSettings()[id];
    
    // 勤務表生成処理

    return newSheet.getUrl();
}

// 交通費精算のスプレッドシートを作成
function createExpensesSheet(data: any, year: string, wareki: string, name: string): string {
    const dates = wareki.split('/');
    const original = SpreadsheetApp.openById('1WMAP-LCQPwy_7afhZwpkq2JlgvgPhgNxKnuWbX5tn7A');　// ひな形取得
    const sheetName = original.getName() + '_' + name; // 新しいシート名
    const newSheet = original.copy(sheetName); // コピーを作成
    const folder = DriveApp.getFolderById('1qfTHPoL23nK8B1hLQowXG06uv9I-DTJf'); // 出力フォルダを取得
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
// 毎日早朝6~7時に実行
function resetCommuting(): void {
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

            const workingHoursSS = SpreadsheetApp.openById(userData.workingHoursSheetId);
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