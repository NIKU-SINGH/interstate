import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { name, tokenaddress, sort, pump, bonk, og, bonded } = req.query;

  const paramKey = tokenaddress ? "tokenaddress" : "name";
  const paramVal = (tokenaddress || name) as string | undefined;
  if (!paramVal) {
    res.status(400).json({ error: "Missing search parameter" });
    return;
  }

  // Use the working API endpoint
  const baseURL = "http://localhost:8000";
  const urlParams = new URLSearchParams();
  urlParams.set(paramKey, paramVal);

  // Add additional query parameters if provided
  if (sort) urlParams.set("sort", sort as string);
  if (pump) urlParams.set("pump", pump as string);
  if (bonk) urlParams.set("bonk", bonk as string);
  if (og) urlParams.set("og", og as string);
  if (bonded) urlParams.set("bonded", bonded as string);

  const targetUrl = `${baseURL}/api/token-search?${urlParams.toString()}`;

  try {
    const upstream = await fetch(targetUrl);
    const data = await upstream.json();
    
    if (!upstream.ok) {
      res.status(upstream.status).json({ error: "Upstream error", detail: data });
      return;
    }

    res.status(200).json(data);
  } catch (e: any) {
    console.error("Token search proxy error:", e);
    res.status(500).json({ error: "Proxy error", detail: e.message });
  }
} 