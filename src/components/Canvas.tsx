import React, { useRef, useState, useEffect } from 'react';

class Line {
  constructor(
    readonly startX: number,
    readonly startY: number,
    readonly endX: number,
    readonly endY: number
  ) {}
  draw(ctx: CanvasRenderingContext2D, color: string = '#000000', width: number = 2) {
    ctx.fillStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(this.startX, this.startY);
    ctx.lineTo(this.endX, this.endY);
    ctx.stroke();
  }
  static drawAll(ctx: CanvasRenderingContext2D, lines: ILines[], color: string = '#000000') {
    for (let l in lines) {
      if (!!lines[l]?.startX && !!lines[l]?.startY && !!lines[l]?.endX && !!lines[l]?.endY) {
        ctx.lineWidth = 2;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(lines[l].startX!, lines[l].startY!);
        ctx.lineTo(lines[l].endX!, lines[l].endY!);
        ctx.stroke();
      }
    }
  }
  static drawPoint(ctx: CanvasRenderingContext2D, point: IPoint) {
    ctx.beginPath();
    ctx.fillStyle = 'red';
    ctx.arc(point?.x, point?.y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  static drawPoints(ctx: CanvasRenderingContext2D, points: IPoint[]) {
    for (let p in points) {
      this.drawPoint(ctx, points[p]);
    }
  }
}

interface IStart {
  x: number;
  y: number;
}

interface IPoint {
  x: number;
  y: number;
}

interface ILines {
  startX?: number;
  startY?: number;
  endX?: number;
  endY?: number;
  points?: IPoint[];
}

const lines: ILines[] = [];
const pointsOfIntersection: IPoint[] = [];

export const Canvas = () => {
  const [count, setCount] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D>();

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (context) {
      setCtx(context);
    }
  }, []);

  const findPoint = (currentLine: ILines) => {
    const points: IPoint[] = [];
    for (let i = 0; i < lines.length - 1; i++) {
      const point = pointOfIntersection(lines[i], currentLine);
      if (!point) continue;
      points.push(point);
    }
    return points;
  };

  const lineParam = (x0: number, y0: number, x1: number, y1: number, dist: number) => {
    let a = x1 - x0;
    let b = y1 - y0;
    const step = dist / 300;
    const rad = Math.atan2(b, a);
    const deg = (rad / Math.PI) * 180;

    const x = x0! + Math.cos((deg * Math.PI) / 180) * step;
    const y = y0! + Math.sin((deg * Math.PI) / 180) * step;
    const point: IPoint = { x, y };
    return point;
  };

  const findCenter = (line: ILines) => {
    const x: number = Math.round((line.startX! + line.endX!) / 2);
    const y: number = Math.round((line.startY! + line.endY!) / 2);
    const point: IPoint = { x, y };
    return point;
  };

  const pointIsOnLine = (line: ILines, point: IPoint) => {
    const x0 = line.startX;
    const y0 = line.startY;
    const x1 = line.endX;
    const y1 = line.endY;
    const x = point.x;
    const y = point.y;
    const lineLength = distance({ x: x0!, y: y0! }, { x: x1!, y: y1! });
    const pointToStart = distance({ x: x0!, y: y0! }, { x, y });
    const pointToEnd = distance({ x: x1!, y: y1! }, { x, y });

    const isOnLine = pointToStart < lineLength || pointToEnd < lineLength;
    return isOnLine;
  };

  const pointsIsOnLine = () => {
    for (let i = 0; i < pointsOfIntersection.length; i++) {
      const isOnLine = lines.every((line) => pointIsOnLine(line, pointsOfIntersection[i]));
      console.log(isOnLine);
      if (!isOnLine) {
        pointsOfIntersection.splice(i, 1);
      }
    }
  };

