import {useState, useEffect} from 'react';
import {marked} from 'marked';
import axios from 'axios';
import './App.css';

const UrlList = () => { 
  const baseURL = './url_list.md';
  const [post, setPost] = useState(null);
  useEffect(() => {
    axios.get(baseURL).then((response) => {
      setPost(marked(response.data));
    });
  }, []);

  if (!post) return <p>error!</p>;

  console.log(post);
  return (
    <div>{post}</div>
  );
}

function App() {
  return(
    <div>
      <h1>kintoneアプリから取得したURLのリスト</h1>
      <UrlList />
  </div>
  );
 };

export default App;
