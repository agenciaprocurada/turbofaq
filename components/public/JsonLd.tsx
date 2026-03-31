interface Props {
  data: object
}

/** Server Component. Injeta um bloco JSON-LD na página. */
export default function JsonLd({ data }: Props) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
