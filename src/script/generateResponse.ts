
import axios from 'axios';
import { YahooParser } from '../htmlParsers/yahoo';

// load data json
import fs from 'fs';
import path from 'path';

// dotenv
import dotenv from 'dotenv';
dotenv.config();

const openaiToken = process.env.OPENAI_TOKEN;

// 執行 openai gpt 3.5
async function openaiGPT3(messages: { role: string, content: string }[]) {
  const res = await axios.post('https://api.openai.com/v1/chat/completions', {
    'model': 'gpt-3.5-turbo',
    'messages': messages,
  }, {
    headers: {
      authorization: `Bearer ${openaiToken}`,
    },
  });
  return {
    content: res.data.choices[0].message.content,
    // 消耗的 token 數量
    tokens: res.data.usage.total_tokens,
  };
}

async function getNewsContent(newsLink: string) {
  const res = await axios.get(newsLink);
  const html = res.data;
  const parser = new YahooParser(html);
  const article = parser.getArticle();
  return article;
}

const 評分標準 = `- 語言中立性：評估文章中的語言是否中立，避免使用情感色彩濃厚的詞彙，如正面或貶義詞語。
- 情感詞語使用：注意文章中情感詞語的使用頻率，過多的情感詞語可能意味著作者帶有個人情緒。
- 背景資訊：文章是否提供了足夠的背景資訊，以幫助讀者了解事件或議題的脈絡。
- 觀點多樣性：文章是否充分涵蓋了不同的觀點和意見，並在適當的情況下提供平衡的報導。
- 引用數量：檢查文章中引用的資料來源數量，多元且充足的資料來源有助於提高文章的可信度。
- 來源類型：評估引用資料的類型，如政府報告、學術研究、專家意見等，並確保這些來源在相應領域具有權威性。
- 透明度：檢查文章是否清楚標明了資料來源，讓讀者可以追溯並查證相關資訊。`

const 回應格式 = `回應格式：\n評分項目;分數;說明原因\n...`

const 要求提示 = `評估新聞內容是否以上7項標準，並各別以 0 ~ 10 分描述，並說明原因`

// 處理一篇新聞
async function procressNews(newsLink: string) {
  const article = await getNewsContent(newsLink);
  const messages = [
    { role: 'system', content:`${評分標準}\n\n${要求提示}\n\n${回應格式}` },
    { role: 'user', content: `title:${article.title}\n\ncontent:${article.content.slice(0, 2000)}` },
  ];
  const {
    content: response,
    tokens,
  } = await openaiGPT3(messages);

  // 解析 csv
  const fields = ['評分項目', '分數', '原因'];
  const rows = (response.split('\n') as string[])
    .filter(one => one)
    .map(row => row.split(';')) as string[][]
  const responseObj = rows.reduce((acc, row) => {
    const obj = row.reduce((acc, field, index) => {
      acc[fields[index]] = field;
      return acc;
    }, {} as { [key: string]: string });
    acc.push(obj);
    return acc;
  }, [] as { [key: string]: string }[]);
  console.log(newsLink, responseObj);
  return {
    link: newsLink,
    article,
    response: response,
    responseObj,
    usedTokens: tokens,
  };
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  const saveFileName = `response-${+new Date()}.json`
  const newsLinks = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/newsLinks.json'), 'utf8')) as string[];

  let data = []
  for(const newsLink of newsLinks.slice(0, 3)) {
    try {
      const one = await procressNews(newsLink);
      data.push(one);
    } catch(e) {
      data.push({
        link: newsLink,
        error: e
      });
    }
    fs.writeFileSync(path.resolve(__dirname, `../data/${saveFileName}`), JSON.stringify(data, null, 2));
    await delay(1000 * 10);
  }

}

main();

async function test() {
  const newsLinks = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/newsLinks.json'), 'utf8')) as string[];

  // 隨機取一
  const link = newsLinks[Math.floor(Math.random() * newsLinks.length)];
  const data = await procressNews(link)

  console.log('data', data)
}

// test();