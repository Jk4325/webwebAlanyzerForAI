import { apiRequest } from "./queryClient";
import { DetailedAnalysisResults } from "@shared/schema";

export async function createAnalysis(url: string, email: string): Promise<{ id: number }> {
  const response = await apiRequest("POST", "/api/analyses", { url, email });
  return response.json();
}

export async function startAnalysis(id: number): Promise<{ results: DetailedAnalysisResults }> {
  const response = await apiRequest("POST", `/api/analyses/${id}/analyze`, {});
  return response.json();
}

export async function getAnalysis(id: number): Promise<{ analysis: any; results: DetailedAnalysisResults | null }> {
  const response = await apiRequest("GET", `/api/analyses/${id}`, {});
  return response.json();
}

export async function updateAnalysisConsent(id: number, consents: {
  termsAccepted: boolean;
  privacyAccepted: boolean;
  dataAccepted: boolean;
}): Promise<{ analysis: any }> {
  const response = await apiRequest("PATCH", `/api/analyses/${id}`, consents);
  return response.json();
}

export async function processPayment(id: number): Promise<{ success: boolean }> {
  const response = await apiRequest("POST", `/api/analyses/${id}/payment`, {});
  return response.json();
}

export async function downloadPDF(id: number, language: string): Promise<Blob> {
  const response = await apiRequest("GET", `/api/analyses/${id}/pdf?lang=${language}`, {});
  return response.blob();
}

export async function sendEmail(id: number): Promise<{ success: boolean }> {
  const response = await apiRequest("POST", `/api/analyses/${id}/email`, {});
  return response.json();
}
