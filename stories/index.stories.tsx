import { withA11y } from "@storybook/addon-a11y";
import { storiesOf, StoryDecorator } from "@storybook/react";
import React, { useEffect, useState } from "react";

import { ReactPictureAnnotation } from "../src";
import { IAnnotation } from "../src/Annotation";
import { IShapeData } from "../src/Shape";

const CenterDecorator: StoryDecorator = storyFn => <div>{storyFn()}</div>;

storiesOf("Hello World", module)
  .addDecorator(withA11y)
  .addDecorator(CenterDecorator)
  .add("with text", () => {
    const AnnotationComponent = () => {
      const [size, setSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight
      });

      const [image, setImage] = useState(
        "https://bequank.oss-cn-beijing.aliyuncs.com/landpage/large/60682895_p0_master1200.jpg"
      );

      const [annotationData, setAnnotationData] = useState<
        Array<IAnnotation<IShapeData>>
      >([]);

      const onResize = () => {
        setSize({ width: window.innerWidth, height: window.innerHeight });
      };

      useEffect(() => {
        window.addEventListener("resize", onResize);
        setTimeout(() => {
          setImage(
            "https://bequank.oss-cn-beijing.aliyuncs.com/landpage/large/20180904.jpg"
          );
          setAnnotationData([]);
        }, 2000);
        return () => {
          window.removeEventListener("resize", onResize);
        };
      }, []);

      return (
        // tslint:disable-next-line: jsx-no-lambda
        <ReactPictureAnnotation
          width={size.width}
          height={size.height}
          annotationData={annotationData}
          // tslint:disable-next-line: jsx-no-lambda
          onChange={data => setAnnotationData(data)}
          // tslint:disable-next-line: jsx-no-lambda
          onSelect={() => null}
          image={image}
        />
      );
    };

    return <AnnotationComponent />;
  });
