export interface IAnnotationState {
  onMouseDown: (positionX: number, positionY: number) => void;
  onMouseMove: (positionX: number, positionY: number) => void;
  onMouseUp: () => void;
}
