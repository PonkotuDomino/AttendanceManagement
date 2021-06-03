# 出退勤管理  
  
## あらまし  
当初は出向先での"""最新技術"""で開発をしようと考えておりましたが最近はGoogle系をやっているため、GoogleAppsScriptを絡める形に変更しました。  
そのため、基本的にはJavaScriptの開発になります。  
古い技術でやっていても仕方がないので割と新しめの技術を用いて開発しようかと思い、React(ReactHooks)+TypeScriptでの開発にしました。  

## 開発環境設定  
1．VSCodeをインストール  
2．Nodejsをインストール。推奨版のインストールをおすすめします。  
3．Gitをインストール。  
4．プロジェクトをクローン(https://github.com/PonkotuDomino/AttendanceManagement.git)する。  
5．VSCode上で「Ctrl＋＠」でコンソールを表示します。  
6．「npm install」コマンドを実行してpackage.json内に記述されているパッケージのインストールを行います。※少し時間がかかるかも  
7．「npm i @google/clasp -g」コマンドを実行しVSCodeとGoogleAppsScriptを連携するパッケージをインストールする。  
8．「clasp login」コマンドを実行しclaspで使用するgoogleアカウントを設定する。※社内開発なので社内アカウント  
※8にて「このシステムではスクリプトの実行が無効になっているため～」というエラーが出た場合、「Set-ExecutionPolicy RemoteSigned -Scope Process」コマンドを実行してから再度行ってください。  
&emsp;一時的に当システム(このパソコンでのPowerShell)スクリプトの実行条件を変更します。
以上で開発環境が完成します。    
  
## ディレクトリ構成  
dist  
&emsp;webpack出力ファイル。claspのpush対象はこのフォルダに格納。 
&emsp;app.ts以外は編集不要。 
node_module  
&emsp;npm install (-s or -d) ~で取得したモジュールの格納フォルダ。 
&emsp;npmコマンド以外での更新は絶対に行わない。 
public  
&emsp;webpackで出力するhtmlのtemplateファイルを配置。  
&emsp;templateに関連するファイルを格納。  
&emsp;編集不要。 
src  
&emsp;開発に使用するts，tsxファイルを格納。  
&emsp;webpackに入力されるファイルを格納。  
types  
&emsp;type，extention，interface等々を入れようかと...  
&emsp;現在うまく活用できてない。  
.clasp.json  
&emsp;clasp create時に自動生成。  
&emsp;編集不要。  
.claspignore  
&emsp;指定したファイルをclaspのpush対象外にする。  
&emsp;「!ファイル名」の場合、対象になる。  
.gitignore  
&emsp;指定したファイルをgitのpush対象外にする。 
package-lock.json  
&emsp;直接編集は絶対にしてはいけない。  
package.json  
&emsp;npm install時に生成。  
&emsp;いろいろ設定できる為、都度調べて実装すると良いかも。  
tsconfig.json  
&emsp;TypeScriptのコンパイラオプションを記述。  
&emsp;いろいろ設定できる為etc...  
webpack.config.js  
  >webpack は WebApp に必要なリソースの依存関係を解決し、アセット（配布物）を生成するビルドツール（要するにコンパイラ）です。JavaScript だけでなく、CoffeeScript や TypeScript、CSS 系、画像ファイルなどを扱うことができます。  
  >WebApp のビルドツールは Grunt や Gulp が有名です。これらは基本的に、ビルド手順をタスクという形で自ら定義する必要があり、フロントエンド開発に馴染みのない開発者にとっては敷居が高いものでした（少なくとも、自分はそうでした）。  
  >webpack を使えば、Grunt も Gulp も必要ありません！覚えるべきことはほとんどありません。（必要なら）簡単な設定ファイルを書いて webpack コマンドを実行するだけです。  
&emsp;※ [webpack で始めるイマドキのフロントエンド開発](https://qiita.com/yosisa/items/61cfd3ede598e194813b)
&emsp;いろいろ設定でetc...  

### 出力ファイルのhtmlにjavascriptを貼り付けている理由
&emsp;webpackで結合したスクリプトをhtmlに貼り付けています。  
&emsp;GAS(GoogleAppsScript)の性質上(サーバサイドレンダリング)、htmlに直にjavascriptを記述する必要性がでてきました。  
&emsp;html，jsを分けて出力した場合、htmlのjs実行がサーバサイドで行われてしまう。  
&emsp;サーバサイドで行われると、window，document等が参照不可能になり、エラーが発生。ページの実行すら不可能になる。  

### NPMコマンドに関して  
devBuild：デバッグビルドします。  
prodBuild：プロダクションビルドします。  
devDebug：ローカルでデバッグビルドにて実行します。  
prodDebug：ローカルでプロダクションビルドにて実行します。  
devWatch：？？？  
prodWatch：？？？  
devClaspPush：デバッグビルドでclaspにプッシュします。  
prodClaspPush：プロダクションビルドでclaspにプッシュします。  
claspPush：現在の状態でpushします。  
claspCreate：プロジェクトの作成を行います。  
