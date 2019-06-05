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
    const { setAnnotationState } = this.context;
    setAnnotationState(new DefaultAnnotationState(this.context));
  };
}
