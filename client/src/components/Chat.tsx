import { ArrowCircleDownIcon, PaperAirplaneIcon } from "@heroicons/react/solid";
import { Formik } from "formik";
import randomString from "randomstring";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { proxy, Sentence, SpellCheckResult } from "../utils/api";
import { ChatMessage } from "./Message";
import Spinner from "./Spinner";

export interface Message {
  id: string;
  text: string;
  author: "user" | "bot";
  time: Date;
  sentences?: Sentence[];
  spellCheck?: SpellCheckResult;
}

const Chat: React.FC<{
  setSendQuery: Dispatch<
    SetStateAction<((values: { query: string }) => Promise<void>) | undefined>
  >;
}> = ({ setSendQuery }) => {
  const [chat, setChat] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const chatWindow = useRef<HTMLDivElement>(null);

  const addMessageToChat = useCallback(
    (
      author: Message["author"],
      text: string,
      sentences?: Sentence[],
      spellCheck?: SpellCheckResult
    ) => {
      setChat((chat) => [
        ...chat,
        {
          id: randomString.generate(12),
          author,
          text,
          time: new Date(),
          sentences,
          spellCheck,
        },
      ]);
    },
    [chat, setChat]
  );

  const sendQuery = async (
    values: { query: string },
    spellCheckBypass?: boolean
  ) => {
    if (loading) return;
    setLoading(true);
    addMessageToChat("user", values.query);
    let spellCheck: SpellCheckResult | undefined = undefined;
    try {
      if (!spellCheckBypass)
        spellCheck = await proxy.getSpellCheck(values.query);
      if (spellCheckBypass || spellCheck?.correct) {
        const sentences = await proxy.getAnswer(values.query);
        addMessageToChat(
          "bot",
          sentences[0]?.sentence ?? "Sorry, I don't understand.",
          sentences.length ? sentences : undefined
        );
      } else {
        addMessageToChat(
          "bot",
          `Did you mean "${spellCheck?.correctedText}"?`,
          undefined,
          spellCheck
        );
      }
    } catch (err) {
      addMessageToChat(
        "bot",
        "Oops! An error occured. Please try again later."
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    setSendQuery?.(() => sendQuery);
    const savedChat = sessionStorage.getItem("chat");
    if (savedChat) setChat(JSON.parse(savedChat));
  }, []);

  useEffect(() => {
    chatWindow.current?.scrollTo({
      top: chatWindow.current.scrollHeight,
      behavior: "smooth",
    });
  }, [chatWindow, chat]);

  useEffect(() => {
    sessionStorage.setItem("chat", JSON.stringify(chat));
  }, [chat]);

  return (
    <section
      id="chat"
      className="flex flex-col col-span-2 overflow-hidden shadow-lg rounded-xl [max-height:80vh]"
    >
      <header className="flex items-center gap-2 p-4 bg-teal-500">
        <div className="flex items-center justify-center w-10 h-10 bg-white rounded-full">
          <img src="/logo.svg" className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-medium">
          <span className="text-white">Gyan</span>
          <span className="text-teal-100">Guru</span>
        </h2>
      </header>

      <main
        className="flex flex-col flex-1 h-full gap-4 p-4 overflow-auto"
        ref={chatWindow}
      >
        {chat.length === 0 ? (
          <div className="flex items-center justify-center w-full h-full gap-2 text-xl text-slate-300">
            <ArrowCircleDownIcon className="w-6" />
            <p>Enter your query below!</p>
          </div>
        ) : (
          chat.map((message, index) => (
            <ChatMessage
              key={message.id}
              message={message}
              isLast={index === chat.length - 1}
              addMessageToChat={addMessageToChat}
              sendQuery={sendQuery}
            />
          ))
        )}
      </main>

      <Formik
        initialValues={{ query: "" }}
        onSubmit={(values, { resetForm }) => {
          resetForm();
          sendQuery(values);
        }}
      >
        {({ values, handleChange, handleSubmit }) => (
          <form className="flex w-full bg-slate-50" onSubmit={handleSubmit}>
            <input
              name="query"
              type="text"
              className="flex-1 w-full p-4 text-lg bg-transparent border-t text-slate-600 border-slate-100 focus:outline-none"
              placeholder="Ask me anything..."
              onChange={handleChange}
              value={values.query}
            />
            <button
              className={`flex items-center gap-2 px-4 m-2 text-sm font-bold text-teal-700 uppercase transition duration-150 ease-in-out
              transform bg-teal-100 rounded-xl hover:bg-teal-200 focus:outline-none focus:bg-teal-200 active:scale-95
              ${loading && "cursor-not-allowed"}`}
              disabled={loading || values.query.length === 0}
            >
              {loading ? (
                <Spinner />
              ) : (
                <>
                  <PaperAirplaneIcon className="w-4 rotate-90 tranform" />
                  <span>Send</span>
                </>
              )}
            </button>
          </form>
        )}
      </Formik>
    </section>
  );
};

export default Chat;
