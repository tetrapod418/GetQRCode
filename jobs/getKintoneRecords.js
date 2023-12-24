const {KintoneRestAPIClient} = require('@kintone/rest-api-client');
const {appendFile} = require('fs');
const {readFileSync} = require('fs');
const { Octokit } = require("@octokit/rest");
const { exit } = require('process');

// リスト表示用csv出力データの取得
function getUrlList(id, title, url, descriptions) {
  return `${id},${title},${url},${descriptions}\n`;
}

// リポジトリのファイル情報取得
async function GetRepoFile(octokit, filepath){
  
  let repofile;
  try{
    repofile = await octokit.repos.getContent({
      owner: 'tetrapod418',//'owner-name',
      repo: 'GetQRCode',//'repo-name',
      path: filepath,//'path/to/file',
    });

    return repofile;
  }catch(err){
    console.error(`GetRepoFile error: ${err.message} status=${err.status}`);
    return null;
  }

}
// GitHub REST APIでリポジトリのcsvファイルを更新する
async function createOrUpdate(filepath, content){

  // 更新内容の読み込み
  try{
    const octokit = new Octokit({
      auth: process.env.MY_PRIVATE_TOKEN,
     });

     const file = GetRepoFile(octokit, filepath);

     const sha = (!file || !file.data.sha) ? "null" : file.data.sha;
     console.log(`sha=${sha}`);
   

     // 新規登録または追加
    octokit.repos.createOrUpdateFileContents({
        owner: 'tetrapod418',//'owner-name',
        repo: 'GetQRCode',//'repo-name',
        path: 'public/url_list.csv',
        message: 'Updated CSV File!',
        content: Buffer.from(content).toString('base64'),
        sha:(!file || !file.data || !file.data.sha) ? null : file.data.sha
    });
      
  }
  catch(err){
    console.error(`${err.message} status=${err.status}`);
  };
 

}

(async () => {
    try {
      const LIST_PATH = 'public/url_list.csv';

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
      const query_string = 'ステータス="accepted" order by $id';
      const params = {
        app: APP_ID,
        fields:['$id', 'ステータス', 'title', 'URL', 'descriptions'],
        query: query_string
      };
      
      // レコードの取得
      const resp = await client.record.getRecords(params);
      if(!resp || resp.records.length === 0){
        console.log('nodata');
        return;
      }

      let content = readFileSync(LIST_PATH, { encoding: "utf8" });
      const kintoneRows = resp.records.map(
        (record)=>{
          const jrec = JSON.parse(JSON.stringify(record));
          // リスト表示用データのcsvデータ
          const urldata = getUrlList(jrec.$id.value,
                                         jrec.title.value,
                                         jrec.URL.value,
                                         jrec.descriptions.value);
          // 表示用csvに追加
          appendFile(LIST_PATH, urldata, err => {
            if( err ){
              console.log(err.message);
            } else {
              console.log(`appended data file`);
            }
          }); 
          // 承認済データのステータス更新
          client.record.updateRecordStatus( {action:'公開する', app:APP_ID, id:jrec.$id.value});
          // csvの内容をバッファに追加
          content+=urldata;
      });

      // ファイルの存在有無によって、新規追加or更新
      // GitHub REST APIでリポジトリのcsvファイルを更新する
      createOrUpdate(LIST_PATH, content);

    } catch (err) {
      console.log(err);
    }
  })();
