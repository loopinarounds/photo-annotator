import { useState } from "react";
import { Annotation } from "../types/Annotations";

export function Home() {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);

  const [currentAnnotation, setCurrentAnnotation] = useState<Annotation | null>(
    null
  );

  const handleMouseDown = (e: any) => {
    const rect = e.target.getBoundingClientRect();
    setCurrentAnnotation({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      width: 0,
      height: 0,
      text: "",
    });
  };

  const handleMouseMove = (e: any) => {
    if (!currentAnnotation) return;
    const rect = e.target.getBoundingClientRect();
    setCurrentAnnotation((prev) => ({
      ...prev,
      x: prev?.x || 0,
      y: prev?.y || 0,
      text: prev?.text || "",
      width: e.clientX - rect.left - (prev?.x || 0),
      height: e.clientY - rect.top - (prev?.y || 0),
    }));
  };

  const handleMouseUp = () => {
    if (currentAnnotation) {
      setAnnotations([...annotations, currentAnnotation]);
      setCurrentAnnotation(null);
    }
  };

  const handleTextChange = (index: any, text: any) => {
    const updatedAnnotations = annotations.map((annotation, i) =>
      i === index ? { ...annotation, text } : annotation
    );
    setAnnotations(updatedAnnotations);
  };

  return (
    <div
      className="relative"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* <img
        src={
          "https://static.vecteezy.com/system/resources/thumbnails/026/542/204/small_2x/landscape-natural-beautiful-mountains-and-blue-sky-panorama-photo.jpg"
        }
        alt="Annotatable"
        className="w-full"
      /> */}
      {annotations.map((annotation, index) => (
        <div
          key={index}
          className="absolute border border-blue-500"
          style={{
            left: annotation.x,
            top: annotation.y,
            width: annotation.width,
            height: annotation.height,
          }}
        >
          <input
            type="text"
            value={annotation.text}
            onChange={(e) => handleTextChange(index, e.target.value)}
            className="bg-white text-black"
          />
        </div>
      ))}
      {currentAnnotation && (
        <div
          className="absolute border border-red-500"
          style={{
            left: currentAnnotation.x,
            top: currentAnnotation.y,
            width: currentAnnotation.width,
            height: currentAnnotation.height,
          }}
        />
      )}
    </div>
  );
}
