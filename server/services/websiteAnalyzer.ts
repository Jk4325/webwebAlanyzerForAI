import { DetailedAnalysisResults, AnalysisResult } from "@shared/schema";
import * as cheerio from "cheerio";
import axios from "axios";

export class WebsiteAnalyzer {
  private userAgent = "Mozilla/5.0 (compatible; WebAuditBot/1.0)";
  private visitedUrls = new Set<string>();
  private maxUrls = 10; // Limit crawling to prevent infinite loops

  async analyzeWebsite(url: string): Promise<DetailedAnalysisResults> {
    try {
      // Reset visited URLs for new analysis
      this.visitedUrls.clear();
      
      // Discover all URLs on the website
      const allUrls = await this.discoverAllUrls(url);
      console.log(`Found ${allUrls.length} URLs to analyze`);
      
      // Analyze each URL and aggregate results
      const aggregatedResults = await this.analyzeAllPages(allUrls);
      
      return aggregatedResults;
    } catch (error) {
      console.error("Website analysis failed:", error);
      return this.getEmptyResults();
    }
  }

  private async discoverAllUrls(baseUrl: string): Promise<string[]> {
    const urls = new Set<string>([baseUrl]);
    const toVisit = [baseUrl];
    const baseDomain = new URL(baseUrl).hostname;

    while (toVisit.length > 0 && urls.size < this.maxUrls) {
      const currentUrl = toVisit.shift()!;
      if (this.visitedUrls.has(currentUrl)) continue;
      
      this.visitedUrls.add(currentUrl);

      try {
        const response = await axios.get(currentUrl, {
          headers: { "User-Agent": this.userAgent },
          timeout: 5000,
          maxRedirects: 3,
        });

        const $ = cheerio.load(response.data);
        
        // Find all internal links
        $('a[href]').each((_, element) => {
          const href = $(element).attr('href');
          if (href) {
            try {
              const fullUrl = new URL(href, currentUrl).href;
              const urlDomain = new URL(fullUrl).hostname;
              
              // Only add URLs from the same domain
              if (urlDomain === baseDomain && !this.visitedUrls.has(fullUrl) && urls.size < this.maxUrls) {
                urls.add(fullUrl);
                toVisit.push(fullUrl);
              }
            } catch (e) {
              // Invalid URL, skip
            }
          }
        });
      } catch (error) {
        console.warn(`Failed to fetch ${currentUrl}:`, error.message);
      }
    }

    return Array.from(urls);
  }

  private async analyzeAllPages(urls: string[]): Promise<DetailedAnalysisResults> {
    const pageResults: DetailedAnalysisResults[] = [];

    for (const url of urls) {
      try {
        const result = await this.analyzeSinglePage(url);
        pageResults.push(result);
      } catch (error) {
        console.warn(`Failed to analyze ${url}:`, error.message);
      }
    }

    // Aggregate results from all pages
    return this.aggregateResults(pageResults);
  }

  private async analyzeSinglePage(url: string): Promise<DetailedAnalysisResults> {
    const response = await axios.get(url, {
      headers: { "User-Agent": this.userAgent },
      timeout: 10000,
      maxRedirects: 3,
    });

    const $ = cheerio.load(response.data);
    const htmlContent = response.data;

    const results: DetailedAnalysisResults = {
      htmlStructure: this.analyzeHtmlStructure($, htmlContent),
      metadata: this.analyzeMetadata($, htmlContent),
      schema: this.analyzeSchema($, htmlContent),
      contentWithoutJs: this.analyzeContentWithoutJs($, htmlContent),
      sitemapRobots: await this.analyzeSitemapRobots(url),
      accessibility: this.analyzeAccessibility($, htmlContent),
      speed: await this.analyzeSpeed(url),
      readability: this.analyzeReadability($, htmlContent),
      internalLinking: this.analyzeInternalLinking($, url),
      totalScore: 0,
    };

    // Calculate total score for this page
    const scores = [
      results.htmlStructure.score,
      results.metadata.score,
      results.schema.score,
      results.contentWithoutJs.score,
      results.sitemapRobots.score,
      results.accessibility.score,
      results.speed.score,
      results.readability.score,
      results.internalLinking.score,
    ];

    results.totalScore = Math.round(
      (scores.reduce((sum, score) => sum + score, 0) / scores.length) * 100
    ) / 100;

    return results;
  }

