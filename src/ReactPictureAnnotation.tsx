import React, { MouseEventHandler } from "react";
import { IShape, RectShape } from "./Shape";
import randomId from "./utils/randomId";

interface IReactPictureAnnotationProps {
  onChange: () => void;
  onSelect: (id: string) => void;
  width: number;
  height: number;
}

enum AnnotationState {
  DRAGGING,
  CREATING,
  NONE
}

export default class ReactPictureAnnotation extends React.Component<
  IReactPictureAnnotationProps
> {
  private canvasRef = React.createRef<HTMLCanvasElement>();
  private canvas2D?: CanvasRenderingContext2D | null;
  private annotationState: AnnotationState = AnnotationState.NONE;
  private shapes: IShape[] = [];
  private selectedId: string;

  public componentDidMount = () => {
    const currentCanvas = this.canvasRef.current;
    if (currentCanvas) {
      this.canvas2D = currentCanvas.getContext("2d");
    }
  };

  public render() {
    return (
      <canvas
        ref={this.canvasRef}
        width={this.props.width}
        height={this.props.height}
        onMouseDown={this.onMouseDown}
        onMouseMove={this.onMouseMove}
        onMouseUp={this.onMouseUp}
        onMouseLeave={this.onMouseUp}
      />
    );
  }

  private onMouseDown: MouseEventHandler<HTMLCanvasElement> = event => {
    if (this.annotationState === AnnotationState.NONE) {
      const { offsetX, offsetY } = event.nativeEvent;
      for (let i = this.shapes.length - 1; i >= 0; i--) {
        if (this.shapes[i].checkBoundary(offsetX, offsetY)) {
          this.selectedId = this.shapes[i].getAnnotationData().id;
          const [selectedShape] = this.shapes.splice(i, 1);
          this.shapes.push(selectedShape);
          selectedShape.onDragStart(offsetX, offsetY);
          this.onShapeChange();
          this.annotationState = AnnotationState.DRAGGING;
          return;
        }
      }

      this.annotationState = AnnotationState.CREATING;
      this.shapes.push(
        new RectShape(
          {
            id: randomId(),
            mark: {
              x: offsetX,
              y: offsetY,
              width: 0,
              height: 0,
              type: "RECT"
            }
          },
          this.onShapeChange
        )
      );
      this.onShapeChange();
    }
  };

  private onMouseMove: MouseEventHandler<HTMLCanvasElement> = event => {
    const { offsetX, offsetY } = event.nativeEvent;
    if (
      this.annotationState === AnnotationState.CREATING &&
      this.shapes.length > 0
    ) {
      const currentShape = this.shapes[this.shapes.length - 1];
      const {
        mark: { x, y }
      } = currentShape.getAnnotationData();
      currentShape.adjustMark({
        width: offsetX - x,
        height: offsetY - y
      });
    } else if (this.annotationState === AnnotationState.DRAGGING) {
      const currentShape = this.shapes[this.shapes.length - 1];
      currentShape.onDrag(offsetX, offsetY);
    }
  };

  private onMouseUp: MouseEventHandler<HTMLCanvasElement> = () => {
    this.annotationState = AnnotationState.NONE;
  };

  private onShapeChange = () => {
    if (this.canvas2D && this.canvasRef.current) {
      this.canvas2D.clearRect(
        0,
        0,
        this.canvasRef.current.width,
        this.canvasRef.current.height
      );
      for (const item of this.shapes) {
        item.paint(
          this.canvas2D,
          item.getAnnotationData().id === this.selectedId
        );
      }
    }
  };
}
