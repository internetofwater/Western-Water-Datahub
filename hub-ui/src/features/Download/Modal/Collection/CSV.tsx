/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Button } from "@mantine/core";
import styles from "@/features/Download/Download.module.css";
import { buildUrl } from "@/features/Download/Modal/utils";
import { ICollection } from "@/services/edr.service";
import { Location } from "@/stores/main/types";

type Props = {
  instanceId: number;
  collectionId: ICollection["id"];
  locationId: Location["id"];
  parameters: string[];
  from: string | null;
  to: string | null;
};

export const CSV: React.FC<Props> = (props) => {
  const { collectionId, locationId, parameters, from, to } = props;
  const handleClick = () => {
    const url = buildUrl(collectionId, locationId, parameters, from, to, true);

    const anchor = document.createElement("a");
    anchor.href = url.toString();
    anchor.download = `data-${locationId}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  return (
    <Button className={styles.csvButton} onClick={handleClick}>
      Get CSV
    </Button>
  );
};
