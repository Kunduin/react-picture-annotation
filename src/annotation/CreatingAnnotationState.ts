import { ReactPictureAnnotation } from "index";
import { IShape } from "Shape";
import { IAnnotationState } from "./AnnotationState";
import { DefaultAnnotationState } from "./DefaultAnnotationState";

export default class CreatingAnnotationState implements IAnnotationState {
  private readonly context: ReactPictureAnnotation;
  constructor(context: ReactPictureAnnotation) {
    this.context = context;
  }
  public onMouseDown = () => undefined;
  public onMouseMove = (positionX: number, positionY: number) => {
    const { shapes } = this.context;
    if (shapes.length > 0) {
      const currentShape = shapes[shapes.length - 1];
      const {
        mark: { x, y },
      } = currentShape.getAnnotationData();
      currentShape.adjustMark({
        width: positionX - x,
        height: positionY - y,
      });
    }
  };

  public onMouseUp = () => {
    const { shapes, onShapeChange, setAnnotationState } = this.context;
    const data = shapes.pop();
    if (
      data &&
      data.getAnnotationData().mark.width !== 0 &&
      data.getAnnotationData().mark.height !== 0
    ) {
      shapes.push(data);
    } else {
      if (data && this.applyDefaultAnnotationSize(data)) {
        shapes.push(data);
        onShapeChange();
      } else {
        this.context.selectedId = null;
        onShapeChange();
      }
    }
    setAnnotationState(new DefaultAnnotationState(this.context));
  };

  private applyDefaultAnnotationSize = (shape: IShape) => {
    if (this.context.selectedId) {
      // Don't capture clicks meant to de-select another annotation.
      return false;
    }
    if (
      !this.context.defaultAnnotationSize ||
      this.context.defaultAnnotationSize.length !== 2
    ) {
      return false;
    }
    const [width, height] = this.context.defaultAnnotationSize;
    shape.adjustMark({
      width,
      height,
    });
    return true;
  };

  public onMouseLeave = () => this.onMouseUp();
}
