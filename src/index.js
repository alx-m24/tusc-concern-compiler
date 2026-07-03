export default {
  async fetch(request, env, ctx) {
    const { results } = await env.DB.prepare(
      "SELECT * FROM Department"
    ).all();

    // Build column headers from the keys of the first row
    const headers = Object.keys(results[0]);
    const colWidths = headers.map((h) =>
      Math.max(h.length, ...results.map((r) => String(r[h] ?? "").length))
    );

    const pad = (str, len) => String(str ?? "").padEnd(len);

    let table = headers.map((h, i) => pad(h, colWidths[i])).join(" | ") + "\n";
    table += colWidths.map((w) => "-".repeat(w)).join("-+-") + "\n";

    for (const row of results) {
      table += headers.map((h, i) => pad(row[h], colWidths[i])).join(" | ") + "\n";
    }

    return new Response(table, {
      headers: { "content-type": "text/plain" },
    });
  },
};
