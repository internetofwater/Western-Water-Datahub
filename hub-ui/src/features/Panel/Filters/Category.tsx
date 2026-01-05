/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { useEffect, useRef, useState } from "react";
import {
  ComboboxData,
  Group,
  Loader,
  Select,
  Stack,
  Text,
  Title,
  VisuallyHidden,
} from "@mantine/core";
import Info from "@/assets/Info";
import Tooltip from "@/components/Tooltip";
import styles from "@/features/Panel/Panel.module.css";
import loadingManager from "@/managers/Loading.init";
import notificationManager from "@/managers/Notification.init";
import wwdhService from "@/services/init/wwdh.init";
import useMainStore from "@/stores/main";
import { ELoadingType, ENotificationType } from "@/stores/session/types";

export const Category: React.FC = () => {
  const category = useMainStore((state) => state.category);
  const setCategory = useMainStore((state) => state.setCategory);

  const provider = useMainStore((state) => state.provider);

  const [categoryOptions, setCategoryOptions] = useState<ComboboxData>([]);
  const [isLoading, setIsLoading] = useState(false);

  const controller = useRef<AbortController>(null);
  const isMounted = useRef(true);

  const getCategoryOptions = async () => {
    const loadingInstance = loadingManager.add(
      "Fetching category dropdown options",
      ELoadingType.Data,
    );

    try {
      setIsLoading(true);
      controller.current = new AbortController();

      const { parameterGroups } = await wwdhService.getCollections({
        params: {
          "parameter-name": "*",
          ...(provider ? { "provider-name": provider } : {}),
        },
      });

      const categoryOptions: ComboboxData = parameterGroups
        .map((parameterGroup) => ({
          value: parameterGroup.label,
          label: parameterGroup.label,
        }))
        .filter(
          (parameterName, index, categoryOptions) =>
            categoryOptions
              .map(({ value }) => value)
              .indexOf(parameterName.value) === index,
        )
        .sort((a, b) => a.label.localeCompare(b.label));

      if (isMounted.current) {
        if (
          !parameterGroups.some(
            (parameterGroup) => parameterGroup.label === category?.value,
          )
        ) {
          setCategory(null);
        }

        loadingManager.remove(loadingInstance);
        setCategoryOptions(categoryOptions);
        setIsLoading(false);
      }
    } catch (error) {
      if (
        (error as Error)?.name === "AbortError" ||
        (typeof error === "string" && error === "Component unmount")
      ) {
        console.log("Fetch request canceled");
      } else if ((error as Error)?.message) {
        const _error = error as Error;
        notificationManager.show(
          `Error: ${_error.message}`,
          ENotificationType.Error,
          10000,
        );
      }
      if (loadingInstance) {
        loadingManager.remove(loadingInstance);
      }
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
      if (controller.current) {
        controller.current.abort("Component unmount");
      }
    };
  }, []);

  useEffect(() => {
    void getCategoryOptions();
  }, [provider]);

  const helpText = (
    <>
      <Text size="sm">
        Choose a data category to narrow down the available collections.
        Categories group collection by type or theme (e.g., reservoir storage,
        atmospheric measurements, water constituents).
      </Text>
      <br />
      <Text size="sm">
        This helps you focus on collections relevant to a domain of interest.
      </Text>
    </>
  );

  return (
    <Stack gap={0}>
      <Tooltip multiline label={helpText}>
        <Group className={styles.filterTitleWrapper} gap="xs">
          <Title order={2} size="h4">
            Filter Collections by Data Category
          </Title>
          <Info />
        </Group>
      </Tooltip>
      <VisuallyHidden>{helpText}</VisuallyHidden>
      <Select
        size="xs"
        label="Category"
        description={
          provider
            ? `Showing categories available for provider: ${provider}`
            : null
        }
        placeholder="Select..."
        data={categoryOptions}
        value={category?.value}
        onChange={(_value, option) => setCategory(option)}
        disabled={categoryOptions.length === 0 || isLoading}
        searchable
        clearable
      />
      {isLoading && (
        <Group>
          <Loader color="blue" type="dots" />
          <Text size="sm">Updating Categories</Text>
        </Group>
      )}
    </Stack>
  );
};
