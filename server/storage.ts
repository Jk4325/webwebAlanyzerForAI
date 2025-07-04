import { websiteAnalyses, type WebsiteAnalysis, type InsertWebsiteAnalysis } from "@shared/schema";

export interface IStorage {
  getAnalysis(id: number): Promise<WebsiteAnalysis | undefined>;
  getAnalysisByEmail(email: string): Promise<WebsiteAnalysis[]>;
  createAnalysis(analysis: InsertWebsiteAnalysis): Promise<WebsiteAnalysis>;
  updateAnalysis(id: number, analysis: Partial<WebsiteAnalysis>): Promise<WebsiteAnalysis | undefined>;
  deleteAnalysis(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private analyses: Map<number, WebsiteAnalysis>;
  private currentId: number;

  constructor() {
    this.analyses = new Map();
    this.currentId = 1;
  }

  async getAnalysis(id: number): Promise<WebsiteAnalysis | undefined> {
    return this.analyses.get(id);
  }

  async getAnalysisByEmail(email: string): Promise<WebsiteAnalysis[]> {
    return Array.from(this.analyses.values()).filter(
      (analysis) => analysis.email === email,
    );
  }

  async createAnalysis(insertAnalysis: InsertWebsiteAnalysis): Promise<WebsiteAnalysis> {
    const id = this.currentId++;
    const now = new Date();
    const analysis: WebsiteAnalysis = {
      ...insertAnalysis,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.analyses.set(id, analysis);
    return analysis;
  }

  async updateAnalysis(id: number, updateData: Partial<WebsiteAnalysis>): Promise<WebsiteAnalysis | undefined> {
    const existing = this.analyses.get(id);
    if (!existing) {
      return undefined;
    }

    const updated: WebsiteAnalysis = {
      ...existing,
      ...updateData,
      updatedAt: new Date(),
    };
    this.analyses.set(id, updated);
    return updated;
  }

  async deleteAnalysis(id: number): Promise<boolean> {
    return this.analyses.delete(id);
  }
}

export const storage = new MemStorage();
