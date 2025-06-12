import { Quote } from '../types';

export class StorageService {
  private readonly STORAGE_KEY = 'logistics_quotes';

  getAllQuotes(): Quote[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  getQuote(id: string): Quote | null {
    const quotes = this.getAllQuotes();
    return quotes.find(q => q.id === id) || null;
  }

  saveQuote(quote: Quote): void {
    const quotes = this.getAllQuotes();
    const existingIndex = quotes.findIndex(q => q.id === quote.id);
    
    if (existingIndex >= 0) {
      quotes[existingIndex] = quote;
    } else {
      quotes.push(quote);
    }
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(quotes));
  }

  deleteQuote(id: string): void {
    const quotes = this.getAllQuotes();
    const filtered = quotes.filter(q => q.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
  }

  searchQuotes(query: string): Quote[] {
    const quotes = this.getAllQuotes();
    const lowercaseQuery = query.toLowerCase();
    
    return quotes.filter(quote => 
      quote.stops.some(stop => 
        stop.lga.toLowerCase().includes(lowercaseQuery) ||
        stop.address.toLowerCase().includes(lowercaseQuery)
      )
    );
  }

  exportToCSV(): string {
    const quotes = this.getAllQuotes();
    const headers = ['ID', 'Route', 'Load Size', 'Price', 'Created At', 'Status'];
    
    const rows = quotes.map(quote => [
      quote.id,
      quote.stops.map(s => `${s.type}: ${s.lga}`).join(' → '),
      quote.loadSize,
      `₦${quote.price.toLocaleString()}`,
      new Date(quote.createdAt).toLocaleDateString(),
      quote.status
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
}