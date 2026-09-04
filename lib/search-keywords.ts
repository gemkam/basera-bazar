// Common filler words that shouldn't be matched against product titles —
// without filtering these out, a query like "how much is the fan" would
// search for a product literally called "how" (naive first-word matching)
// and never find anything, which is exactly the bug this fixes.
const STOPWORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'do', 'you', 'have', 'has', 'i', 'me', 'my',
  'want', 'to', 'buy', 'tell', 'about', 'what', 'whats', "what's", 'price',
  'of', 'for', 'in', 'stock', 'available', 'it', 'this', 'that', 'please',
  'hi', 'hello', 'hey', 'need', 'looking', 'show', 'much', 'how', 'can',
  'your', 'any', 'got', 'still', 'yet', 'and', 'or', 'with', 'be', 'will',
]);

export function extractKeywords(query: string): string[] {
  return query
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}
