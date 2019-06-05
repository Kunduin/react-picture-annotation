import React, { MouseEventHandler } from "react";
import { IAnnotationState } from "./annotation/AnnotationState";
import { DefaultAnnotationState } from "./annotation/DefaultAnnotationState";
import { IShape, IShapeData } from "./Shape";

interface IReactPictureAnnotationProps {
  onChange: () => void;
  onSelect: (id: string) => void;
  width: number;
  height: number;
}

interface IStageState {
  scale: number;
  originX: number;
  originY: number;
}

const defaultState: IStageState = {
  scale: 1,
  originX: 0,
  originY: 0
};

export default class ReactPictureAnnotation extends React.Component<
  IReactPictureAnnotationProps
> {
  public shapes: IShape[] = [];
  public selectedId: string;

  private canvasRef = React.createRef<HTMLCanvasElement>();
  private canvas2D?: CanvasRenderingContext2D | null;
  private currentAnnotationState: IAnnotationState = new DefaultAnnotationState(
    this
  );
  private scaleState = defaultState;

  public componentDidMount = () => {
    const currentCanvas = this.canvasRef.current;
    if (currentCanvas) {
      this.canvas2D = currentCanvas.getContext("2d");
    }
  };

  public calculateMousePosition = (positionX: number, positionY: number) => {
    const { originX, originY, scale } = this.scaleState;
    return {
      positionX: (positionX - originX) / scale,
      positionY: (positionY - originY) / scale
    };
  };

  public calculateShapePosition = (shapeData: IShapeData): IShapeData => {
    const { originX, originY, scale } = this.scaleState;
    const { x, y, width, height } = shapeData;
    return {
      ...shapeData,
      x: x * scale + originX,
      y: y * scale + originY,
      width: width * scale,
      height: height * scale
    };
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
        onWheel={this.onWheel}
      />
    );
  }

  public setAnnotationState = (annotationState: IAnnotationState) => {
    this.currentAnnotationState = annotationState;
  };

  public onShapeChange = () => {
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
          this.calculateShapePosition,
          item.getAnnotationData().id === this.selectedId
        );
      }
    }
  };

  private onMouseDown: MouseEventHandler<HTMLCanvasElement> = event => {
    const { offsetX, offsetY } = event.nativeEvent;
    const { positionX, positionY } = this.calculateMousePosition(
      offsetX,
      offsetY
    );
    this.currentAnnotationState.onMouseDown(positionX, positionY);
  };

  private onMouseMove: MouseEventHandler<HTMLCanvasElement> = event => {
    const { offsetX, offsetY } = event.nativeEvent;
    const { positionX, positionY } = this.calculateMousePosition(
      offsetX,
      offsetY
    );
    this.currentAnnotationState.onMouseMove(positionX, positionY);
  };

  private onMouseUp: MouseEventHandler<HTMLCanvasElement> = () => {
    this.currentAnnotationState.onMouseUp();
  };

  private onWheel = (event: React.WheelEvent<HTMLCanvasElement>) => {
    // https://stackoverflow.com/a/31133823/9071503
    const { clientHeight, scrollTop, scrollHeight } = event.currentTarget;
    if (clientHeight + scrollTop + event.deltaY > scrollHeight) {
      event.preventDefault();
      event.currentTarget.scrollTop = scrollHeight;
    } else if (scrollTop + event.deltaY < 0) {
      event.preventDefault();
      event.currentTarget.scrollTop = 0;
    }

    const { scale: preScale } = this.scaleState;
    this.scaleState.scale += event.deltaY * 0.005;
    if (this.scaleState.scale > 2) {
      this.scaleState.scale = 2;
    }
    if (this.scaleState.scale < 0.4) {
      this.scaleState.scale = 0.4;
    }

    const { originX, originY, scale } = this.scaleState;
    const { offsetX, offsetY } = event.nativeEvent;
    this.scaleState.originX =
      offsetX - ((offsetX - originX) / preScale) * scale;
    this.scaleState.originY =
      offsetY - ((offsetY - originY) / preScale) * scale;

    requestAnimationFrame(this.onShapeChange);

    return false;
  };
}
