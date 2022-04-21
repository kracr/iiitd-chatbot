// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { api, Sentence } from "../../utils/api";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { sentence } = req.body as { sentence: Sentence };
  const data = await api.getSentenceDetails(sentence);
  res.status(200).json(data);
}
