# React Picture Annotation

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/kunduin/react-picture-annotation/blob/master/LICENSE) [![Travis (.com)](https://img.shields.io/travis/com/kunduin/react-picture-annotation.svg)](https://travis-ci.com/Kunduin/react-picture-annotation) [![npm](https://img.shields.io/npm/v/react-picture-annotation.svg)](https://www.npmjs.com/package/react-picture-annotation) [![Greenkeeper badge](https://badges.greenkeeper.io/Kunduin/react-picture-annotation.svg)](https://greenkeeper.io/)

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

## Props

### AnnotationData `not required`

**TYPE**

```ts
Array<IAnnotation>
```

see [IAnnotation](#iannotation)

**COMMENT**

Control the marked areas on the page.

### selectedId `not required`

**TYPE**

```ts
string | null;
```

**COMMENT**

Control the selected shape.

### onChange `required`

**TYPE**

```ts
(annotationData: IAnnotation[]) => void
```

**COMMENT**

Called every time the shape changes.

### onSelected `required`

**TYPE**

```ts
(id: string | null) => void
```

**COMMENT**

Called each time the selection is changed.

### width `required`

**TYPE**

```ts
number;
```

**COMMENT**

Width of the canvas.

### height `required`

**TYPE**

```ts
number;
```

**COMMENT**

Height of the canvas.

### image `required`

**TYPE**

```ts
string;
```

**COMMENT**

Image to be annotated.

### inputElement `not required`

**TYPE**

```ts
(value: string, onChange: (value: string) => void, onDelete: () => void) =>
  React.ReactElement;
```

**COMMENT**

Customizable input control.

**EXAMPLE**

```jsx
<ReactPictureAnnotation
  {...props}
  inputElement={inputProps => <MyInput {...inputProps} />}
/>
```

## Types

### IAnnotation

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
