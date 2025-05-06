import { fal } from "@fal-ai/client";

fal.config({ credentials: process.env.FAL_API_KEY });

export const runVision = (imageUrl: string, subject: string) =>
  fal.subscribe("fal-ai/any-llm/vision", {
    input: {
      image_url: imageUrl,
      prompt: `You are a product-ad specialist... SUBJECT:${subject}`
    }
  });

export const runEdit = (workflow: "edit" | "model" | "pose" | "retouch",
                        payload: Record<string, any>) => {
  const model = {
    edit: "fal-ai/flux-pro/v1/fill",
    model: "fal-ai/flux-pro/v1/fill",
    pose: "fal-ai/sdxl-controlnet-union/inpainting",
    retouch: "fal-ai/iclight-v2"
  }[workflow];

  return fal.subscribe(model, { input: payload });
};
