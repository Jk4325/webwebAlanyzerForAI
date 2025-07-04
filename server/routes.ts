import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { createAnalysisSchema, updateAnalysisSchema } from "@shared/schema";
import { WebsiteAnalyzer } from "./services/websiteAnalyzer";
import { PDFGenerator } from "./services/pdfGenerator";
import { CSVLogger } from "./services/csvLogger";
import helmet from "helmet";
import Stripe from "stripe";

const websiteAnalyzer = new WebsiteAnalyzer();
const pdfGenerator = new PDFGenerator();
const csvLogger = new CSVLogger();

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for development
  }));

  // Sanitize inputs
  app.use((req, res, next) => {
    if (req.body) {
      for (const key in req.body) {
        if (typeof req.body[key] === 'string') {
          req.body[key] = req.body[key].trim();
        }
      }
    }
    next();
  });

  // Create new analysis
  app.post("/api/analyses", async (req, res) => {
    try {
      const data = createAnalysisSchema.parse(req.body);
      
      // Get client IP
      const ipAddress = req.ip || req.connection.remoteAddress || "unknown";
      
      // Normalize URL
      let url = data.url;
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = "https://" + url;
      }

      // Create analysis record
      const analysis = await storage.createAnalysis({
        ...data,
        url,
        ipAddress,
        htmlStructureScore: "0",
        metadataScore: "0",
        schemaScore: "0",
        contentWithoutJsScore: "0",
        sitemapRobotsScore: "0",
        accessibilityScore: "0",
        speedScore: "0",
        readabilityScore: "0",
        internalLinkingScore: "0",
        totalScore: "0",
        analysisResults: "",
        termsAccepted: false,
        privacyAccepted: false,
        dataAccepted: false,
        paymentCompleted: false,
        paymentTimestamp: null,
      });

      res.json({ id: analysis.id });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid input data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create analysis" });
      }
    }
  });

  // Start website analysis
  app.post("/api/analyses/:id/analyze", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const analysis = await storage.getAnalysis(id);
      
      if (!analysis) {
        return res.status(404).json({ error: "Analysis not found" });
      }

      // Perform website analysis
      const results = await websiteAnalyzer.analyzeWebsite(analysis.url);

      // Update analysis with results
      await storage.updateAnalysis(id, {
        htmlStructureScore: results.htmlStructure.score.toString(),
        metadataScore: results.metadata.score.toString(),
        schemaScore: results.schema.score.toString(),
        contentWithoutJsScore: results.contentWithoutJs.score.toString(),
        sitemapRobotsScore: results.sitemapRobots.score.toString(),
        accessibilityScore: results.accessibility.score.toString(),
        speedScore: results.speed.score.toString(),
        readabilityScore: results.readability.score.toString(),
        internalLinkingScore: results.internalLinking.score.toString(),
        totalScore: results.totalScore.toString(),
        analysisResults: JSON.stringify(results),
      });

      res.json({ results });
    } catch (error) {
      console.error("Analysis error:", error);
      res.status(500).json({ error: "Analysis failed" });
    }
  });

  // Get analysis results
  app.get("/api/analyses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const analysis = await storage.getAnalysis(id);
      
      if (!analysis) {
        return res.status(404).json({ error: "Analysis not found" });
      }

      let results = null;
      if (analysis.analysisResults) {
        results = JSON.parse(analysis.analysisResults);
      }

      res.json({ analysis, results });
    } catch (error) {
      res.status(500).json({ error: "Failed to get analysis" });
    }
  });

  // Update analysis (for consent and payment)
  app.patch("/api/analyses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = updateAnalysisSchema.parse(req.body);
      
      const analysis = await storage.updateAnalysis(id, data);
      
      if (!analysis) {
        return res.status(404).json({ error: "Analysis not found" });
      }

      res.json({ analysis });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid input data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update analysis" });
      }
    }
  });

  // Create Stripe payment intent
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { analysisId } = req.body;
      
      const analysis = await storage.getAnalysis(analysisId);
      if (!analysis) {
        return res.status(404).json({ error: "Analysis not found" });
      }

      // Verify all consents are given
      if (!analysis.termsAccepted || !analysis.privacyAccepted || !analysis.dataAccepted) {
        return res.status(400).json({ error: "All consents must be accepted" });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: 5000, // 50 CZK in haléře (cents)
        currency: "czk",
        description: `WebAudit Pro - Analýza webu ${analysis.url}`,
        metadata: {
          analysisId: analysisId.toString(),
          email: analysis.email,
          url: analysis.url,
        },
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      console.error("Payment intent creation error:", error);
      res.status(500).json({ error: "Payment intent creation failed" });
    }
  });

  // Confirm payment completion
  app.post("/api/analyses/:id/payment", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { paymentIntentId } = req.body;
      
      const analysis = await storage.getAnalysis(id);
      if (!analysis) {
        return res.status(404).json({ error: "Analysis not found" });
      }

      // Verify payment with Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({ error: "Payment not completed" });
      }

      // Update analysis with payment completion
      const updatedAnalysis = await storage.updateAnalysis(id, {
        paymentCompleted: true,
        paymentTimestamp: new Date(),
      });

      // Log to CSV
      await csvLogger.logEntry({
        timestamp: new Date().toISOString(),
        url: analysis.url,
        email: analysis.email,
        ipAddress: analysis.ipAddress,
        totalScore: parseFloat(analysis.totalScore || "0"),
        termsAccepted: analysis.termsAccepted,
        privacyAccepted: analysis.privacyAccepted,
        dataAccepted: analysis.dataAccepted,
        paymentCompleted: true,
        paymentTimestamp: new Date().toISOString(),
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Payment confirmation error:", error);
      res.status(500).json({ error: "Payment confirmation failed" });
    }
  });

  // Generate and download PDF
  app.get("/api/analyses/:id/pdf", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const language = req.query.lang as string || "cs";
      
      const analysis = await storage.getAnalysis(id);
      
      if (!analysis) {
        return res.status(404).json({ error: "Analysis not found" });
      }

      if (!analysis.paymentCompleted) {
        return res.status(403).json({ error: "Payment required" });
      }

      if (!analysis.analysisResults) {
        return res.status(400).json({ error: "Analysis not completed" });
      }

      const results = JSON.parse(analysis.analysisResults);
      const pdfBuffer = await pdfGenerator.generatePDFReport(
        analysis.url,
        analysis.email,
        results,
        language
      );

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="website-analysis-${id}.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error("PDF generation error:", error);
      res.status(500).json({ error: "PDF generation failed" });
    }
  });

  // Mock email sending
  app.post("/api/analyses/:id/email", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const analysis = await storage.getAnalysis(id);
      
      if (!analysis) {
        return res.status(404).json({ error: "Analysis not found" });
      }

      if (!analysis.paymentCompleted) {
        return res.status(403).json({ error: "Payment required" });
      }

      // Mock email sending (always succeeds)
      await new Promise(resolve => setTimeout(resolve, 1000));

      res.json({ success: true, message: "Email sent successfully" });
    } catch (error) {
      console.error("Email sending error:", error);
      res.status(500).json({ error: "Email sending failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
