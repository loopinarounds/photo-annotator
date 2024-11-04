// import React, { useRef, useState } from "react";
// import { Annotation } from "../types/Annotations";

// export function Annotator() {
//   const [annotations, setAnnotations] = useState<Annotation[]>([]);
//   const [currentAnnotation, setCurrentAnnotation] = useState<Annotation | null>(
//     null
//   );
//   const [isCreating, setIsCreating] = useState(false);
//   const [resizingIndex, setResizingIndex] = useState<number | null>(null);
//   const imageRef = useRef<HTMLImageElement | null>(null);

//   const handleMouseDown = (e: React.MouseEvent) => {
//     if (!isCreating || !imageRef.current) return;
//     const rect = imageRef.current.getBoundingClientRect();
//     setCurrentAnnotation({
//       x: (e.clientX - rect.left) / rect.width,
//       y: (e.clientY - rect.top) / rect.height,
//       width: 0,
//       height: 0,
//       text: "",
//     });
//   };

//   const handleMouseMove = (e: React.MouseEvent) => {
//     if (resizingIndex !== null && imageRef.current) {
//       const rect = imageRef.current.getBoundingClientRect();
//       const updatedAnnotations = annotations.map((annotation, index) => {
//         if (index === resizingIndex) {
//           return {
//             ...annotation,
//             width: (e.clientX - rect.left) / rect.width - annotation.x,
//             height: (e.clientY - rect.top) / rect.height - annotation.y,
//           };
//         }
//         return annotation;
//       });
//       setAnnotations(updatedAnnotations);
//     } else if (currentAnnotation && imageRef.current) {
//       const rect = imageRef.current.getBoundingClientRect();
//       setCurrentAnnotation((prev) => ({
//         ...prev,
//         width: (e.clientX - rect.left) / rect.width - (prev?.x || 0),
//         height: (e.clientY - rect.top) / rect.height - (prev?.y || 0),
//         x: prev?.x || 0,
//         y: prev?.y || 0,
//         text: prev?.text || "",
//       }));
//     }
//   };

//   const handleMouseUp = () => {
//     if (currentAnnotation) {
//       setAnnotations([...annotations, currentAnnotation]);
//       setCurrentAnnotation(null);
//       setIsCreating(false);
//     }
//     setResizingIndex(null);
//   };

//   const handleTextChange = (index: number, text: string) => {
//     const updatedAnnotations = annotations.map((annotation, i) =>
//       i === index ? { ...annotation, text } : annotation
//     );
//     setAnnotations(updatedAnnotations);
//   };

//   const handleDelete = (index: number) => {
//     setAnnotations(annotations.filter((_, i) => i !== index));
//   };

//   const startResizing = (index: number) => {
//     setResizingIndex(index);
//   };

//   return (
//     <div className="relative">
//       <button
//         onClick={() => setIsCreating(true)}
//         className="mb-2 p-2 bg-blue-500 text-white"
//       >
//         Create Annotation
//       </button>
//       <div
//         onMouseDown={handleMouseDown}
//         onMouseMove={handleMouseMove}
//         onMouseUp={handleMouseUp}
//         className="relative"
//       >
//         <img
//           ref={imageRef}
//           src={
//             "https://static.vecteezy.com/system/resources/thumbnails/026/542/204/small_2x/landscape-natural-beautiful-mountains-and-blue-sky-panorama-photo.jpg"
//           }
//           alt="Annotatable"
//           className="w-full"
//         />
//         {annotations.map((annotation, index) => (
//           <div
//             key={index}
//             className="absolute"
//             style={{
//               left: `${annotation.x * 100}%`,
//               top: `${annotation.y * 100}%`,
//             }}
//           >
//             <div className="relative border border-blue-500 bg-white">
//               <input
//                 type="text"
//                 value={annotation.text}
//                 onChange={(e) => handleTextChange(index, e.target.value)}
//                 className="bg-white text-black"
//               />
//               <button
//                 onClick={() => handleDelete(index)}
//                 className="absolute left-0 bg-red-500 text-white"
//               >
//                 X
//               </button>
//               <div
//                 className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 cursor-se-resize"
//                 onMouseDown={() => startResizing(index)}
//               />
//             </div>
//           </div>
//         ))}
//         {currentAnnotation && (
//           <div
//             className="absolute border border-red-500"
//             style={{
//               left: `${currentAnnotation.x * 100}%`,
//               top: `${currentAnnotation.y * 100}%`,
//               width: `${currentAnnotation.width * 100}%`,
//               height: `${currentAnnotation.height * 100}%`,
//             }}
//           />
//         )}
//       </div>
//     </div>
//   );
// }
