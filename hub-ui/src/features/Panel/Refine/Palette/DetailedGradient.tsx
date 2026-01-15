/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from "react";
import { ExpressionSpecification } from "mapbox-gl";
import { Gradient } from "@/features/Panel/Refine/Palette/Gradient";
import mainManager from "@/managers/Main.init";
import { TLayer } from "@/stores/main/types";
import { createColorRange } from "@/utils/colors";
import { PaletteDefinition } from "@/utils/colors/types";
import { getLabel } from "@/utils/parameters";

type Props = {
  collectionId: TLayer["collectionId"];
  color: ExpressionSpecification;
  paletteDefinition: PaletteDefinition;
};

export const DetailedGradient: React.FC<Props> = (props) => {
  const { collectionId, color, paletteDefinition } = props;

  const [label, setLabel] = useState<string>(
    paletteDefinition?.parameter ?? "",
  );
  const [left, setLeft] = useState("Less");
  const [right, setRight] = useState("More");

  useEffect(() => {
    // Get values from expression, example:
    // [
    //     "step",
    //     ["number", ["at", 0, ["get", "tmx"]], 0],
    //     "#f1eef6",
    //     8.04,
    //     "#bdc9e1",
    //     10.9839,
    //     "#74a9cf",
    //     15.26,
    //     "#2b8cbe",
    //     18.75,
    //     "#045a8d",
    // ];

    const min = color[3];
    if (min && typeof min === "number") {
      const left = `< ${min.toFixed(2)}`;
      setLeft(left);
    }

    const max = color[color.length - 2];
    if (max && typeof max === "number") {
      const right = `>= ${max.toFixed(2)}`;
      setRight(right);
    }
  }, [color]);

  useEffect(() => {
    const collection = mainManager.getCollection(collectionId);
    if (collection) {
      const label = getLabel(collection, paletteDefinition.parameter);

      if (label) {
        setLabel(label);
      }
    }
  }, [collectionId]);

  return (
    <Gradient
      label={label}
      colors={createColorRange(
        paletteDefinition.count,
        paletteDefinition.palette,
      )}
      left={left}
      right={right}
    />
  );
};
