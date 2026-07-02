export default {
  async fetch(request, env, ctx) {
    console.info({ message: 'Hello World Worker received a request!' });

    const result = await env.AI.run(
      "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
      {
        prompt: "What is the origin of the phrase Hello, World",
      }
    );

    return new Response(result.response, {
      headers: { "content-type": "text/plain" },
    });
  }
};
