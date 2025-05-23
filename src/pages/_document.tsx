import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en" className="overflow-x-hidden">
      <Head>
        <link rel="icon" href="/favicon.svg" />
        <meta name="generator" content="v0.dev" />
      </Head>
      <body className="overflow-x-hidden">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
