import {
  PlusCircleIcon,
  SearchIcon,
  XCircleIcon,
} from "@heroicons/react/solid";
import { Formik } from "formik";
import type { NextPage } from "next";
import React, { useEffect, useReducer, useRef, useState } from "react";
import { proxy } from "../utils/api";

type NodeType = "Topic" | "Document" | "Paragraph" | "Sentence" | "ExtEntity";

export interface Node {
  id: string;
  text: string;
  type: NodeType;
  hasNeighbors: boolean;
  legend: boolean;
}

export interface Link {
  source: string;
  target: string;
  type: string;
}

const Header: React.FC<{
  loading: boolean;
  onSubmit: (values: { query: string }) => Promise<void>;
}> = ({ loading, onSubmit }) => (
  <header className="flex items-center bg-teal-500 border-b-2">
    <h1 className="px-5 font-bold text-white text-medium">
      Explore the Knowledge Graph
    </h1>
    <Formik
      initialValues={{ query: "" }}
      onSubmit={(values, { resetForm }) => {
        resetForm();
        onSubmit(values);
      }}
    >
      {({ values, handleChange, handleSubmit }) => (
        <form
          className="flex items-center flex-1 w-full bg-slate-50"
          onSubmit={handleSubmit}
        >
          <input
            name="query"
            type="text"
            value={values.query}
            onChange={handleChange}
            className="flex-1 w-full p-4 text-lg bg-transparent border-t text-slate-600 border-slate-100 focus:outline-none"
            placeholder="Enter a phrase..."
          />
          <button
            type="submit"
            className={`flex items-center gap-2 px-4 py-2 m-2 text-sm font-bold text-teal-700 uppercase transition duration-150 ease-in-out
              transform bg-teal-100 rounded-xl hover:bg-teal-200 focus:outline-none focus:bg-teal-200 active:scale-95
              ${loading && "cursor-not-allowed"}`}
          >
            <SearchIcon className="w-6 h-6" />
            <span>Search</span>
          </button>
        </form>
      )}
    </Formik>
  </header>
);

