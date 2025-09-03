/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import { useEffect, useRef, useState } from "react";
import {
  ComboboxData,
  Group,
  Select,
  Stack,
  Title,
  Tooltip,
  VisuallyHidden,
} from "@mantine/core";
import Info from "@/assets/Info";
import styles from "@/features/Panel/Panel.module.css";
import loadingManager from "@/managers/Loading.init";
import notificationManager from "@/managers/Notification.init";
import wwdhService from "@/services/init/wwdh.init";
import useMainStore from "@/stores/main";
import { LoadingType, NotificationType } from "@/stores/session/types";

export const Category: React.FC = () => {
  const category = useMainStore((state) => state.category);
  const setCategory = useMainStore((state) => state.setCategory);

  const provider = useMainStore((state) => state.provider);

  const [categoryOptions, setCategoryOptions] = useState<ComboboxData>([]);

  const controller = useRef<AbortController>(null);
  const isMounted = useRef(true);
  const loadingInstance = useRef<string>(null);

  const getCategoryOptions = async () => {
    loadingInstance.current = loadingManager.add(
      "Fetching category dropdown options",
      LoadingType.Collections,
    );

    try {
      controller.current = new AbortController();

      const { collections } = await wwdhService.getCollections({
        params: {
          ...(provider ? { "provider-name": provider } : {}),
          "parameter-name": category ? category.value : "*",
        },
      });

      const categoryOptions: ComboboxData = collections
        .flatMap((collection) =>
          Object.values(collection.parameter_names).map((parameterName) => ({
            value: parameterName.id,
            label: parameterName.name,
          })),
        )
        .filter(
          (parameterName, index, categoryOptions) =>
            categoryOptions
              .map(({ value }) => value)
              .indexOf(parameterName.value) === index,
        );

      if (isMounted.current) {
        loadingInstance.current = loadingManager.remove(
          loadingInstance.current,
        );
        setCategoryOptions(categoryOptions);
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
          NotificationType.Error,
          10000,
        );
      }
      if (loadingInstance.current) {
        loadingInstance.current = loadingManager.remove(
          loadingInstance.current,
        );
      }
    }
  };

  useEffect(() => {
    isMounted.current = true;
    void getCategoryOptions();
    return () => {
      isMounted.current = false;
      if (controller.current) {
        controller.current.abort("Component unmount");
      }
    };
  }, []);

  const helpText = "Data Category tooltip placeholder";

  return (
    <Stack gap={0}>
      {/* TODO */}
      <Tooltip
        label={helpText}
        transitionProps={{ transition: "fade-right", duration: 300 }}
        position="top-start"
      >
        <Group className={styles.filterTitleWrapper} gap="xs">
          <Title order={2} size="h3">
            Filter by Data Category
          </Title>
          <Info />
        </Group>
      </Tooltip>
      <VisuallyHidden>{helpText}</VisuallyHidden>
      <Select
        size="sm"
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
        disabled={
          categoryOptions.length === 0 || Boolean(loadingInstance.current)
        }
        searchable
        clearable
      />
    </Stack>
  );
};
