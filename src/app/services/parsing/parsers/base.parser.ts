import { ParsedProperty, ParsingResult } from '../../../../types/property';

export abstract class BaseParser {
  abstract parse(url: string): Promise<ParsingResult>;
  
  protected abstract extractData(html: string, url: string): Promise<ParsedProperty>;
  
  protected async fetchPage(url: string): Promise<string> {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.text();
  }
}
