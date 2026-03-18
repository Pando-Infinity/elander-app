/// <reference lib="webworker" />

export type {};

interface GenerateMessage {
  type: "generate";
  edition: number;
  layers: ImageBitmap[];
  canvasWidth: number;
  canvasHeight: number;
}

self.onmessage = async (e: MessageEvent<GenerateMessage>) => {
  const { type, edition, layers, canvasWidth, canvasHeight } = e.data;

  if (type !== "generate") return;

  try {
    const canvas = new OffscreenCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      self.postMessage({ type: "error", edition, error: "Failed to get 2D context" });
      return;
    }

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Composite each layer in order
    for (const layer of layers) {
      ctx.drawImage(layer, 0, 0, canvasWidth, canvasHeight);
    }

    const imageBlob = await canvas.convertToBlob({ type: "image/png" });

    self.postMessage({ type: "result", edition, imageBlob });
  } catch (error) {
    self.postMessage({
      type: "error",
      edition,
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
