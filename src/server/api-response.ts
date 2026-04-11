export function jsonResponse(payload: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json; charset=utf-8');
  }

  return new Response(JSON.stringify(payload), {
    ...init,
    headers,
  });
}

export function errorJsonResponse(message: string, status: number) {
  return jsonResponse(
    { error: message },
    { status },
  );
}
