export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api")) {
      // Handle API endpoints here
    }

    // Static files (index.html, CSS, JS) are served automatically.
    return env.ASSETS.fetch(request);
  },
};
