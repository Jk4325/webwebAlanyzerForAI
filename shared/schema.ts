import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const websiteAnalyses = pgTable("website_analyses", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  email: text("email").notNull(),
  ipAddress: text("ip_address").notNull(),
  
  // Analysis results
  htmlStructureScore: decimal("html_structure_score", { precision: 5, scale: 2 }),
  metadataScore: decimal("metadata_score", { precision: 5, scale: 2 }),
  schemaScore: decimal("schema_score", { precision: 5, scale: 2 }),
  contentWithoutJsScore: decimal("content_without_js_score", { precision: 5, scale: 2 }),
  sitemapRobotsScore: decimal("sitemap_robots_score", { precision: 5, scale: 2 }),
  accessibilityScore: decimal("accessibility_score", { precision: 5, scale: 2 }),
  speedScore: decimal("speed_score", { precision: 5, scale: 2 }),
  readabilityScore: decimal("readability_score", { precision: 5, scale: 2 }),
  internalLinkingScore: decimal("internal_linking_score", { precision: 5, scale: 2 }),
  totalScore: decimal("total_score", { precision: 5, scale: 2 }),
  
  // Analysis details
  analysisResults: text("analysis_results"), // JSON string with detailed results
  
  // Legal consent
  termsAccepted: boolean("terms_accepted").default(false),
  privacyAccepted: boolean("privacy_accepted").default(false),
  dataAccepted: boolean("data_accepted").default(false),
  
  // Payment
  paymentCompleted: boolean("payment_completed").default(false),
  paymentTimestamp: timestamp("payment_timestamp"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertWebsiteAnalysisSchema = createInsertSchema(websiteAnalyses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const createAnalysisSchema = insertWebsiteAnalysisSchema.pick({
  url: true,
  email: true,
});

export const updateAnalysisSchema = insertWebsiteAnalysisSchema.partial();

export type InsertWebsiteAnalysis = z.infer<typeof insertWebsiteAnalysisSchema>;
export type WebsiteAnalysis = typeof websiteAnalyses.$inferSelect;
export type CreateAnalysis = z.infer<typeof createAnalysisSchema>;
export type UpdateAnalysis = z.infer<typeof updateAnalysisSchema>;

// Analysis result types
export interface AnalysisResult {
  score: number;
  methodology: {
    cs: string;
    en: string;
  };
  details: any;
}

export interface DetailedAnalysisResults {
  htmlStructure: AnalysisResult;
  metadata: AnalysisResult;
  schema: AnalysisResult;
  contentWithoutJs: AnalysisResult;
  sitemapRobots: AnalysisResult;
  accessibility: AnalysisResult;
  speed: AnalysisResult;
  readability: AnalysisResult;
  internalLinking: AnalysisResult;
  totalScore: number;
}
