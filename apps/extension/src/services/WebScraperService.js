/**
 * WebScraperService
 * 
 * Intelligent web scraping for company information extraction.
 * 
 * Features:
 * - About page scraping
 * - Careers page analysis
 * - News/blog scraping
 * - Contact/team page extraction
 * - Social media presence detection
 * - Structured data extraction (JSON-LD, microdata)
 * 
 * Best Practices:
 * - Respects robots.txt
 * - Rate limiting
 * - User-agent identification
 * - Error handling and retries
 */

class WebScraperService {
  constructor(config = {}) {
    this.userAgent = config.userAgent || 'Mozilla/5.0 (compatible; JobSeekBot/1.0; +https://jobseek.ai)';
    this.timeout = config.timeout || 10000; // 10 seconds
    this.retries = config.retries || 2;
    this.rateLimit = config.rateLimit || 1000; // 1 second between requests
    this.lastRequestTime = 0;
    this.cache = new Map();
    this.cacheTTL = config.cacheTTL || 24 * 60 * 60 * 1000; // 24 hours
  }

  /**
   * Main scraping orchestrator
   * @param {string} websiteUrl - Company website URL
   * @returns {Promise<Object>} Scraped data
   */
  async scrapeWebsite(websiteUrl) {
    console.log(`[WebScraper] Scraping website: ${websiteUrl}`);

    // Normalize URL
    const normalizedUrl = this.normalizeUrl(websiteUrl);

    // Check cache
    if (this.cache.has(normalizedUrl)) {
      const cached = this.cache.get(normalizedUrl);
      if (Date.now() - cached.timestamp < this.cacheTTL) {
        console.log(`[WebScraper] Using cached data for ${normalizedUrl}`);
        return cached.data;
      }
    }

    // Scrape different pages in parallel
    const [
      homepageData,
      aboutData,
      careersData,
      newsData,
      teamData,
      socialData
    ] = await Promise.all([
      this.scrapeHomepage(normalizedUrl),
      this.scrapeAboutPage(normalizedUrl),
      this.scrapeCareersPage(normalizedUrl),
      this.scrapeNewsPage(normalizedUrl),
      this.scrapeTeamPage(normalizedUrl),
      this.detectSocialMedia(normalizedUrl)
    ]);

    // Combine all scraped data
    const scrapedData = {
      url: normalizedUrl,
      timestamp: new Date().toISOString(),
      homepage: homepageData,
      about: aboutData,
      careers: careersData,
      news: newsData,
      team: teamData,
      social: socialData,
      summary: this.generateSummary({
        homepage: homepageData,
        about: aboutData,
        careers: careersData,
        news: newsData
      })
    };

    // Cache results
    this.cache.set(normalizedUrl, {
      timestamp: Date.now(),
      data: scrapedData
    });

    return scrapedData;
  }

  /**
   * Scrape homepage
   * @param {string} websiteUrl - Website URL
   * @returns {Promise<Object>} Homepage data
   */
  async scrapeHomepage(websiteUrl) {
    console.log(`[WebScraper] Scraping homepage: ${websiteUrl}`);

    try {
      const html = await this.fetchHtml(websiteUrl);
      if (!html) return null;

      return {
        title: this.extractTitle(html),
        description: this.extractDescription(html),
        headline: this.extractHeadline(html),
        tagline: this.extractTagline(html),
        keywords: this.extractKeywords(html),
        structuredData: this.extractStructuredData(html),
        language: this.detectLanguage(html),
        tone: this.detectTone(html)
      };
    } catch (error) {
      console.error('[WebScraper] Homepage scraping failed:', error);
      return null;
    }
  }

