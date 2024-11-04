import { useEffect } from "react";
import { useStorage } from "../liveblocks.config";
import { privateApiRequest } from "../api";

export function useAnnotationSync(roomId: number) {
  const annotations = useStorage((root) => root.annotations);

  useEffect(() => {
    if (!annotations) return;

    const saveAnnotations = async () => {
      try {
        console.log("Saving annotations", annotations);

        await privateApiRequest(`/room/${roomId}/annotations`, {
          method: "POST",
          body: {
            annotations: annotations.map((ann) => ({
              x: ann.x,
              y: ann.y,
              text: ann.text,
              authorId: ann.authorId,
              createdAt: Date.now(),
            })),
          },
        });
      } catch (error) {
        console.error("Failed to save annotations:", error);
      }
    };

    const timeoutId = setTimeout(saveAnnotations, 10);
    return () => clearTimeout(timeoutId);
  }, [annotations, roomId]);
}
