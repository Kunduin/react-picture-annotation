import { withA11y } from "@storybook/addon-a11y";
import { storiesOf, StoryDecorator } from "@storybook/react";
import React from "react";

import { ReactPictureAnnotation } from "../src";

const CenterDecorator: StoryDecorator = storyFn => <div>{storyFn()}</div>;

storiesOf("Hello World", module)
  .addDecorator(withA11y)
  .addDecorator(CenterDecorator)
  .add("with text", () => (
    // tslint:disable-next-line: jsx-no-lambda
    <ReactPictureAnnotation
      width={window.innerWidth}
      height={window.innerHeight}
      // tslint:disable-next-line: jsx-no-lambda
      onChange={() => null}
      // tslint:disable-next-line: jsx-no-lambda
      onSelect={() => null}
    />
  ));
