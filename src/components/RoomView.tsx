import { useState, useRef } from "react";
import { LiveList } from "@liveblocks/client";
import { InviteUserDialog } from "./InviteUserDialog";
import {
  RoomProvider,
  useMyPresence,
  useStorage,
  useMutation,
} from "../liveblocks.config";
import { useAnnotationSync } from "../hooks/useAnnotationSync";

type Participant = {
  id: number;
  email: string;
};

type Annotation = {
  x: number;
  y: number;
  text: string;
  authorId: number;
};

interface RoomViewProps {
  id: number;
  name: string;
  imageUrl: string;
  participants?: Participant[];
  currentUserId?: number;
  initialAnnotations?: Annotation[];
}

export function RoomViewWithLiveblocks(props: RoomViewProps) {
  return (
    <RoomProvider
      id={props.id.toString()}
      initialPresence={{
        isAddingAnnotation: false,
        cursor: null,
      }}
      initialStorage={{
        annotations: new LiveList(props.initialAnnotations || []),
      }}
    >
      <RoomView {...props} />
    </RoomProvider>
  );
}

function RoomView({
  name,
  imageUrl,
  participants = [],
  id,
  currentUserId,
}: RoomViewProps) {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [editingText, setEditingText] = useState("");

  const [editingAnnotation, setEditingAnnotation] = useState<number | null>(
    null
  );
  const imageRef = useRef<HTMLDivElement>(null);

  const [{ isAddingAnnotation }, updateMyPresence] = useMyPresence();
  const annotations = useStorage((root) => root.annotations);

  useAnnotationSync(id);

  const addAnnotation = useMutation(({ storage }, annotation: Annotation) => {
    const annotations = storage.get("annotations");
    annotations.push({
      ...annotation,
      authorId: Number(currentUserId),
    });
  }, []);

  const updateAnnotationText = useMutation(({ storage }, { index, text }) => {
    const annotations = storage.get("annotations");
    const existing = annotations.get(index);
    if (!existing) return;

    const updatedAnnotation = {
      ...existing,
      text,
    };

    annotations.set(index, updatedAnnotation);
  }, []);

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isAddingAnnotation || !imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    addAnnotation({
      x,
      y,
      text: "",
      authorId: currentUserId!,
    });

    updateMyPresence({ isAddingAnnotation: false });
    setEditingAnnotation(annotations?.length ?? 0);
  };

  const startEditing = (index: number, initialText: string) => {
    setEditingAnnotation(index);
    setEditingText(initialText);
  };

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold text-center mb-8">{name}</h1>

      <div className="max-w-4xl mx-auto">
        <div
          ref={imageRef}
          className="relative w-full mb-8 cursor-pointer"
          onClick={handleImageClick}
        >
          <img
            src={imageUrl}
            alt={name}
            className="w-full rounded-lg shadow-lg"
          />

          {annotations?.map((annotation, index) => (
            <div
              key={index}
              className="absolute bg-white p-2 rounded shadow"
              style={{
                left: `${annotation.x}%`,
                top: `${annotation.y}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              {editingAnnotation === index ? (
                <input
                  type="text"
                  value={editingText}
                  autoFocus
                  className="border p-1 rounded"
                  onChange={(e) => setEditingText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      updateAnnotationText({
                        index,
                        text: editingText,
                      });
                      setEditingAnnotation(null);
                    } else if (e.key === "Escape") {
                      setEditingAnnotation(null);
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    startEditing(index, annotation.text);
                  }}
                >
                  {annotation.text || "Click to edit"}
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-center mb-8">
          <button
            onClick={() =>
              updateMyPresence({ isAddingAnnotation: !isAddingAnnotation })
            }
            className={`px-4 py-2 rounded ${
              isAddingAnnotation
                ? "bg-green-500 hover:bg-green-600"
                : "bg-blue-500 hover:bg-blue-600"
            } text-white`}
          >
            {isAddingAnnotation
              ? "Click on image to add annotation"
              : "Add Annotation"}
          </button>
        </div>

        <div className="flex justify-between items-start bg-white rounded-lg p-4 shadow-sm">
          <div className="w-2/3">
            <h2 className="text-xl font-semibold mb-4">Participants</h2>
            <ul className="space-y-2">
              {participants.map((participant) => (
                <li key={participant.id} className="text-gray-700">
                  {participant.email}
                </li>
              ))}
            </ul>
          </div>
          <button
            onClick={() => setIsInviteOpen(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add Participant
          </button>
        </div>
      </div>

      <InviteUserDialog
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        roomId={id}
      />
    </div>
  );
}
