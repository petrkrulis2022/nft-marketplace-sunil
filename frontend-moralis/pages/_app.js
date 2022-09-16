import '../styles/globals.css'
import { MoralisProvider } from "react-moralis"
import Header from '../components/Header'
import Head from 'next/head'

function MyApp({ Component, pageProps }) {
  return (
    <div> <Head>
      <title>NFT Market Place</title>
      <meta name="description" content="nft market place" />
      <link rel="icon" href="/favicon.ico" />
    </Head>

      <MoralisProvider appId="BPw8zegsd6RxvBbqaeHT6orJwKMsQ7QYZPX1I382" serverUrl="https://x61bqnnchbg9.usemoralis.com:2053/server">
        <Header />
        <Component {...pageProps} />
      </MoralisProvider></div>)
}

export default MyApp
