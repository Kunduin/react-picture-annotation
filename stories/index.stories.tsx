import { withA11y } from "@storybook/addon-a11y";
import { storiesOf, StoryDecorator } from "@storybook/react";
import React, { useEffect, useState } from "react";

import { ReactPictureAnnotation } from "../src";

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

      const onResize = () => {
        setSize({ width: window.innerWidth, height: window.innerHeight });
      };

      useEffect(() => {
        window.addEventListener("resize", onResize);
        return () => {
          window.removeEventListener("resize", onResize);
        };
      }, []);

      return (
        // tslint:disable-next-line: jsx-no-lambda
        <ReactPictureAnnotation
          width={size.width}
          height={size.height}
          // tslint:disable-next-line: jsx-no-lambda
          onChange={() => null}
          // tslint:disable-next-line: jsx-no-lambda
          onSelect={() => null}
          image="https://bequank.oss-cn-beijing.aliyuncs.com/landpage/large/60682895_p0_master1200.jpg"
        />
      );
    };

    return <AnnotationComponent />;
  });
