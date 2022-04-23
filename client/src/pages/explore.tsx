import {
  ArrowCircleUpIcon,
  ChevronLeftIcon,
  ExclamationCircleIcon,
  MapIcon,
  PlusCircleIcon,
  SearchIcon,
  XCircleIcon,
} from "@heroicons/react/solid";
import { Formik } from "formik";
import type { NextPage } from "next";
import React, { useEffect, useRef, useState } from "react";
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
  source: Node;
  target: Node;
  type: string;
}

const nodeColor: Record<
  NodeType,
  {
    bg: string;
    line: string;
    text: string;
    border: string;
  }
> = {
  Document: {
    bg: "bg-slate-200",
    line: "stroke-slate-500",
    text: "text-slate-900",
    border: "border-slate-400",
  },
  Topic: {
    bg: "bg-green-200",
    line: "stroke-green-500",
    text: "text-green-900",
    border: "border-green-400",
  },
  Paragraph: {
    bg: "bg-yellow-200",
    line: "stroke-yellow-500",
    text: "text-yellow-900",
    border: "border-yellow-400",
  },
  Sentence: {
    bg: "bg-blue-200",
    line: "stroke-blue-500",
    text: "text-blue-900",
    border: "border-blue-400",
  },
  ExtEntity: {
    bg: "bg-red-200",
    line: "stroke-red-500",
    text: "text-red-900",
    border: "border-red-400",
  },
};

function useStateRef<T>(
  initialValue: T
): [React.MutableRefObject<T>, T, (value: T) => void] {
  const ref = useRef<T>(initialValue);
  const [value, setValue] = useState<T>(initialValue);
  useEffect(() => {
    setValue(ref.current);
  }, [ref.current]);
  return [ref, value, setValue];
}

const Header: React.FC<{
  loading: boolean;
  onSubmit: (values: { query: string }) => Promise<void>;
}> = ({ loading, onSubmit }) => (
  <header className="sticky top-0 z-20 flex flex-col items-center bg-teal-500 shadow shadow-slate-100 md:flex-row">
    <h1 className="px-4 py-2 font-bold text-white text-medium">
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

const GraphNodes: React.FC<{
  layers: Node[][];
  activeLink?: Link;
  onNodeClick: (node: Node) => void;
  setNodeElements:
    | React.Dispatch<
        React.SetStateAction<
          {
            node: Node;
            ref: HTMLElement;
          }[]
        >
      >
    | undefined;
  removeNode: (nodeId: string) => void;
  getNeighbours: (nodeNeighbours?: Node[]) => Promise<void>;
}> = ({
  layers,
  activeLink,
  onNodeClick,
  setNodeElements,
  removeNode,
  getNeighbours,
}) => (
  <div className="flex flex-col gap-20">
    {layers.map((layer, i) => (
      <div className="flex flex-col gap-1 mx-auto">
        <p className="text-xs font-medium tracking-wider uppercase text-slate-600">
          Layer {i + 1}
        </p>
        <div className="flex flex-wrap gap-10 p-5 mx-auto bg-slate-100">
          {layer.map((node, j) => (
            <article
              key={`${node.id}-${i}-${j}`}
              ref={(ref) =>
                ref && setNodeElements?.((items) => [...items, { node, ref }])
              }
              className={`rounded-md border ${
                nodeColor[node.type].border
              } shadow-slate-100 relative flex flex-shrink-0 max-w-[10rem] min-w-[5rem] group ${
                nodeColor[node.type].bg
              } ${
                [activeLink?.source.id, activeLink?.target.id].includes(node.id)
                  ? "opacity-100 scale-110"
                  : "opacity-80"
              } hover:opacity-100 hover:scale-105 transform transition duration-100`}
              onClick={() => onNodeClick(node)}
            >
              <header className="absolute w-full transition duration-300 opacity-25 sm:opacity-0 group-hover:opacity-100">
                <button
                  className="absolute -left-2 -top-2"
                  onClick={(e) => {
                    getNeighbours([node]);
                    e.stopPropagation();
                  }}
                >
                  <PlusCircleIcon
                    className={`w-7 h-7 ${
                      nodeColor[node.type].text
                    } bg-white rounded-full`}
                  />
                </button>
                <button
                  className="absolute -right-2 -top-2"
                  onClick={(e) => {
                    removeNode(node.id);
                    e.stopPropagation();
                  }}
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
                    className={`font-bold break-words ${
                      nodeColor[node.type].text
                    }`}
                  >
                    {node.text.length > 30
                      ? node.text.slice(0, 30) + "..."
                      : node.text}
                  </div>
                </div>
              </button>
            </article>
          ))}
        </div>
      </div>
    ))}
  </div>
);

const GraphLinks: React.FC<{
  links: Link[];
  containerRef: HTMLDivElement | null;
  setActiveLink: React.Dispatch<React.SetStateAction<Link | undefined>>;
  setSetNodeElements: React.Dispatch<
    React.SetStateAction<
      | React.Dispatch<
          React.SetStateAction<
            {
              node: Node;
              ref: HTMLElement;
            }[]
          >
        >
      | undefined
    >
  >;
}> = ({ links, containerRef, setSetNodeElements, setActiveLink }) => {
  const [nodeElements, setNodeElements] = useState<
    {
      node: Node;
      ref: HTMLElement;
    }[]
  >([]);

  useEffect(() => {
    setSetNodeElements?.(() => setNodeElements);
  }, [setSetNodeElements, setNodeElements]);

  return (
    <svg className="absolute top-0 left-0 overflow-visible">
      {links.map((link) => {
        const sourceNodeElement = nodeElements.find(
          ({ node }) => node.id === link.source.id
        )?.ref;
        const targetNodeElement = nodeElements.find(
          ({ node }) => node.id === link.target.id
        )?.ref;
        if (!sourceNodeElement || !targetNodeElement || !containerRef)
          return null;
        const sourceRect = sourceNodeElement.getBoundingClientRect();
        const targetRect = targetNodeElement.getBoundingClientRect();
        const containerRect = containerRef.getBoundingClientRect();
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
            key={`${link.source.id}-${link.target.id}`}
            onMouseEnter={() => setActiveLink(link)}
            onMouseLeave={() => setActiveLink(undefined)}
            x1={sourceCenter.x}
            y1={sourceCenter.y}
            x2={targetCenter.x}
            y2={targetCenter.y}
            strokeWidth={10}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`${
              nodeColor[link.source.type].line
            } opacity-25 hover:opacity-100`}
          />
        );
      })}
    </svg>
  );
};

