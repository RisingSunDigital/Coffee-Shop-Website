// Netlify serverless function.
// Creates a Stripe Checkout Session so payment happens on Stripe's
// secure, hosted page — card details never touch our own server or code.
//
// Requires an environment variable set in the Netlify dashboard:
//   STRIPE_SECRET_KEY = sk_live_xxx  (or sk_test_xxx while testing)
//
// See README.md for the full setup walkthrough.

const Stripe = require("stripe");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error:
          "Payments aren't set up yet — missing STRIPE_SECRET_KEY. See README.md.",
      }),
    };
  }

  const stripe = Stripe(secretKey);

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Bad request body." }) };
  }

  const items = Array.isArray(payload.items) ? payload.items : [];
  if (items.length === 0) {
    return { statusCode: 400, body: JSON.stringify({ error: "Your order is empty." }) };
  }

  // Basic server-side sanity checks so a tampered request can't send
  // arbitrary prices to Stripe.
  const line_items = items.map((item) => {
    const qty = Math.max(1, Math.min(50, parseInt(item.qty, 10) || 1));
    const unitPrice = Math.max(0, Number(item.unitPrice) || 0);
    const name = String(item.name || "Item").slice(0, 120);
    const sizeLabel = item.sizeLabel ? ` (${String(item.sizeLabel).slice(0, 30)})` : "";

    return {
      price_data: {
        currency: "usd",
        product_data: {
          name: `${name}${sizeLabel}`,
        },
        unit_amount: Math.round(unitPrice * 100), // Stripe uses cents
      },
      quantity: qty,
    };
  });

  const siteUrl = process.env.URL || `https://${event.headers.host}`;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      success_url: `${siteUrl}/success.html?order=success`,
      cancel_url: `${siteUrl}/cancel.html`,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url }),
    };
  } catch (err) {
    console.error("Stripe error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Couldn't start checkout. Please try again." }),
    };
  }
};