  private aggregateResults(pageResults: DetailedAnalysisResults[]): DetailedAnalysisResults {
    if (pageResults.length === 0) {
      return this.getEmptyResults();
    }

    // Calculate average scores across all pages
    const avgResult: DetailedAnalysisResults = {
      htmlStructure: this.averageAnalysisResult(pageResults.map(r => r.htmlStructure)),
      metadata: this.averageAnalysisResult(pageResults.map(r => r.metadata)),
      schema: this.averageAnalysisResult(pageResults.map(r => r.schema)),
      contentWithoutJs: this.averageAnalysisResult(pageResults.map(r => r.contentWithoutJs)),
      sitemapRobots: this.averageAnalysisResult(pageResults.map(r => r.sitemapRobots)),
      accessibility: this.averageAnalysisResult(pageResults.map(r => r.accessibility)),
      speed: this.averageAnalysisResult(pageResults.map(r => r.speed)),
      readability: this.averageAnalysisResult(pageResults.map(r => r.readability)),
      internalLinking: this.averageAnalysisResult(pageResults.map(r => r.internalLinking)),
      totalScore: 0,
    };

    // Calculate overall total score
    const totalScores = pageResults.map(r => r.totalScore);
    avgResult.totalScore = Math.round(
      (totalScores.reduce((sum, score) => sum + score, 0) / totalScores.length) * 100
    ) / 100;

    return avgResult;
  }

  private averageAnalysisResult(results: AnalysisResult[]): AnalysisResult {
    const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
    
    return {
      score: Math.round(avgScore * 100) / 100,
      methodology: results[0].methodology, // Use first result's methodology
      details: {
        pagesAnalyzed: results.length,
        averageScore: Math.round(avgScore * 100) / 100,
        scoreRange: {
          min: Math.min(...results.map(r => r.score)),
          max: Math.max(...results.map(r => r.score))
        }
      }
    };
  }

  private analyzeHtmlStructure($: cheerio.CheerioAPI, html: string): AnalysisResult {
    let score = 0;
    const details: any = {};

    // Check for H1 tag
    const h1Count = $("h1").length;
    details.h1Count = h1Count;
    if (h1Count === 1) score += 25;
    else if (h1Count > 1) score += 10;

    // Check for heading hierarchy
    const headings = ["h1", "h2", "h3", "h4", "h5", "h6"];
    let hasProperHierarchy = true;
    let prevLevel = 0;
    
    headings.forEach((tag, index) => {
      const count = $(tag).length;
      if (count > 0) {
        if (index > prevLevel + 1) hasProperHierarchy = false;
        prevLevel = index;
      }
    });

    details.hasProperHierarchy = hasProperHierarchy;
    if (hasProperHierarchy) score += 25;

    // Check for semantic HTML elements
    const semanticTags = ["main", "section", "article", "aside", "header", "footer", "nav"];
    let semanticCount = 0;
    semanticTags.forEach(tag => {
      if ($(tag).length > 0) semanticCount++;
    });

    details.semanticTagsUsed = semanticCount;
    score += Math.min(semanticCount * 5, 25);

    // Check for proper HTML5 doctype
    const hasHtml5Doctype = html.toLowerCase().startsWith("<!doctype html");
    details.hasHtml5Doctype = hasHtml5Doctype;
    if (hasHtml5Doctype) score += 25;

    return {
      score: Math.min(score, 100),
      methodology: {
        cs: "Hodnotíme přítomnost jediného H1 tagu (25 bodů), správnou hierarchii nadpisů (25 bodů), použití sémantických HTML5 elementů (25 bodů) a HTML5 doctype (25 bodů).",
        en: "We evaluate the presence of a single H1 tag (25 points), proper heading hierarchy (25 points), use of semantic HTML5 elements (25 points), and HTML5 doctype (25 points).",
      },
      details,
    };
  }

  private analyzeMetadata($: cheerio.CheerioAPI, html: string): AnalysisResult {
    let score = 0;
    const details: any = {};

    // Check title tag
    const title = $("title").text().trim();
    details.title = title;
    details.titleLength = title.length;
    if (title.length > 0 && title.length <= 60) score += 25;
    else if (title.length > 0) score += 15;

    // Check meta description
    const metaDescription = $('meta[name="description"]').attr("content") || "";
    details.metaDescription = metaDescription;
    details.metaDescriptionLength = metaDescription.length;
    if (metaDescription.length >= 120 && metaDescription.length <= 160) score += 25;
    else if (metaDescription.length > 0) score += 15;

    // Check Open Graph tags
    const ogTags = ["og:title", "og:description", "og:image", "og:url"];
    let ogCount = 0;
    ogTags.forEach(tag => {
      const content = $(`meta[property="${tag}"]`).attr("content");
      if (content) ogCount++;
    });

    details.openGraphTags = ogCount;
    score += Math.min(ogCount * 6, 25);

    // Check Twitter Card tags
    const twitterCard = $('meta[name="twitter:card"]').attr("content");
    details.hasTwitterCard = !!twitterCard;
    if (twitterCard) score += 25;

    return {
      score: Math.min(score, 100),
      methodology: {
        cs: "Hodnotíme title tag (25 bodů), meta description (25 bodů), Open Graph tagy (25 bodů) a Twitter Card (25 bodů).",
        en: "We evaluate the title tag (25 points), meta description (25 points), Open Graph tags (25 points), and Twitter Card (25 points).",
      },
      details,
    };
  }

