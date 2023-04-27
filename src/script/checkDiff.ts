
import axios from 'axios';
import { YahooParser } from '../htmlParsers/yahoo';

// load data json
import fs from 'fs';
import path from 'path';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  const response1 = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, '../data/response-1682603338473.json'), 'utf8')
  ) as {
    link: string;
    error?: any;
    responseObj: {
      '評分項目': string;
      '分數': string;
      '原因': string;
    }[];
  }[]
  const response2 = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, '../data/response-1682608265114.json'), 'utf8')
  ) as {
    link: string;
    error?: any;
    responseObj: {
      '評分項目': string;
      '分數': string;
      '原因': string;
    }[];
  }[]

  const allowKeys = [
    '語言中立性',
    '情感詞語使用',
    '背景資訊',
    '觀點多樣性',
    '引用數量',
    '來源類型',
    '透明度',
  ]

  // 統計 response1 與 response2 差異
  /* 
    評分項目異動情況數量分佈
    標示各評分項目，兩筆資料差異，範例:
    {
      '語言中立性': { '-2': 1, '-1': 12, '0': 20, '+1': 10, '+2': 1, '+3': 1 },
      ...
    }
  */
  const diffScoreCounts = response1
  .filter(one => !one.error)
  .reduce((acc, one) => {
    const otherOne = response2.find(one2 => one2.link === one.link);
    if (!otherOne || otherOne.error) return acc;
    
    one.responseObj.forEach(item => {
      const { '評分項目': key1, '分數': score1 } = item;
      if (!score1 || !allowKeys.includes(key1)) return acc;

      const otherItem = otherOne.responseObj.find(item2 => item2['評分項目'] === key1);
      if (!otherItem) return acc;
      const { '評分項目': key2, '分數': score2 } = otherItem;

      if (isNaN(Number(score1.trim())) || isNaN(Number(score2.trim()))) {
        return
      }
      
      let diff = String(Number(score1.trim()) - Number(score2.trim()));
      // 正數加上 + 符號
      if (Number(diff) >= 0) diff = `+${diff}`;

      if(!acc[key1]) {
        acc[key1] = {};
      }
      if(!acc[key1][diff]) {
        acc[key1][diff] = 0;
      }
      acc[key1][diff] += 1;
      return acc;
    });
    return acc;
  }, {} as { [key: string]: { [key: string]: number } });

  // diffScoreCounts 重新排序 -2 -1 0 +1 +2 +3
  console.log('評分項目異動情況數量分佈', Object.keys(diffScoreCounts).reduce((acc, key) => {
    acc[key] = {};
    const keys = Object.keys(diffScoreCounts[key]).sort((a, b) => Number(a) - Number(b));
    keys.forEach(k => {
      acc[key][k] = diffScoreCounts[key][k];
    });
    return acc;
  }, {} as { [key: string]: { [key: string]: number } }));
}

main();
