import type { NextPage } from "next";
import { useState } from "react";
import Chat from "../components/Chat";
import CommonQuestions from "../components/CommonQuestions";

const Home: NextPage = () => {
  const [sendQuery, setSendQuery] =
    useState<(values: { query: string }) => Promise<void>>();
  return (
    <main className="grid flex-1 max-w-6xl grid-cols-3 gap-10 py-10 mx-auto">
      <CommonQuestions sendQuery={sendQuery} />
      <Chat setSendQuery={setSendQuery} />
    </main>
  );
};

export default Home;
