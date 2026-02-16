import { NextResponse } from "next/server";
import { z } from "zod";
import { selectRelevantSkills } from "@/lib/remotion-skills";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const requestSchema = z.object({
  prompt: z.string().trim().min(10).max(125000),
  model: z.string().trim().min(1).max(100).optional(),
  imageDataUrl: z
    .union([
      z
        .string()
        .max(10_000_000)
        .refine((value) => /^data:image\/(?:png|jpeg|jpg|webp|gif);base64,/i.test(value), "Unsupported image format."),
      z.null()
    ])
    .optional(),
  durationSeconds: z.number().min(1).max(60).optional(),
  width: z.number().int().min(320).max(3840).optional(),
  height: z.number().int().min(240).max(2160).optional(),
  fps: z.number().int().min(12).max(60).optional()
});

type ServerLogEntry = {
  at: string;
  step: string;
  detail?: string;
};

export async function POST(request: Request) {
  const logs: ServerLogEntry[] = [];
  const log = (step: string, detail?: string) => {
    logs.push({
      at: new Date().toISOString(),
      step,
      ...(detail ? { detail } : {})
    });
  };

  try {
    log("request.received");

    log("module.load.start", "Loading Copilot and Remotion modules");
    const [{ generateVideoSpecWithCopilot }, { renderRemotionVideo }] = await Promise.all([
      import("@/lib/copilot"),
      import("@/lib/remotion")
    ]);
    log("module.load.done");

    log("request.parse.start");
    const body = await request.json();
    const { prompt, model, imageDataUrl, durationSeconds, width, height, fps } = requestSchema.parse(body);
    const normalizedImageDataUrl = imageDataUrl ?? undefined;
    log("request.parse.done", `Prompt length: ${prompt.length}. Image attached: ${normalizedImageDataUrl ? "yes" : "no"}`);

    const relevantSkills = selectRelevantSkills(prompt);
    log("skills.selected", relevantSkills.map((s) => s.name).join(", ") || "none");

    log("copilot.generate.start", `Model: ${model || process.env.COPILOT_MODEL || "gpt-5"}`);
    const { spec } = await generateVideoSpecWithCopilot({
      prompt,
      model,
      imageDataUrl: normalizedImageDataUrl,
      durationSeconds,
      width,
      height,
      fps
    });
    log("copilot.generate.done", `${spec.width}x${spec.height} @ ${spec.fps}fps, ${spec.durationInFrames} frames`);

    log("remotion.render.start");
    const renderResult = await renderRemotionVideo(spec);
    log("remotion.render.done", `Job: ${renderResult.jobId}`);

    return NextResponse.json({
      ok: true,
      jobId: renderResult.jobId,
      videoUrl: renderResult.videoUrl,
      metadata: {
        title: spec.title,
        width: spec.width,
        height: spec.height,
        fps: spec.fps,
        durationInFrames: spec.durationInFrames
      },
      logs
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      log("request.parse.failed", error.issues[0]?.message || "Invalid request payload.");

      return NextResponse.json(
        {
          ok: false,
          error: error.issues[0]?.message || "Invalid request payload.",
          logs
        },
        { status: 400 }
      );
    }

    log("request.failed", error instanceof Error ? error.message : "Unknown error");

    console.error("/api/generate error:", error);

    const message = error instanceof Error ? error.message : "Unknown error";
    const payload: { ok: false; error: string; logs: ServerLogEntry[]; stack?: string } = {
      ok: false,
      error: message,
      logs
    };

    if (process.env.NODE_ENV !== "production" && error instanceof Error && error.stack) {
      payload.stack = error.stack;
    }

    return NextResponse.json(payload, { status: 500 });
  }
}
