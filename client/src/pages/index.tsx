import type { NextPage } from "next";
import { useState } from "react";
import Chat from "../components/Chat";
import CommonQuestions from "../components/CommonQuestions";

const Home: NextPage = () => {
  const [sendQuery, setSendQuery] =
    useState<(values: { query: string }) => Promise<void>>();
  return (
    <main className="flex flex-col-reverse flex-1 w-11/12 grid-cols-3 gap-10 py-10 mx-auto md:grid max-w-7xl">
      <CommonQuestions sendQuery={sendQuery} />
      <Chat setSendQuery={setSendQuery} />
    </main>
  );
};

export default Home;
