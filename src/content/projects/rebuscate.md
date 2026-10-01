---
title: Rebuscate
summary: Price comparison platform for local supermarkets, pharmacies and other stores in Paraguay, with AI-powered product matching and search, all running on our own infrastructure.
order: 1
category: Product
featured: true
platforms: [Web, iOS, Android]
stack: [React Native, Next.js, PostgreSQL, Qdrant, Embeddings, Python, Go, Docker, PostHog]
url: https://rebuscate.com
collaborators:
  - { label: Abel Franco, url: "https://afranval.github.io" }
---
- Built the mobile app in React Native and the website in Next.js.
- Designed a product-relation algorithm that matches the same product across stores to improve search accuracy.
- Run a self-hosted Qdrant vector database with our own embedding service that embeds every product.
- Built image, text and combined image-and-text retrieval on those embeddings, plus AI-driven product comparisons.
- Wrote the scrapers and crawlers in Python and Go that keep prices up to date.
- Implemented the backend in PostgreSQL with edge functions, with product analytics in PostHog.
- Deployed everything on our own VPS: domains, routing, hosting, S3-compatible storage and backups.
