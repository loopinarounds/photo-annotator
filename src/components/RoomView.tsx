import { useEffect, useState, useRef } from "react";
import { InviteUserDialog } from "./InviteUserDialog";

import {
  RoomProvider,
  useMyPresence,
  useOthers,
  useStorage,
  useMutation,
} from "../liveblocks.config";

type Participant = {
  id: number;
  email: string;
};

interface RoomViewProps {
  id: number;
  name: string;
  image?: string;
  ownerUserId: number;
  participants?: Participant[];
}

// This is the wrapper component that provides Liveblocks context
export function RoomViewWithLiveblocks(props: RoomViewProps) {
  return (
    <RoomProvider
      id={props.id.toString()}
      initialPresence={{
        cursor: null,
        isTyping: false,
      }}
      initialStorage={{
        annotations: [],
      }}
    >
      <RoomView {...props} />
    </RoomProvider>
  );
}

function RoomView({ name, image, participants = [], id }: RoomViewProps) {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  const [draggedAnnotation, setDraggedAnnotation] = useState<number | null>(
    null
  );

  const [myPresence, updateMyPresence] = useMyPresence();

  const others = useOthers();

  const storage = useStorage((root) => root);

  const addAnnotation = useMutation(({ storage }, annotation) => {
    storage.get("annotations").push(annotation);
  }, []);
  const updateAnnotation = useMutation(({ storage }, { index, x, y }) => {
    const annotations = storage.get("annotations");
    annotations[index] = {
      ...annotations[index],
      x,
      y,
    };
  }, []);

  const getRelativeCoordinates = (clientX: number, clientY: number) => {
    if (!imageRef.current) return null;
    const rect = imageRef.current.getBoundingClientRect();
    const x = Math.min(Math.max(0, clientX - rect.left), rect.width);
    const y = Math.min(Math.max(0, clientY - rect.top), rect.height);
    return { x, y };
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      updateMyPresence({
        cursor: {
          x: e.clientX,
          y: e.clientY,
        },
      });
    };

    const handlePointerLeave = () => {
      updateMyPresence({
        cursor: null,
      });
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [updateMyPresence]);

  return (
    <div className="relative max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">{name}</h1>
      {image && (
        <div
          ref={imageRef}
          className="relative w-3/4 mx-auto mb-8 overflow-hidden"
        >
          <img src={image} alt={name} className="w-full rounded-lg shadow-lg" />

          {others.map(({ connectionId, presence }) => {
            if (!presence.cursor) return null;

            return (
              <div
                key={connectionId}
                className="absolute w-4 h-4 bg-blue-500 rounded-full"
                style={{
                  left: presence.cursor.x,
                  top: presence.cursor.y,
                  transform: "translate(-50%, -50%)",
                }}
              />
            );
          })}

          {storage?.annotations.map((annotation, index) => (
            <div
              key={index}
              className={`absolute bg-white p-2 rounded shadow cursor-move
                ${draggedAnnotation === index ? "z-50 opacity-90" : "z-10"}`}
              style={{
                left: `${annotation.x}px`,
                top: `${annotation.y}px`,
                transform: "translate(-50%, -50%)",
              }}
              draggable="true"
              onDragStart={(e) => {
                setDraggedAnnotation(index);
                e.dataTransfer.setDragImage(new Image(), 0, 0); // Hide default drag image
              }}
              onDrag={(e) => {
                if (e.clientX === 0 && e.clientY === 0) return; // Ignore invalid drag events
                const coords = getRelativeCoordinates(e.clientX, e.clientY);
                if (coords) {
                  updateAnnotation({ index, ...coords });
                }
              }}
              onDragEnd={() => {
                setDraggedAnnotation(null);
              }}
            >
              {annotation.text}
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => {
          const text = prompt("Enter annotation text:");
          if (text && myPresence.cursor) {
            addAnnotation({
              x: myPresence.cursor.x,
              y: myPresence.cursor.y,
              text,
              authorId: "current-user-id",
            });
          }
        }}
      >
        Add Annotation
      </button>

      <div className="mt-8 bg-white rounded-lg p-4 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Participants</h2>
          <button
            onClick={() => setIsInviteOpen(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add Participant
          </button>
        </div>
        <ul className="space-y-2">
          {participants.map((participant) => (
            <li key={participant.id} className="text-gray-700">
              {participant.email}
            </li>
          ))}
          {others.map(({ connectionId }) => (
            <li key={connectionId} className="text-gray-500 italic">
              Anonymous User
            </li>
          ))}
        </ul>
      </div>

      <InviteUserDialog
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        roomId={id}
      />
    </div>
  );
}
