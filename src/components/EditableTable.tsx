import React from "react";
import MaterialTable, { Localization } from "material-table";

export function EditableTable(
  props: {
    title: string,
    header: any[],
    data: any[],
    options?: any,
    handleInsert?: (newData: any) => any,
    validationInsert?: (newData: any) => boolean,
    handleUpdate?: (newData: any, oldData: any) => any,
    validationUpdate?: (newData: any) => boolean,
    handleDelete?: (oldData: any) => any
  }) {

  const localizationJapanese: Localization = {
    error: "エラー",
    body: {
      emptyDataSourceMessage: "表示するレコードがありません。",
      filterRow: {
        filterPlaceHolder: "",
        filterTooltip: "フィルター",
      },
      editRow: {
        saveTooltip: "保存",
        cancelTooltip: "キャンセル",
        deleteText: "この行を削除しますか？",
      },
      addTooltip: "追加",
      deleteTooltip: "削除",
      editTooltip: "編集",
    },
    header: {
      actions: "",
    },
    grouping: {
      groupedBy: "グループ化:",
      placeholder: "ヘッダーをドラッグ ...",
    },
    pagination: {
      firstTooltip: "最初のページ",
      firstAriaLabel: "最初のページ",
      previousTooltip: "前のページ",
      previousAriaLabel: "前のページ",
      nextTooltip: "次のページ",
      nextAriaLabel: "次のページ",
      labelDisplayedRows: "{from}-{to} 全{count}件",
      labelRowsPerPage: "ページあたりの行数:",
      lastTooltip: "最後のページ",
      lastAriaLabel: "最後のページ",
      labelRowsSelect: "行",
    },
    toolbar: {
      addRemoveColumns: "列の追加、削除",
      nRowsSelected: "{0} 行選択",
      showColumnsTitle: "列の表示",
      showColumnsAriaLabel: "列の表示",
      exportTitle: "出力",
      exportAriaLabel: "出力",
      exportCSVName: "CSV出力",
      exportPDFName: "PDF出力",
      searchTooltip: "検索",
      searchPlaceholder: "検索",
      searchAriaLabel: "検索",
      clearSearchAriaLabel: "クリア",
    },
  };

  let editable = {};
  if (props.handleInsert) {
    editable['onRowAdd'] = (newData: any) =>
      new Promise((resolve, reject) => {
        setTimeout(() => {
          if (props.validationInsert && !props.validationInsert(newData)) {
            reject();
            return false;
          }

          props.handleInsert(newData);
          resolve(undefined);
        }, 1000)
      });
  }

  if (props.handleUpdate) {
    editable['onRowUpdate'] = (newData: any, oldData: any) =>
      new Promise((resolve, reject) => {
        setTimeout(() => {
          if (props.validationUpdate && !props.validationUpdate(newData)) {
            reject();
            return false;
          }

          props.handleUpdate(newData, oldData);
          resolve(undefined);
        }, 1000)
      });
  }

  if (props.handleDelete) {
    editable['onRowDelete'] = (oldData: any) =>
      new Promise((resolve) => {
        setTimeout(() => {
          props.handleDelete(oldData);
          resolve(undefined);
        }, 1000)
      });
  }

  return (
    <MaterialTable
      title={props.title}
      localization={localizationJapanese}
      columns={props.header}
      data={props.data}
      options={props.options}
      editable={editable}
    />
  )
}