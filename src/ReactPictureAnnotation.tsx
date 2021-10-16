import React, { MouseEventHandler } from "react";
import { IAnnotation } from "./Annotation";
import { IAnnotationState } from "./annotation/AnnotationState";
import { DefaultAnnotationState } from "./annotation/DefaultAnnotationState";
import DefaultInputSection from "./DefaultInputSection";
// import DeleteButton from "./DeleteButton";
import {
  defaultShapeStyle,
  IShape,
  IShapeBase,
  IShapeStyle,
  RectShape,
} from "./Shape";
import Transformer, { ITransformer } from "./Transformer";

interface IReactPictureAnnotationProps {
  annotationData?: IAnnotation[];
  selectedId?: string | null;
  scrollSpeed: number;
  marginWithInput: number;
  onChange: (annotationData: IAnnotation[]) => void;
  onSelect: (id: string | null) => void;
  width: number;
  height: number;
  image: string;
  annotationStyle: IShapeStyle;
  defaultAnnotationSize?: number[];
  panCode: string;
  inputElement: (
    value: string,
    onChange: (value: string) => void,
    onDelete: () => void
  ) => React.ReactElement;
}

interface IStageState {
  scale: number;
  originX: number;
  originY: number;
}

const defaultState: IStageState = {
  scale: 1,
  originX: 0,
  originY: 0,
};

export default class ReactPictureAnnotation extends React.Component<IReactPictureAnnotationProps> {
  public static defaultProps = {
    marginWithInput: 10,
    scrollSpeed: 0.0005,
    annotationStyle: defaultShapeStyle,
    panCode: "Space",
    inputElement: (
      value: string,
      onChange: (value: string) => void,
      onDelete: () => void
    ) => (
      <DefaultInputSection
        value={value}
        onChange={onChange}
        onDelete={onDelete}
      />
    ),
  };

  public state = {
    inputPosition: {
      left: 0,
      top: 0,
    },
    showInput: false,
    inputComment: "",
    panKeyPressed: false,
    imageScale: defaultState,
  };

  set selectedId(value: string | null) {
    const { onSelect } = this.props;
    this.selectedIdTrueValue = value;
    onSelect(value);
  }

  get selectedId() {
    return this.selectedIdTrueValue;
  }

  get annotationStyle() {
    return this.props.annotationStyle;
  }

  get defaultAnnotationSize() {
    return this.props.defaultAnnotationSize;
  }

  public shapes: IShape[] = [];
  public currentTransformer: ITransformer;

  private currentAnnotationData: IAnnotation[] = [];
  private selectedIdTrueValue: string | null;
  private canvasRef = React.createRef<HTMLCanvasElement>();
  private canvas2D?: CanvasRenderingContext2D | null;
  private imageCanvasRef = React.createRef<HTMLCanvasElement>();
  private imageCanvas2D?: CanvasRenderingContext2D | null;
  private currentImageElement?: HTMLImageElement;
  private mouseDown = false;
  private currentAnnotationState: IAnnotationState = new DefaultAnnotationState(
    this
  );

  public componentDidMount = () => {
    const currentCanvas = this.canvasRef.current;
    const currentImageCanvas = this.imageCanvasRef.current;
    if (currentCanvas && currentImageCanvas) {
      this.setCanvasDPI();

      this.canvas2D = currentCanvas.getContext("2d");
      this.imageCanvas2D = currentImageCanvas.getContext("2d");
      this.onImageChange();
    }

    this.syncAnnotationData();
    this.syncSelectedId();
    document.addEventListener("keydown", this.onPanKeyDown);
    document.addEventListener("keyup", this.onPanKeyUp);
  };

  public componentDidUpdate = (preProps: IReactPictureAnnotationProps) => {
    const { width, height, image } = this.props;
    if (preProps.width !== width || preProps.height !== height) {
      this.setCanvasDPI();
      this.onShapeChange();
      this.onImageChange();
    }
    if (preProps.image !== image) {
      this.cleanImage();
      if (this.currentImageElement) {
        this.currentImageElement.src = image;
      } else {
        this.onImageChange();
      }
    }

    this.syncAnnotationData();
    this.syncSelectedId();
  };

  public componentWillUnmount = () => {
    document.removeEventListener("keydown", this.onPanKeyDown);
    document.removeEventListener("keyup", this.onPanKeyUp);
  };

  public calculateMousePosition = (positionX: number, positionY: number) => {
    const { originX, originY, scale } = this.state.imageScale;
    return {
      positionX: (positionX - originX) / scale,
      positionY: (positionY - originY) / scale,
    };
  };

