/* ------------------------------------------------------------------
   src/pages/api/fal/vision.ts
-------------------------------------------------------------------*/
import type { NextApiRequest, NextApiResponse } from "next";
import { fal } from "@fal-ai/client";
import { visionSystemPrompt } from "@/lib/falPrompts";

/* one-time server-side config */
fal.config({ credentials: process.env.FAL_API_KEY! });

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const { image, prompt } = req.body as { image?: string; prompt?: string };
  if (!image || !prompt) {
    return res
      .status(400)
      .json({ error: "`image` and `prompt` are required" });
  }

  console.log("→ body received:", { image, prompt });

  try {
    /* run the model and wait until it’s finished */
    const run: any = await fal.subscribe("fal-ai/any-llm/vision", {
      input: {
        model_name: "gpt-4o-mini",
        image_url: image,
        prompt: `See the product ${prompt} in this image: .\n\n${visionSystemPrompt}`,
        //prompt: `${visionSystemPrompt}\n\nSUBJECT: ${prompt}\nReturn raw JSON only – NO markdown fences.`,
      },
    });

    /* -------- extract the text, no matter where it lands ---------- */
    let raw: unknown =
      /* OpenAI-style */
      run?.choices?.[0]?.message?.content ??
      /* helper (string) */
      (typeof run?.output === "string" ? run.output : undefined) ??
      /* helper v1.x (string) */
      (typeof run?.data?.output === "string" ? run.data.output : undefined) ??
      /* sometimes run / run.data is an object that contains { output } */
      (run?.output?.output ?? run?.data?.output) ??
      /* fallback */
      run;

    /* if we still have an object, pick .output or stringify          */
    if (typeof raw !== "string") {
      raw =
        (raw as any)?.output && typeof (raw as any).output === "string"
          ? (raw as any).output
          : JSON.stringify(raw);
    }

    /* at this point `raw` is a string */
    let rawStr = (raw as string).trim();

    /* strip ```json … ``` or ``` … ``` fences */
    if (rawStr.startsWith("```")) {
      rawStr = rawStr
        .replace(/^```[a-z]*\s*/i, "")
        .replace(/```$/, "")
        .trim();
    }

    console.log("🔥 cleaned FAL output:", rawStr);

    if (rawStr.startsWith("{")) {
      /* parse & forward to the browser */
      return res.status(200).json(JSON.parse(rawStr));
    }

    return res
      .status(422)
      .json({ error: "Model did not return JSON", rawReturned: rawStr });
  } catch (err: any) {
    console.error("🔥 proxy caught error:", err);
    return res.status(500).json({ error: err.message ?? "FAL error" });
  }
}
