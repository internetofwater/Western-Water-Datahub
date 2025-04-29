/**
 * Copyright 2025 Lincoln Institute of Land Policy
 * SPDX-License-Identifier: MIT
 */

import edrService from '@/services/edr.init';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const result = await edrService.getLocations('rise-edr', {
        params: {
            'parameter-name': searchParams.get('parameter-name') ?? '',
        },
    });

    return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' },
    });
}
