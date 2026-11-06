type JsonLdValue = Record<string, unknown> | Array<Record<string, unknown>>;

export function JsonLd({ value }: { value: JsonLdValue }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(value).replace(/</g, "\\u003c"),
      }}
    />
  );
}
