import { type CareerTopicGroup } from './types';

export const ADVANCED_TECH_LIBRARY: CareerTopicGroup[] = [
  {
    id: 'adv-genai-rag',
    title: 'Generative AI, LLMs, RAG & Vector Databases',
    summary: 'Transformer attention, prompt engineering, embeddings, retrieval-augmented generation, and agentic tool orchestration.',
    subtopics: [
      {
        id: 'adv-sub-llm-rag',
        title: 'RAG Architecture & Vector Embeddings',
        level: 'Advanced',
        estimatedTime: '3 hours',
        simpleExplanation:
          'Retrieval-Augmented Generation (RAG) indexes domain documents as dense embedding vectors and feeds top-matching chunks into an LLM prompt to prevent hallucinations.',
        whyImportant:
          'Dominant production pattern across AI Engineer, Full Stack AI, and Data Scientist roles.',
        whatToLearn: [
          'Text chunking strategies & overlap tuning',
          'Cosine similarity, HNSW vector search & pgvector/FAISS',
          'Hybrid search (BM25 + Dense vectors) & re-ranking',
          'Grounded citations & hallucination evaluation metrics',
        ],
        prerequisites: ['Python APIs & REST fundamentals'],
        codeExample: `# Embed query -> Top-K vector search -> Grounded LLM synthesis
chunks = vector_store.similarity_search(user_query, k=4)
context = "\\n---\\n".join(c.page_content for c in chunks)
answer = llm.generate(f"Answer strictly from context:\\n{context}\\nQ: {user_query}")`,
        completionCriteria: 'Build a working PDF Q&A retriever pipeline with chunk citation.',
        resources: [
          { title: 'Hugging Face LLM & NLP Course', url: 'https://huggingface.co/learn/nlp-course', type: 'Official Docs', pricing: 'Free', level: 'Intermediate' },
          { title: 'PyTorch Official Deep Learning Tutorials', url: 'https://pytorch.org/tutorials/', type: 'Official Docs', pricing: 'Free', level: 'Advanced' },
          { title: 'roadmap.sh AI & Data Scientist Guide', url: 'https://roadmap.sh/ai-data-scientist', type: 'Tutorial', pricing: 'Free', level: 'Intermediate' },
        ],
      },
    ],
  },
  {
    id: 'adv-sys-design',
    title: 'Distributed Systems, Microservices & High-Scale Architecture',
    summary: 'Horizontal scaling, consistent hashing, event-driven queues, CAP theorem, and multi-region resilience.',
    subtopics: [
      {
        id: 'adv-sub-distributed',
        title: 'Microservices, Message Queues & CAP Theorem',
        level: 'Advanced',
        estimatedTime: '4 hours',
        simpleExplanation:
          'Distributed backends trade strict consistency vs high availability under network partitions while decoupling heavy work with Kafka/RabbitMQ queues.',
        whyImportant:
          'Tested in senior campus interviews and System Design rounds at Amazon, Flipkart, and Google.',
        whatToLearn: [
          'CAP & PACELC theorems in real databases',
          'Consistent Hashing & Database Sharding',
          'Async Event Queues (Kafka consumer groups, DLQ, idempotency)',
          'Circuit Breakers, Rate Limiting (Token Bucket) & Caching',
        ],
        prerequisites: ['REST APIs & Relational Database indexing'],
        completionCriteria: 'Design URL Shortener and Order Notification Pipeline diagrams with bottlenecks solved.',
        resources: [
          { title: 'roadmap.sh System Design Guide', url: 'https://roadmap.sh/system-design', type: 'Tutorial', pricing: 'Free', level: 'Advanced' },
          { title: 'GeeksforGeeks System Design Tutorial', url: 'https://www.geeksforgeeks.org/system-design-tutorial/', type: 'Tutorial', pricing: 'Free', level: 'Intermediate' },
          { title: 'NeetCode System Design Roadmap', url: 'https://neetcode.io/roadmap', type: 'Interactive Practice', pricing: 'Freemium', level: 'Advanced' },
        ],
      },
    ],
  },
  {
    id: 'adv-mlops-devsecops',
    title: 'MLOps, DevSecOps & Site Reliability Engineering (SRE)',
    summary: 'Automated security scanning in CI/CD, observability SLOs, model drift monitoring, and zero-downtime rollouts.',
    subtopics: [
      {
        id: 'adv-sub-sre-sec',
        title: 'Observability, SRE Golden Signals & DevSecOps Gates',
        level: 'Advanced',
        estimatedTime: '3 hours',
        simpleExplanation:
          'SRE tracks Latency, Traffic, Errors, and Saturation while DevSecOps shifts SAST/dependency vulnerability scanning left directly into CI pipelines.',
        whyImportant:
          'Critical differentiator for Cloud/DevOps, AI/ML Ops, and Security Engineering interviews.',
        whatToLearn: [
          'Four Golden Signals & SLA / SLO / Error Budgets',
          'SAST, DAST, container image scanning & SBOMs',
          'Blue-Green vs Canary deployments & automated rollbacks',
          'Feature drift monitoring & automated retraining triggers',
        ],
        prerequisites: ['Docker containers & CI/CD basics'],
        completionCriteria: 'Define SLO error budgets and add automated security scanning to a sample GitHub pipeline.',
        resources: [
          { title: 'Kubernetes Production Documentation', url: 'https://kubernetes.io/docs/home/', type: 'Official Docs', pricing: 'Free', level: 'Advanced' },
          { title: 'OWASP DevSecOps Guideline', url: 'https://owasp.org/www-project-devsecops-guideline/', type: 'Official Docs', pricing: 'Free', level: 'Advanced' },
          { title: 'roadmap.sh DevOps & SRE Path', url: 'https://roadmap.sh/devops', type: 'Tutorial', pricing: 'Free', level: 'Intermediate' },
        ],
      },
    ],
  },
];
