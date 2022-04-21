const BASE_URL = "http://localhost:8080";
const PROXY_URL = "http://localhost:3000/api";

export interface Sentence {
  answer_type: number;
  nbr_text: number;
  nbr_tokens: number;
  s_id: number;
  score: number;
  sent_stemmed_overlap: number;
  sent_text: number;
  sent_tokens: number;
  sentence: string;
  topic: string;
  topic1: number;
  topic2: number;
}

export interface SpellCheckResult {
  correct: boolean;
  correctedText: string;
  originalText: string;
}

export interface SentenceDetails {
  document: {
    name: string;
    source: string;
  };
  neighbouring_sentences: Sentence[];
  sentence: Sentence;
}

export type Entity = [number, string, string];

export type Edge = [number, string, number];

const wrapper = <Data = any>(
  base: string,
  method: string,
  endpoint: string,
  body?: any
): Promise<Data> =>
  fetch(`${base}/${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  }).then((res) => res.json()) as Promise<Data>;

export const api = {
  getSpellCheck: async (text: string) => {
    const data = await wrapper<{
      corrected_text: string;
      text: string;
    }>(BASE_URL, "POST", "correct_text", { text });
    return {
      correct: data.corrected_text === data.text,
      correctedText: data.corrected_text,
      originalText: data.text,
    };
  },

  getAnswer: async (query: string) => {
    const data = await wrapper<{
      query: string;
      sentences: Sentence[];
    }>(BASE_URL, "POST", "get_answer", { query });
    return data.sentences;
  },

  getSentenceDetails: async (sentence: Sentence) => {
    const data = await wrapper<SentenceDetails>(
      BASE_URL,
      "POST",
      "get_sentence_details",
      { sentence }
    );
    return data;
  },

  getClosestEntities: async (query: string) => {
    const data = await wrapper<{
      query: string;
      closest_entities: {
        entity: Entity;
      }[];
    }>(BASE_URL, "POST", "get_closest_entities", { query, threshold: 0 });
    return data.closest_entities.map((e) => e.entity);
  },

  getGraphWithNeighbours: async (nodes: number[], nodeNeighbours: number[]) => {
    const data = await wrapper<{
      edges: Edge[];
      nodes: Entity[];
    }>(BASE_URL, "POST", "get_graph_with_neighbours", {
      nbr_of_nodes: nodeNeighbours,
      nodes,
    });
    return data;
  },
};

export const proxy = {
  getSpellCheck: (text: string) =>
    wrapper<SpellCheckResult>(PROXY_URL, "POST", "spellcheck", { text }),

  getAnswer: async (query: string) =>
    wrapper<Sentence[]>(PROXY_URL, "POST", "answer", { query }),

  getSentenceDetails: async (sentence: Sentence) =>
    wrapper<SentenceDetails>(PROXY_URL, "POST", "sentence", { sentence }),

  getClosestEntities: async (query: string) =>
    wrapper<Entity[]>(PROXY_URL, "POST", "closest-entities", { query }),

  getGraphWithNeighbours: async (nodes: number[], nodeNeighbours: number[]) =>
    wrapper<{
      edges: Edge[];
      nodes: Entity[];
    }>(PROXY_URL, "POST", "graph-with-neighbours", {
      nodeNeighbours,
      nodes,
    }),
};
