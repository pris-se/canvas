import { IPoint, ILine } from './../types';

export class Line {
  readonly interval = 17;
  start: IPoint;
  end: IPoint;
  points: IPoint[];
  color: string;
  width: number;
  duration: number;
  readonly initLength: number;

  constructor(
    public context: CanvasRenderingContext2D,
    start: IPoint,
    end: IPoint,
    points: IPoint[] = [],
    color = '#000000',
    width = 2,
    duration = 3000
  ) {
    this.start = start;
    this.end = end;
    this.points = points;
    this.color = color;
    this.width = width;
    this.duration = duration;
    this.initLength = this.length;
  }
  get line() {
    const line: ILine = {
      start: {
        x: this.start.x,
        y: this.start.y,
      },
      end: {
        x: this.end.x,
        y: this.end.y,
      },
    };
    return line;
  }
  get length(): number {
    const num1 = this.end.x - this.start.x;
    const num2 = this.end.y - this.start.y;
    const summ = Math.pow(num1, 2) + Math.pow(num2, 2);
    const dist = Math.sqrt(summ);
    return dist;
  }
  get getNextPoints(): ILine {
    const start = this.findNextPoint(this.start, this.end);
    const end = this.findNextPoint(this.end, this.start);
    const point = { start, end };
    return point;
  }
  set setStart(start: IPoint) {
    this.start = start;
  }
  set setEnd(end: IPoint) {
    this.end = end;
  }

  get step() {
    const duration = this.duration / this.interval;
    return this.initLength / duration / 2;
  }
  set setDuration(duration: number) {
    this.duration = duration;
  }
  set setPoints(points: IPoint[]) {
    this.points = points;
  }
  public drawLine(
    context: CanvasRenderingContext2D = this.context,
    line: ILine = this.line,
    width: number = this.width,
    color: string = this.color
  ) {
    context.lineWidth = width;
    context.fillStyle = color;
    context.beginPath();
    context.moveTo(line.start.x, line.start.y);
    context.lineTo(line.end.x, line.end.y);
    context.stroke();
  }

  public findNextPoint(start: IPoint, end: IPoint) {
    const a = end.x - start.x;
    const b = end.y - start.y;
    const rad = Math.atan2(b, a);
    const deg = (rad / Math.PI) * 180;
    const x = start.x + Math.cos((deg * Math.PI) / 180) * this.step;
    const y = start.y + Math.sin((deg * Math.PI) / 180) * this.step;
    const point = { x, y };
    return point;
  }

  static distance(start: IPoint, end: IPoint): number {
    const num1 = end.x - start.x;
    const num2 = end.y - start.y;
    const summ = Math.pow(num1, 2) + Math.pow(num2, 2);
    const dist = Math.sqrt(summ);
    return dist;
  }

  public collapse(lines: Line[]) {
    if (this.length > 2) {
      const points = this.getNextPoints;
      this.setStart = points.start;
      this.setEnd = points.end;

      const newCircles = Circle.pointsOfIntersection(this.line, lines);
      this.setPoints = newCircles;

      this.drawLine();
      Circle.drawCircles(this.context, this.points);
    } else {
      this.clear();
    }
  }
  public animate(duration: number = this.duration, lines: Line[]) {
    this.setDuration = duration;
    this.clear();

    this.collapse(lines);

    if (lines.length !== 0) {
      window.requestAnimationFrame(() => this.animate(duration, lines));
    }
  }
  static animateLines(context: CanvasRenderingContext2D, lines: Line[], duration: number = 3000) {
    Line.clearAll(context);

    lines.forEach((line) => {
      line.setDuration = duration;

      if (line.length > 2) {
        const points = line.getNextPoints;
        line.setStart = points.start;
        line.setEnd = points.end;

        const newCircles = Circle.pointsOfIntersection(line, lines);
        line.setPoints = newCircles;

        line.drawLine();
        Circle.drawCircles(line.context, line.points);
      } else {
        lines.length = 0;
        Line.clearAll(context);
      }
    });
    if (lines.length !== 0) {
      window.requestAnimationFrame(() => Line.animateLines(context, lines, duration));
    }
  }

  public clear() {
    this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
  }
  static clearAll(context: CanvasRenderingContext2D) {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  }
}

export class Circle {
  point: IPoint;
  color: string;
  width: number;
  radius: number;
  constructor(
    public context: CanvasRenderingContext2D,
    point: IPoint,
    width = 2,
    radius = 5,
    color = '#f00'
  ) {
    this.point = point;
    this.color = color;
    this.width = width;
    this.radius = radius;
    this.context = context;
  }
  static drawCircle(
    context: CanvasRenderingContext2D,
    point: IPoint,
    radius: number = 5,
    color: string = '#f00'
  ) {
    context.beginPath();
    context.fillStyle = color;
    context.arc(point.x, point?.y, radius, 0, Math.PI * 2);
    context.fill();
    context.stroke();
  }
  static drawCircles(
    context: CanvasRenderingContext2D,
    points: IPoint[],
    radius: number = 5,
    color: string = '#f00'
  ) {
    points.forEach((point) => this.drawCircle(context, point, radius, color));
  }
  static pointOfIntersection(firstLine: ILine, secondLine: ILine): IPoint | void {
    let a1 = firstLine.end.y - firstLine.start.y;
    let b1 = firstLine.start.x - firstLine.end.x;
    let c1 = -firstLine.start.x * firstLine.end.y + firstLine.start.y * firstLine.end.x;
    let a2 = secondLine.end.y - secondLine.start.y;
    let b2 = secondLine.start.x - secondLine.end.x;
    let c2 = -secondLine.start.x * secondLine.end.y + secondLine.start.y * secondLine.end.x;

    //  Координаты точки пересечения
    const x = (b1 * c2 - b2 * c1) / (a1 * b2 - a2 * b1);
    const y = (a2 * c1 - a1 * c2) / (a1 * b2 - a2 * b1);

    const pointToFirstStart = Line.distance(firstLine.start, { x, y });
    const pointToFirstEnd = Line.distance(firstLine.end, { x, y });
    const firstLineLenght = Line.distance(firstLine.start, firstLine.end);
    const pointToSecondStart = Line.distance(secondLine.start, { x, y });
    const pointToSecondEnd = Line.distance(secondLine.end, { x, y });
    const secondLineLength = Line.distance(secondLine.start, secondLine.end);

    const outFirstLine = pointToFirstStart > firstLineLenght || pointToFirstEnd > firstLineLenght;
    const outSecondLine =
      pointToSecondStart > secondLineLength || pointToSecondEnd > secondLineLength;

    if (outFirstLine || outSecondLine) {
      // Точка не принадлежит отрезку
      return;
    }
    if (a1 * b2 - a2 * b1 === 0) {
      // Прямые параллельны
      return;
    }
    if (a1 * b2 === b1 * a2 && a1 * c2 === a2 * c1 && b1 * c2 === c1 * b2) {
      // Прямые совпадают
      return;
    }

    const point = { x, y };
    return point;
  }
  static pointsOfIntersection(currentLine: ILine, lines: Line[]): IPoint[] {
    const points: IPoint[] = [];
    for (let i = 0; i < lines.length - 1; i++) {
      const point = this.pointOfIntersection(lines[i], currentLine);
      if (!point) continue;
      points.push(point);
    }
    return points;
  }
}
