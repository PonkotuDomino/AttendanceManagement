GAS(GoogleAppsScript)の性質上(サーバサイドレンダリング)、htmlに直にjavascriptを記述する必要がある。
html，jsを分けて出力した場合、htmlのjs実行がサーバサイドで行われてしまう。
サーバサイドで行われると、window，document等が参照不可能になり、エラーが発生。ページの実行すら不可能になる。

dist
  webpack出力ファイル。claspのpush対象はこのフォルダに格納。
node_module
  npm install (-s or -d) ~で取得したモジュールの格納フォルダ。
public
  webpackで出力するhtmlのtemplateファイルを配置。
  templateに関連するファイルを格納。
src
  開発に使用するts，tsxファイルを格納。
  webpackに入力されるファイルを格納。
types
  type，extention，interface等々を入れようかと...
.clasp.json
  clasp create時に自動生成。
  特に変更する必要性なし。
.claspignore
　指定したファイルをpush対象外にする。
  「!ファイル名」の場合、対象になる。
package-lock.json
  絶対いじるな。
package.json
  npm install時に生成。
  いろいろ設定できる為、都度調べて実装すると良いかも。
tsconfig.json
  TypeScriptのコンパイラオプションを記述。
  いろいろ設定できる為etc...
webpack.config.js
  >webpack は WebApp に必要なリソースの依存関係を解決し、アセット（配布物）を生成するビルドツール（要するにコンパイラ）です。JavaScript だけでなく、CoffeeScript や TypeScript、CSS 系、画像ファイルなどを扱うことができます。
  >WebApp のビルドツールは Grunt や Gulp が有名です。これらは基本的に、ビルド手順をタスクという形で自ら定義する必要があり、フロントエンド開発に馴染みのない開発者にとっては敷居が高いものでした（少なくとも、自分はそうでした）。
  >webpack を使えば、Grunt も Gulp も必要ありません！覚えるべきことはほとんどありません。（必要なら）簡単な設定ファイルを書いて webpack コマンドを実行するだけです。
  ※ [webpack で始めるイマドキのフロントエンド開発](https://qiita.com/yosisa/items/61cfd3ede598e194813b)
  いろいろ設定でetc...