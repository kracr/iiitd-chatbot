// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { api, Edge, Entity } from "../../utils/api";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{
    edges: Edge[];
    nodes: Entity[];
  }>
) {
  const { nodes, nodeNeighbours } = req.body as {
    nodes: number[];
    nodeNeighbours: number[];
  };
  const data = await api.getGraphWithNeighbours(nodes, nodeNeighbours);
  res.status(200).json(data);
}
