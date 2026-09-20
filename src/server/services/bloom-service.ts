import { getBloomProvider } from "@/lib/ai";
import type { BloomMessage, BloomQuestion, DiagnosisContext, Recommendation } from "@/types";

/**
 * Contextualise les informations disponibles et produit des conseils, des
 * messages courts et des questions au nom de Bloom (section 23). Ne parle
 * jamais directement au provider IA depuis l'UI — toujours via ce service.
 */
export class BloomService {
  private get provider() {
    return getBloomProvider();
  }

  async getDiagnosisQuestions(context: DiagnosisContext): Promise<BloomQuestion[]> {
    return this.provider.generateQuestions(context);
  }

  async getRecommendation(context: DiagnosisContext): Promise<Recommendation> {
    return this.provider.generateRecommendation(context);
  }

  async getMessage(context: DiagnosisContext): Promise<BloomMessage> {
    return this.provider.generateBloomMessage(context);
  }
}

export const bloomService = new BloomService();