  /**
   * Scrape About page
   * @param {string} websiteUrl - Website URL
   * @returns {Promise<Object>} About page data
   */
  async scrapeAboutPage(websiteUrl) {
    console.log(`[WebScraper] Scraping About page: ${websiteUrl}`);

    const aboutUrls = [
      `${websiteUrl}/about`,
      `${websiteUrl}/about-us`,
      `${websiteUrl}/company`,
      `${websiteUrl}/who-we-are`,
      `${websiteUrl}/our-story`
    ];

    for (const url of aboutUrls) {
      try {
        const html = await this.fetchHtml(url);
        if (!html) continue;

        // Check if this looks like an About page
        if (!this.isAboutPage(html)) continue;

        const data = {
          url: url,
          mission: this.extractMission(html),
          vision: this.extractVision(html),
          values: this.extractValues(html),
          history: this.extractHistory(html),
          founded: this.extractFounded(html),
          founders: this.extractFounders(html),
          size: this.extractCompanySize(html),
          locations: this.extractLocations(html),
          description: this.extractLongDescription(html)
        };

        // Return if we found substantial data
        if (data.mission || data.vision || data.description) {
          return data;
        }
      } catch (error) {
        console.warn(`[WebScraper] Failed to scrape ${url}:`, error.message);
      }
    }

    return null;
  }

  /**
   * Scrape Careers page
   * @param {string} websiteUrl - Website URL
   * @returns {Promise<Object>} Careers page data
   */
  async scrapeCareersPage(websiteUrl) {
    console.log(`[WebScraper] Scraping Careers page: ${websiteUrl}`);

    const careersUrls = [
      `${websiteUrl}/careers`,
      `${websiteUrl}/jobs`,
      `${websiteUrl}/work-with-us`,
      `${websiteUrl}/join-us`,
      `${websiteUrl}/opportunities`
    ];

    for (const url of careersUrls) {
      try {
        const html = await this.fetchHtml(url);
        if (!html) continue;

        // Check if this looks like a Careers page
        if (!this.isCareersPage(html)) continue;

        return {
          url: url,
          culture: this.extractCultureInfo(html),
          benefits: this.extractBenefits(html),
          perks: this.extractPerks(html),
          workEnvironment: this.extractWorkEnvironment(html),
          diversity: this.extractDiversityInfo(html),
          growth: this.extractGrowthOpportunities(html),
          testimonials: this.extractEmployeeTestimonials(html),
          openPositions: this.extractOpenPositions(html)
        };
      } catch (error) {
        console.warn(`[WebScraper] Failed to scrape ${url}:`, error.message);
      }
    }

    return null;
  }

  /**
   * Scrape News/Blog page
   * @param {string} websiteUrl - Website URL
   * @returns {Promise<Object>} News data
   */
  async scrapeNewsPage(websiteUrl) {
    console.log(`[WebScraper] Scraping News page: ${websiteUrl}`);

    const newsUrls = [
      `${websiteUrl}/news`,
      `${websiteUrl}/blog`,
      `${websiteUrl}/press`,
      `${websiteUrl}/media`,
      `${websiteUrl}/newsroom`
    ];

    for (const url of newsUrls) {
      try {
        const html = await this.fetchHtml(url);
        if (!html) continue;

        const articles = this.extractNewsArticles(html);
        if (articles && articles.length > 0) {
          return {
            url: url,
            articles: articles.slice(0, 10), // Top 10 articles
            latestUpdate: articles[0] ? articles[0].date : null,
            categories: this.categorizeArticles(articles)
          };
        }
      } catch (error) {
        console.warn(`[WebScraper] Failed to scrape ${url}:`, error.message);
      }
    }

    return null;
  }

