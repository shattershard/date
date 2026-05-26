export async function onRequest({ request, env }) {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const { date, time, foods, text } = await request.json();

    const token = env.TELEGRAM_BOT_TOKEN;
    const chatId = env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      return new Response(
        JSON.stringify({ ok: false, error: "Missing Telegram env vars" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const lines = [];
    lines.push("💌 Новое «свидание» с лендинга:");
    if (date || time) {
      lines.push(`📅 Дата/время: ${date || "сегодня"} ${time || ""}`.trim());
    } else {
      lines.push("📅 Дата/время: прямо сегодня");
    }

    if (Array.isArray(foods) && foods.length) {
      lines.push(`🍽 Еда: ${foods.join(", ")}`);
    } else {
      lines.push("🍽 Еда: не выбрана (значит, всё подряд)");
    }

    if (text) {
      lines.push("");
      lines.push(text);
    }

    const message = lines.join("\n");

    const tgResponse = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: "HTML",
        }),
      }
    );

    const data = await tgResponse.json();

    if (!data.ok) {
      return new Response(
        JSON.stringify({ ok: false, error: "Telegram API error", data }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: String(err) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

