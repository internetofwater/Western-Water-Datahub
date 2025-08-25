/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: Apache-2.0
 */

import { render, screen } from '@test-utils';
import { fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import CopyInput from '@/components/CopyInput';

describe('CopyInput', () => {
  beforeAll(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  const testUrl = 'https://example.com';

  it('renders the URL and copy button', () => {
    render(<CopyInput url={testUrl} />);
    expect(screen.getByText(testUrl)).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('copies the URL and shows check icon', async () => {
    render(<CopyInput url={testUrl} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByTestId('check')).toBeInTheDocument();
    });
  });
});