  private analyzeSchema($: cheerio.CheerioAPI, html: string): AnalysisResult {
    let score = 0;
    const details: any = {};

    // Check for JSON-LD structured data
    const jsonLdScripts = $('script[type="application/ld+json"]');
    const schemas: any[] = [];

    jsonLdScripts.each((_, element) => {
      try {
        const content = $(element).html();
        if (content) {
          const jsonData = JSON.parse(content);
          schemas.push(jsonData);
        }
      } catch (error) {
        // Invalid JSON-LD
      }
    });

    details.jsonLdSchemas = schemas;
    details.jsonLdCount = schemas.length;

    if (schemas.length > 0) score += 50;

    // Check for microdata
    const microdataElements = $('[itemscope]');
    details.microdataCount = microdataElements.length;
    if (microdataElements.length > 0) score += 25;

    // Check for common schema types
    const commonSchemas = ["Organization", "WebSite", "Article", "Product", "LocalBusiness"];
    let foundCommonSchema = false;
    schemas.forEach(schema => {
      if (schema["@type"] && commonSchemas.includes(schema["@type"])) {
        foundCommonSchema = true;
      }
    });

    details.hasCommonSchema = foundCommonSchema;
    if (foundCommonSchema) score += 25;

    return {
      score: Math.min(score, 100),
      methodology: {
        cs: "Hodnotíme přítomnost JSON-LD strukturovaných dat (50 bodů), microdata (25 bodů) a běžných schema typů (25 bodů).",
        en: "We evaluate the presence of JSON-LD structured data (50 points), microdata (25 points), and common schema types (25 points).",
      },
      details,
    };
  }

  private analyzeContentWithoutJs($: cheerio.CheerioAPI, html: string): AnalysisResult {
    let score = 0;
    const details: any = {};

    // Get text content
    const textContent = $.text().trim();
    details.textLength = textContent.length;
    details.wordCount = textContent.split(/\s+/).filter(word => word.length > 0).length;

    // Check if there's substantial content
    if (details.wordCount > 200) score += 40;
    else if (details.wordCount > 100) score += 30;
    else if (details.wordCount > 50) score += 20;
    else if (details.wordCount > 0) score += 10;

    // Check for content in noscript tags
    const noscriptContent = $("noscript").text().trim();
    details.noscriptContentLength = noscriptContent.length;
    if (noscriptContent.length > 0) score += 20;

    // Check for images with alt text
    const images = $("img");
    const imagesWithAlt = $("img[alt]");
    details.totalImages = images.length;
    details.imagesWithAlt = imagesWithAlt.length;

    if (images.length > 0) {
      const altTextRatio = imagesWithAlt.length / images.length;
      score += Math.round(altTextRatio * 40);
    } else {
      score += 40; // No images is fine
    }

    return {
      score: Math.min(score, 100),
      methodology: {
        cs: "Hodnotíme množství textového obsahu (40 bodů), obsah v noscript tagech (20 bodů) a poměr obrázků s alt textem (40 bodů).",
        en: "We evaluate the amount of text content (40 points), content in noscript tags (20 points), and the ratio of images with alt text (40 points).",
      },
      details,
    };
  }

