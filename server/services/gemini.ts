import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || "" 
});

export interface ReportStructure {
  title: string;
  sections: {
    id: string;
    title: string;
    type: 'text' | 'chart' | 'table';
    content?: string;
    chartType?: 'bar' | 'line' | 'pie' | 'area';
    data?: any;
  }[];
  insights: string[];
}

export async function generateReportStructure(prompt: string, dataSourceType: string): Promise<ReportStructure> {
  try {
    const systemPrompt = `You are an AI report generator expert. 
Based on the user's request and data source type, generate a comprehensive report structure.
Consider the data source capabilities and create relevant sections with appropriate chart types.

Data source: ${dataSourceType}
User request: ${prompt}

Respond with JSON in this exact format:
{
  "title": "Report Title",
  "sections": [
    {
      "id": "unique-id",
      "title": "Section Title", 
      "type": "chart|text|table",
      "chartType": "bar|line|pie|area",
      "content": "Text content for text sections"
    }
  ],
  "insights": ["Key insight 1", "Key insight 2"]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            title: { type: "string" },
            sections: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  title: { type: "string" },
                  type: { type: "string" },
                  chartType: { type: "string" },
                  content: { type: "string" }
                },
                required: ["id", "title", "type"]
              }
            },
            insights: {
              type: "array",
              items: { type: "string" }
            }
          },
          required: ["title", "sections", "insights"]
        }
      },
      contents: prompt,
    });

    const rawJson = response.text;
    if (rawJson) {
      const structure: ReportStructure = JSON.parse(rawJson);
      return structure;
    } else {
      throw new Error("Empty response from AI model");
    }
  } catch (error) {
    console.error("Failed to generate report structure:", error);
    throw new Error(`AI report generation failed: ${error}`);
  }
}

export async function generateReportInsights(data: any, reportType: string): Promise<string[]> {
  try {
    const prompt = `Analyze this ${reportType} data and provide 3-5 key business insights:
    
Data: ${JSON.stringify(data, null, 2)}

Provide insights as a JSON array of strings.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "array",
          items: { type: "string" }
        }
      },
      contents: prompt,
    });

    const rawJson = response.text;
    if (rawJson) {
      return JSON.parse(rawJson);
    }
    return [];
  } catch (error) {
    console.error("Failed to generate insights:", error);
    return [];
  }
}

export async function generateReportContent(section: any, data?: any): Promise<string> {
  try {
    let prompt = `Generate content for a report section titled "${section.title}" of type "${section.type}".`;
    
    if (data) {
      prompt += `\n\nUse this data: ${JSON.stringify(data, null, 2)}`;
    }

    if (section.type === 'text') {
      prompt += '\n\nGenerate 2-3 paragraphs of analytical text content.';
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "Content generation failed";
  } catch (error) {
    console.error("Failed to generate content:", error);
    return "Error generating content";
  }
}
