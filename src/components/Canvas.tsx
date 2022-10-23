import React, { useRef, useState, useEffect } from 'react';
import { Circle, Line } from '../models/canvas.model';
import { IPoint } from '../types';

const lines: Line[] | [] = [];

export const Canvas = () => {
  const [id, setId] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [prevPoint, setPrevPoint] = useState<IPoint | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (context) {
      setCtx(context);
    }
  }, []);

  const onClickHandler = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if (ctx) {
      const x = e.clientX - ctx.canvas.offsetLeft;
      const y = e.clientY - ctx.canvas.offsetTop;

      const currentPoint: IPoint = { x: Math.floor(x), y: Math.floor(y) };

      if (!prevPoint) {
        setIsDrawing(true);
        setPrevPoint(currentPoint);
        // first point exist
      } else if (prevPoint) {
        const points = Circle.pointsOfIntersection(
          {
            start: prevPoint,
            end: currentPoint,
          },
          lines
        ); // find point of intersection

        const line = new Line(ctx, prevPoint, currentPoint, points);
        lines[id] = line; // add lines to array // add points to array

        setId(id + 1); //  set id
        setPrevPoint(null);
        setIsDrawing(false);
      }
    }
  };

  const onMouseMooveHandler = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if (ctx && prevPoint && isDrawing) {
      // start and end of first point exist
      const x = e.clientX - ctx.canvas.offsetLeft;
      const y = e.clientY - ctx.canvas.offsetTop;
      const currentPoint: IPoint = { x: Math.floor(x), y: Math.floor(y) };

      const line = new Line(ctx, prevPoint, currentPoint); // creare new Line
      lines[id] = line;
      line.clear(); // clear canvas
      lines.forEach((line) => line.drawLine()); // draw all Lines

      if (lines[id - 1]) {
        const points = Circle.pointsOfIntersection(
          {
            start: line.start,
            end: currentPoint,
          },
          lines
        ); // find all point on thes line
        line.points = points;

        lines.forEach((line) => Circle.drawCircles(ctx, line.points));
      }
    }
  };

  const onRightClickHandler = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    e.preventDefault();
    if (isDrawing && ctx) {
      setIsDrawing(false);
      setPrevPoint(null);
      lines.splice(id, 1);

      Line.clearAll(ctx);
      lines.forEach((line) => line.drawLine());
      lines.forEach((line) => Circle.drawCircles(ctx, line.points));

      // exist only a second point of current line
      // delete current line
      // decrise current id
    }
    // redraw all lines
  };

  const colapseHandler = () => {
    if (ctx) {
      Line.animateLines(ctx, lines);
    }
    setId(0);
  };

  return (
    <>
      <canvas
        width={window.screen.width - 50}
        height='500px'
        onClick={(e) => onClickHandler(e)}
        onMouseMove={(e) => onMouseMooveHandler(e)}
        onContextMenu={(e) => onRightClickHandler(e)}
        className='canvas'
        ref={canvasRef}
      />
      <button onClick={colapseHandler} className='btn'>
        collapse lines
      </button>
    </>
  );
};
