const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'http://localhost:3001');

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

export interface NewsResponse {
  articles: NewsArticle[];
  totalResults: number;
}

class NewsService {
  async getCybersecurityNews(limit: number = 20): Promise<NewsArticle[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/news?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: NewsResponse = await response.json();
      return data.articles || [];
    } catch (error) {
      console.error('Error fetching news:', error);
      // Return fallback news if API fails
      return this.getFallbackNews();
    }
  }

  async searchNews(query: string): Promise<NewsArticle[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/news/search?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: NewsResponse = await response.json();
      return data.articles || [];
    } catch (error) {
      console.error('Error searching news:', error);
      return [];
    }
  }

  // Fallback news data when API is unavailable
  private getFallbackNews(): NewsArticle[] {
    return [
      {
        id: '1',
        title: 'New OWASP Top 10 Update Released',
        description: 'The Open Web Application Security Project has released an updated Top 10 list of the most critical web application security risks, reflecting the evolving threat landscape.',
        source: 'OWASP',
        url: 'https://owasp.org/www-project-top-ten/',
        publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'Web Security',
        tags: ['OWASP', 'Web Security', 'Vulnerabilities'],
      },
      {
        id: '2',
        title: 'Supply Chain Attack Trends in 2025',
        description: 'Security researchers report a significant increase in supply chain attacks targeting software dependencies and third-party vendors. Organizations are urged to implement stricter vendor security assessments.',
        source: 'Security Weekly',
        url: '#',
        publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'Threat Intelligence',
        tags: ['Supply Chain', 'Threats', 'Risk Management'],
      },
      {
        id: '3',
        title: 'Phishing Techniques Evolve with AI',
        description: 'Cybercriminals are leveraging AI tools to create more convincing phishing emails and social engineering attacks. Security awareness training becomes more critical than ever.',
        source: 'CISA',
        url: '#',
        publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'Social Engineering',
        tags: ['Phishing', 'AI', 'Social Engineering'],
      },
      {
        id: '4',
        title: 'Zero-Day Vulnerability Found in Popular Web Framework',
        description: 'Security researchers have discovered a critical zero-day vulnerability affecting millions of websites. Immediate patching is recommended for affected systems.',
        source: 'Security Research',
        url: '#',
        publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'Vulnerabilities',
        tags: ['Zero-Day', 'Critical', 'Patch'],
      },
      {
        id: '5',
        title: 'Ransomware Attacks Target Healthcare Sector',
        description: 'A new ransomware campaign specifically targets healthcare organizations, encrypting patient data and disrupting critical services. Healthcare providers are advised to review their backup and recovery procedures.',
        source: 'Healthcare IT News',
        url: '#',
        publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'Ransomware',
        tags: ['Ransomware', 'Healthcare', 'Critical Infrastructure'],
      },
      {
        id: '6',
        title: 'New NIST Cybersecurity Framework Updates',
        description: 'The National Institute of Standards and Technology has released updates to its Cybersecurity Framework, providing new guidance for organizations to manage cybersecurity risk.',
        source: 'NIST',
        url: '#',
        publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'Standards',
        tags: ['NIST', 'Framework', 'Compliance'],
      },
    ];
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

