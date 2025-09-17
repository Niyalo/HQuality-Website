import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Minimal middleware that is a no-op. Next.js requires an exported `middleware` function
// or a default export. Keep this file intentionally simple so it doesn't alter app behavior.
export function middleware(_req: NextRequest) {
	// Keep _req referenced to avoid unused variable lints
	void _req;
	return NextResponse.next();
}

export const config = {
	// Apply to all routes by default; adjust matcher if you only need specific paths
	matcher: '/:path*',
};