const Explore: NextPage = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const presentNeighbours = useRef<Set<string>>(new Set());
  const nodes = useRef<Node[]>([]);
  const links = useRef<Link[]>([]);
  const layers = useRef<string[][]>([]);
  const nodeElements = useRef<
    {
      node: Node;
      element: HTMLDivElement;
    }[]
  >([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [_, forceUpdate] = useReducer((x) => x + 1, 0);

  const idAndFilter = (nodeList: Node[]) =>
    nodeList
      .map(({ id }) => id)
      .filter((id, index, self) => self.indexOf(id) === index);

  const getGraph = async (query: string) => {
    setLoading(true);
    const closesEntities = await proxy.getClosestEntities(query);
    nodes.current = closesEntities.map((entity) => ({
      id: entity[0].toString(),
      text: entity[1],
      type: entity[2] as NodeType,
      hasNeighbors: false,
      legend: false,
    }));
    await getNeighbours();
    setLoading(false);
  };

  const getNeighbours = async (nodeNeighbours: Node[] = nodes.current) => {
    const neighbourIds = nodeNeighbours.map((node) => node.id);
    presentNeighbours.current = new Set([
      ...presentNeighbours.current,
      ...neighbourIds,
    ]);
    const data = await proxy.getGraphWithNeighbours(
      nodes.current.map(({ id }) => Number(id)),
      neighbourIds.map(Number)
    );
    nodes.current = data.nodes.map((node) => ({
      id: node[0].toString(),
      text: node[1],
      type: node[2] as NodeType,
      hasNeighbors: presentNeighbours.current.has(node[0].toString()),
      legend: false,
    }));
    links.current = data.edges.map((edge) => ({
      source: edge[0].toString(),
      target: edge[2].toString(),
      type: edge[1],
    }));
    console.log(links.current[1]);
    calculateNodePositions();
  };

  const removeNode = (nodeId: string) => {
    presentNeighbours.current.delete(nodeId);
    links.current.forEach(({ source, target }) => {
      if (source === nodeId) presentNeighbours.current.delete(target);
      if (target === nodeId) presentNeighbours.current.delete(source);
    });
    links.current = links.current.filter(
      ({ source, target }) => ![source, target].includes(nodeId)
    );
    const linkNodeIds = new Set(
      links.current.flatMap(({ source, target }) => [source, target])
    );
    nodes.current = nodes.current
      .filter(({ id }) => linkNodeIds.has(id))
      .map((node) => ({
        ...node,
        hasNeighbors: presentNeighbours.current.has(node.id),
      }));
    calculateNodePositions();
  };

  const calculateNodePositions = () => {
    if (typeof window === "undefined") return;
    const topicTree = idAndFilter(
      nodes.current.filter(({ type }) => ["Topic", "Document"].includes(type))
    );
    const adjuscentNodes = new Map<string, string[]>();
    const parentNodes = new Map<string, string>();
    topicTree.forEach((nodeId) => adjuscentNodes.set(nodeId, []));
    links.current.forEach(({ source, target }) => {
      if ([source, target].every((id) => adjuscentNodes.has(id))) {
        adjuscentNodes.get(target)?.push(source);
        parentNodes.set(source, target);
      }
    });
    const depth = new Map<string, number>();
    const queue = topicTree.filter(
      (id, index, self) => !parentNodes.has(id) && self.indexOf(id) === index
    );
    queue.forEach((nodeId) => depth.set(nodeId, 1));
    let maxDepth = 1;
    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      adjuscentNodes.get(nodeId)?.forEach((adjId) => {
        queue.push(adjId);
        depth.set(adjId, depth.get(nodeId)! + 1);
        maxDepth = depth.get(adjId)!;
      });
    }
    layers.current = Array.from({ length: maxDepth }, () => []);
    topicTree.forEach((nodeId) => {
      layers.current[depth.get(nodeId)! - 1].push(nodeId);
    });
    layers.current.push(
      ...["Paragraph", "Sentence", "ExtEntity"].map((type) =>
        idAndFilter(nodes.current.filter((node) => node.type === type))
      )
    );
    nodeElements.current = [];
    forceUpdate();
  };

  const nodeColor: Record<
    NodeType,
    {
      bg: string;
      line: string;
      text: string;
    }
  > = {
    Document: {
      bg: "bg-slate-200",
      line: "stroke-slate-500",
      text: "text-slate-900",
    },
    Topic: {
      bg: "bg-green-200",
      line: "stroke-green-500",
      text: "text-green-900",
    },
    Paragraph: {
      bg: "bg-yellow-200",
      line: "stroke-yellow-500",
      text: "text-yellow-900",
    },
    Sentence: {
      bg: "bg-blue-200",
      line: "stroke-blue-500",
      text: "text-blue-900",
    },
    ExtEntity: {
      bg: "bg-red-200",
      line: "stroke-red-500",
      text: "text-red-900",
    },
  };

  const GraphNode: React.FC<{ node: Node }> = ({ node }) => {
    return (
      <div
        ref={(ref) => ref && nodeElements.current.push({ node, element: ref })}
        className={`rounded-md shadow-slate-100 relative flex flex-shrink-0 max-w-[10rem] min-w-[5rem] group ${
          nodeColor[node.type].bg
        } opacity-70 hover:opacity-100 transform hover:scale-105 transition duration-100`}
      >
        <header className="absolute w-full transition duration-300 opacity-0 group-hover:opacity-100">
          <button
            className="absolute -left-2 -top-2"
            onClick={() => getNeighbours([node])}
          >
            <PlusCircleIcon
              className={`w-7 h-7 ${
                nodeColor[node.type].text
              } bg-white rounded-full`}
            />
          </button>
          <button
            className="absolute -right-2 -top-2"
            onClick={() => removeNode(node.id)}
          >
            <XCircleIcon
              className={`w-7 h-7 ${
                nodeColor[node.type].text
              } bg-white rounded-full`}
            />
          </button>
        </header>
        <button className="p-4 overflow-auto text-sm text-left">
          <div>
            <div
              className={`font-bold break-words ${nodeColor[node.type].text}`}
            >
              {node.text.length > 30
                ? node.text.slice(0, 30) + "..."
                : node.text}
            </div>
          </div>
        </button>
      </div>
    );
  };

  const GraphEdge: React.FC<{
    link: Link;
  }> = ({ link }) => {
    const sourceNode = nodes.current.find(({ id }) => id === link.source)!;
    const sourceNodeElement = nodeElements.current.find(
      ({ node }) => node.id === link.source
    )?.element;
    const targetNodeElement = nodeElements.current.find(
      ({ node }) => node.id === link.target
    )?.element;
    if (!sourceNodeElement || !targetNodeElement || !containerRef.current)
      return null;
    const sourceRect = sourceNodeElement.getBoundingClientRect();
    const targetRect = targetNodeElement.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    const sourceCenter = {
      x: sourceRect.left + sourceRect.width / 2 - containerRect.left,
      y: sourceRect.top + sourceRect.height / 2 - containerRect.top,
    };
    const targetCenter = {
      x: targetRect.left + targetRect.width / 2 - containerRect.left,
      y: targetRect.top + targetRect.height / 2 - containerRect.top,
    };
    return (
      <line
        x1={sourceCenter.x}
        y1={sourceCenter.y}
        x2={targetCenter.x}
        y2={targetCenter.y}
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`${
          nodeColor[sourceNode.type].line
        } opacity-25 hover:opacity-100`}
      />
    );
  };

  useEffect(() => {
    if (layers.current.flat().length === nodeElements.current.length)
      forceUpdate();
  }, [layers.current, nodeElements.current, containerRef.current]);

  return (
    <main className="flex flex-col h-screen">
      <Header
        loading={loading}
        onSubmit={async ({ query }) => getGraph(query)}
      />
      <section className="relative flex-1 w-full p-10 overflow-auto">
        {nodes.current.length > 0 && (
          <div className="relative" ref={containerRef}>
            <svg
              width={window.innerWidth}
              height={window.innerHeight}
              className="absolute top-0 left-0 overflow-visible"
            >
              {links.current.map((link) => (
                <GraphEdge key={`${link.source}-${link.target}`} link={link} />
              ))}
            </svg>
            <div className="flex flex-col gap-10">
              {layers.current.map((layer, i) => (
                <div key={`layer-${i}`} className="flex gap-5">
                  {layer.map((nodeId, j) => {
                    const node = nodes.current.find(
                      (node) => node.id === nodeId
                    )!;
                    return (
                      <GraphNode key={`${node.id}-${i}-${j}`} node={node} />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
};

export default Explore;
