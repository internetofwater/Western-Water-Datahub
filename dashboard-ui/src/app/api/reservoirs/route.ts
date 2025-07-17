/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import wwdhService from '@/services/init/wwdh.init';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const result = await wwdhService.getLocations('rise-edr', {
        params: {
            'parameter-name': searchParams.get('parameter-name') ?? '',
        },
    });

    return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' },
    });
}
