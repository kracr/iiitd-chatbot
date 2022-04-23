import { ArrowCircleRightIcon, ChevronLeftIcon } from "@heroicons/react/solid";
import React, { useState } from "react";
import questions from "../../data/common-questions.json";

const CommonQuestionItem: React.FC<{
  question: string;
  onClick: () => void;
}> = ({ question, onClick }) => {
  return (
    <button
      className="flex items-center gap-2 p-3 text-sm font-medium text-left text-teal-900 transition duration-150 ease-in-out transform border border-teal-100 rounded hover:bg-teal-50 hover:text-teal-700 hover:translate-x-1 focus:outline-none focus:ring-2 ring-teal-100 ring-offset-2 active:scale-95"
      onClick={onClick}
    >
      <span className="flex-1">{question}</span>
      <ArrowCircleRightIcon className="w-5 opacity-30" />
    </button>
  );
};

const CommonQuestions: React.FC<{
  sendQuery: ((values: { query: string }) => Promise<void>) | undefined;
}> = ({ sendQuery }) => {
  const [open, setOpen] = useState<boolean>(false);
  return (
    <section id="common-questions" className="space-y-6">
      <div className="flex items-center justify-between gap-2 md:block">
        <div className="space-y-1">
          <h2 className="text-lg font-medium text-teal-600">
            Common Questions
          </h2>
          <p className="leading-normal text-slate-600">
            A list of frequently asked questions to get you started!
          </p>
        </div>
        <button className="block md:hidden" onClick={() => setOpen(!open)}>
          <ChevronLeftIcon
            className={`w-12 h-12 text-teal-600 opacity-70 transition duration-150 ease-in-out transform ${
              open && "-rotate-90"
            }`}
          />
        </button>
      </div>
      <div className="flex-col items-stretch hidden gap-2 md:flex">
        {questions.map((question, index) => (
          <CommonQuestionItem
            key={index}
            question={question}
            onClick={() => sendQuery?.({ query: question })}
          />
        ))}
      </div>
      {open && (
        <div className="flex flex-col items-stretch gap-2 md:hidden">
          {questions.map((question, index) => (
            <CommonQuestionItem
              key={index}
              question={question}
              onClick={() => sendQuery?.({ query: question })}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default CommonQuestions;