const NodeDetails: React.FC<{
  node: Node;
  onClose: () => void;
}> = ({ node, onClose }) => (
  <div
    className={`w-full h-full fixed ${
      nodeColor[node.type].bg
    }  bg-opacity-10 flex items-center justify-center backdrop-filter backdrop-blur-sm z-30 shadow-lg`}
    onClick={onClose}
  >
    <div
      className={`relative rounded-lg border ${nodeColor[node.type].border} ${
        nodeColor[node.type].bg
      } p-5 max-w-md w-5/6`}
      onClick={(e) => e.stopPropagation()}
    >
      <button className="absolute -top-4 -right-4">
        <XCircleIcon
          className="w-10 h-10 bg-white rounded-full"
          onClick={onClose}
        />
      </button>
      <div className="space-y-2">
        <p className="text-sm font-bold text-slate-500">{node.type}</p>
        <h1 className={`text-xl font-bold ${nodeColor[node.type].text}`}>
          {node.text}
        </h1>
      </div>
    </div>
  </div>
);

const Legend: React.FC = () => {
  const types: {
    type: NodeType;
    description: string;
  }[] = [
    {
      type: "Document",
      description: "IIITD policy document.",
    },
    {
      type: "Topic",
      description: "Topic or subtopic present in a IIITD policy document.",
    },
    {
      type: "Paragraph",
      description: "Paragraph present in a IIITD policy document.",
    },
    {
      type: "Sentence",
      description: "Sentence in a IIITD policy document.",
    },
    {
      type: "ExtEntity",
      description: "Noun phrase in a IIITD policy document.",
    },
  ];
  const icons: {
    Icon: (props: any) => React.ReactElement;
    description: string;
  }[] = [
    {
      Icon: PlusCircleIcon,
      description: "Add neighbours of the current node to graph.",
    },
    {
      Icon: XCircleIcon,
      description:
        "Remove node from graph. Neighbouring nodes with no other neighbours will also be removed.",
    },
  ];
  const [open, setOpen] = useState<boolean>(false);
  return (
    <aside className="absolute z-10 flex flex-col items-end gap-2 top-2 right-2">
      <button
        className="flex items-center gap-1 p-2 bg-opacity-50 border border-slate-400 backdrop-filter backdrop-blur bg-slate-100"
        onClick={() => setOpen(!open)}
      >
        <MapIcon className="w-6 h-6 text-teal-700" />
        <ChevronLeftIcon
          className={`w-6 h-6 text-teal-700 transform transition duration-150 ease-in-out ${
            open && "-rotate-90"
          }`}
        />
      </button>
      <ul
        className={`${
          !open && "hidden"
        } max-w-md shadow-lg shadow-slate-100 backdrop-filter backdrop-blur cursor-default bg-opacity-50 border border-slate-400 bg-slate-100 space-y-2 py-2`}
      >
        {types.map(({ type, description }) => (
          <li key={type} className="px-2">
            <article className="flex items-center gap-4">
              <div
                className={`${nodeColor[type].bg} flex items-center justify-center p-2 rounded-md border ${nodeColor[type].border} text-sm ${nodeColor[type].text} font-bold`}
              >
                {type}
              </div>
              <p className="text-sm text-slate-500">{description}</p>
            </article>
          </li>
        ))}
        {icons.map(({ Icon, description }) => (
          <li key={description} className="px-2">
            <article className="flex items-center gap-4">
              <Icon className="w-8 h-8 text-teal-700" />
              <p className="flex-1 text-sm text-slate-500">{description}</p>
            </article>
          </li>
        ))}
      </ul>
    </aside>
  );
};

