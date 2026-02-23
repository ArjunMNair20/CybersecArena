import { useState, useEffect, useRef } from 'react';
import { ExternalLink, Calendar, User, Tag, Search, RefreshCw, AlertCircle, Clock } from 'lucide-react';
import newsService, { NewsArticle } from '../services/newsService';

export default function NewsFeed() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredArticles, setFilteredArticles] = useState<NewsArticle[]>([]);
  const [lastRefreshTime, setLastRefreshTime] = useState<string>('');
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load news immediately on mount and in background
  useEffect(() => {
    // Load news (will return immediately if cached)
    loadNewsWithCache(false);

    // Set up auto-refresh interval if enabled
    if (autoRefreshEnabled) {
      refreshIntervalRef.current = setInterval(() => {
        loadNewsWithCache(false);
      }, 3 * 60 * 1000); // 3 minutes
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefreshEnabled]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = articles.filter(
        (article) =>
          article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredArticles(filtered);
    } else {
      setFilteredArticles(articles);
    }
  }, [searchQuery, articles]);

  // Load news with cache first (immediate display), then fetch fresh
  const loadNewsWithCache = async (forceRefresh: boolean = false) => {
    try {
      setError(null);
      if (forceRefresh) setLoading(true);
      
      // Fetch news (returns cache immediately if available, fetches in background)
      const news = await newsService.getCybersecurityNews(30, forceRefresh);
      
      if (news.length > 0) {
        setArticles(news);
        setFilteredArticles(news);
        setLastRefreshTime(new Date().toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          second: '2-digit'
        }));
      }
    } catch (err: unknown) {
      const error = err as Error;
      const errorMessage = error?.message || 'Unknown error';
      console.error('News loading error:', err);
      
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
        setError('Cannot fetch news. Please check your internet connection and try again.');
      } else if (errorMessage.includes('timeout') || errorMessage.includes('aborted')) {
        setError('Request timed out. News sources may be slow. Please try refreshing.');
      } else {
        setError(`Failed to load news: ${errorMessage}. Please try again later.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      setLoading(true);
      try {
        const results = await newsService.searchNews(searchQuery);
        setFilteredArticles(results);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#A78BFA] mb-2">Cybersecurity News Feed</h1>
          <p className="text-slate-400">Stay updated with the latest cybersecurity news, threats, and updates</p>
          {lastRefreshTime && (
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
              <Clock size={14} />
              <span>Last updated: {lastRefreshTime}</span>
              {autoRefreshEnabled && <span className="text-[#A78BFA]">(Auto-refreshing every 3 minutes)</span>}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => {
              setLoading(true);
              loadNewsWithCache(true);
            }}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-[#A78BFA]/20 border border-[#A78BFA]/30 text-[#A78BFA] hover:bg-purple-500/30 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Refresh Now
          </button>
          <button
            onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
            className={`px-4 py-2 rounded-lg border text-sm transition-colors flex items-center gap-2 ${
              autoRefreshEnabled 
                ? 'bg-green-500/20 border-green-400/30 text-green-300 hover:bg-green-500/30' 
                : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <RefreshCw size={16} />
            {autoRefreshEnabled ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search news by title, description, or tags..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-black/40 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#FF6F61]/50 focus:ring-1 focus:ring-cyan-400/30"
          />
        </div>
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery('');
              setFilteredArticles(articles);
            }}
            className="px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors"
          >
            Clear
          </button>
        )}
        <button
          onClick={handleSearch}
          disabled={loading || !searchQuery.trim()}
          className="px-4 py-2 rounded-lg bg-fuchsia-500/20 border border-fuchsia-400/30 text-fuchsia-300 hover:bg-fuchsia-500/30 disabled:opacity-50 transition-colors"
        >
          Search
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-400/30 flex items-center gap-2 text-red-300">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Loading State */}
      {loading && articles.length === 0 && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="border border-slate-800 rounded-lg p-6 bg-gradient-to-br from-white/[0.03] to-white/[0.01] animate-pulse"
            >
              <div className="space-y-3">
                <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                <div className="h-4 bg-slate-700 rounded w-1/2"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-slate-700 rounded w-full"></div>
                  <div className="h-3 bg-slate-700 rounded w-5/6"></div>
                </div>
                <div className="flex gap-2 pt-2">
                  <div className="h-3 bg-slate-700 rounded w-16"></div>
                  <div className="h-3 bg-slate-700 rounded w-20"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* News Articles */}
      {!loading && filteredArticles.length > 0 && (
        <div className="grid gap-4">
          {filteredArticles.map((article) => (
            <article
              key={article.id}
              className="border border-slate-800 rounded-lg p-6 bg-gradient-to-br from-white/[0.03] to-white/[0.01] hover:border-[#FF6F61]/30 transition-all group"
            >
              <div className="flex flex-col md:flex-row gap-4">
                {/* Article Image (if available) */}
                {article.imageUrl && (
                  <div className="md:w-48 flex-shrink-0">
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-full h-32 object-cover rounded-lg border border-slate-800"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                {/* Article Content */}
                <div className="flex-1 space-y-3">
                  {/* Category and Date */}
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    {article.category && (
                      <span className="px-2 py-1 rounded bg-[#06b6d4]/20 text-[#06b6d4] border border-[#06b6d4]/30">
                        {article.category}
                      </span>
                    )}
                    <div className="flex items-center gap-1 text-slate-400">
                      <Calendar size={14} />
                      {newsService.formatDate(article.publishedAt)}
                    </div>
                    {article.source && (
                      <div className="flex items-center gap-1 text-slate-400">
                        <User size={14} />
                        {article.source}
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <h2 className="text-xl font-bold text-[#06b6d4] group-hover:text-cyan-200 transition-colors">
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline flex items-center gap-2"
                    >
                      {article.title}
                      <ExternalLink size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </h2>

                  {/* Description */}
                  <p className="text-slate-300 leading-relaxed">{article.description}</p>

                  {/* Tags */}
                  {article.tags && article.tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                      <Tag size={14} className="text-slate-500" />
                      {article.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 rounded bg-slate-800/50 text-slate-400 text-xs border border-slate-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Author (if available) */}
                  {article.author && (
                    <div className="text-sm text-slate-500">
                      By {article.author}
                    </div>
                  )}

                  {/* Read More Link */}
                  <div>
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-[#06b6d4] hover:text-[#06b6d4] text-sm font-medium transition-colors"
                    >
                      Read full article
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredArticles.length === 0 && !error && (
        <div className="text-center py-12">
          <p className="text-slate-400 text-lg">No news articles found.</p>
          {searchQuery && (
            <p className="text-slate-500 text-sm mt-2">Try a different search query.</p>
          )}
        </div>
      )}

      {/* Results Count */}
      {!loading && filteredArticles.length > 0 && (
        <div className="text-center text-sm text-slate-500">
          Showing {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''}
          {searchQuery && ` matching "${searchQuery}"`}
        </div>
      )}
    </div>
  );
}
