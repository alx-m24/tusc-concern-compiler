const HTML_PAGE = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>TUSC Concern Compiler API</title>
</head>
<body>
  <h1>API only worker</h1>
</body>
</html>`;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json",
      ...CORS_HEADERS,
    },
  });
}

async function handleApi(request, env, url) {
  const path = url.pathname;
  const method = request.method;

  // ------------------------------------------------------------
  // POST /api/llm
  // Body:
  // {
  //   "prompt": "..."
  // }
  // ------------------------------------------------------------

  if (path === "/api/llm" && method === "POST") {
    let body;

    try {
      body = await request.json();
    } catch {
      return json({ error: "Invalid JSON" }, 400);
    }

    if (typeof body.prompt !== "string") {
      return json({ error: "Missing or invalid 'prompt'" }, 400);
    }

    const result = await env.AI.run(
      "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
      {
        messages: [
          {
            role: "user",
            content: body.prompt,
          },
        ],
        temperature: 0,
      }
    );

    return json(result);
  }

  // ------------------------------------------------------------
  // POST /api/d1
  // Body:
  // {
  //   "sql": "SELECT * FROM Department WHERE DepartmentID = ?",
  //   "params": [1]
  // }
  // ------------------------------------------------------------

  if (path === "/api/d1" && method === "POST") {
    let body;

    try {
      body = await request.json();
    } catch {
      return json({ error: "Invalid JSON" }, 400);
    }

    if (typeof body.sql !== "string") {
      return json({ error: "Missing or invalid 'sql'" }, 400);
    }

    const params = Array.isArray(body.params)
      ? body.params
      : [];

    try {
      const result = await env.DB
        .prepare(body.sql)
        .bind(...params)
        .all();

      return json(result);
    } catch (error) {
      return json({
        error: "D1 query failed",
        message: error instanceof Error
          ? error.message
          : String(error),
      }, 400);
    }
  }

  return json({ error: "Not found" }, 404);
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: CORS_HEADERS,
      });
    }

    if (url.pathname.startsWith("/api/")) {
      return handleApi(request, env, url);
    }

    return new Response(HTML_PAGE, {
      headers: {
        "content-type": "text/html;charset=UTF-8",
      },
    });
  },
};
