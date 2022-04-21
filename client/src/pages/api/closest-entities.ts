// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { api, Entity } from "../../utils/api";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Entity[]>
) {
  const { query } = req.body as { query: string };
  const data = await api.getClosestEntities(query);
  res.status(200).json(data);
}
