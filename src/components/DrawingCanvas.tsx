import { useEffect, useRef, useState } from "react";
import rough from "roughjs";

type DrawingShape =
  | "freehand"
  | "rectangle"
  | "circle"
  | "ellipse"
  | "triangle";

const Canvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [roughCanvas, setRoughCanvas] = useState<ReturnType<
    typeof rough.canvas
  > | null>(null);
  const [currentShape, setCurrentShape] = useState<DrawingShape>("freehand");
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const roughCanvasInstance = rough.canvas(canvas);

      setContext(ctx);
      setRoughCanvas(roughCanvasInstance);

      if (ctx) {
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.lineWidth = 5;
      }
    }
  }, []);

  const startDrawing = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (context && roughCanvas) {
      setDrawing(true);
      setStartX(event.nativeEvent.offsetX);
      setStartY(event.nativeEvent.offsetY);

      if (currentShape === "freehand") {
        context.beginPath();
        context.moveTo(event.nativeEvent.offsetX, event.nativeEvent.offsetY);
      }
    }
  };

  const draw = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (drawing && context && roughCanvas) {
      if (currentShape === "freehand") {
        context.lineTo(event.nativeEvent.offsetX, event.nativeEvent.offsetY);
        context.stroke();
      } else {
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);

        const endX = event.nativeEvent.offsetX;
        const endY = event.nativeEvent.offsetY;

        switch (currentShape) {
          case "rectangle":
            roughCanvas.rectangle(
              startX,
              startY,
              endX - startX,
              endY - startY,
              { roughness: 1 }
            );
            break;
          case "circle":
            roughCanvas.circle(
              startX + (endX - startX) / 2,
              startY + (endY - startY) / 2,
              endX - startX,
              { roughness: 1 }
            );
            break;
          case "ellipse":
            roughCanvas.ellipse(
              startX + (endX - startX) / 2,
              startY + (endY - startY) / 2,
              endX - startX,
              endY - startY,
              { roughness: 1 }
            );
            break;
          case "triangle":
            roughCanvas.polygon([
              [startX, endY],
              [endX, endY],
              [startX + (endX - startX) / 2, startY],
            ]);
            break;
          default:
            break;
        }
      }
    }
  };

  const endDrawing = () => {
    setDrawing(false);
  };

  const toggleShape = () => {
    setCurrentShape((prevShape) => {
      const shapeOrder: DrawingShape[] = [
        "freehand",
        "rectangle",
        "circle",
        "ellipse",
        "triangle",
      ];
      const currentIndex = shapeOrder.indexOf(prevShape);
      const nextIndex = (currentIndex + 1) % shapeOrder.length;
      return shapeOrder[nextIndex];
    });
  };

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      className="w-full h-full border"
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={endDrawing}
      onMouseOut={endDrawing}
      onClick={toggleShape}
    />
  );
};

export default Canvas;
