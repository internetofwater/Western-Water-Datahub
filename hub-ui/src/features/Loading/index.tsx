/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Progress } from "@mantine/core";
import useSessionStore from "@/stores/session";
import { Info } from "./Info";

const Loading: React.FC = () => {
  const loadingInstances = useSessionStore((state) => state.loadingInstances);

  const hasLoadingInstances = loadingInstances.length > 0;

  return (
    <>
      {hasLoadingInstances && (
        <Info
          loadingTexts={loadingInstances.map((instance) => instance.message)}
        >
          <Progress value={100} size="lg" radius="sm" animated />
        </Info>
      )}
    </>
  );
};

export default Loading;
