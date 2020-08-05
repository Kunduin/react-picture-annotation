import { IShape, IShapeBase } from "Shape";

export interface ITransformer {
  checkBoundary: (positionX: number, positionY: number) => boolean;
  startTransformation: (positionX: number, positionY: number) => void;
  onTransformation: (positionX: number, positionY: number) => void;
  paint: (
    canvas2D: CanvasRenderingContext2D,
    calculateTruePosition: (shapeData: IShapeBase) => IShapeBase,
    scale: number
  ) => void;
}

export default class Transformer implements ITransformer {
  private readonly shape: IShape;
  private currentNodeCenterIndex: number;
  private scale: number;

  private get nodeWidth() {
    return this.shape.shapeStyle.transformerSize / this.scale;
  }

  constructor(shape: IShape, scale: number) {
    this.shape = shape;
    this.scale = scale;
  }

  public checkBoundary = (positionX: number, positionY: number) => {
    const currentCenterIndex = this.getCenterIndexByCursor(
      positionX,
      positionY
    );
    return currentCenterIndex >= 0;
  };

  public startTransformation = (positionX: number, positionY: number) => {
    this.currentNodeCenterIndex = this.getCenterIndexByCursor(
      positionX,
      positionY
    );
  };

  public onTransformation = (positionX: number, positionY: number) => {
    const currentCentersTable = this.getAllCentersTable();
    currentCentersTable[this.currentNodeCenterIndex].adjust(
      positionX,
      positionY
    );
  };

  public paint = (
    canvas2D: CanvasRenderingContext2D,
    calculateTruePosition: (shapeData: IShapeBase) => IShapeBase,
    scale: number
  ) => {
    this.scale = scale;

    const allCentersTable = this.getAllCentersTable();
    canvas2D.save();
    canvas2D.fillStyle = this.shape.shapeStyle.transformerBackground;

    for (const item of allCentersTable) {
      const { x, y, width, height } = calculateTruePosition({
        x: item.x - this.nodeWidth / 2,
        y: item.y - this.nodeWidth / 2,
        width: this.nodeWidth,
        height: this.nodeWidth,
      });
      canvas2D.fillRect(x, y, width, height);
    }

    canvas2D.restore();
  };

  private getCenterIndexByCursor = (positionX: number, positionY: number) => {
    const allCentersTable = this.getAllCentersTable();
    return allCentersTable.findIndex((item) =>
      this.checkEachRectBoundary(item.x, item.y, positionX, positionY)
    );
  };

  private checkEachRectBoundary = (
    rectCenterX: number,
    rectCenterY: number,
    positionX: number,
    positionY: number
  ) => {
    return (
      Math.abs(positionX - rectCenterX) <= this.nodeWidth / 2 &&
      Math.abs(positionY - rectCenterY) <= this.nodeWidth / 2
    );
  };

  private getAllCentersTable = () => {
    const { shape } = this;
    const { x, y, width, height } = shape.getAnnotationData().mark;
    return [
      {
        x,
        y,
        adjust: (positionX: number, positionY: number) => {
          shape.adjustMark({
            x: positionX,
            y: positionY,
            width: width + x - positionX,
            height: height + y - positionY,
          });
        },
      },
      {
        x: x + width / 2,
        y,
        adjust: (_: number, positionY: number) => {
          shape.adjustMark({
            y: positionY,
            height: height + y - positionY,
          });
        },
      },
      {
        x: x + width,
        y,
        adjust: (positionX: number, positionY: number) => {
          shape.adjustMark({
            x,
            y: positionY,
            width: positionX - x,
            height: y + height - positionY,
          });
        },
      },
      {
        x,
        y: y + height / 2,
        adjust: (positionX: number) => {
          shape.adjustMark({
            x: positionX,
            width: width + x - positionX,
          });
        },
      },
      {
        x: x + width,
        y: y + height / 2,
        adjust: (positionX: number) => {
          shape.adjustMark({ width: positionX - x });
        },
      },
      {
        x,
        y: y + height,
        adjust: (positionX: number, positionY: number) => {
          shape.adjustMark({
            x: positionX,
            width: width + x - positionX,
            height: positionY - y,
          });
        },
      },
      {
        x: x + width / 2,
        y: y + height,
        adjust: (_: number, positionY: number) => {
          shape.adjustMark({
            height: positionY - y,
          });
        },
      },
      {
        x: x + width,
        y: y + height,
        adjust: (positionX: number, positionY: number) => {
          shape.adjustMark({
            width: positionX - x,
            height: positionY - y,
          });
        },
      },
    ];
  };
}
