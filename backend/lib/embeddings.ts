// Embeddings adapter abstraction — server-side
export interface EmbeddingsProvider {
  embed(texts: string[]): Promise<number[][]>
}

export const NotImplementedEmbeddings: EmbeddingsProvider = {
  async embed() {
    throw new Error('EmbeddingsProvider.embed not implemented')
  },
}

// TODO: Add OpenAI / HuggingFace / Anthropic adapter implementations.
