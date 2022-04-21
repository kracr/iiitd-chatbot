import { ArrowsExpandIcon, XIcon } from "@heroicons/react/solid";
import { useState } from "react";
import { proxy, Sentence, SentenceDetails } from "../utils/api";
import type { Message } from "./Chat";
import Spinner from "./Spinner";

const UserMessage = ({ message: { text, time } }: { message: Message }) => (
  <div className="flex items-center justify-end">
    <div className="flex flex-col max-w-xl gap-1 p-4 leading-normal border rounded-lg border-teal-50">
      <p className="text-sm text-slate-700">{text}</p>
      <p className="text-xs text-right text-slate-400">
        {new Date(time).toLocaleTimeString()}
      </p>
    </div>
  </div>
);

const BotMessage = ({
  message: { text, time, sentences, spellCheck },
  isLast,
  addMessageToChat,
  sendQuery,
}: {
  message: Message;
  isLast: boolean;
  addMessageToChat: (
    author: Message["author"],
    text: string,
    sentences?: Sentence[] | undefined
  ) => void;
  sendQuery: (
    values: {
      query: string;
    },
    spellCheckBypass?: boolean | undefined
  ) => Promise<void>;
}) => {
  const [state, setState] = useState<"collapsed" | "expanded" | "loading">(
    "collapsed"
  );
  const [details, setDetails] = useState<SentenceDetails>();
  const getDetails = async () => {
    if (!sentences || state === "loading") return;
    if (details) {
      setState("expanded");
      return;
    }
    setState("loading");
    const data = await proxy.getSentenceDetails(sentences[0]);
    setDetails(data);
    setState("expanded");
  };
  const acceptResponse = () =>
    addMessageToChat("bot", "Thanks for the feedback!");
  const rejectResponse = () => {
    if (!sentences) return;
    const rest = sentences.slice(1);
    if (!rest.length) {
      addMessageToChat(
        "bot",
        "Please contact the Admin department for more information."
      );
      return;
    }
    rest.forEach((sentence) =>
      addMessageToChat("bot", sentence.sentence, [sentence])
    );
  };
  const respondSpellCheck = (accept: boolean) => {
    if (!spellCheck) return;
    sendQuery(
      { query: accept ? spellCheck.correctedText : spellCheck.originalText },
      true
    );
  };
  return (
    <div>
      <div className="flex items-center justify-start">
        <div className="flex flex-col max-w-xl gap-1 p-4 leading-normal border rounded-lg border-teal-50 bg-teal-50">
          {state === "expanded" && details ? (
            <>
              <p className="text-sm text-slate-700">
                {details.neighbouring_sentences.map((neighbour) => (
                  <span key={neighbour.sentence}>
                    {neighbour.sentence === text ? (
                      <strong>{neighbour.sentence}</strong>
                    ) : (
                      neighbour.sentence
                    )}
                    &nbsp;
                  </span>
                ))}
              </p>
              <p className="text-xs text-slate-500">
                Source:{" "}
                <a
                  className="font-bold underline"
                  href={details.document.source}
                  target="_blank"
                >
                  {details.document.name}
                </a>
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-700">{text}</p>
          )}
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">
              {new Date(time).toLocaleTimeString()}
            </p>
            {sentences && (
              <button
                className="text-xs text-teal-300 hover:text-teal-400"
                onClick={() => {
                  if (state === "collapsed") getDetails();
                  else if (state === "expanded") setState("collapsed");
                }}
              >
                {state === "expanded" ? (
                  <XIcon className="w-5 h-5" />
                ) : state === "loading" ? (
                  <Spinner />
                ) : (
                  <ArrowsExpandIcon className="w-5 h-5" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
      {sentences && isLast && (
        <div className="my-2 space-x-2">
          <button
            className="px-2 py-1 border border-teal-100 rounded-md hover:bg-teal-50"
            onClick={acceptResponse}
          >
            👍
          </button>
          <button
            className="px-2 py-1 border border-teal-100 rounded-md hover:bg-teal-50"
            onClick={rejectResponse}
          >
            👎
          </button>
        </div>
      )}
      {spellCheck && (
        <div className="my-2 space-x-2">
          <button
            disabled={!isLast}
            className={`text-sm px-2 py-1 border border-teal-100 rounded-md hover:bg-teal-50 ${
              !isLast && "cursor-not-allowed text-slate-300"
            }`}
            onClick={() => respondSpellCheck(true)}
          >
            Yes
          </button>
          <button
            disabled={!isLast}
            className={`text-sm px-2 py-1 border border-teal-100 rounded-md hover:bg-teal-50 ${
              !isLast && "cursor-not-allowed text-slate-300"
            }`}
            onClick={() => respondSpellCheck(false)}
          >
            No
          </button>
        </div>
      )}
    </div>
  );
};

export const ChatMessage: React.FC<{
  message: Message;
  isLast: boolean;
  addMessageToChat: (
    author: Message["author"],
    text: string,
    sentences?: Sentence[] | undefined
  ) => void;
  sendQuery: (
    values: {
      query: string;
    },
    spellCheckBypass?: boolean | undefined
  ) => Promise<void>;
}> = ({ message, isLast, addMessageToChat, sendQuery }) =>
  message.author === "user" ? (
    <UserMessage message={message} />
  ) : (
    <BotMessage
      message={message}
      isLast={isLast}
      addMessageToChat={addMessageToChat}
      sendQuery={sendQuery}
    />
  );