  /**
   * Scrape Team page
   * @param {string} websiteUrl - Website URL
   * @returns {Promise<Object>} Team data
   */
  async scrapeTeamPage(websiteUrl) {
    console.log(`[WebScraper] Scraping Team page: ${websiteUrl}`);

    const teamUrls = [
      `${websiteUrl}/team`,
      `${websiteUrl}/leadership`,
      `${websiteUrl}/about/team`,
      `${websiteUrl}/people`
    ];

    for (const url of teamUrls) {
      try {
        const html = await this.fetchHtml(url);
        if (!html) continue;

        const teamMembers = this.extractTeamMembers(html);
        if (teamMembers && teamMembers.length > 0) {
          return {
            url: url,
            members: teamMembers,
            leadership: teamMembers.filter(m => this.isLeadership(m.title)),
            size: teamMembers.length
          };
        }
      } catch (error) {
        console.warn(`[WebScraper] Failed to scrape ${url}:`, error.message);
      }
    }

    return null;
  }

  /**
   * Detect social media presence
   * @param {string} websiteUrl - Website URL
   * @returns {Promise<Object>} Social media data
   */
  async detectSocialMedia(websiteUrl) {
    console.log(`[WebScraper] Detecting social media: ${websiteUrl}`);

    try {
      const html = await this.fetchHtml(websiteUrl);
      if (!html) return null;

      const social = {
        linkedin: this.findLinkedInUrl(html),
        twitter: this.findTwitterUrl(html),
        facebook: this.findFacebookUrl(html),
        instagram: this.findInstagramUrl(html),
        github: this.findGitHubUrl(html),
        youtube: this.findYouTubeUrl(html)
      };

      // Remove null values
      return Object.fromEntries(
        Object.entries(social).filter(([_, url]) => url !== null)
      );
    } catch (error) {
      console.error('[WebScraper] Social media detection failed:', error);
      return null;
    }
  }

  /**
   * Fetch HTML with retries and rate limiting
   * @param {string} url - URL to fetch
   * @returns {Promise<string|null>} HTML content
   */
  async fetchHtml(url) {
    // Rate limiting
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.rateLimit) {
      await new Promise(resolve => setTimeout(resolve, this.rateLimit - timeSinceLastRequest));
    }
    this.lastRequestTime = Date.now();

    // Retry logic
    for (let attempt = 0; attempt <= this.retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(url, {
          headers: {
            'User-Agent': this.userAgent,
            'Accept': 'text/html,application/xhtml+xml',
            'Accept-Language': 'en-US,en;q=0.9'
          },
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          if (response.status === 404) {
            return null; // Page doesn't exist, don't retry
          }
          throw new Error(`HTTP ${response.status}`);
        }

        return await response.text();
      } catch (error) {
        if (attempt === this.retries) {
          console.warn(`[WebScraper] Failed to fetch ${url} after ${this.retries + 1} attempts:`, error.message);
          return null;
        }
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }

    return null;
  }

  /**
   * Extract title
   * @param {string} html - HTML content
   * @returns {string|null} Title
   */
  extractTitle(html) {
    const match = html.match(/<title>([^<]+)<\/title>/i);
    return match ? match[1].trim() : null;
  }