  public calculateShapePosition = (shapeData: IShapeBase): IShapeBase => {
    const { originX, originY, scale } = this.state.imageScale;
    const { x, y, width, height } = shapeData;
    return {
      x: x * scale + originX,
      y: y * scale + originY,
      width: width * scale,
      height: height * scale,
    };
  };

  public render() {
    const { width, height, inputElement } = this.props;
    const { showInput, inputPosition, inputComment, panKeyPressed } =
      this.state;
    return (
      <div
        className="rp-stage"
        style={{ cursor: panKeyPressed ? "grabbing" : "auto" }}
      >
        <canvas
          style={{ width, height }}
          className="rp-image"
          ref={this.imageCanvasRef}
          width={width * 2}
          height={height * 2}
        />
        <canvas
          className="rp-shapes"
          style={{ width, height }}
          ref={this.canvasRef}
          width={width * 2}
          height={height * 2}
          onMouseDown={this.onMouseDown}
          onMouseMove={this.onMouseMove}
          onMouseUp={this.onMouseUp}
          onMouseLeave={this.onMouseLeave}
          onWheel={this.onWheel}
        />
        {showInput && (
          <div className="rp-selected-input" style={inputPosition}>
            {inputElement(
              inputComment,
              this.onInputCommentChange,
              this.onDelete
            )}
          </div>
        )}
      </div>
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

      let hasSelectedItem = false;

      for (const item of this.shapes) {
        const isSelected = item.getAnnotationData().id === this.selectedId;
        const { x, y, height } = item.paint(
          this.canvas2D,
          this.calculateShapePosition,
          isSelected
        );

        if (isSelected) {
          if (!this.currentTransformer) {
            this.currentTransformer = new Transformer(
              item,
              this.state.imageScale.scale
            );
          }

          hasSelectedItem = true;

          this.currentTransformer.paint(
            this.canvas2D,
            this.calculateShapePosition,
            this.state.imageScale.scale
          );

          this.setState({
            showInput: true,
            inputPosition: {
              left: x,
              top: y + height + this.props.marginWithInput,
            },
            inputComment: item.getAnnotationData().comment || "",
          });
        }
      }

      if (!hasSelectedItem) {
        this.setState({
          showInput: false,
          inputComment: "",
        });
      }
    }

    this.currentAnnotationData = this.shapes.map((item) =>
      item.getAnnotationData()
    );
    const { onChange } = this.props;
    onChange(this.currentAnnotationData);
  };

  private syncAnnotationData = () => {
    const { annotationData } = this.props;
    if (annotationData) {
      const refreshShapesWithAnnotationData = () => {
        this.selectedId = null;
        this.shapes = annotationData.map(
          (eachAnnotationData) =>
            new RectShape(
              eachAnnotationData,
              this.onShapeChange,
              this.annotationStyle
            )
        );
        this.onShapeChange();
      };

      if (annotationData.length !== this.shapes.length) {
        refreshShapesWithAnnotationData();
      } else {
        for (const annotationDataItem of annotationData) {
          const targetShape = this.shapes.find(
            (item) => item.getAnnotationData().id === annotationDataItem.id
          );
          if (targetShape && targetShape.equal(annotationDataItem)) {
            continue;
          } else {
            refreshShapesWithAnnotationData();
            break;
          }
        }
      }
    }
  };

  private syncSelectedId = () => {
    const { selectedId } = this.props;

    if (selectedId && selectedId !== this.selectedId) {
      this.selectedId = selectedId;
      this.onShapeChange();
    }
  };

  private onPanKeyDown = (e: KeyboardEvent) => {
    if (!e.repeat && e.code === this.props.panCode) {
      this.setState({ panKeyPressed: true });
    }
  };
  private onPanKeyUp = (e: KeyboardEvent) => {
    if (e.code === this.props.panCode) {
      this.setState({ panKeyPressed: false });
    }
  };

  private onDelete = () => {
    const deleteTarget = this.shapes.findIndex(
      (shape) => shape.getAnnotationData().id === this.selectedId
    );
    if (deleteTarget >= 0) {
      this.shapes.splice(deleteTarget, 1);
      this.onShapeChange();
    }
  };

  private setCanvasDPI = () => {
    const currentCanvas = this.canvasRef.current;
    const currentImageCanvas = this.imageCanvasRef.current;
    if (currentCanvas && currentImageCanvas) {
      const currentCanvas2D = currentCanvas.getContext("2d");
      const currentImageCanvas2D = currentImageCanvas.getContext("2d");
      if (currentCanvas2D && currentImageCanvas2D) {
        currentCanvas2D.scale(2, 2);
        currentImageCanvas2D.scale(2, 2);
      }
    }
  };

