/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import wwdhService from '@/services/init/wwdh.init';
import { NextRequest } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const searchParams = request.nextUrl.searchParams;
    const id = (await params).id;
    const result = await wwdhService.getLocation('rise-edr', id, {
        params: {
            'parameter-name': searchParams.get('parameter-name') ?? '',
        },
        headers: {
            Accept: 'application/json',
        },
    });

    // e.g. Query a database for user with ID `id`
    return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}