const Explore: NextPage = () => {
  const [presentNeighboursRef, presentNeighbours] = useStateRef<Set<string>>(
    new Set()
  );
  const [nodesRef] = useStateRef<Node[]>([]);
  const [linksRef, links] = useStateRef<Link[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [layers, setLayers] = useState<Node[][]>([]);
  const [activeLink, setActiveLink] = useState<Link>();
  const [selectedNode, setSelectedNode] = useState<Node>();
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);
  const [setNodeElements, setSetNodeElements] = useState<
    React.Dispatch<
      React.SetStateAction<
        {
          node: Node;
          ref: HTMLElement;
        }[]
      >
    >
  >();

  const getGraph = async (query: string) => {
    setLoading(true);
    try {
      const closesEntities = await proxy.getClosestEntities(query);
      nodesRef.current = closesEntities.map((entity) => ({
        id: entity[0].toString(),
        text: entity[1],
        type: entity[2] as NodeType,
        hasNeighbors: false,
        legend: false,
      }));
      await getNeighbours();
      setError(false);
    } catch (err) {
      setError(true);
    }
    setLoading(false);
  };

  const getNeighbours = async (nodeNeighbours: Node[] = nodesRef.current) => {
    const neighbourIds = nodeNeighbours.map((node) => node.id);
    presentNeighboursRef.current = new Set([
      ...presentNeighbours,
      ...neighbourIds,
    ]);
    const data = await proxy.getGraphWithNeighbours(
      nodesRef.current.map(({ id }) => Number(id)),
      neighbourIds.map(Number)
    );
    nodesRef.current = data.nodes.map((node) => ({
      id: node[0].toString(),
      text: node[1],
      type: node[2] as NodeType,
      hasNeighbors: presentNeighboursRef.current.has(node[0].toString()),
      legend: false,
    }));
    linksRef.current = data.edges.map((edge) => ({
      source: nodesRef.current.find(({ id }) => id === edge[0].toString())!,
      target: nodesRef.current.find(({ id }) => id === edge[2].toString())!,
      type: edge[1],
    }));
    calculateNodePositions();
  };

  const removeNode = (nodeId: string) => {
    presentNeighboursRef.current.delete(nodeId);
    linksRef.current.forEach(({ source, target }) => {
      if (source.id === nodeId) presentNeighboursRef.current.delete(target.id);
      if (target.id === nodeId) presentNeighboursRef.current.delete(source.id);
    });
    linksRef.current = [
      ...linksRef.current.filter(
        ({ source, target }) => ![source.id, target.id].includes(nodeId)
      ),
    ];
    const linkNodeIds = new Set(
      linksRef.current.flatMap(({ source, target }) => [source.id, target.id])
    );
    nodesRef.current = [
      ...nodesRef.current
        .filter(({ id }) => linkNodeIds.has(id))
        .map((node) => ({
          ...node,
          hasNeighbors: presentNeighboursRef.current.has(node.id),
        })),
    ];
    calculateNodePositions();
  };

  const calculateNodePositions = () => {
    if (typeof window === "undefined") return;
    const topicTree = nodesRef.current
      .filter(({ type }) => ["Topic", "Document"].includes(type))
      .map(({ id }) => id)
      .filter((id, index, self) => self.indexOf(id) === index);
    const adjuscentNodes = new Map<string, string[]>();
    const parentNodes = new Map<string, string>();
    topicTree.forEach((nodeId) => adjuscentNodes.set(nodeId, []));
    linksRef.current.forEach(({ source, target }) => {
      if ([source.id, target.id].every((id) => adjuscentNodes.has(id))) {
        adjuscentNodes.get(target.id)?.push(source.id);
        parentNodes.set(source.id, target.id);
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
    const newLayers: Node[][] = Array.from({ length: maxDepth }, () => []);
    topicTree.forEach((nodeId) => {
      const node = nodesRef.current.find((node) => node.id === nodeId)!;
      newLayers[depth.get(nodeId)! - 1].push(node);
    });
    newLayers.push(
      ...["Paragraph", "Sentence", "ExtEntity"].map((type) =>
        nodesRef.current
          .filter((node) => node.type === type)
          .filter(
            (node, index, self) =>
              self.findIndex(({ id }) => node.id === id) === index
          )
      )
    );
    setNodeElements?.([]);
    setLayers(newLayers.filter((layer) => layer.length));
  };

  useEffect(() => {
    const escapeCallback = (event: KeyboardEvent) => {
      if (event.key === "Escape" && selectedNode) setSelectedNode(undefined);
    };
    window.addEventListener("keydown", escapeCallback);
    return () => {
      window.removeEventListener("keydown", escapeCallback);
    };
  }, [selectedNode]);

  useEffect(() => {
    const graph = sessionStorage.getItem("graph");
    if (graph) {
      try {
        const { nodes, links } = JSON.parse(graph);
        nodesRef.current = [...nodes];
        linksRef.current = [...links];
        calculateNodePositions();
      } catch (err) {
        sessionStorage.removeItem("graph");
      }
    }
    window.addEventListener("resize", calculateNodePositions);
    return () => {
      window.removeEventListener("resize", calculateNodePositions);
    };
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(
        "graph",
        JSON.stringify({
          nodes: nodesRef.current,
          links: linksRef.current,
        })
      );
    } catch (err) {}
  }, [linksRef.current, nodesRef.current]);

  return (
    <>
      {selectedNode && (
        <NodeDetails
          node={selectedNode}
          onClose={() => setSelectedNode(undefined)}
        />
      )}
      <main className="flex flex-col flex-1">
        <Header loading={loading} onSubmit={({ query }) => getGraph(query)} />
        <section className="flex-1 w-full overflow-x-auto">
          <div
            className={`relative ${
              error || layers.flat().length === 0
                ? "flex items-center justify-center"
                : "min-w-[48rem] after:w-px after:p-10"
            } w-full p-10 scroll-container`}
          >
            <Legend />
            {error ? (
              <div className="flex items-center justify-center flex-1 h-full gap-2 text-xl text-slate-300">
                <ExclamationCircleIcon className="w-6 text-red-300" />
                <p className="text-red-300">Query could not be processed!</p>
              </div>
            ) : layers.flat().length === 0 ? (
              <div className="flex items-center justify-center flex-1 h-full gap-2 text-xl text-slate-300">
                <ArrowCircleUpIcon className="w-6" />
                <p>Enter your query above!</p>
              </div>
            ) : (
              <div className="relative" ref={setContainerRef}>
                <GraphLinks
                  links={links}
                  containerRef={containerRef}
                  setActiveLink={setActiveLink}
                  setSetNodeElements={setSetNodeElements}
                />
                <GraphNodes
                  layers={layers}
                  setNodeElements={setNodeElements}
                  removeNode={removeNode}
                  getNeighbours={getNeighbours}
                  activeLink={activeLink}
                  onNodeClick={(node: Node) => setSelectedNode(node)}
                />
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
};

export default Explore;
