# React Picture Annotation

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/kunduin/react-picture-annotation/blob/master/LICENSE) [![Travis (.com)](https://img.shields.io/travis/com/kunduin/react-picture-annotation.svg)](https://travis-ci.com/Kunduin/react-picture-annotation) [![npm](https://img.shields.io/npm/v/react-picture-annotation.svg)](https://www.npmjs.com/package/react-picture-annotation)

A simple annotation component.

![rect](./doc/rect.gif)

## Install

```Bash
# npm
npm install react-picture-annotation

# yarn
yarn add react-picture-annotation
```

## Basic Example

[![Edit react-picture-annotation-example](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/react-picture-annotation-example-cw49e?fontsize=14)

```jsx
const App = () => {
  const [pageSize, setPageSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  const onResize = () => {
    setPageSize({ width: window.innerWidth, height: window.innerHeight });
  };

  useEffect(() => {
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const onSelect = selectedId => console.log(selectedId);
  const onChange = data => console.log(data);

  return (
    <div className="App">
      <ReactPictureAnnotation
        image="https://source.unsplash.com/random/800x600"
        onSelect={onSelect}
        onChange={onChange}
        width={pageSize.width}
        height={pageSize.height}
      />
    </div>
  );
};

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);
```

## ReactPictureAnnotation Props

| Name                  | Type                                                                                            | Comment                                    | required |
| --------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------ | -------- |
| onChange              | `(annotationData: IAnnotation[]) => void`                                                       | Called every time the shape changes.       | √        |
| onSelected            | `(id: string or null) => void`                                                                  | Called each time the selection is changed. | √        |
| width                 | `number`                                                                                        | Width of the canvas.                       | √        |
| height                | `number`                                                                                        | Height of the canvas.                      | √        |
| image                 | `string`                                                                                        | Image to be annotated.                     | √        |
| inputElement          | `(value: string,onChange: (value: string) => void,onDelete: () => void) => React.ReactElement;` | Customizable input control.                | X        |
| annotationData        | `Array<IAnnotation>`                                                                            | Control the marked areas on the page.      | X        |
| annotationStyle       | `IShapeStyle`                                                                                   | Control the mark style                     | X        |
| selectedId            | `string or null`                                                                                | Selected markId                            | X        |
| scrollSpeed           | `number`                                                                                        | Speed of wheel zoom, default 0.0005        | X        |
| marginWithInput       | `number`                                                                                        | Margin between input and mark, default 1   | X        |
| defaultAnnotationSize | `number[]`                                                                                      | Size for annotations created by clicking.  | X        |

## IShapeStyle

ReactPictureAnnotation can be easily modified the style through a prop named `annotationStyle`                                                                                      

```typescript
export const defaultShapeStyle: IShapeStyle = {
  /** text area **/
  padding: 5, // text padding
  fontSize: 12, // text font size
  fontColor: "#212529", // text font color
  fontBackground: "#f8f9fa", // text background color
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', Helvetica, Arial, sans-serif",
  
  /** stroke style **/
  lineWidth: 2, // stroke width
  shapeBackground: "hsla(210, 16%, 93%, 0.2)", // background color in the middle of the marker
  shapeStrokeStyle: "#f8f9fa", // shape stroke color
  shadowBlur: 10, // stroke shadow blur
  shapeShadowStyle: "hsla(210, 9%, 31%, 0.35)", // shape shadow color
  
  /** transformer style **/
  transformerBackground: "#5c7cfa",
  transformerSize: 10
};
```

## IAnnotation

```js
{
  id:"to identify this shape",    // required,
  comment:"string type comment",  // not required
  mark:{
    type:"RECT",                  // now only support rect

    // The number of pixels in the upper left corner of the image
    x:0,
    y:0,

    // The size of tag
    width:0,
    height:0
  }
}
```

## Licence

[MIT License](https://github.com/kunduin/react-picture-annotation/blob/master/LICENSE)
