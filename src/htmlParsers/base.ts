
// 新聞 html 解析出文章標題、內容、發佈時間、作者

// 定義文章 interface
export interface IArticle {
  title: string;
  content: string;
  createdAt: Date | null;
  author: string | null;
}

// 定義解析器 class (abstract)
export abstract class BaseParser {
  constructor(protected html: string) {}
  abstract getArticle(): IArticle;
}