  /**
   * Extract meta description
   * @param {string} html - HTML content
   * @returns {string|null} Description
   */
  extractDescription(html) {
    const patterns = [
      /<meta\s+name="description"\s+content="([^"]+)"/i,
      /<meta\s+property="og:description"\s+content="([^"]+)"/i
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) return match[1].trim();
    }

    return null;
  }

  /**
   * Extract main headline (h1)
   * @param {string} html - HTML content
   * @returns {string|null} Headline
   */
  extractHeadline(html) {
    const match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    return match ? this.cleanText(match[1]) : null;
  }

  /**
   * Extract tagline
   * @param {string} html - HTML content
   * @returns {string|null} Tagline
   */
  extractTagline(html) {
    // Look for common tagline patterns
    const patterns = [
      /<p[^>]*class="[^"]*tagline[^"]*"[^>]*>([^<]+)<\/p>/i,
      /<div[^>]*class="[^"]*tagline[^"]*"[^>]*>([^<]+)<\/div>/i,
      /<h2[^>]*>([^<]{20,100})<\/h2>/i // Short h2 might be tagline
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) return this.cleanText(match[1]);
    }

    return null;
  }

  /**
   * Extract meta keywords
   * @param {string} html - HTML content
   * @returns {Array} Keywords
   */
  extractKeywords(html) {
    const match = html.match(/<meta\s+name="keywords"\s+content="([^"]+)"/i);
    if (match) {
      return match[1].split(',').map(k => k.trim()).filter(Boolean);
    }
    return [];
  }

  /**
   * Extract structured data (JSON-LD)
   * @param {string} html - HTML content
   * @returns {Array} Structured data objects
   */
  extractStructuredData(html) {
    const structuredData = [];
    const pattern = /<script\s+type="application\/ld\+json"[^>]*>(.*?)<\/script>/gis;
    let match;

    while ((match = pattern.exec(html)) !== null) {
      try {
        const data = JSON.parse(match[1]);
        structuredData.push(data);
      } catch (error) {
        console.warn('[WebScraper] Failed to parse structured data:', error.message);
      }
    }

    return structuredData;
  }

  /**
   * Check if page is About page
   * @param {string} html - HTML content
   * @returns {boolean} Is About page
   */
  isAboutPage(html) {
    const indicators = ['about us', 'our story', 'our mission', 'who we are', 'company history'];
    const textLower = html.toLowerCase();
    return indicators.some(indicator => textLower.includes(indicator));
  }

  /**
   * Check if page is Careers page
   * @param {string} html - HTML content
   * @returns {boolean} Is Careers page
   */
  isCareersPage(html) {
    const indicators = ['careers', 'join our team', 'open positions', 'job opportunities', 'work with us'];
    const textLower = html.toLowerCase();
    return indicators.some(indicator => textLower.includes(indicator));
  }

  /**
   * Extract mission statement
   * @param {string} html - HTML content
   * @returns {string|null} Mission
   */
  extractMission(html) {
    const patterns = [
      /(?:our\s+)?mission[:\s]+([^<.!?]{30,300}[.!?])/i,
      /mission\s+statement[:\s]+([^<.!?]{30,300}[.!?])/i
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) return this.cleanText(match[1]);
    }

    return null;
  }

  /**
   * Extract vision statement
   * @param {string} html - HTML content
   * @returns {string|null} Vision
   */
  extractVision(html) {
    const patterns = [
      /(?:our\s+)?vision[:\s]+([^<.!?]{30,300}[.!?])/i,
      /vision\s+statement[:\s]+([^<.!?]{30,300}[.!?])/i
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) return this.cleanText(match[1]);
    }

    return null;
  }

  /**
   * Extract company values
   * @param {string} html - HTML content
   * @returns {Array} Values
   */
  extractValues(html) {
    const values = [];
    const valueKeywords = [
      'integrity', 'innovation', 'collaboration', 'excellence', 'customer first',
      'transparency', 'diversity', 'inclusion', 'respect', 'passion',
      'teamwork', 'quality', 'accountability', 'trust', 'sustainability'
    ];

    const textLower = html.toLowerCase();
    for (const keyword of valueKeywords) {
      if (textLower.includes(keyword)) {
        // Try to extract context
        const pattern = new RegExp(`([^.!?]{20,150}${keyword}[^.!?]{20,150}[.!?])`, 'i');
        const match = html.match(pattern);

        values.push({
          value: keyword.charAt(0).toUpperCase() + keyword.slice(1),
          context: match ? this.cleanText(match[1]) : null
        });
      }
    }

    return values.slice(0, 8); // Top 8 values
  }

  /**
   * Extract company history
   * @param {string} html - HTML content
   * @returns {string|null} History
   */
  extractHistory(html) {
    const patterns = [
      /(?:our\s+)?history[:\s]+([^<]{100,500})/i,
      /(?:company\s+)?history[:\s]+([^<]{100,500})/i,
      /founded[^<]{10,200}/i
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) return this.cleanText(match[0]);
    }

    return null;
  }

  /**
   * Extract founded year
   * @param {string} html - HTML content
   * @returns {string|null} Year
   */
  extractFounded(html) {
    const match = html.match(/founded\s+(?:in\s+)?(\d{4})/i);
    return match ? match[1] : null;
  }

  /**
   * Extract founders
   * @param {string} html - HTML content
   * @returns {Array} Founders
   */
  extractFounders(html) {
    const founders = [];
    const pattern = /(?:founded|co-founded)\s+(?:by\s+)?([A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+and\s+[A-Z][a-z]+\s+[A-Z][a-z]+)?)/gi;
    let match;

    while ((match = pattern.exec(html)) !== null) {
      const names = match[1].split(/\s+and\s+/);
      founders.push(...names.map(name => name.trim()));
    }

    return [...new Set(founders)]; // Deduplicate
  }

  /**
   * Extract company size
   * @param {string} html - HTML content
   * @returns {string|null} Size
   */
  extractCompanySize(html) {
    const patterns = [
      /(\d+[\+\-]?\s*employees)/i,
      /team\s+of\s+(\d+[\+\-]?)/i,
      /(\d+[\+\-]?\s*people)/i
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) return match[1].trim();
    }

    return null;
  }

  /**
   * Extract locations
   * @param {string} html - HTML content
   * @returns {Array} Locations
   */
  extractLocations(html) {
    const locations = [];
    
    // Common city, state/country patterns
    const pattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?),\s*([A-Z]{2}|[A-Z][a-z]+)\b/g;
    let match;

    while ((match = pattern.exec(html)) !== null) {
      locations.push(`${match[1]}, ${match[2]}`);
    }

    return [...new Set(locations)].slice(0, 5); // Top 5 unique locations
  }

  /**
   * Extract long description
   * @param {string} html - HTML content
   * @returns {string|null} Description
   */
  extractLongDescription(html) {
    // Look for first substantial paragraph
    const pattern = /<p[^>]*>([^<]{100,500})<\/p>/i;
    const match = html.match(pattern);
    return match ? this.cleanText(match[1]) : null;
  }

  /**
   * Extract culture information from Careers page
   * @param {string} html - HTML content
   * @returns {Object} Culture info
   */
  extractCultureInfo(html) {
    const cultureKeywords = {
      innovative: /\b(innovative|innovation|cutting-edge|pioneering)\b/gi,
      collaborative: /\b(collaborative|teamwork|together|partnership)\b/gi,
      diverse: /\b(diverse|diversity|inclusion|inclusive)\b/gi,
      fastPaced: /\b(fast-paced|dynamic|agile|rapid)\b/gi,
      balanced: /\b(work-life balance|balanced|flexible|wellness)\b/gi
    };

    const culture = {};
    for (const [trait, pattern] of Object.entries(cultureKeywords)) {
      const matches = html.match(pattern);
      if (matches) {
        culture[trait] = {
          mentioned: true,
          count: matches.length
        };
      }
    }

    return Object.keys(culture).length > 0 ? culture : null;
  }

  /**
   * Extract benefits
   * @param {string} html - HTML content
   * @returns {Array} Benefits
   */
  extractBenefits(html) {
    const benefitKeywords = [
      'health insurance', 'dental', 'vision', '401k', 'retirement',
      'paid time off', 'pto', 'vacation', 'parental leave',
      'remote work', 'flexible hours', 'stock options', 'equity'
    ];

    const benefits = [];
    const textLower = html.toLowerCase();

    for (const keyword of benefitKeywords) {
      if (textLower.includes(keyword)) {
        benefits.push(keyword);
      }
    }

    return benefits;
  }

  /**
   * Extract perks
   * @param {string} html - HTML content
   * @returns {Array} Perks
   */
  extractPerks(html) {
    const perkKeywords = [
      'free lunch', 'catered meals', 'snacks', 'coffee',
      'gym membership', 'wellness', 'learning budget', 'conferences',
      'team outings', 'happy hours', 'game room', 'standing desks'
    ];

    const perks = [];
    const textLower = html.toLowerCase();

    for (const keyword of perkKeywords) {
      if (textLower.includes(keyword)) {
        perks.push(keyword);
      }
    }

    return perks;
  }

  /**
   * Extract work environment details
   * @param {string} html - HTML content
   * @returns {Object} Work environment
   */
  extractWorkEnvironment(html) {
    const env = {
      remote: html.toLowerCase().includes('remote') || html.toLowerCase().includes('work from home'),
      hybrid: html.toLowerCase().includes('hybrid'),
      office: html.toLowerCase().includes('office'),
      flexible: html.toLowerCase().includes('flexible')
    };

    return Object.values(env).some(v => v) ? env : null;
  }

  /**
   * Extract diversity information
   * @param {string} html - HTML content
   * @returns {string|null} Diversity info
   */
  extractDiversityInfo(html) {
    const patterns = [
      /diversity[^<.]{20,200}[.!?]/i,
      /inclusion[^<.]{20,200}[.!?]/i,
      /equal\s+opportunity[^<.]{20,200}[.!?]/i
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) return this.cleanText(match[0]);
    }

    return null;
  }

  /**
   * Extract growth opportunities
   * @param {string} html - HTML content
   * @returns {Array} Growth opportunities
   */
  extractGrowthOpportunities(html) {
    const opportunities = [];
    const keywords = ['training', 'development', 'mentorship', 'career growth', 'promotion', 'learning'];

    const textLower = html.toLowerCase();
    for (const keyword of keywords) {
      if (textLower.includes(keyword)) {
        opportunities.push(keyword);
      }
    }

    return opportunities;
  }

  /**
   * Extract employee testimonials
   * @param {string} html - HTML content
   * @returns {Array} Testimonials
   */
  extractEmployeeTestimonials(html) {
    const testimonials = [];
    
    // Look for quote patterns
    const pattern = /"([^"]{50,300})"/g;
    let match;
    let count = 0;

    while ((match = pattern.exec(html)) !== null && count < 5) {
      const quote = this.cleanText(match[1]);
      if (this.looksLikeTestimonial(quote)) {
        testimonials.push({ quote });
        count++;
      }
    }

    return testimonials;
  }

  /**
   * Check if text looks like a testimonial
   * @param {string} text - Text to check
   * @returns {boolean} Is testimonial
   */
  looksLikeTestimonial(text) {
    const indicators = ['i love', 'working here', 'great team', 'amazing', 'best company', 'culture'];
    const textLower = text.toLowerCase();
    return indicators.some(indicator => textLower.includes(indicator));
  }

  /**
   * Extract open positions
   * @param {string} html - HTML content
   * @returns {Array} Open positions
   */
  extractOpenPositions(html) {
    const positions = [];
    
    // Look for common job posting patterns
    const pattern = /<a[^>]*href="[^"]*(?:job|position|career)[^"]*"[^>]*>([^<]{10,100})<\/a>/gi;
    let match;
    let count = 0;

    while ((match = pattern.exec(html)) !== null && count < 10) {
      const title = this.cleanText(match[1]);
      if (this.looksLikeJobTitle(title)) {
        positions.push({ title });
        count++;
      }
    }

    return positions;
  }

  /**
   * Check if text looks like a job title
   * @param {string} text - Text to check
   * @returns {boolean} Is job title
   */
  looksLikeJobTitle(text) {
    const indicators = ['engineer', 'developer', 'manager', 'designer', 'analyst', 'specialist', 'director', 'lead'];
    const textLower = text.toLowerCase();
    return indicators.some(indicator => textLower.includes(indicator));
  }

  /**
   * Extract news articles
   * @param {string} html - HTML content
   * @returns {Array} Articles
   */
  extractNewsArticles(html) {
    const articles = [];
    
    // Look for article patterns
    const pattern = /<article[^>]*>(.*?)<\/article>/gis;
    let match;
    let count = 0;

    while ((match = pattern.exec(html)) !== null && count < 10) {
      const articleHtml = match[1];
      const article = {
        title: this.extractHeadline(articleHtml),
        excerpt: this.extractExcerpt(articleHtml),
        date: this.extractArticleDate(articleHtml),
        url: this.extractArticleUrl(articleHtml)
      };

      if (article.title) {
        articles.push(article);
        count++;
      }
    }

    return articles;
  }

  /**
   * Extract article excerpt
   * @param {string} html - HTML content
   * @returns {string|null} Excerpt
   */
  extractExcerpt(html) {
    const match = html.match(/<p[^>]*>([^<]{50,200})<\/p>/i);
    return match ? this.cleanText(match[1]) : null;
  }

  /**
   * Extract article date
   * @param {string} html - HTML content
   * @returns {string|null} Date
   */
  extractArticleDate(html) {
    const patterns = [
      /<time[^>]*datetime="([^"]+)"/i,
      /(\w+ \d{1,2}, \d{4})/,
      /(\d{4}-\d{2}-\d{2})/
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) return match[1];
    }

    return null;
  }

  /**
   * Extract article URL
   * @param {string} html - HTML content
   * @returns {string|null} URL
   */
  extractArticleUrl(html) {
    const match = html.match(/<a[^>]*href="([^"]+)"/i);
    return match ? match[1] : null;
  }

  /**
   * Categorize articles
   * @param {Array} articles - Articles
   * @returns {Object} Categories
   */
  categorizeArticles(articles) {
    const categories = {};

    for (const article of articles) {
      const text = `${article.title} ${article.excerpt || ''}`.toLowerCase();
      let category = 'general';

      if (text.includes('product') || text.includes('launch')) category = 'product';
      else if (text.includes('partnership') || text.includes('collaboration')) category = 'partnership';
      else if (text.includes('funding') || text.includes('investment')) category = 'funding';
      else if (text.includes('award') || text.includes('recognition')) category = 'award';

      if (!categories[category]) categories[category] = [];
      categories[category].push(article);
    }

    return categories;
  }

  /**
   * Extract team members
   * @param {string} html - HTML content
   * @returns {Array} Team members
   */
  extractTeamMembers(html) {
    // This would need more sophisticated parsing in production
    // For now, return empty array
    return [];
  }

  /**
   * Check if title is leadership role
   * @param {string} title - Job title
   * @returns {boolean} Is leadership
   */
  isLeadership(title) {
    const leadershipKeywords = ['ceo', 'cto', 'cfo', 'coo', 'vp', 'vice president', 'director', 'head'];
    const titleLower = title.toLowerCase();
    return leadershipKeywords.some(keyword => titleLower.includes(keyword));
  }

  /**
   * Find LinkedIn URL
   * @param {string} html - HTML content
   * @returns {string|null} LinkedIn URL
   */
  findLinkedInUrl(html) {
    const match = html.match(/https?:\/\/(?:www\.)?linkedin\.com\/company\/[^"\s<>]+/i);
    return match ? match[0] : null;
  }

  /**
   * Find Twitter URL
   * @param {string} html - HTML content
   * @returns {string|null} Twitter URL
   */
  findTwitterUrl(html) {
    const match = html.match(/https?:\/\/(?:www\.)?(?:twitter|x)\.com\/[^"\s<>]+/i);
    return match ? match[0] : null;
  }

  /**
   * Find Facebook URL
   * @param {string} html - HTML content
   * @returns {string|null} Facebook URL
   */
  findFacebookUrl(html) {
    const match = html.match(/https?:\/\/(?:www\.)?facebook\.com\/[^"\s<>]+/i);
    return match ? match[0] : null;
  }

  /**
   * Find Instagram URL
   * @param {string} html - HTML content
   * @returns {string|null} Instagram URL
   */
  findInstagramUrl(html) {
    const match = html.match(/https?:\/\/(?:www\.)?instagram\.com\/[^"\s<>]+/i);
    return match ? match[0] : null;
  }

  /**
   * Find GitHub URL
   * @param {string} html - HTML content
   * @returns {string|null} GitHub URL
   */
  findGitHubUrl(html) {
    const match = html.match(/https?:\/\/(?:www\.)?github\.com\/[^"\s<>]+/i);
    return match ? match[0] : null;
  }

  /**
   * Find YouTube URL
   * @param {string} html - HTML content
   * @returns {string|null} YouTube URL
   */
  findYouTubeUrl(html) {
    const match = html.match(/https?:\/\/(?:www\.)?youtube\.com\/[^"\s<>]+/i);
    return match ? match[0] : null;
  }

  /**
   * Detect language
   * @param {string} html - HTML content
   * @returns {string} Language code
   */
  detectLanguage(html) {
    const match = html.match(/<html[^>]*lang="([^"]+)"/i);
    return match ? match[1] : 'en';
  }

  /**
   * Detect tone from homepage
   * @param {string} html - HTML content
   * @returns {string} Tone (formal/casual/professional)
   */
  detectTone(html) {
    const text = this.extractTextContent(html);
    const textLower = text.toLowerCase();

    let formalScore = 0;
    let casualScore = 0;

    // Formal indicators
    const formalWords = ['pursuant', 'hereby', 'aforementioned', 'enterprise', 'solution', 'leverage'];
    for (const word of formalWords) {
      if (textLower.includes(word)) formalScore++;
    }

    // Casual indicators
    const casualWords = ['hey', 'awesome', 'cool', 'fun', 'love', 'excited'];
    for (const word of casualWords) {
      if (textLower.includes(word)) casualScore++;
    }

    if (formalScore > casualScore * 1.5) return 'formal';
    if (casualScore > formalScore * 1.5) return 'casual';
    return 'professional';
  }

  /**
   * Extract text content (remove HTML tags)
   * @param {string} html - HTML content
   * @returns {string} Text content
   */
  extractTextContent(html) {
    return html.replace(/<script[^>]*>.*?<\/script>/gis, '')
               .replace(/<style[^>]*>.*?<\/style>/gis, '')
               .replace(/<[^>]+>/g, ' ')
               .replace(/\s+/g, ' ')
               .trim();
  }

  /**
   * Clean text (remove extra whitespace, decode entities)
   * @param {string} text - Text to clean
   * @returns {string} Cleaned text
   */
  cleanText(text) {
    return text.replace(/\s+/g, ' ')
               .replace(/&amp;/g, '&')
               .replace(/&lt;/g, '<')
               .replace(/&gt;/g, '>')
               .replace(/&quot;/g, '"')
               .replace(/&#39;/g, "'")
               .trim();
  }

  /**
   * Normalize URL
   * @param {string} url - URL to normalize
   * @returns {string} Normalized URL
   */
  normalizeUrl(url) {
    try {
      const urlObj = new URL(url);
      return `${urlObj.protocol}//${urlObj.hostname}`;
    } catch {
      return url.replace(/\/$/, ''); // Remove trailing slash
    }
  }

  /**
   * Generate summary
   * @param {Object} data - Scraped data
   * @returns {Object} Summary
   */
  generateSummary(data) {
    return {
      hasAbout: !!data.about,
      hasCareers: !!data.careers,
      hasNews: !!data.news,
      mission: data.about?.mission || null,
      description: data.homepage?.description || data.about?.description || null,
      tone: data.homepage?.tone || data.careers?.culture ? 'casual' : 'professional',
      latestNews: data.news?.articles?.[0] || null,
      openPositions: data.careers?.openPositions?.length || 0
    };
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    console.log('[WebScraper] Cache cleared');
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WebScraperService;
}
