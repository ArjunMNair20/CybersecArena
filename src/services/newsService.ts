export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  content?: string;
  source: string;
  author?: string;
  url: string;
  imageUrl?: string;
  publishedAt: string;
  category?: string;
  tags?: string[];
}

class NewsService {
  private newsCache: NewsArticle[] | null = null;
  private cacheTimestamp: number = 0;
  private CACHE_DURATION = 2 * 60 * 1000; // 2 minute cache
  private isFetching = false;
  private readonly STORAGE_KEY = 'cybersec_news_cache';
  private readonly STORAGE_TIMESTAMP_KEY = 'cybersec_news_timestamp';

  constructor() {
    // Load from localStorage on initialization
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      const timestamp = localStorage.getItem(this.STORAGE_TIMESTAMP_KEY);
      
      if (stored && timestamp) {
        this.newsCache = JSON.parse(stored);
        this.cacheTimestamp = parseInt(timestamp, 10);
        console.log(`📦 Loaded ${this.newsCache.length} articles from localStorage`);
      }
    } catch (error) {
      console.warn('Failed to load news from localStorage:', error);
    }
  }

  private saveToStorage() {
    try {
      if (this.newsCache && this.newsCache.length > 0) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.newsCache));
        localStorage.setItem(this.STORAGE_TIMESTAMP_KEY, this.cacheTimestamp.toString());
        console.log(`💾 Saved ${this.newsCache.length} articles to localStorage`);
      }
    } catch (error) {
      console.warn('Failed to save news to localStorage:', error);
    }
  }

  // Helper function with timeout
  private async fetchWithTimeout(url: string, options: RequestInit = {}, timeout: number = 5000): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  // Fetch from Reddit (using CORS proxy)
  private async fetchFromReddit(subreddit: string, limit: number = 15): Promise<NewsArticle[]> {
    const articles: NewsArticle[] = [];
    try {
      // Use CORS proxy to bypass CORS restrictions
      const redditUrl = `https://www.reddit.com/r/${subreddit}/new.json?limit=${limit}&raw_json=1`;
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(redditUrl)}`;
      
      const response = await this.fetchWithTimeout(proxyUrl, {}, 6000);
      
      if (response.ok) {
        const proxyData = await response.json();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let data: any;
        
        try {
          // Parse the contents from proxy response
          data = JSON.parse(proxyData.contents);
        } catch (parseError) {
          console.error(`Failed to parse Reddit ${subreddit} response:`, parseError);
          return articles;
        }
        
        const posts = data.data?.children || [];
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        posts.forEach((post: any) => {
          const postData = post.data;
          if (postData && postData.title) {
            articles.push({
              id: `reddit-${subreddit}-${postData.id}`,
              title: postData.title,
              description: postData.selftext ? postData.selftext.substring(0, 300) : `Discussion on ${subreddit}`,
              source: `Reddit r/${subreddit}`,
              author: `u/${postData.author}`,
              url: `https://reddit.com${postData.permalink}`,
              publishedAt: new Date(postData.created_utc * 1000).toISOString(),
              category: 'Community Discussion',
              tags: ['Security', 'Community', 'Discussion'],
            });
          }
        });
        console.log(`✓ Fetched ${articles.length} articles from Reddit r/${subreddit}`);
      } else {
        console.warn(`Reddit ${subreddit} response not OK:`, response.status);
      }
    } catch (error: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = error as any;
      console.log(`Reddit ${subreddit} fetch failed:`, err?.message || error);
    }
    return articles;
  }

  // Fetch from HackerNews
  private async fetchFromHackerNews(): Promise<NewsArticle[]> {
    const articles: NewsArticle[] = [];
    try {
      const topStoriesResponse = await this.fetchWithTimeout(
        'https://hacker-news.firebaseio.com/v0/topstories.json',
        {},
        5000
      );
      
      if (topStoriesResponse.ok) {
        const topStoryIds: number[] = await topStoriesResponse.json();
        const storyIds = topStoryIds.slice(0, 30); // Get more stories to filter
        
        const stories = await Promise.all(
          storyIds.map(id =>
            this.fetchWithTimeout(
              `https://hacker-news.firebaseio.com/v0/item/${id}.json`,
              {},
              4000
            )
              .then(res => res.json())
              .catch(() => null)
          )
        );
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        stories.forEach((story: any) => {
          if (story && story.title && story.url) {
            const titleLower = story.title.toLowerCase();
            if (titleLower.includes('security') || 
                titleLower.includes('cyber') ||
                titleLower.includes('hack') ||
                titleLower.includes('vulnerability') ||
                titleLower.includes('breach') ||
                titleLower.includes('malware') ||
                titleLower.includes('ransomware') ||
                titleLower.includes('phishing') ||
                titleLower.includes('attack') ||
                titleLower.includes('exploit')) {
              articles.push({
                id: `hn-${story.id}`,
                title: story.title,
                description: `${story.score || 0} upvotes | ${story.descendants || 0} comments`,
                source: 'Hacker News',
                author: story.by || 'Anonymous',
                url: story.url,
                publishedAt: new Date(story.time * 1000).toISOString(),
                category: 'Tech News',
                tags: ['HackerNews', 'Security', 'News'],
              });
            }
          }
        });
        console.log(`✓ Fetched ${articles.length} security articles from HackerNews`);
      }
    } catch (error: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = error as any;
      console.log('HackerNews fetch failed:', err?.message || error);
    }
    return articles;
  }

  // Fetch from CVE Database
  private async fetchFromCVE(): Promise<NewsArticle[]> {
    const articles: NewsArticle[] = [];
    try {
      const response = await this.fetchWithTimeout(
        'https://cve.circl.lu/api/last/10',
        {},
        5000
      );
      
      if (response.ok) {
        const cveData = await response.json();
        if (Array.isArray(cveData)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          cveData.forEach((cve: any) => {
            if (cve && cve.id && cve.summary) {
              articles.push({
                id: `cve-${cve.id}`,
                title: `${cve.id}: ${cve.summary.substring(0, 100)}`,
                description: cve.summary || `Critical security vulnerability: ${cve.id}`,
                source: 'CVE Database',
                author: 'CVE.org',
                url: `https://cve.mitre.org/cgi-bin/cvename.cgi?name=${cve.id}`,
                publishedAt: cve.Published || new Date().toISOString(),
                category: 'Vulnerabilities',
                tags: ['CVE', 'Vulnerability', 'Security', 'Patch', 'Critical'],
              });
            }
          });
          console.log(`✓ Fetched ${articles.length} CVEs`);
        }
      }
    } catch (error: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = error as any;
      console.log('CVE fetch failed:', err?.message || error);
    }
    return articles;
  }

  // Fetch from NewsAPI (using a free public API)
  private async fetchFromNewsAPI(): Promise<NewsArticle[]> {
    const articles: NewsArticle[] = [];
    try {
      // Using a public NewsAPI proxy that doesn't require API key
      // Alternative: use RSS feeds through a CORS proxy
      const response = await this.fetchWithTimeout(
        'https://api.rss2json.com/v1/api.json?rss_url=https://feeds.feedburner.com/TheHackersNews',
        {},
        6000
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.items && Array.isArray(data.items)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data.items.slice(0, 15).forEach((item: any, index: number) => {
            articles.push({
              id: `newsapi-${index}-${Date.now()}`,
              title: item.title || 'Security News',
              description: item.description?.replace(/<[^>]*>/g, '').substring(0, 300) || 'Cybersecurity news article',
              source: 'The Hacker News',
              author: item.author || 'The Hacker News',
              url: item.link || '#',
              publishedAt: item.pubDate || new Date().toISOString(),
              category: 'Security News',
              tags: ['Security', 'News', 'Hacking'],
            });
          });
        }
      }
    } catch (error) {
      console.log('NewsAPI/RSS fetch failed:', error);
    }
    return articles;
  }

  async getCybersecurityNews(limit: number = 30, forceRefresh: boolean = false): Promise<NewsArticle[]> {
    // Force refresh if requested
    if (forceRefresh) {
      this.newsCache = null;
      this.cacheTimestamp = 0;
    }
    
    // Return cached if still valid
    if (!forceRefresh && this.newsCache && Date.now() - this.cacheTimestamp < this.CACHE_DURATION) {
      console.log('⚡ Returning fresh in-memory cache');
      return this.newsCache.slice(0, limit);
    }

    // Return localStorage data immediately if available (even if old)
    if (!forceRefresh && this.newsCache) {
      console.log('⚡ Returning cached data immediately from memory');
      // Trigger background refresh in the background
      this.refreshInBackground();
      return this.newsCache.slice(0, limit);
    }

    // Prevent multiple simultaneous requests
    if (this.isFetching) {
      console.log('Already fetching, returning cache');
      return this.newsCache || [];
    }

    // If no cache at all, try localStorage
    if (!this.newsCache) {
      this.loadFromStorage();
      if (this.newsCache) {
        console.log('⚡ Returning localStorage data immediately');
        // Trigger background refresh
        this.refreshInBackground();
        return this.newsCache.slice(0, limit);
      }
    }

    // If still no data, fetch synchronously
    return await this.performFetch(limit);
  }

  private async refreshInBackground() {
    // Fetch fresh data without blocking - fire and forget
    this.performFetch(30).catch(error => {
      console.log('Background refresh failed silently:', error);
    });
  }

  private async performFetch(limit: number): Promise<NewsArticle[]> {
    // Prevent multiple simultaneous requests
    if (this.isFetching) {
      console.log('Already fetching, returning cache');
      return this.newsCache || [];
    }

    this.isFetching = true;
    try {
      console.log('📡 Fetching live cybersecurity news from multiple sources...');
      
      // Fetch from multiple sources in parallel (with better error handling)
      const results = await Promise.allSettled([
        this.fetchFromReddit('cybersecurity', 15),
        this.fetchFromReddit('netsec', 10),
        this.fetchFromHackerNews(),
        this.fetchFromCVE(),
        this.fetchFromNewsAPI(), // Add RSS feed source
      ]);

      // Extract successful results
      const allArticles: NewsArticle[] = [];
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          allArticles.push(...result.value);
          console.log(`✓ Source ${index + 1} fetched ${result.value.length} articles`);
        } else {
          console.warn(`✗ Source ${index + 1} failed:`, result.reason);
        }
      });

      if (allArticles.length === 0) {
        console.warn('No articles fetched from any source');
        // Return cached if available
        if (this.newsCache && this.newsCache.length > 0) {
          console.log('Returning cached articles as fallback');
          return this.newsCache;
        }
        return [];
      }

      // Remove duplicates and sort by date
      const uniqueArticles = Array.from(
        new Map(allArticles.map(article => [article.id, article])).values()
      ).sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

      // Update cache
      this.newsCache = uniqueArticles;
      this.cacheTimestamp = Date.now();
      
      // Save to localStorage for persistence
      this.saveToStorage();
      
      console.log(`✓ Successfully fetched ${uniqueArticles.length} live news articles from ${results.filter(r => r.status === 'fulfilled').length} sources`);
      return uniqueArticles.slice(0, limit);
    } catch (error) {
      console.error('Failed to fetch live news:', error);
      // Return cached if available
      if (this.newsCache && this.newsCache.length > 0) {
        console.log('Returning cached articles due to error');
        return this.newsCache;
      }
      return [];
    } finally {
      this.isFetching = false;
    }
  }

  async searchNews(query: string): Promise<NewsArticle[]> {
    try {
      // Fetch all news and filter by query
      const allNews = await this.getCybersecurityNews(100, false);
      const queryLower = query.toLowerCase();
      
      return allNews.filter(article => {
        const titleMatch = article.title.toLowerCase().includes(queryLower);
        const descMatch = article.description?.toLowerCase().includes(queryLower);
        const tagMatch = article.tags?.some(tag => tag.toLowerCase().includes(queryLower));
        const sourceMatch = article.source?.toLowerCase().includes(queryLower);
        const categoryMatch = article.category?.toLowerCase().includes(queryLower);
        
        return titleMatch || descMatch || tagMatch || sourceMatch || categoryMatch;
      }).sort((a, b) => {
        // Sort by relevance (title matches first)
        const aTitleMatch = a.title.toLowerCase().includes(queryLower);
        const bTitleMatch = b.title.toLowerCase().includes(queryLower);
        if (aTitleMatch && !bTitleMatch) return -1;
        if (!aTitleMatch && bTitleMatch) return 1;
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      });
    } catch (error) {
      console.error('Failed to search news:', error);
      return [];
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
  }
}

export default new NewsService();

