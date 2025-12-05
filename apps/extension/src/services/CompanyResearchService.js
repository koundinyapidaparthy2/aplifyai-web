/**
 * CompanyResearchService
 * 
 * Comprehensive company research for intelligent cover letter generation.
 * 
 * Features:
 * - Company news and recent achievements
 * - Company values and mission
 * - Leadership and hiring manager information
 * - Company culture and tone detection
 * - Industry positioning and competitors
 * - Recent press releases and announcements
 * 
 * Data Sources:
 * - Google Custom Search API
 * - LinkedIn API (if available)
 * - Web scraping (About, Careers, News pages)
 * - Company website analysis
 */

class CompanyResearchService {
  constructor(config = {}) {
    this.googleSearchApiKey = config.googleSearchApiKey || process.env.GOOGLE_SEARCH_API_KEY;
    this.googleSearchEngineId = config.googleSearchEngineId || process.env.GOOGLE_SEARCH_ENGINE_ID;
    this.linkedInApiKey = config.linkedInApiKey || process.env.LINKEDIN_API_KEY;
    this.enableWebScraping = config.enableWebScraping !== false;
    this.cacheResults = config.cacheResults !== false;
    this.cache = new Map();
    this.cacheTTL = config.cacheTTL || 7 * 24 * 60 * 60 * 1000; // 7 days
  }

  /**
   * Main research orchestrator
   * @param {string} companyName - Company name
   * @param {string} companyWebsite - Company website URL (optional)
   * @param {string} jobTitle - Job title being applied for (optional)
   * @returns {Promise<Object>} Comprehensive research results
   */
  async researchCompany(companyName, companyWebsite = null, jobTitle = null) {
    // Check cache first
    const cacheKey = `${companyName}-${companyWebsite}`;
    if (this.cacheResults && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTTL) {
        console.log(`[CompanyResearch] Using cached data for ${companyName}`);
        return cached.data;
      }
    }

    console.log(`[CompanyResearch] Researching company: ${companyName}`);

    // Run research tasks in parallel where possible
    const [
      newsResults,
      aboutPageData,
      valuesData,
      leadershipData,
      achievementsData,
      cultureData
    ] = await Promise.all([
      this.searchCompanyNews(companyName),
      companyWebsite ? this.scrapeAboutPage(companyWebsite) : Promise.resolve(null),
      companyWebsite ? this.extractCompanyValues(companyWebsite) : Promise.resolve(null),
      this.searchLeadership(companyName, jobTitle),
      this.searchAchievements(companyName),
      this.analyzeCulture(companyName, companyWebsite)
    ]);

    // Combine all research
    const research = {
      companyName,
      companyWebsite,
      timestamp: new Date().toISOString(),
      
      // Recent news and updates
      news: newsResults,
      
      // Company information
      about: aboutPageData,
      
      // Values and mission
      values: valuesData,
      
      // Leadership and hiring managers
      leadership: leadershipData,
      
      // Recent achievements
      achievements: achievementsData,
      
      // Culture and tone
      culture: cultureData,
      
      // Summary for quick reference
      summary: this.generateSummary({
        news: newsResults,
        about: aboutPageData,
        values: valuesData,
        achievements: achievementsData,
        culture: cultureData
      }),
      
      // Confidence scores
      confidence: this.calculateConfidence({
        news: newsResults,
        about: aboutPageData,
        values: valuesData,
        leadership: leadershipData,
        achievements: achievementsData
      })
    };

    // Cache results
    if (this.cacheResults) {
      this.cache.set(cacheKey, {
        timestamp: Date.now(),
        data: research
      });
    }

