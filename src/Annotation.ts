import { IShapeData } from "Shape";

export interface IAnnotation<T = IShapeData> {
  comment?: string;
  id: string;
  mark: T;
}
