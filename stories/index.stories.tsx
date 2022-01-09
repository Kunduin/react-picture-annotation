import { withA11y } from "@storybook/addon-a11y";
import { addDecorator, storiesOf } from "@storybook/react";
import React, { useEffect, useState } from "react";

import {
  DefaultInputSection,
  defaultShapeStyle,
  ReactPictureAnnotation,
} from "../src";
import { IAnnotation } from "../src/Annotation";
import { IShapeData } from "../src/Shape";

addDecorator((storyFn) => <div>{storyFn()}</div>);

storiesOf("Hello World", module)
  .addDecorator(withA11y)
  .add("with text", () => {
    const AnnotationComponent = () => {
      const [size, setSize] = useState({
        width: window.innerWidth - 16,
        height: window.innerHeight - 16,
      });

      const [annotationData, setAnnotationData] = useState<
        IAnnotation<IShapeData>[]
      >([
        {
          id: "a",
          comment: "HA HA HA",
          mark: {
            type: "RECT",
            width: 161,
            height: 165,
            x: 229,
            y: 92,
          },
        },
      ]);

      const [selectedId, setSelectedId] = useState<string | null>("a");

      const onResize = () => {
        setSize({
          width: window.innerWidth - 16,
          height: window.innerHeight - 16,
        });
      };

      useEffect(() => {
        window.addEventListener("resize", onResize);
        return () => {
          window.removeEventListener("resize", onResize);
        };
      }, []);

      const onSelectNextClick = () => {
        let i = 0;
        let annotationId = "";
        while (i < annotationData.length) {
          if (annotationData[i].id === selectedId) {
            if (i + 1 < annotationData.length) {
              annotationId = annotationData[i + 1].id;
            } else {
              annotationId = annotationData[0].id;
            }
          }
          i += 1;
        }
        setSelectedId(annotationId);
      };

      return (
        <div>
          <input
            value={"Select next"}
            type={"button"}
            onClick={onSelectNextClick}
          />
          <ReactPictureAnnotation
            width={size.width}
            height={size.height}
            annotationData={annotationData}
            onChange={(data) => setAnnotationData(data)}
            selectedId={selectedId}
            onSelect={(e) => setSelectedId(e)}
            annotationStyle={{
              ...defaultShapeStyle,
              shapeStrokeStyle: "#2193ff",
              transformerBackground: "black",
            }}
            defaultAnnotationSize={[120, 90]}
            image="https://bequank.oss-cn-beijing.aliyuncs.com/landpage/large/60682895_p0_master1200.jpg"
            inputElement={(value, onChange, onDelete) => (
              <DefaultInputSection
                placeholder={"Hello world"}
                {...{ value, onChange, onDelete }}
              />
            )}
          />
        </div>
      );
    };

    return <AnnotationComponent />;
  });