  private async analyzeSitemapRobots(url: string): Promise<AnalysisResult> {
    let score = 0;
    const details: any = {};

    try {
      const baseUrl = new URL(url);
      const sitemapUrl = `${baseUrl.origin}/sitemap.xml`;
      const robotsUrl = `${baseUrl.origin}/robots.txt`;

      // Check sitemap.xml
      try {
        const sitemapResponse = await axios.get(sitemapUrl, {
          headers: { "User-Agent": this.userAgent },
          timeout: 5000,
        });
        details.sitemapExists = true;
        details.sitemapStatus = sitemapResponse.status;
        
        if (sitemapResponse.status === 200) {
          score += 50;
          // Check if it's valid XML
          if (sitemapResponse.data.includes("<urlset") || sitemapResponse.data.includes("<sitemapindex")) {
            score += 10;
          }
        }
      } catch (error) {
        details.sitemapExists = false;
      }

      // Check robots.txt
      try {
        const robotsResponse = await axios.get(robotsUrl, {
          headers: { "User-Agent": this.userAgent },
          timeout: 5000,
        });
        details.robotsExists = true;
        details.robotsStatus = robotsResponse.status;
        
        if (robotsResponse.status === 200) {
          score += 30;
          // Check if it mentions sitemap
          if (robotsResponse.data.toLowerCase().includes("sitemap:")) {
            score += 10;
          }
        }
      } catch (error) {
        details.robotsExists = false;
      }

    } catch (error) {
      details.error = error.message;
    }

    return {
      score: Math.min(score, 100),
      methodology: {
        cs: "Hodnotíme přístupnost sitemap.xml (50 bodů), validitu XML (10 bodů), přístupnost robots.txt (30 bodů) a odkaz na sitemap v robots.txt (10 bodů).",
        en: "We evaluate sitemap.xml accessibility (50 points), XML validity (10 points), robots.txt accessibility (30 points), and sitemap reference in robots.txt (10 points).",
      },
      details,
    };
  }

  private analyzeAccessibility($: cheerio.CheerioAPI, html: string): AnalysisResult {
    let score = 0;
    const details: any = {};

    // Check for alt attributes on images
    const images = $("img");
    const imagesWithAlt = $("img[alt]");
    details.totalImages = images.length;
    details.imagesWithAlt = imagesWithAlt.length;

    if (images.length > 0) {
      const altRatio = imagesWithAlt.length / images.length;
      score += Math.round(altRatio * 25);
    } else {
      score += 25;
    }

    // Check for proper heading structure
    const headings = $("h1, h2, h3, h4, h5, h6");
    details.headingCount = headings.length;
    if (headings.length > 0) score += 25;

    // Check for form labels
    const formInputs = $("input, select, textarea");
    const labelsForInputs = $("label[for]");
    details.totalInputs = formInputs.length;
    details.labelsForInputs = labelsForInputs.length;

    if (formInputs.length > 0) {
      const labelRatio = labelsForInputs.length / formInputs.length;
      score += Math.round(labelRatio * 25);
    } else {
      score += 25;
    }

    // Check for lang attribute
    const langAttribute = $("html").attr("lang");
    details.hasLangAttribute = !!langAttribute;
    if (langAttribute) score += 25;

    return {
      score: Math.min(score, 100),
      methodology: {
        cs: "Hodnotíme alt atributy obrázků (25 bodů), strukturu nadpisů (25 bodů), labely formulářů (25 bodů) a lang atribut (25 bodů).",
        en: "We evaluate alt attributes on images (25 points), heading structure (25 points), form labels (25 points), and lang attribute (25 points).",
      },
      details,
    };
  }

  private async analyzeSpeed(url: string): Promise<AnalysisResult> {
    let score = 0;
    const details: any = {};

    try {
      const startTime = Date.now();
      const response = await axios.get(url, {
        headers: { "User-Agent": this.userAgent },
        timeout: 10000,
      });
      const loadTime = Date.now() - startTime;

      details.loadTime = loadTime;
      details.responseSize = response.data.length;
      details.status = response.status;

      // Score based on load time
      if (loadTime < 1000) score += 40;
      else if (loadTime < 2000) score += 30;
      else if (loadTime < 3000) score += 20;
      else if (loadTime < 5000) score += 10;

      // Score based on response size
      if (details.responseSize < 50000) score += 20;
      else if (details.responseSize < 100000) score += 15;
      else if (details.responseSize < 200000) score += 10;
      else if (details.responseSize < 500000) score += 5;

      // Check for compression
      const contentEncoding = response.headers['content-encoding'];
      details.hasCompression = !!contentEncoding;
      if (contentEncoding) score += 20;

      // Check for caching headers
      const cacheControl = response.headers['cache-control'];
      const etag = response.headers['etag'];
      details.hasCacheHeaders = !!(cacheControl || etag);
      if (cacheControl || etag) score += 20;

    } catch (error) {
      details.error = error.message;
      score = 0;
    }

    return {
      score: Math.min(score, 100),
      methodology: {
        cs: "Hodnotíme rychlost načítání (40 bodů), velikost odpovědi (20 bodů), kompresi (20 bodů) a cache hlavičky (20 bodů).",
        en: "We evaluate loading speed (40 points), response size (20 points), compression (20 points), and cache headers (20 points).",
      },
      details,
    };
  }

