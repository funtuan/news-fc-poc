
import axios from 'axios';
import { YahooParser } from './htmlParsers/yahoo';

async function main() {
  // get articles
  const res = await axios.get('https://tw.news.yahoo.com/%E6%98%A5%E5%AD%A3%E5%A4%A7%E5%8F%8D%E6%94%BB%E6%93%9A%E9%BB%9E%E5%9C%A8%E9%80%99-%E7%83%8F%E5%9C%A8%E6%9C%AD%E6%B3%A2%E7%BE%85%E7%86%B1%E9%9B%86%E7%B5%90%E8%90%AC%E4%BA%BA%E5%A4%A7%E8%BB%8D-110112194.html');

  // get html
  const html = res.data;

  const parser = new YahooParser(html);
  const article = parser.getArticle();
  console.log('article', article);
}

main();
