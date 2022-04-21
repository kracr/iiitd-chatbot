import type { AppProps } from "next/app";
import Nav from "../components/Nav";
import "../styles/globals.css";

function GyanGuru({ Component, pageProps }: AppProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <Component {...pageProps} />
    </div>
  );
}

export default GyanGuru;
