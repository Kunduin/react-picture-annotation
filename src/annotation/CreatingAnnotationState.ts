import { ReactPictureAnnotation } from "index";
import { IAnnotationState } from "./AnnotationState";
import { DefaultAnnotationState } from "./DefaultAnnotationState";

export default class CreatingAnnotationState implements IAnnotationState {
  private context: ReactPictureAnnotation;
  constructor(context: ReactPictureAnnotation) {
    this.context = context;
  }
  public onMouseDown = () => undefined;
  public onMouseMove = (positionX: number, positionY: number) => {
    const { shapes } = this.context;
    if (shapes.length > 0) {
      const currentShape = shapes[shapes.length - 1];
      const {
        mark: { x, y }
      } = currentShape.getAnnotationData();
      currentShape.adjustMark({
        width: positionX - x,
        height: positionY - y
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
      this.context.selectedId = null;
      onShapeChange();
    }
    setAnnotationState(new DefaultAnnotationState(this.context));
  };

  public onMouseLeave = () => this.onMouseUp();
}