  private analyzeReadability($: cheerio.CheerioAPI, html: string): AnalysisResult {
    let score = 0;
    const details: any = {};

    // Get text content
    const textContent = $.text().trim();
    const sentences = textContent.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = textContent.split(/\s+/).filter(w => w.length > 0);

    details.sentenceCount = sentences.length;
    details.wordCount = words.length;

    if (sentences.length > 0) {
      // Average sentence length
      const avgSentenceLength = words.length / sentences.length;
      details.avgSentenceLength = avgSentenceLength;

      // Score based on sentence length (15-20 words is optimal)
      if (avgSentenceLength >= 10 && avgSentenceLength <= 25) score += 30;
      else if (avgSentenceLength >= 8 && avgSentenceLength <= 30) score += 20;
      else if (avgSentenceLength >= 5 && avgSentenceLength <= 35) score += 10;

      // Average word length
      const totalCharacters = words.join("").length;
      const avgWordLength = totalCharacters / words.length;
      details.avgWordLength = avgWordLength;

      // Score based on word length (4-6 characters is optimal)
      if (avgWordLength >= 4 && avgWordLength <= 6) score += 25;
      else if (avgWordLength >= 3 && avgWordLength <= 7) score += 20;
      else if (avgWordLength >= 2 && avgWordLength <= 8) score += 15;

      // Paragraph structure
      const paragraphs = $("p");
      details.paragraphCount = paragraphs.length;
      if (paragraphs.length > 0) score += 25;

      // Use of lists
      const lists = $("ul, ol");
      details.listCount = lists.length;
      if (lists.length > 0) score += 20;
    }

    return {
      score: Math.min(score, 100),
      methodology: {
        cs: "Hodnotíme průměrnou délku vět (30 bodů), průměrnou délku slov (25 bodů), strukturu odstavců (25 bodů) a použití seznamů (20 bodů).",
        en: "We evaluate average sentence length (30 points), average word length (25 points), paragraph structure (25 points), and use of lists (20 points).",
      },
      details,
    };
  }

  private analyzeInternalLinking($: cheerio.CheerioAPI, baseUrl: string): AnalysisResult {
    let score = 0;
    const details: any = {};

    const links = $("a[href]");
    const internalLinks: string[] = [];
    const externalLinks: string[] = [];

    links.each((_, element) => {
      const href = $(element).attr("href");
      if (href) {
        try {
          const url = new URL(href, baseUrl);
          const baseUrlObj = new URL(baseUrl);
          
          if (url.hostname === baseUrlObj.hostname) {
            internalLinks.push(href);
          } else {
            externalLinks.push(href);
          }
        } catch (error) {
          // Invalid URL
        }
      }
    });

    details.totalLinks = links.length;
    details.internalLinks = internalLinks.length;
    details.externalLinks = externalLinks.length;

    // Score based on internal linking
    if (internalLinks.length > 0) score += 30;
    if (internalLinks.length > 3) score += 20;

    // Check anchor text quality
    let goodAnchorTexts = 0;
    links.each((_, element) => {
      const text = $(element).text().trim();
      if (text.length > 2 && !text.toLowerCase().includes("click here") && !text.toLowerCase().includes("read more")) {
        goodAnchorTexts++;
      }
    });

    details.goodAnchorTexts = goodAnchorTexts;
    if (links.length > 0) {
      const anchorTextRatio = goodAnchorTexts / links.length;
      score += Math.round(anchorTextRatio * 30);
    }

    // Check for breadcrumbs
    const breadcrumbs = $('[class*="breadcrumb"], [role="navigation"]');
    details.hasBreadcrumbs = breadcrumbs.length > 0;
    if (breadcrumbs.length > 0) score += 20;

    return {
      score: Math.min(score, 100),
      methodology: {
        cs: "Hodnotíme počet vnitřních odkazů (50 bodů), kvalitu anchor textů (30 bodů) a přítomnost breadcrumbs (20 bodů).",
        en: "We evaluate the number of internal links (50 points), anchor text quality (30 points), and presence of breadcrumbs (20 points).",
      },
      details,
    };
  }

  private getEmptyResults(): DetailedAnalysisResults {
    const emptyResult: AnalysisResult = {
      score: 0,
      methodology: {
        cs: "Analýza se nezdařila kvůli technické chybě.",
        en: "Analysis failed due to technical error.",
      },
      details: {},
    };

    return {
      htmlStructure: emptyResult,
      metadata: emptyResult,
      schema: emptyResult,
      contentWithoutJs: emptyResult,
      sitemapRobots: emptyResult,
      accessibility: emptyResult,
      speed: emptyResult,
      readability: emptyResult,
      internalLinking: emptyResult,
      totalScore: 0,
    };
  }
}
