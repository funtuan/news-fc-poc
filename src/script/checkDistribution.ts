
import axios from 'axios';
import { YahooParser } from '../htmlParsers/yahoo';

// load data json
import fs from 'fs';
import path from 'path';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  const response = JSON.parse(
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

  // 統計各評分項目、各分數數量分佈
  const scoreCounts = response
  .filter(one => !one.error)
  .reduce((acc, one) => {
    one.responseObj.forEach(item => {
      let { '評分項目': key, '分數': score } = item;
      // 排除空格
      if (score) score = score.trim();
      if(!acc[key]) {
        acc[key] = {};
      }
      if(!acc[key][score]) {
        acc[key][score] = 0;
      }
      acc[key][score] += 1;
    });
    return acc;
  }, {} as { [key: string]: { [key: string]: number } });

  console.log('評分項目數量分布', scoreCounts);

  // 平均分數分佈情況
  const avgScoreCounts = response
  .filter(one => !one.error)
  .reduce((acc, one) => {
    const avgScore = one.responseObj.reduce((acc, item) => {
      let { '評分項目': key, '分數': score } = item;
      if (!score || !allowKeys.includes(key)) return acc;

      if ( Number(score.trim()) > 0 ) {
        acc += Number(score.trim());
      }
      return acc;
    }, 0) / allowKeys.length;
    
    // 標記分數區間如 0-0.5, 0.5-1... 以 0.5 為單位
    const scoreRange = `${Math.floor(avgScore * 2) / 2}-${Math.floor(avgScore * 2 + 1) / 2}`;
    if(!acc[scoreRange]) {
      acc[scoreRange] = 0;
    }
    acc[scoreRange] += 1;
    return acc;
  }, {} as { [key: string]: number });

  // 由小到大排序
  console.log('平均分數分佈情況', Object.entries(avgScoreCounts).sort((a, b) => Number(a[0].split('-')[0]) - Number(b[0].split('-')[0])));

}

main();