    return research;
  }

  /**
   * Search for recent company news using Google Custom Search API
   * @param {string} companyName - Company name
   * @returns {Promise<Object>} News results
   */
  async searchCompanyNews(companyName) {
    console.log(`[CompanyResearch] Searching news for ${companyName}`);

    try {
      // Search for recent news (last 6 months)
      const queries = [
        `"${companyName}" news`,
        `"${companyName}" announcement`,
        `"${companyName}" press release`,
        `"${companyName}" launch`
      ];

      const allResults = [];

      for (const query of queries.slice(0, 2)) { // Limit to 2 queries to avoid rate limits
        if (!this.googleSearchApiKey || !this.googleSearchEngineId) {
          console.warn('[CompanyResearch] Google Search API not configured, using fallback');
          break;
        }

        const url = new URL('https://www.googleapis.com/customsearch/v1');
        url.searchParams.append('key', this.googleSearchApiKey);
        url.searchParams.append('cx', this.googleSearchEngineId);
        url.searchParams.append('q', query);
        url.searchParams.append('num', '5'); // Top 5 results per query
        url.searchParams.append('dateRestrict', 'm6'); // Last 6 months

        try {
          const response = await fetch(url.toString());
          if (!response.ok) {
            console.warn(`[CompanyResearch] Search API error: ${response.status}`);
            continue;
          }

          const data = await response.json();
          if (data.items) {
            allResults.push(...data.items);
          }
        } catch (error) {
          console.warn(`[CompanyResearch] Search failed for query: ${query}`, error.message);
        }
      }

      // Process and deduplicate results
      const processedNews = this.processNewsResults(allResults, companyName);

      return {
        count: processedNews.length,
        items: processedNews.slice(0, 10), // Top 10 most relevant
        categories: this.categorizeNews(processedNews),
        mostRecent: processedNews[0] || null,
        trending: this.identifyTrending(processedNews)
      };
    } catch (error) {
      console.error('[CompanyResearch] News search failed:', error);
      return {
        count: 0,
        items: [],
        categories: {},
        mostRecent: null,
        trending: [],
        error: error.message
      };
    }
  }

  /**
   * Process and rank news results
   * @param {Array} results - Raw search results
   * @param {string} companyName - Company name for relevance scoring
   * @returns {Array} Processed news items
   */
  processNewsResults(results, companyName) {
    const seen = new Set();
    const processed = [];

    for (const item of results) {
      // Deduplicate by URL
      if (seen.has(item.link)) continue;
      seen.add(item.link);

      // Extract date from snippet or metadata
      const date = this.extractDate(item.snippet, item.pagemap);

      // Calculate relevance score
      const relevance = this.calculateNewsRelevance(item, companyName);

      processed.push({
        title: item.title,
        snippet: item.snippet,
        url: item.link,
        source: this.extractSource(item.link),
        date: date,
        relevance: relevance,
        category: this.categorizeNewsItem(item),
        sentiment: this.detectSentiment(item.snippet)
      });
    }

    // Sort by relevance and recency
    processed.sort((a, b) => {
      const scoreA = a.relevance * 0.7 + (a.date ? 0.3 : 0);
      const scoreB = b.relevance * 0.7 + (b.date ? 0.3 : 0);
      return scoreB - scoreA;
    });

    return processed;
  }

  /**
   * Categorize news items
   * @param {Array} newsItems - Processed news items
   * @returns {Object} Categories with counts
   */
  categorizeNews(newsItems) {
    const categories = {
      funding: [],
      product_launch: [],
      expansion: [],
      partnership: [],
      acquisition: [],
      award: [],
      leadership: [],
      other: []
    };

    for (const item of newsItems) {
      categories[item.category].push(item);
    }

    return Object.entries(categories)
      .filter(([_, items]) => items.length > 0)
      .reduce((acc, [category, items]) => {
        acc[category] = {
          count: items.length,
          items: items
        };
        return acc;
      }, {});
  }

  /**
   * Categorize individual news item
   * @param {Object} item - News item
   * @returns {string} Category
   */
  categorizeNewsItem(item) {
    const text = `${item.title} ${item.snippet}`.toLowerCase();

    const categories = [
      { name: 'funding', keywords: ['funding', 'raised', 'series', 'investment', 'capital', 'investors'] },
      { name: 'product_launch', keywords: ['launch', 'introduces', 'unveils', 'releases', 'new product', 'announces'] },
      { name: 'expansion', keywords: ['expansion', 'opening', 'new office', 'growing', 'enters market'] },
      { name: 'partnership', keywords: ['partnership', 'partners with', 'collaboration', 'teams up'] },
      { name: 'acquisition', keywords: ['acquires', 'acquisition', 'purchases', 'buys'] },
      { name: 'award', keywords: ['award', 'wins', 'recognized', 'named', 'best', 'top'] },
      { name: 'leadership', keywords: ['appoints', 'hires', 'ceo', 'cto', 'cfo', 'joins', 'executive'] }
    ];

    for (const category of categories) {
      for (const keyword of category.keywords) {
        if (text.includes(keyword)) {
          return category.name;
        }
      }
    }

    return 'other';
  }

  /**
   * Identify trending topics from news
   * @param {Array} newsItems - Processed news items
   * @returns {Array} Trending topics
   */
  identifyTrending(newsItems) {
    const keywords = {};

    for (const item of newsItems) {
      const text = `${item.title} ${item.snippet}`.toLowerCase();
      const words = text.match(/\b[a-z]{4,}\b/g) || [];

      for (const word of words) {
        // Skip common words
        if (this.isCommonWord(word)) continue;
        keywords[word] = (keywords[word] || 0) + 1;
      }
    }

    // Get top trending keywords
    return Object.entries(keywords)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([word, count]) => ({ keyword: word, mentions: count }));
  }

  /**
   * Scrape company About page
   * @param {string} websiteUrl - Company website URL
   * @returns {Promise<Object>} About page data
   */
  async scrapeAboutPage(websiteUrl) {
    if (!this.enableWebScraping) {
      return null;
    }

    console.log(`[CompanyResearch] Scraping About page: ${websiteUrl}`);

    try {
      // Try common About page URLs
      const aboutUrls = [
        `${websiteUrl}/about`,
        `${websiteUrl}/about-us`,
        `${websiteUrl}/company`,
        `${websiteUrl}/who-we-are`,
        websiteUrl // Homepage as fallback
      ];

      for (const url of aboutUrls) {
        try {
          const response = await fetch(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; JobSeekBot/1.0; +https://jobseek.ai)'
            }
          });

          if (response.ok) {
            const html = await response.text();
            const aboutData = this.parseAboutPage(html);

            if (aboutData && aboutData.mission) {
              return {
                url: url,
                ...aboutData
              };
            }
          }
        } catch (error) {
          console.warn(`[CompanyResearch] Failed to fetch ${url}:`, error.message);
        }
      }

      return null;
    } catch (error) {
      console.error('[CompanyResearch] About page scraping failed:', error);
      return null;
    }
  }

  /**
   * Parse About page HTML
   * @param {string} html - HTML content
   * @returns {Object} Parsed data
   */
  parseAboutPage(html) {
    // Simple HTML parsing (in production, use a proper parser like cheerio)
    const data = {
      mission: null,
      description: null,
      founded: null,
      size: null,
      headquarters: null,
      industry: null
    };

    // Extract mission statement
    const missionPatterns = [
      /mission[:\s]+([^<.]{20,200})/i,
      /our mission is[:\s]+([^<.]{20,200})/i,
      /we believe[:\s]+([^<.]{20,200})/i
    ];

    for (const pattern of missionPatterns) {
      const match = html.match(pattern);
      if (match) {
        data.mission = match[1].trim();
        break;
      }
    }

    // Extract company description
    const descPatterns = [
      /<meta\s+name="description"\s+content="([^"]+)"/i,
      /<meta\s+property="og:description"\s+content="([^"]+)"/i
    ];

    for (const pattern of descPatterns) {
      const match = html.match(pattern);
      if (match) {
        data.description = match[1].trim();
        break;
      }
    }

    // Extract founded year
    const foundedMatch = html.match(/founded[:\s]+(\d{4})/i);
    if (foundedMatch) {
      data.founded = foundedMatch[1];
    }

    // Extract company size
    const sizePatterns = [
      /(\d+[\+\-]?\s*employees)/i,
      /team of (\d+)/i
    ];

    for (const pattern of sizePatterns) {
      const match = html.match(pattern);
      if (match) {
        data.size = match[0].trim();
        break;
      }
    }

    return data.mission || data.description ? data : null;
  }

  /**
   * Extract company values from website
   * @param {string} websiteUrl - Company website URL
   * @returns {Promise<Object>} Company values
   */
  async extractCompanyValues(websiteUrl) {
    if (!this.enableWebScraping) {
      return null;
    }

    console.log(`[CompanyResearch] Extracting values from: ${websiteUrl}`);

    try {
      // Try common values/culture pages
      const valuesUrls = [
        `${websiteUrl}/values`,
        `${websiteUrl}/culture`,
        `${websiteUrl}/careers`,
        `${websiteUrl}/about`
      ];

      for (const url of valuesUrls) {
        try {
          const response = await fetch(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; JobSeekBot/1.0)'
            }
          });

          if (response.ok) {
            const html = await response.text();
            const values = this.parseValues(html);

            if (values && values.length > 0) {
              return {
                url: url,
                values: values,
                categories: this.categorizeValues(values)
              };
            }
          }
        } catch (error) {
          console.warn(`[CompanyResearch] Failed to fetch ${url}:`, error.message);
        }
      }

      return null;
    } catch (error) {
      console.error('[CompanyResearch] Values extraction failed:', error);
      return null;
    }
  }

  /**
   * Parse company values from HTML
   * @param {string} html - HTML content
   * @returns {Array} Company values
   */
  parseValues(html) {
    const values = [];

    // Common value keywords
    const valueKeywords = [
      'integrity', 'innovation', 'collaboration', 'excellence', 'customer first',
      'transparency', 'diversity', 'inclusion', 'accountability', 'respect',
      'passion', 'teamwork', 'quality', 'growth', 'ownership', 'trust',
      'sustainability', 'impact', 'empowerment', 'authenticity'
    ];

    // Look for values in the HTML
    const text = html.toLowerCase();
    for (const keyword of valueKeywords) {
      if (text.includes(keyword)) {
        // Try to extract context around the keyword
        const regex = new RegExp(`([^.!?]{10,100}${keyword}[^.!?]{10,100})`, 'i');
        const match = html.match(regex);

        values.push({
          value: keyword.charAt(0).toUpperCase() + keyword.slice(1),
          context: match ? match[1].trim() : null,
          confidence: match ? 0.8 : 0.5
        });
      }
    }

    // Deduplicate and sort by confidence
    const seen = new Set();
    return values
      .filter(v => {
        if (seen.has(v.value.toLowerCase())) return false;
        seen.add(v.value.toLowerCase());
        return true;
      })
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 8); // Top 8 values
  }

  /**
   * Categorize company values
   * @param {Array} values - Company values
   * @returns {Object} Categorized values
   */
  categorizeValues(values) {
    const categories = {
      people: ['diversity', 'inclusion', 'respect', 'empowerment', 'teamwork'],
      innovation: ['innovation', 'growth', 'excellence', 'quality'],
      ethics: ['integrity', 'transparency', 'accountability', 'trust', 'authenticity'],
      customer: ['customer first', 'impact', 'passion'],
      sustainability: ['sustainability', 'ownership']
    };

    const result = {};

    for (const value of values) {
      const valueLower = value.value.toLowerCase();
      let categorized = false;

      for (const [category, keywords] of Object.entries(categories)) {
        if (keywords.some(k => valueLower.includes(k))) {
          if (!result[category]) result[category] = [];
          result[category].push(value);
          categorized = true;
          break;
        }
      }

      if (!categorized) {
        if (!result.other) result.other = [];
        result.other.push(value);
      }
    }

    return result;
  }

  /**
   * Search for company leadership information
   * @param {string} companyName - Company name
   * @param {string} jobTitle - Job title (to find relevant managers)
   * @returns {Promise<Object>} Leadership data
   */
  async searchLeadership(companyName, jobTitle = null) {
    console.log(`[CompanyResearch] Searching leadership for ${companyName}`);

    try {
      // Search for leadership information
      const queries = [
        `"${companyName}" CEO`,
        `"${companyName}" leadership team`,
        jobTitle ? `"${companyName}" "${jobTitle}" manager` : null
      ].filter(Boolean);

      const leaders = [];

      for (const query of queries.slice(0, 2)) {
        if (!this.googleSearchApiKey || !this.googleSearchEngineId) {
          console.warn('[CompanyResearch] Google Search API not configured');
          break;
        }

        const url = new URL('https://www.googleapis.com/customsearch/v1');
        url.searchParams.append('key', this.googleSearchApiKey);
        url.searchParams.append('cx', this.googleSearchEngineId);
        url.searchParams.append('q', query);
        url.searchParams.append('num', '3');

        try {
          const response = await fetch(url.toString());
          if (!response.ok) continue;

          const data = await response.json();
          if (data.items) {
            const extracted = this.extractLeadershipInfo(data.items, companyName);
            leaders.push(...extracted);
          }
        } catch (error) {
          console.warn(`[CompanyResearch] Leadership search failed:`, error.message);
        }
      }

      return {
        found: leaders.length > 0,
        count: leaders.length,
        leaders: leaders.slice(0, 5), // Top 5 leaders
        ceo: leaders.find(l => l.title.toLowerCase().includes('ceo')),
        hiringManager: jobTitle ? this.findRelevantManager(leaders, jobTitle) : null
      };
    } catch (error) {
      console.error('[CompanyResearch] Leadership search failed:', error);
      return {
        found: false,
        count: 0,
        leaders: [],
        ceo: null,
        hiringManager: null,
        error: error.message
      };
    }
  }

  /**
   * Extract leadership information from search results
   * @param {Array} results - Search results
   * @param {string} companyName - Company name
   * @returns {Array} Leadership info
   */
  extractLeadershipInfo(results, companyName) {
    const leaders = [];
    const titlePatterns = [
      /(?:CEO|Chief Executive Officer|President|Founder)/i,
      /(?:CTO|Chief Technology Officer)/i,
      /(?:CFO|Chief Financial Officer)/i,
      /(?:COO|Chief Operating Officer)/i,
      /(?:VP|Vice President|SVP|Senior Vice President)/i,
      /(?:Director|Head of)/i
    ];

    for (const result of results) {
      const text = `${result.title} ${result.snippet}`;

      // Look for name and title patterns
      const namePattern = /([A-Z][a-z]+\s+[A-Z][a-z]+)/g;
      const names = text.match(namePattern) || [];

      for (const name of names) {
        // Check if name is followed by a title
        for (const titlePattern of titlePatterns) {
          const fullPattern = new RegExp(`${name}[,\\s]+(?:is\\s+)?(?:the\\s+)?(${titlePattern.source})`, 'i');
          const match = text.match(fullPattern);

          if (match) {
            leaders.push({
              name: name.trim(),
              title: match[1].trim(),
              source: result.link,
              confidence: 0.7
            });
            break;
          }
        }
      }
    }

    return leaders;
  }

  /**
   * Find relevant hiring manager based on job title
   * @param {Array} leaders - List of leaders
   * @param {string} jobTitle - Job title
   * @returns {Object|null} Relevant manager
   */
  findRelevantManager(leaders, jobTitle) {
    const jobLower = jobTitle.toLowerCase();

    // Map job categories to relevant manager titles
    const mappings = {
      engineering: ['cto', 'vp engineering', 'engineering director'],
      product: ['cpo', 'vp product', 'product director'],
      design: ['design director', 'vp design', 'creative director'],
      marketing: ['cmo', 'vp marketing', 'marketing director'],
      sales: ['cro', 'vp sales', 'sales director'],
      finance: ['cfo', 'vp finance', 'finance director']
    };

    // Determine job category
    let category = null;
    for (const [cat, keywords] of Object.entries(mappings)) {
      if (keywords.some(k => jobLower.includes(k.split(' ')[0]))) {
        category = cat;
        break;
      }
    }

    if (!category) return null;

    // Find matching leader
    const relevantTitles = mappings[category];
    for (const leader of leaders) {
      const leaderTitle = leader.title.toLowerCase();
      if (relevantTitles.some(t => leaderTitle.includes(t))) {
        return leader;
      }
    }

    return null;
  }

  /**
   * Search for company achievements
   * @param {string} companyName - Company name
   * @returns {Promise<Object>} Achievements
   */
  async searchAchievements(companyName) {
    console.log(`[CompanyResearch] Searching achievements for ${companyName}`);

    try {
      const queries = [
        `"${companyName}" award`,
        `"${companyName}" recognized`,
        `"${companyName}" achievement`
      ];

      const achievements = [];

      for (const query of queries.slice(0, 1)) { // Just first query to avoid rate limits
        if (!this.googleSearchApiKey || !this.googleSearchEngineId) {
          console.warn('[CompanyResearch] Google Search API not configured');
          break;
        }

        const url = new URL('https://www.googleapis.com/customsearch/v1');
        url.searchParams.append('key', this.googleSearchApiKey);
        url.searchParams.append('cx', this.googleSearchEngineId);
        url.searchParams.append('q', query);
        url.searchParams.append('num', '5');
        url.searchParams.append('dateRestrict', 'y1'); // Last year

        try {
          const response = await fetch(url.toString());
          if (!response.ok) continue;

          const data = await response.json();
          if (data.items) {
            const extracted = this.extractAchievements(data.items);
            achievements.push(...extracted);
          }
        } catch (error) {
          console.warn(`[CompanyResearch] Achievement search failed:`, error.message);
        }
      }

      return {
        count: achievements.length,
        items: achievements.slice(0, 5), // Top 5 achievements
        categories: this.categorizeAchievements(achievements)
      };
    } catch (error) {
      console.error('[CompanyResearch] Achievement search failed:', error);
      return {
        count: 0,
        items: [],
        categories: {},
        error: error.message
      };
    }
  }

  /**
   * Extract achievements from search results
   * @param {Array} results - Search results
   * @returns {Array} Achievements
   */
  extractAchievements(results) {
    const achievements = [];

    for (const result of results) {
      achievements.push({
        title: result.title,
        description: result.snippet,
        url: result.link,
        date: this.extractDate(result.snippet),
        category: this.categorizeAchievement(result)
      });
    }

    return achievements;
  }

  /**
   * Categorize achievement
   * @param {Object} result - Search result
   * @returns {string} Category
   */
  categorizeAchievement(result) {
    const text = `${result.title} ${result.snippet}`.toLowerCase();

    if (text.includes('award') || text.includes('wins')) return 'award';
    if (text.includes('patent') || text.includes('innovation')) return 'innovation';
    if (text.includes('growth') || text.includes('revenue')) return 'growth';
    if (text.includes('customer') || text.includes('satisfaction')) return 'customer';
    if (text.includes('employee') || text.includes('workplace')) return 'culture';

    return 'other';
  }

  /**
   * Categorize achievements
   * @param {Array} achievements - List of achievements
   * @returns {Object} Categorized achievements
   */
  categorizeAchievements(achievements) {
    const categories = {};

    for (const achievement of achievements) {
      const category = achievement.category;
      if (!categories[category]) categories[category] = [];
      categories[category].push(achievement);
    }

    return categories;
  }

  /**
   * Analyze company culture
   * @param {string} companyName - Company name
   * @param {string} websiteUrl - Company website
   * @returns {Promise<Object>} Culture analysis
   */
  async analyzeCulture(companyName, websiteUrl) {
    console.log(`[CompanyResearch] Analyzing culture for ${companyName}`);

    // Culture indicators from various sources
    const indicators = {
      formal: 0,
      casual: 0,
      innovative: 0,
      traditional: 0,
      collaborative: 0,
      autonomous: 0,
      fastPaced: 0,
      balanced: 0
    };

    // Analyze from search results (if available)
    try {
      if (this.googleSearchApiKey && this.googleSearchEngineId) {
        const query = `"${companyName}" culture`;
        const url = new URL('https://www.googleapis.com/customsearch/v1');
        url.searchParams.append('key', this.googleSearchApiKey);
        url.searchParams.append('cx', this.googleSearchEngineId);
        url.searchParams.append('q', query);
        url.searchParams.append('num', '5');

        const response = await fetch(url.toString());
        if (response.ok) {
          const data = await response.json();
          if (data.items) {
            this.analyzeCultureFromText(data.items.map(i => i.snippet).join(' '), indicators);
          }
        }
      }
    } catch (error) {
      console.warn('[CompanyResearch] Culture search failed:', error.message);
    }

    // Determine primary culture type
    const cultures = Object.entries(indicators)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    return {
      primary: cultures[0] ? cultures[0][0] : 'professional',
      scores: indicators,
      top3: cultures.map(([name, score]) => ({ name, score })),
      tone: this.determineTone(indicators),
      confidence: cultures[0] ? cultures[0][1] / 10 : 0.5
    };
  }

  /**
   * Analyze culture from text
   * @param {string} text - Text to analyze
   * @param {Object} indicators - Culture indicators to update
   */
  analyzeCultureFromText(text, indicators) {
    const textLower = text.toLowerCase();

    const patterns = {
      formal: ['formal', 'professional', 'business', 'corporate'],
      casual: ['casual', 'relaxed', 'fun', 'laid-back', 'friendly'],
      innovative: ['innovative', 'cutting-edge', 'pioneering', 'disruptive'],
      traditional: ['established', 'traditional', 'legacy', 'conservative'],
      collaborative: ['collaborative', 'teamwork', 'together', 'partnership'],
      autonomous: ['autonomous', 'independent', 'self-directed', 'ownership'],
      fastPaced: ['fast-paced', 'dynamic', 'agile', 'rapid'],
      balanced: ['work-life balance', 'balanced', 'flexible', 'wellness']
    };

    for (const [indicator, keywords] of Object.entries(patterns)) {
      for (const keyword of keywords) {
        if (textLower.includes(keyword)) {
          indicators[indicator] += 1;
        }
      }
    }
  }

  /**
   * Determine overall tone
   * @param {Object} indicators - Culture indicators
   * @returns {string} Tone
   */
  determineTone(indicators) {
    const formalScore = indicators.formal + indicators.traditional;
    const casualScore = indicators.casual + indicators.innovative;

    if (formalScore > casualScore * 1.5) return 'formal';
    if (casualScore > formalScore * 1.5) return 'casual';
    return 'professional';
  }

  /**
   * Generate research summary
   * @param {Object} data - All research data
   * @returns {Object} Summary
   */
  generateSummary(data) {
    const summary = {
      highlights: [],
      recentNews: null,
      keyValues: [],
      cultureFit: null,
      personalizationTips: []
    };

    // Add most recent news
    if (data.news && data.news.items && data.news.items.length > 0) {
      summary.recentNews = data.news.items[0];
      summary.highlights.push(`Recent: ${data.news.items[0].title}`);
    }

    // Add key values
    if (data.values && data.values.values) {
      summary.keyValues = data.values.values.slice(0, 3).map(v => v.value);
      if (summary.keyValues.length > 0) {
        summary.highlights.push(`Values: ${summary.keyValues.join(', ')}`);
      }
    }

    // Add culture insight
    if (data.culture) {
      summary.cultureFit = data.culture.tone;
      summary.highlights.push(`Culture: ${data.culture.primary}`);
    }

    // Generate personalization tips
    if (data.news && data.news.items && data.news.items.length > 0) {
      summary.personalizationTips.push({
        type: 'news',
        tip: `Reference their recent ${data.news.items[0].category}: "${data.news.items[0].title}"`,
        priority: 'high'
      });
    }

    if (data.values && data.values.values && data.values.values.length > 0) {
      summary.personalizationTips.push({
        type: 'values',
        tip: `Align with their value of "${data.values.values[0].value}"`,
        priority: 'high'
      });
    }

    if (data.achievements && data.achievements.items && data.achievements.items.length > 0) {
      summary.personalizationTips.push({
        type: 'achievement',
        tip: `Mention their achievement: "${data.achievements.items[0].title}"`,
        priority: 'medium'
      });
    }

    return summary;
  }

  /**
   * Calculate confidence in research results
   * @param {Object} data - All research data
   * @returns {Object} Confidence scores
   */
  calculateConfidence(data) {
    const scores = {
      overall: 0,
      news: 0,
      values: 0,
      leadership: 0,
      achievements: 0
    };

    // News confidence
    if (data.news && data.news.count > 0) {
      scores.news = Math.min(data.news.count / 5, 1.0);
    }

    // Values confidence
    if (data.values && data.values.values && data.values.values.length > 0) {
      scores.values = data.values.values[0].confidence || 0.5;
    }

    // Leadership confidence
    if (data.leadership && data.leadership.count > 0) {
      scores.leadership = Math.min(data.leadership.count / 3, 1.0);
    }

    // Achievements confidence
    if (data.achievements && data.achievements.count > 0) {
      scores.achievements = Math.min(data.achievements.count / 3, 1.0);
    }

    // Overall confidence (weighted average)
    scores.overall = (
      scores.news * 0.3 +
      scores.values * 0.3 +
      scores.leadership * 0.2 +
      scores.achievements * 0.2
    );

    return scores;
  }

  /**
   * Helper: Extract date from text
   * @param {string} text - Text to search
   * @param {Object} pagemap - Page metadata
   * @returns {string|null} Date
   */
  extractDate(text, pagemap = null) {
    // Try pagemap first
    if (pagemap && pagemap.metatags && pagemap.metatags[0]) {
      const date = pagemap.metatags[0]['article:published_time'] ||
                   pagemap.metatags[0]['og:published_time'];
      if (date) return date;
    }

    // Try to extract from text
    const datePatterns = [
      /(\w+ \d{1,2}, \d{4})/,  // January 1, 2024
      /(\d{1,2} \w+ \d{4})/,    // 1 January 2024
      /(\d{4}-\d{2}-\d{2})/     // 2024-01-01
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) return match[1];
    }

    return null;
  }

  /**
   * Helper: Extract source from URL
   * @param {string} url - URL
   * @returns {string} Source name
   */
  extractSource(url) {
    try {
      const hostname = new URL(url).hostname;
      return hostname.replace('www.', '');
    } catch {
      return 'Unknown';
    }
  }

  /**
   * Helper: Calculate news relevance
   * @param {Object} item - News item
   * @param {string} companyName - Company name
   * @returns {number} Relevance score 0-1
   */
  calculateNewsRelevance(item, companyName) {
    let score = 0.5; // Base score

    // Check if company name appears in title
    if (item.title.toLowerCase().includes(companyName.toLowerCase())) {
      score += 0.3;
    }

    // Check for high-value keywords
    const highValueKeywords = [
      'raises', 'funding', 'launches', 'acquires', 'partnership',
      'award', 'recognized', 'expansion', 'announces'
    ];

    const text = `${item.title} ${item.snippet}`.toLowerCase();
    for (const keyword of highValueKeywords) {
      if (text.includes(keyword)) {
        score += 0.1;
        break;
      }
    }

    return Math.min(score, 1.0);
  }

  /**
   * Helper: Detect sentiment
   * @param {string} text - Text to analyze
   * @returns {string} Sentiment (positive/neutral/negative)
   */
  detectSentiment(text) {
    const positiveWords = ['success', 'growth', 'award', 'wins', 'launches', 'innovative', 'leading'];
    const negativeWords = ['lawsuit', 'scandal', 'layoff', 'decline', 'loss', 'controversy'];

    let score = 0;
    const textLower = text.toLowerCase();

    for (const word of positiveWords) {
      if (textLower.includes(word)) score += 1;
    }

    for (const word of negativeWords) {
      if (textLower.includes(word)) score -= 1;
    }

    if (score > 0) return 'positive';
    if (score < 0) return 'negative';
    return 'neutral';
  }

  /**
   * Helper: Check if word is too common
   * @param {string} word - Word to check
   * @returns {boolean} Is common
   */
  isCommonWord(word) {
    const commonWords = new Set([
      'that', 'this', 'with', 'from', 'have', 'more', 'will',
      'their', 'they', 'been', 'were', 'which', 'when', 'there'
    ]);
    return commonWords.has(word);
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    console.log('[CompanyResearch] Cache cleared');
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CompanyResearchService;
}
