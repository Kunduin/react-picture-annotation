import { IShape, IShapeBase } from "Shape";

const NODE_WIDTH = 10;

export interface ITransformer {
  checkBoundary: (positionX: number, positionY: number) => boolean;
  startTransformation: (positionX: number, positionY: number) => void;
  onTransformation: (positionX: number, positionY: number) => void;
  paint: (
    canvas2D: CanvasRenderingContext2D,
    calculateTruePosition: (shapeData: IShapeBase) => IShapeBase
  ) => void;
}

export default class Transformer implements ITransformer {
  private shape: IShape;
  private currentNodeCenterIndex: number;

  constructor(shape: IShape) {
    this.shape = shape;
  }
  public checkBoundary = (positionX: number, positionY: number) => {
    const currentCenterIndex = this.getCenterIndexByCursor(
      positionX,
      positionY
    );
    return currentCenterIndex >= 0;
  };

  public startTransformation = (positionX: number, positionY: number) => {
    const currentCenterIndex = this.getCenterIndexByCursor(
      positionX,
      positionY
    );
    this.currentNodeCenterIndex = currentCenterIndex;
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
    calculateTruePosition: (shapeData: IShapeBase) => IShapeBase
  ) => {
    const allCentersTable = this.getAllCentersTable();
    canvas2D.save();
    canvas2D.fillStyle = "#5c7cfa";

    for (const item of allCentersTable) {
      const { x, y, width, height } = calculateTruePosition({
        x: item.x - NODE_WIDTH / 2,
        y: item.y - NODE_WIDTH / 2,
        width: NODE_WIDTH,
        height: NODE_WIDTH
      });
      canvas2D.fillRect(x, y, width, height);
    }

    canvas2D.restore();
  };

  private getCenterIndexByCursor = (positionX: number, positionY: number) => {
    const allCentersTable = this.getAllCentersTable();
    return allCentersTable.findIndex(item =>
      this.checkEachRectBoundary(item.x, item.y, positionX, positionY)
    );
  };

  private checkEachRectBoundary = (
    rectCenterX: number,
    rectCenterY: number,
    positionX: number,
    positionY: number
  ) => {
    if (
      Math.abs(positionX - rectCenterX) <= NODE_WIDTH / 2 &&
      Math.abs(positionY - rectCenterY) <= NODE_WIDTH / 2
    ) {
      return true;
    }
    return false;
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
            height: height + y - positionY
          });
        }
      },
      {
        x: x + width / 2,
        y,
        adjust: (_: number, positionY: number) => {
          shape.adjustMark({
            y: positionY,
            height: height + y - positionY
          });
        }
      },
      {
        x: x + width,
        y,
        adjust: (positionX: number, positionY: number) => {
          shape.adjustMark({
            x,
            y: positionY,
            width: positionX - x,
            height: y + height - positionY
          });
        }
      },
      {
        x,
        y: y + height / 2,
        adjust: (positionX: number) => {
          shape.adjustMark({
            x: positionX,
            width: width + x - positionX
          });
        }
      },
      {
        x: x + width,
        y: y + height / 2,
        adjust: (positionX: number) => {
          shape.adjustMark({ width: positionX - x });
        }
      },
      {
        x,
        y: y + height,
        adjust: (positionX: number, positionY: number) => {
          shape.adjustMark({
            x: positionX,
            width: width + x - positionX,
            height: positionY - y
          });
        }
      },
      {
        x: x + width / 2,
        y: y + height,
        adjust: (_: number, positionY: number) => {
          shape.adjustMark({
            height: positionY - y
          });
        }
      },
      {
        x: x + width,
        y: y + height,
        adjust: (positionX: number, positionY: number) => {
          shape.adjustMark({
            width: positionX - x,
            height: positionY - y
          });
        }
      }
    ];
  };
}
