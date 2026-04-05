import axios from "axios";
import { Collection } from "@/types/collection";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface CollectionResponse {
  collections: Collection[];
}

export type SingleCollectionResponse = Collection;

interface UploadResponse {
  message: string;
}

interface AIResponse {
  text: string;
  processingTime: number;
  status: string;
}

export interface FileItem {
  id: string;
  filename: string;
  originalFilename: string;
  size: number;
  uploadedAt: string;
  status: "processing" | "completed" | "error";
  processingError?: string;
  collectionName: string;
}

class ApiService {
  private userId: string | undefined;

  setUserId(userId: string) {
    this.userId = userId;
  }

  private getHeaders() {
    return {
      params: {
        userId: this.userId
      }
    };
  }

  // Collections API
  async getCollections(): Promise<Collection[]> {
    const response = await axios.get<ApiResponse<CollectionResponse>>(
      `${API_URL}/collections`,
      this.getHeaders()
    );
    return response.data.data.collections;
  }

  async createCollection(data: { name: string; description?: string }): Promise<Collection> {
    const response = await axios.post<ApiResponse<SingleCollectionResponse>>(
      `${API_URL}/collections`,
      {
        ...data,
        userId: this.userId
      }
    );
    return response.data.data;
  }

  async updateCollection(
    id: string,
    data: { name: string; description?: string }
  ): Promise<Collection> {
    const response = await axios.patch<ApiResponse<Collection>>(`${API_URL}/collections/${id}`, {
      ...data,
      userId: this.userId
    });
    return response.data.data;
  }

  async deleteCollection(id: string): Promise<void> {
    await axios.delete(`${API_URL}/collections/${id}`, this.getHeaders());
  }

  async getCollectionBySlug(slug: string): Promise<Collection | null> {
    try {
      const response = await axios.get<ApiResponse<SingleCollectionResponse>>(
        `${API_URL}/collections/${slug}`,
        this.getHeaders()
      );
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  // File Upload API
  async uploadFiles(files: File[], collectionSlug: string): Promise<void> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    await axios.post<ApiResponse<UploadResponse>>(`${API_URL}/pdf/upload`, formData, {
      params: {
        collection: collectionSlug,
        userId: this.userId
      },
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
  }

  // Business Report Analysis
  async analyzeBusinessReport(collectionSlug: string): Promise<AIResponse> {
    const prompt = `Analyze this business visit report and deliver structured, insight-driven content using the following format (no introductory phrases or explanations):

Companies & Locations: List all companies and their respective visit locations.

Key Business Topics: Summarize business discussions, collaborations, deals, and technical or strategic matters.

Market & Demand Overview: Highlight market conditions, customer demand, competitor landscape, and product trends.

Business Opportunities: Identify opportunities for upselling, new projects, product expansions, or strategic partnerships.

Customer Feedback: Extract customer satisfaction ratings and qualitative sentiment (if any).

Operational Challenges & Action Items: Note open issues, complaints, internal tasks, pricing or logistical barriers, and required follow-ups.

SWOT Analysis:

Strengths

Weaknesses

Opportunities

Threats

Executive Summary: Provide a strategic paragraph summarizing the visit's business implications and next steps.`;

    const response = await axios.get<ApiResponse<{ aiResponse: AIResponse }>>(
      `${API_URL}/pdf/similar`,
      {
        params: {
          query: prompt,
          collection: collectionSlug,
          userId: this.userId
        }
      }
    );

    return response.data.data.aiResponse;
  }

  // File APIs
  async getFiles(collectionSlug: string): Promise<{ results: FileItem[]; total: number }> {
    const response = await axios.get<ApiResponse<{ results: FileItem[]; total: number }>>(
      `${API_URL}/pdf`,
      {
        params: {
          collection: collectionSlug,
          userId: this.userId
        }
      }
    );
    return response.data.data;
  }

  async deleteFile(fileId: string): Promise<void> {
    await axios.delete(`${API_URL}/pdf/${fileId}`, this.getHeaders());
  }
}

export const api = new ApiService();
