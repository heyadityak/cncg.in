type JsonLdValue = Record<string, unknown> | Record<string, unknown>[];

interface JsonLdProps {
  data: JsonLdValue;
}

/**
 * Renders Schema.org JSON-LD for search engines.
 * Safe for RSC — no client JS required.
 */
export default function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
