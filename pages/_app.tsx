// pages/_app.tsx
import '../app/globals.css';      // ajusta o caminho se você mover o CSS para `styles/`
import type { AppProps } from 'next/app';

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
