export interface GeneratedProduct {
  name: string; slug: string; shortDescription: string; description: string;
  highlights: string[]; specifications: Array<{ name: string; value: string }>;
  applications: string[]; seo: { title: string; description: string; keywords: string[] };
  tags: string[]; imageAltTexts: Array<{ imageIndex: number; alt: string }>;
  missingInformation: string[];
}

export interface GeneratedBlog {
  title: string; slug: string; excerpt: string; content: string;
  tableOfContents: Array<{ title: string; anchor: string }>;
  seo: { title: string; description: string; primaryKeyword: string; secondaryKeywords: string[] };
  tags: string[]; imageAltTexts: Array<{ imageIndex: number; alt: string }>;
  relatedProductSuggestions: string[]; missingInformation: string[];
}

export interface GeneratedSeo {
  title: string; metaDescription: string; slug: string; primaryKeyword: string;
  secondaryKeywords: string[]; tags: string[]; suggestedHeadings: string[];
  imageAltTexts: string[]; suggestions: string[];
}

export type JsonSchema = Record<string, unknown>;
export interface AiProvider {
  readonly name: string; readonly model: string;
  generateStructuredOutput<T>(system: string, input: unknown, schema: JsonSchema): Promise<T>;
}
