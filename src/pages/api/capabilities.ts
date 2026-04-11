import type { APIRoute } from 'astro';
import { jsonResponse } from '@/server/api-response';
import { getRuntimeCapabilities } from '@/server/capabilities';
import { IS_STATIC_BUILD } from '@/server/runtime';

export const prerender = IS_STATIC_BUILD;

export const GET: APIRoute = async () => {
  return jsonResponse(getRuntimeCapabilities());
};
