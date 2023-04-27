
import axios from 'axios';
import { YahooParser } from '../htmlParsers/yahoo';

// load data json
import fs from 'fs';
import path from 'path';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  const response = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, '../data/response.json'), 'utf8')
  ) as {
    link: string;
    error?: any;
    responseObj: {
      '評分項目': string;
      '分數': string;
      '原因': string;
    }[];
  }[]

  // 統計各評分項目、各分數數量分佈
  const data = response
  .filter(one => !one.error)
  .reduce((acc, one) => {
    one.responseObj.forEach(item => {
      const { '評分項目': key, '分數': score } = item;
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

  console.log('data', data);

}

main();
