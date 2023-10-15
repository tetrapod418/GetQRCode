import React, {useState, useEffect} from "react";
import './App.css';
import {UrlList} from "./url_list.js";

function App() {
  return(
    <div>
      <h1>kintoneアプリから取得したURLのリスト</h1>
      <UrlList />
  </div>
  );
 };

export default App;
