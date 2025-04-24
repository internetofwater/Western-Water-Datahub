import edrService from '@/services/edr.init';
import { NextRequest } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const searchParams = request.nextUrl.searchParams;
    const id = (await params).id;
    const result = await edrService.getLocation('rise-edr', id, {
        params: {
            'parameter-name': searchParams.get('parameter-name') ?? '',
        },
    });

    // e.g. Query a database for user with ID `id`
    return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}
