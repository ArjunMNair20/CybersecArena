import { useState, useEffect } from 'react';
import { ExternalLink, Calendar, User, Tag, Search, RefreshCw, AlertCircle } from 'lucide-react';
import newsService, { NewsArticle } from '../services/newsService';

export default function NewsFeed() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredArticles, setFilteredArticles] = useState<NewsArticle[]>([]);

  useEffect(() => {
    loadNews();
  }, []);

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

  const loadNews = async () => {
    setLoading(true);
    setError(null);
    try {
      const news = await newsService.getCybersecurityNews(20);
      setArticles(news);
      setFilteredArticles(news);
    } catch (err) {
      setError('Failed to load news. Please try again later.');
      console.error(err);
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
          <h1 className="text-3xl font-bold text-cyan-300 mb-2">Cybersecurity News Feed</h1>
          <p className="text-slate-400">Stay updated with the latest cybersecurity news, threats, and updates</p>
        </div>
        <button
          onClick={loadNews}
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 hover:bg-cyan-500/30 disabled:opacity-50 transition-colors flex items-center gap-2"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
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
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-black/40 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30"
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
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="animate-spin text-cyan-400" size={32} />
          <span className="ml-3 text-slate-400">Loading latest cybersecurity news...</span>
        </div>
      )}

      {/* News Articles */}
      {!loading && filteredArticles.length > 0 && (
        <div className="grid gap-4">
          {filteredArticles.map((article) => (
            <article
              key={article.id}
              className="border border-slate-800 rounded-lg p-6 bg-gradient-to-br from-white/[0.03] to-white/[0.01] hover:border-cyan-400/30 transition-all group"
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
                      <span className="px-2 py-1 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
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
                  <h2 className="text-xl font-bold text-cyan-300 group-hover:text-cyan-200 transition-colors">
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
                      className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
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
