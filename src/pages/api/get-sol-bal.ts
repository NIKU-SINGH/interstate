import type { NextApiRequest, NextApiResponse } from "next";
import { getSolBalance } from "~/utils/functions";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const addr = decodeURIComponent(req.query.address as string);

  try {
    const balance = await getSolBalance(addr);
    res.status(200).json({ data: { balance }})
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: e })
  }
}