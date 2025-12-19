/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import Code from "@/components/Code";

export default {
  title: "Code",
};
const code = `curl -X GET https://api.com?coords=POLYGON(...)&datetime=2020-02-03/2021-02-03 \n
-H "Content-Type: application/json"`;

export const Usage = () => <Code code={code} />;
