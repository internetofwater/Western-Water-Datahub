/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { Progress } from '@mantine/core';
import { Info } from '@/features/Loading/Info';
import useSessionStore from '@/stores/session';

type Props = {
  desktop: boolean;
};

const Loading: React.FC<Props> = (props) => {
  const { desktop } = props;

  const loadingInstances = useSessionStore((state) => state.loadingInstances);

  const hasLoadingInstances = loadingInstances.length > 0;

  return (
    <>
      {hasLoadingInstances && (
        <Info loadingTexts={loadingInstances.map((instance) => instance.message)} desktop={desktop}>
          <Progress value={100} size="lg" radius={0} animated />
        </Info>
      )}
    </>
  );
};

export default Loading;
