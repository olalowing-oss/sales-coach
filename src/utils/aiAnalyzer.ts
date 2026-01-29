import type { CallAnalysis } from '../types';

/**
 * Analyze call transcript using OpenAI GPT-4o via secure Netlify Function
 * Provides intelligent, context-aware analysis of sales calls
 */
export async function analyzeTranscriptWithAI(
  transcript: string,
  existingAnalysis?: Partial<CallAnalysis>
): Promise<Partial<CallAnalysis>> {
  try {
    // Call secure Netlify Function instead of OpenAI directly
    const response = await fetch('/.netlify/functions/analyze-call', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        transcript,
        existingAnalysis
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || 'AI analysis failed');
    }

    const { success, analysis } = await response.json();

    if (!success || !analysis) {
      throw new Error('Invalid response from AI service');
    }

    // Convert to CallAnalysis format
    const result: Partial<CallAnalysis> & { companyName?: string } = {
      companyName: analysis.companyName,
      industry: analysis.industry || existingAnalysis?.industry,
      companySize: analysis.companySize || existingAnalysis?.companySize,
      callPurpose: analysis.callPurpose || existingAnalysis?.callPurpose,
      productsDiscussed: analysis.productsDiscussed || existingAnalysis?.productsDiscussed || [],
      competitorsMentioned: analysis.competitorsMentioned || existingAnalysis?.competitorsMentioned || [],
      objectionsRaised: analysis.objectionsRaised || existingAnalysis?.objectionsRaised || [],
      painPoints: analysis.painPoints || existingAnalysis?.painPoints || [],
      interestLevel: analysis.interestLevel || existingAnalysis?.interestLevel,
      decisionTimeframe: analysis.decisionTimeframe || existingAnalysis?.decisionTimeframe,
      callOutcome: analysis.callOutcome || existingAnalysis?.callOutcome,
      nextSteps: analysis.nextSteps || existingAnalysis?.nextSteps,
      estimatedValue: analysis.estimatedValue || existingAnalysis?.estimatedValue,
      probability: analysis.probability ?? existingAnalysis?.probability ?? 50,
      aiSummary: analysis.aiSummary || existingAnalysis?.aiSummary,
      keyTopics: analysis.keyTopics || existingAnalysis?.keyTopics || []
    };

    console.log('✅ AI Analysis completed:', result);

    return result;

  } catch (error) {
    console.error('❌ AI Analysis error:', error);

    // Return empty object on error - calling code can handle fallback
    return {};
  }
}

/**
 * Check if AI analysis is available
 * For serverless function, we always return true and let the backend handle availability
 */
export function isAIAnalysisAvailable(): boolean {
  // Backend will handle API key validation
  return true;
}

/**
 * Estimate cost of AI analysis
 * GPT-4o pricing (as of 2024):
 * - Input: $2.50 per 1M tokens
 * - Output: $10.00 per 1M tokens
 */
export function estimateAnalysisCost(transcriptLength: number): number {
  // Rough estimate: 1 token ≈ 4 characters
  const inputTokens = transcriptLength / 4 + 500; // transcript + system prompt
  const outputTokens = 300; // Typical structured output

  const inputCost = (inputTokens / 1_000_000) * 2.5;
  const outputCost = (outputTokens / 1_000_000) * 10.0;

  return inputCost + outputCost;
}
