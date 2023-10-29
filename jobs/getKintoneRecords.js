const {KintoneRestAPIClient} = require('@kintone/rest-api-client');
const {writeFile} = require('fs');

// リスト表示用タグの取得
function getUrlList(rows) {
  const urls = rows.map(
    (row) => {
      return `\t\t<li><div>${row.title}<div><img src=\"${getQRCodeUrl(row.url)}\" alt=\"${row.url}\" title=\"${row.title}\" /><div>${row.descriptions}</div></div></div></li>\n`;
        });
        return urls.join('');
}

// QRコード生成用URLの取得
function getQRCodeUrl(url) {
  return `http://api.qrserver.com/v1/create-qr-code/?data=${url}&size=100x100`;
}

// リスト表示用タグの整形
function getExportFileData(urls) {
  return `export function UrlList() { \n\t return ( <ul>\n${urls}</ul>\n);\n}`;
}

(async () => {
    try {
      // クライアントの作成
      const client = new KintoneRestAPIClient({
        // kintoneのデータ取得先を設定
        baseUrl: 'https://1lc011kswasj.cybozu.com',
        auth: {
          apiToken: process.env.KINTONE_API_TOKEN
        }
      });
  
      // リクエストパラメータの設定
      const APP_ID = 2;
      const query_string = 'ステータス="accepted" or ステータス="published" order by $id';
      const params = {
        app: APP_ID,
        fields:['$id', 'ステータス', 'title', 'URL', 'descriptions'],
        query: query_string
      };
      
      // レコードの取得
      const resp = await client.record.getRecords(params);
      const kintoneRows = resp.records.map(
        (record)=>{
          const jrec = JSON.parse(JSON.stringify(record));
          return {
            id : jrec.$id.value,
            title: jrec.title.value,
            url: jrec.URL.value,
            descriptions: jrec.descriptions.value,
            status: jrec.ステータス.value
          };
        });
      // 新しい対象データの有無
      if(kintoneRows.filter((row)=>row.status === 'accepted').length === 0){
        console.log('not exist of update => data skip next job');
        return;
      }

      // リスト表示用タグの取得
      const urls = getUrlList(kintoneRows);
      const exportData = getExportFileData(urls);
      
      const LIST_PATH = './src/url_list.js';

      // 表示用リストファイル出力
      const listFile = writeFile(LIST_PATH, exportData, err => {
        if( err ){
          console.log(err.message);
        } else {
          console.log(`create data file`);
        }
      }); 

      // 取得データのステータス更新
      kintoneRows.forEach(
        (record) => {
          if(record.status === "accepted"){
            client.record.updateRecordStatus( {action:'公開する', app:APP_ID, id:record.id})
          }});
     
    } catch (err) {
      console.log(err);
    }
  })();