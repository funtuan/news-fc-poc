
import { BaseParser } from "./base";
import * as cheerio from 'cheerio';

export class YahooParser extends BaseParser {
  getArticle() {
    const $ = cheerio.load(this.html);
    const title = $('h1[data-test-locator="headline"]').text();
    
    const content = $('.caas-body').text().replace(/<img[^>]*>/g, '');
    const createdStr = $('time').attr('datetime');
    const createdAt = createdStr ? new Date(createdStr) : null;
    const author = $('.caas-author-byline-collapse').text();
    return { title, content, createdAt, author };
  }
}
