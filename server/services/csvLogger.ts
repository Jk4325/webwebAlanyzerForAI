import fs from "fs";
import path from "path";

export interface LogEntry {
  timestamp: string;
  url: string;
  email: string;
  ipAddress: string;
  totalScore: number;
  termsAccepted: boolean;
  privacyAccepted: boolean;
  dataAccepted: boolean;
  paymentCompleted: boolean;
  paymentTimestamp?: string;
}

export class CSVLogger {
  private logFilePath: string;

  constructor() {
    this.logFilePath = path.join(process.cwd(), "logs", "website_analyses.csv");
    this.ensureLogDirectory();
    this.ensureCSVHeaders();
  }

  private ensureLogDirectory() {
    const logDir = path.dirname(this.logFilePath);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  private ensureCSVHeaders() {
    if (!fs.existsSync(this.logFilePath)) {
      const headers = [
        "timestamp",
        "url",
        "email",
        "ipAddress",
        "totalScore",
        "termsAccepted",
        "privacyAccepted",
        "dataAccepted",
        "paymentCompleted",
        "paymentTimestamp",
      ];
      fs.writeFileSync(this.logFilePath, headers.join(",") + "\n");
    }
  }

  async logEntry(entry: LogEntry): Promise<void> {
    const row = [
      entry.timestamp,
      `"${entry.url}"`,
      `"${entry.email}"`,
      entry.ipAddress,
      entry.totalScore,
      entry.termsAccepted,
      entry.privacyAccepted,
      entry.dataAccepted,
      entry.paymentCompleted,
      entry.paymentTimestamp || "",
    ];

    const csvRow = row.join(",") + "\n";
    fs.appendFileSync(this.logFilePath, csvRow);
  }
}
