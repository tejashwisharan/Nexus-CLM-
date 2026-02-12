
import { GoogleGenAI, Type } from "@google/genai";
import { MOCK_DATABASE } from "../constants"; // Import MOCK_DATABASE for context
import { EntityProfile, RiskLevel, ScreeningResult, RiskFactor, ForensicResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-3-flash-preview';

// 1. Profile Enrichment & Screening Analysis
export const performRiskAnalysis = async (
  entityName: string,
  entityType: string,
  details: any
): Promise<{
  riskScore: number;
  riskLevel: RiskLevel;
  riskFactors: RiskFactor[];
  screeningResult: ScreeningResult;
  enrichedSummary: string;
}> => {
  const prompt = `
    You are a highly advanced Financial Crime Risk Engine and KYC Analyst.
    Analyze the following entity for onboarding.
    
    Entity Name: ${entityName}
    Type: ${entityType}
    Details: ${JSON.stringify(details)}
    
    Task:
    1. Simulate a profile enrichment (imagine gathering public data).
    2. Simulate a screening check (Adverse Media, PEP, Sanctions). If the name sounds like a known political figure or criminal (e.g. "Osama", "Pablo Escobar", "Putin"), flag it. If it is generic (e.g., "John Smith", "Tech Corp"), assume clean.
    3. Calculate a Risk Score (0-100) based on the entity type, industry (if provided), country (if provided), and simulated screening results.
    4. Provide specific risk factors.
    
    Return the response in strictly valid JSON format conforming to the schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskScore: { type: Type.INTEGER, description: "0 to 100" },
            riskLevel: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
            enrichedSummary: { type: Type.STRING, description: "A brief summary of what was found about the entity." },
            riskFactors: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  description: { type: Type.STRING },
                  score: { type: Type.INTEGER },
                  severity: { type: Type.STRING, enum: ["Low", "Medium", "High"] }
                }
              }
            },
            screeningResult: {
              type: Type.OBJECT,
              properties: {
                adverseMediaFound: { type: Type.BOOLEAN },
                pepStatus: { type: Type.BOOLEAN },
                sanctionsHit: { type: Type.BOOLEAN },
                summary: { type: Type.STRING }
              }
            }
          }
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Risk Analysis Error:", error);
    // Fallback if AI fails
    return {
      riskScore: 50,
      riskLevel: RiskLevel.MEDIUM,
      riskFactors: [{ category: 'System', description: 'AI Analysis Failed - Manual Review Required', score: 50, severity: RiskLevel.MEDIUM }],
      screeningResult: { adverseMediaFound: false, pepStatus: false, sanctionsHit: false, summary: "Automated screening unavailable." },
      enrichedSummary: "Could not enrich profile due to system error."
    };
  }
};

// 2. Natural Language Search
export const searchEntitiesNaturalLanguage = async (query: string, currentDatabase: any[]): Promise<{ matchedIds: string[], reason: string }> => {
  // We feed the mock database to the context so it can "search" it.
  // In a real app, this would generate a SQL/Vector query.
  
  const prompt = `
    You are an intelligent database search assistant.
    User Query: "${query}"
    
    Here is the current database of entities:
    ${JSON.stringify(currentDatabase.map(e => ({ id: e.id, name: e.name, type: e.type, details: e.details, status: e.status })))}
    
    Task:
    Identify which entities in the database best match the user's natural language query.
    Even if the user has "half-cooked memory" (e.g. "that shipping company in Panama"), try to find the best match based on metadata.
    
    Return a JSON object with a list of matched IDs and a brief reasoning.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matchedIds: { type: Type.ARRAY, items: { type: Type.STRING } },
            reason: { type: Type.STRING }
          }
        }
      }
    });

    return JSON.parse(response.text || `{"matchedIds": [], "reason": "No match"}`);
  } catch (error) {
    console.error("Search Error:", error);
    return { matchedIds: [], reason: "Search service unavailable." };
  }
};

// 3. Document Forensic Analysis (Simulation)
export const verifyDocumentIntegrity = async (docName: string, shouldFail?: boolean): Promise<ForensicResult> => {
    // In a real app, we would send file buffers. Here we simulate the forensic check
    // using the model to generate realistic outcomes.
    
    // We intentionally introduce "Flagged" scenarios for demonstration if the docName contains "fake" or specific triggers.
    // MODIFIED: Accepts shouldFail override.
    const isSuspicious = shouldFail !== undefined 
        ? shouldFail 
        : (docName.toLowerCase().includes("fake") || Math.random() > 0.9);

    const prompt = `
        You are a Document Forensics AI.
        Analyze a document named "${docName}".
        
        Task:
        Simulate a forensic analysis report. 
        If 'isSuspicious' is true (simulated logic), generate a detection report for a forged document.
        Otherwise, generate a clean report.
        
        Factors to evaluate:
        1. Metadata Consistency (Creation dates, software used)
        2. Error Level Analysis (ELA) (Compression artifacts)
        3. Font/Typography Consistency
        4. Pixel Pattern Analysis (Cloning/Healing detection)

        Is Suspicious: ${isSuspicious}

        Return strictly valid JSON.
    `;

    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        isForged: { type: Type.BOOLEAN },
                        score: { type: Type.INTEGER, description: "0-100 authenticity confidence" },
                        factors: {
                            type: Type.OBJECT,
                            properties: {
                                metadata: { type: Type.STRING, enum: ['Consistent', 'Inconsistent', 'Missing'] },
                                ela: { type: Type.STRING, enum: ['Pass', 'Fail', 'Inconclusive'] },
                                fonts: { type: Type.STRING, enum: ['Consistent', 'Manipulation Detected'] },
                                pixel: { type: Type.STRING, enum: ['Natural', 'Artifacts Detected'] }
                            }
                        },
                        reason: { type: Type.STRING }
                    }
                }
            }
        });

        return JSON.parse(response.text || "{}");
    } catch (e) {
        // Fallback
        const defaultResult: ForensicResult = {
            isForged: isSuspicious,
            score: isSuspicious ? 35 : 98,
            factors: {
                metadata: isSuspicious ? 'Inconsistent' : 'Consistent',
                ela: isSuspicious ? 'Fail' : 'Pass',
                fonts: isSuspicious ? 'Manipulation Detected' : 'Consistent',
                pixel: isSuspicious ? 'Artifacts Detected' : 'Natural'
            },
            reason: isSuspicious ? "System detected anomalies (fallback)." : "Forensic service passed (default)."
        };
        return defaultResult;
    }
};
