const {KintoneRestAPIClient} = require('@kintone/rest-api-client');
const {appendFile} = require('fs');
const {readFileSync} = require('fs');
const { Octokit } = require("@octokit/rest");

// リスト表示用csv出力データの取得
function getUrlList(id, title, url, descriptions) {
  return `${id},${title},${url},${descriptions}\n`;
}

// リポジトリのファイル存在確認
async function isExistRepoFile(octokit, repofile){
  let file;
  try {
    file = await ({
      owner: 'tetrapod418',//'owner-name',
      repo: 'GetQRCode',//'repo-name',
      path: repofile,//'path/to/file',
    })
  } catch (e) {
    if (e.status !== 404) {
      throw e
    }
    file = null;
  }
  return file;
}

// GitHub REST APIでリポジトリのcsvファイルを更新する
async function createOrUpdate(filepath){

  const octokit = new Octokit({
        auth: process.env.MY_PRIVATE_TOKEN,
       });

  const repofile = filepath.replace('../', '');
  const file = isExistRepoFile(octokit, repofile);
  console.log(`repofile=${repofile}`);
  
  // 更新内容の読み込み
  try{
    const content = readFileSync(filepath, { encoding: "utf8" });
    console.log(`read data file complete[content]=${content}`);
    // 新規登録または追加
    octokit.repos.createOrUpdate({
        owner: 'tetrapod418',//'owner-name',
        repo: 'GetQRCode',//'repo-name',
        path: repofile,
        message: 'Updated CSV File!',
        content: Buffer.from(content).toString('base64'),
        sha: file ? file.data.sha : null,
    });
      
  }
  catch(err){
    console.error(err.message);
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
      });

      // ファイルの存在有無によって、新規追加or更新
      // GitHub REST APIでリポジトリのcsvファイルを更新する
      createOrUpdate(LIST_PATH);

    } catch (err) {
      console.log(err);
    }
  })();
