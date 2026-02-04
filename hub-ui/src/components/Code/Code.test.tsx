/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { render, screen } from "@test-utils";
import { fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Code from "@/components/Code";

describe("Code", () => {
  beforeAll(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  const sampleCode = `curl -X GET https://api.com?coords=POLYGON(...)&datetime=2020-02-03/2021-02-03 \n
  -H "Content-Type: application/json"`;

  it("renders the code block with correct content", () => {
    render(<Code code={sampleCode} />);
    const pre = screen.getByTestId("code-block");
    expect(pre.innerHTML).toMatch(/curl -X GET/);
  });

  it("renders the copy button with initial icon", () => {
    render(<Code code={sampleCode} />);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("changes icon after copy", async () => {
    render(<Code code={sampleCode} />);
    const button = screen.getByRole("button");

    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByTestId("check")).toBeInTheDocument();
    });
  });

  it("applies correct size class", () => {
    render(<Code code={sampleCode} size="lg" />);
    const wrapper = screen.getByTestId("code-copy");
    expect(wrapper?.className).toMatch(/lg/);
  });
});
