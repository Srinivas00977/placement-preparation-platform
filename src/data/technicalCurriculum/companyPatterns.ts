export interface TargetCompanyPattern {
  id: string;
  name: string;
  shortLabel: string;
  focusBanner: string;
  keywords: string[];
}

export const TARGET_COMPANIES: TargetCompanyPattern[] = [
  {
    id: 'all',
    name: 'All Companies',
    shortLabel: 'All Companies',
    focusBanner: 'Balanced industry-wide placement syllabus across Core CS, Projects & System Design.',
    keywords: [],
  },
  {
    id: 'tcs',
    name: 'TCS (NQT / Digital / Prime)',
    shortLabel: 'TCS (NQT / Digital / Prime)',
    focusBanner: 'Focus: Core CS (DBMS / OS / OOP) + 1–2 Coding Problems + Resume Project Deep-Dive.',
    keywords: ['oop', 'dbms', 'sql', 'os', 'transactions', 'normalization', 'http', 'testing'],
  },
  {
    id: 'infosys',
    name: 'Infosys',
    shortLabel: 'Infosys',
    focusBanner: 'Focus: OOP Principles, SQL Queries & Joins, SDLC / Testing Basics + Pseudocode Reasoning.',
    keywords: ['oop', 'sql', 'dbms', 'testing', 'api', 'react', 'css', 'statistics'],
  },
  {
    id: 'wipro',
    name: 'Wipro',
    shortLabel: 'Wipro',
    focusBanner: 'Focus: Core Java/Python OOP, Basics of DBMS/CN, Debugging & Project Architecture Overview.',
    keywords: ['oop', 'sql', 'cn', 'http', 'linux', 'containers', 'testing'],
  },
  {
    id: 'cognizant',
    name: 'Cognizant (GenC)',
    shortLabel: 'Cognizant (GenC)',
    focusBanner: 'Focus: SQL Joins & Subqueries, OOP Basics, Web/Cloud Fundamentals + Scenario Testing.',
    keywords: ['sql', 'oop', 'dbms', 'http', 'api', 'testing', 'cloud', 'accessibility'],
  },
  {
    id: 'accenture',
    name: 'Accenture',
    shortLabel: 'Accenture',
    focusBanner: 'Focus: Cloud/DevOps Awareness, Pseudocode/DSA Fundamentals, SQL & Communication on Projects.',
    keywords: ['cloud', 'ci/cd', 'sql', 'api', 'oop', 'security', 'design systems'],
  },
  {
    id: 'deloitte',
    name: 'Deloitte',
    shortLabel: 'Deloitte',
    focusBanner: 'Focus: Data Analytics (SQL Window Functions, Statistics, BI), Cloud Architecture & Business Case Studies.',
    keywords: ['sql', 'statistics', 'case study', 'regression', 'cloud', 'iam', 'owasp'],
  },
  {
    id: 'amazon',
    name: 'Amazon',
    shortLabel: 'Amazon',
    focusBanner: 'Focus: Medium/Hard DSA + OOP/LLD Scalability + AWS/Distributed Caching + Leadership Principles.',
    keywords: ['dsa', 'system design', 'caching', 'indexing', 'transactions', 'performance', 'scalability'],
  },
  {
    id: 'google',
    name: 'Google',
    shortLabel: 'Google',
    focusBanner: 'Focus: Graph/DP/Tree DSA Optimization, Clean Edge-Case Complexity, Concurrency & Large-Scale Design.',
    keywords: ['dsa', 'os', 'system design', 'transformers', 'deep learning', 'performance', 'javascript'],
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    shortLabel: 'Microsoft',
    focusBanner: 'Focus: Clean Algorithmic Problem Solving, OS/Concurrency/Memory Internals, LLD & Product Architecture.',
    keywords: ['dsa', 'os', 'system design', 'oop', 'caching', 'memory', 'react'],
  },
  {
    id: 'zoho',
    name: 'Zoho',
    shortLabel: 'Zoho',
    focusBanner: 'Focus: Hands-on C/Java/Python Logic, Modular OOP Low-Level Design (Taxi/Parking/Invoice Apps) & DBMS.',
    keywords: ['oop', 'dsa', 'dbms', 'sql', 'indexing', 'api', 'android'],
  },
];