  const toPoint = (line: ILines, dist: number) => {
    const x0 = line.startX;
    const y0 = line.startY;
    const x1 = line.endX;
    const y1 = line.endY;
    const length = distance({ x: x0!, y: y0! }, { x: x1!, y: y1! });
    if (length > 1) {
      const fromStart = lineParam(x0!, y0!, x1!, y1!, dist);
      const fromEnd = lineParam(x1!, y1!, x0!, y0!, dist);

      line.startX = fromStart.x;
      line.startY = fromStart.y;
      line.endX = fromEnd.x;
      line.endY = fromEnd.y;

      if (ctx) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        Line.drawAll(ctx, lines);
        pointsIsOnLine();
        Line.drawPoints(ctx, pointsOfIntersection);
      }
    }
  };

  const collapse = (line: ILines) => {
    const start: IStart = { x: line.startX!, y: line.startY! };
    const end: IStart = { x: line.endX!, y: line.endY! };
    const dist = distance(start, end);
    const interval = 10;
    setInterval(() => toPoint(line, dist), interval);
  };

  const onClickHandler = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if (ctx) {
      const x = e.clientX - ctx.canvas.offsetLeft;

      const y = e.clientY - ctx.canvas.offsetTop;
      const firstPointExist: boolean = !!lines[count]?.startX && !!lines[count]?.startY;

      if (!firstPointExist) {
        lines[count] = { ...lines[count], startX: x, startY: y };
      } else {
        lines[count] = { ...lines[count], endX: x, endY: y };

        const points = findPoint(lines[count]);
        points.forEach((point) => pointsOfIntersection.push(point));
        setCount(count + 1);
      }
    }
  };

  const onMouseMooveHandler = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if (ctx && lines[count]?.startX && lines[count]?.startY) {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      Line.drawAll(ctx, lines);
      const x = e.clientX - ctx.canvas.offsetLeft;
      const y = e.clientY - ctx.canvas.offsetTop;

      const line = new Line(lines[count].startX!, lines[count].startY!, x, y);
      line.draw(ctx);
      if (lines[count - 1]) {
        const point = pointOfIntersection(lines[count - 1], { ...lines[count], endX: x, endY: y });
        if (point?.x && point?.y) {
          Line.drawPoint(ctx, point);
        }
      }
      const points = findPoint({ ...lines[count], endX: x, endY: y });
      Line.drawPoints(ctx, points);

      Line.drawPoints(ctx, pointsOfIntersection);
    }
  };

  const colapseHandler = () => {
    lines.forEach((line) => collapse(line));
  };
  const onRightClickHandler = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    e.preventDefault();
    lines[count] = {};
    setCount(count - 1);
    if (ctx) {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      Line.drawAll(ctx, lines, '#000000');
    }
  };

  const distance = (start: IStart, end: IStart) => {
    const num1 = end.x! - start.x!;
    const num2 = end.y! - start.y!;
    const summ = Math.pow(num1, 2) + Math.pow(num2, 2);
    const dist: number = Math.sqrt(summ);
    return dist;
  };

  const pointOfIntersection = (firstLine: ILines, secondLine: ILines) => {
    let a1 = firstLine.endY! - firstLine.startY!;
    let b1 = firstLine.startX! - firstLine.endX!;
    let c1 = -firstLine.startX! * firstLine.endY! + firstLine.startY! * firstLine.endX!;

    let a2 = secondLine.endY! - secondLine.startY!;
    let b2 = secondLine.startX! - secondLine.endX!;
    let c2 = -secondLine.startX! * secondLine.endY! + secondLine.startY! * secondLine.endX!;

    // Формула точки пересечения
    const x: number = (b1 * c2 - b2 * c1) / (a1 * b2 - a2 * b1);
    const y: number = (a2 * c1 - a1 * c2) / (a1 * b2 - a2 * b1);

    const pointToFirstStart = distance({ x: firstLine.startX!, y: firstLine.startY! }, { x, y });
    const pointToFirstEnd = distance({ x: firstLine.endX!, y: firstLine.endY! }, { x, y });
    const firstLineLenght = distance(
      { x: firstLine.endX!, y: firstLine.endY! },
      { x: firstLine.startX!, y: firstLine.startY! }
    );
    const pointToSecondStart = distance({ x: secondLine.startX!, y: secondLine.startY! }, { x, y });
    const pointToSecondEnd = distance({ x: secondLine.endX!, y: secondLine.endY! }, { x, y });
    const secondLineLength = distance(
      { x: secondLine.startX!, y: secondLine.startY! },
      { x: secondLine.endX!, y: secondLine.endY! }
    ); // Длина линии

    const eq1 = pointToFirstStart > firstLineLenght || pointToFirstEnd > firstLineLenght;
    const eq2 = pointToSecondStart > secondLineLength || pointToSecondEnd > secondLineLength;

    if (eq1 || eq2) {
      // Выход за пределы отрезка
      return;
    }
    if (a1 * b2 - a2 * b1 === 0) {
      console.log('Прямые параллельны');
      return;
    }
    if (a1 * b2 === b1 * a2 && a1 * c2 === a2 * c1 && b1 * c2 === c1 * b2) {
      console.log('Прямые совпадают');
      return;
    }

    const point: IPoint = { x, y };
    return point;
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