  private onInputCommentChange = (comment: string) => {
    const selectedShapeIndex = this.shapes.findIndex(
      (item) => item.getAnnotationData().id === this.selectedId
    );
    this.shapes[selectedShapeIndex].setComment(comment);
    this.setState({ inputComment: comment });
  };

  private cleanImage = () => {
    if (this.imageCanvas2D && this.imageCanvasRef.current) {
      this.imageCanvas2D.clearRect(
        0,
        0,
        this.imageCanvasRef.current.width,
        this.imageCanvasRef.current.height
      );
    }
  };

  private onImageChange = () => {
    this.cleanImage();
    if (this.imageCanvas2D && this.imageCanvasRef.current) {
      if (this.currentImageElement) {
        const { originX, originY, scale } = this.state.imageScale;
        this.imageCanvas2D.drawImage(
          this.currentImageElement,
          originX,
          originY,
          this.currentImageElement.width * scale,
          this.currentImageElement.height * scale
        );
      } else {
        const nextImageNode = document.createElement("img");
        nextImageNode.addEventListener("load", () => {
          this.currentImageElement = nextImageNode;
          const { width, height } = nextImageNode;
          const imageNodeRatio = height / width;
          const { width: canvasWidth, height: canvasHeight } = this.props;
          const canvasNodeRatio = canvasHeight / canvasWidth;
          if (!isNaN(imageNodeRatio) && !isNaN(canvasNodeRatio)) {
            if (imageNodeRatio < canvasNodeRatio) {
              const scale = canvasWidth / width;
              this.setState({
                imageScale: {
                  originX: 0,
                  originY: (canvasHeight - scale * height) / 2,
                  scale,
                },
              });
            } else {
              const scale = canvasHeight / height;
              this.setState({
                imageScale: {
                  originX: (canvasWidth - scale * width) / 2,
                  originY: 0,
                  scale,
                },
              });
            }
          }
          this.onImageChange();
          this.onShapeChange();
        });
        nextImageNode.alt = "";
        nextImageNode.src = this.props.image;
      }
    }
  };

  private onMouseDown: MouseEventHandler<HTMLCanvasElement> = (event) => {
    const { offsetX, offsetY } = event.nativeEvent;
    const { positionX, positionY } = this.calculateMousePosition(
      offsetX,
      offsetY
    );
    this.mouseDown = true;
    if (this.state.panKeyPressed) return;
    this.currentAnnotationState.onMouseDown(positionX, positionY);
  };

  private onMouseMove: MouseEventHandler<HTMLCanvasElement> = (event) => {
    const { movementX, movementY, offsetX, offsetY } = event.nativeEvent;
    const { imageScale, panKeyPressed } = this.state;
    if (panKeyPressed && this.mouseDown) {
      this.setState({
        imageScale: {
          ...imageScale,
          originX: imageScale.originX + movementX,
          originY: imageScale.originY + movementY,
        },
      });
      requestAnimationFrame(() => {
        this.onShapeChange();
        this.onImageChange();
      });
      return;
    }
    const { positionX, positionY } = this.calculateMousePosition(
      offsetX,
      offsetY
    );
    this.currentAnnotationState.onMouseMove(positionX, positionY);
  };

  private onMouseUp: MouseEventHandler<HTMLCanvasElement> = () => {
    this.mouseDown = false;
    this.currentAnnotationState.onMouseUp();
  };

  private onMouseLeave: MouseEventHandler<HTMLCanvasElement> = () => {
    this.currentAnnotationState.onMouseLeave();
  };

  private onWheel = (event: React.WheelEvent<HTMLCanvasElement>) => {
    // https://stackoverflow.com/a/31133823/9071503
    const { clientHeight, scrollTop, scrollHeight } = event.currentTarget;
    if (clientHeight + scrollTop + event.deltaY > scrollHeight) {
      // event.preventDefault();
      event.currentTarget.scrollTop = scrollHeight;
    } else if (scrollTop + event.deltaY < 0) {
      // event.preventDefault();
      event.currentTarget.scrollTop = 0;
    }

    const { originX, originY, scale } = this.state.imageScale;
    let newScale = scale + event.deltaY * this.props.scrollSpeed;
    if (newScale > 10) {
      newScale = 10;
    }
    if (newScale < 0.1) {
      newScale = 0.1;
    }
    const { offsetX, offsetY } = event.nativeEvent;
    const newOriginX = offsetX - ((offsetX - originX) / scale) * newScale;
    const newOriginY = offsetY - ((offsetY - originY) / scale) * newScale;

    this.setState({
      imageScale: { scale: newScale, originX: newOriginX, originY: newOriginY },
    });

    requestAnimationFrame(() => {
      this.onShapeChange();
      this.onImageChange();
    });
  };
}
