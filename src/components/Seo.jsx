import { SITE } from '../lib/site'

// React 19 네이티브 문서 메타데이터(title/meta/link 는 자동으로 <head> 로 hoist)
// path: '/blog/slug' 형태(앞에 / 포함), 홈은 '' 또는 '/'
function Seo({ title, description, path = '', type = 'website', image, jsonLd }) {
  const fullTitle = title ? `${title} — ${SITE.name}` : SITE.title
  const desc = description ?? SITE.description
  const url = SITE.url + (path === '/' ? '' : path)
  const ogImage = image || SITE.image

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE.name} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
      <meta property="og:locale" content={SITE.locale} />
      {ogImage && <meta property="og:image" content={ogImage} />}

      {/* Twitter */}
      <meta name="twitter:card" content={ogImage ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}

      {/* 구조화 데이터(JSON-LD) */}
      {jsonLd && (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
    </>
  )
}

export default Seo
