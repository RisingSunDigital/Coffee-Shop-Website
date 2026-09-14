# Rise n Grind — website + online ordering

A coffee-shop website with a real online ordering flow: customers browse the
menu, build an order in the cart, and pay through Stripe Checkout.

## What's in here

```
index.html                              the main page
success.html / cancel.html              pages Stripe sends customers back to
css/style.css                           all styling
js/menu.js                              <-- EDIT THIS to change the menu
js/cart.js                              cart logic + talks to the function below
netlify/functions/create-checkout-session.js   creates the Stripe payment session
package.json                            lists the "stripe" library the function needs
netlify.toml                            tells Netlify how to build/deploy this
```

## 1. Put it on GitHub

1. Create a new repository on GitHub (e.g. `rise-n-grind`). Leave it empty —
   no README, no .gitignore.
2. On your computer, in this folder, run:
   ```
   git init
   git add .
   git commit -m "Initial site"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/rise-n-grind.git
   git push -u origin main
   ```

## 2. Deploy it on Netlify

1. Go to [app.netlify.com](https://app.netlify.com) and sign up/log in
   (you can sign in directly with your GitHub account).
2. Click **Add new site → Import an existing project**.
3. Choose **GitHub**, authorize Netlify, and pick your `rise-n-grind` repo.
4. Build settings should auto-fill from `netlify.toml`:
   - Build command: `npm install`
   - Publish directory: `.`
5. Click **Deploy site**. You'll get a free address like
   `https://random-name-123.netlify.app` — you can rename this (Site
   settings → Change site name) or connect a real domain later
   (Site settings → Domain management → Add a custom domain).

From now on, every time you `git push` to GitHub, Netlify automatically
rebuilds and redeploys the live site.

## 3. Turn on real payments (Stripe)

Nothing will charge real cards until you do this step — right now the
checkout button will show a friendly "payments aren't set up yet" message.

1. Create a free account at [stripe.com](https://stripe.com).
2. In the Stripe Dashboard, go to **Developers → API keys**.
3. Copy the **Secret key**:
   - Start with the one labeled **Test mode** (starts with `sk_test_...`)
     while you're trying things out — test payments use fake card numbers
     and no real money moves.
   - Switch to the **Live mode** secret key (`sk_live_...`) once you're
     ready to accept real customer payments.
4. In Netlify: **Site settings → Environment variables → Add a variable**.
   - Key: `STRIPE_SECRET_KEY`
   - Value: paste the key from Stripe
5. Redeploy the site (Netlify → Deploys → Trigger deploy) so the function
   picks up the new variable.
6. Test it: add something to your cart on the live site and click **Pay &
   order**. In test mode, use Stripe's test card `4242 4242 4242 4242`,
   any future expiry date, and any CVC.

Money from real (live-mode) payments lands in your Stripe balance, and
Stripe handles payouts to your bank account on its normal schedule — you'll
set up your bank details in the Stripe Dashboard under **Balance →
Payouts**.

## 4. Updating the menu

Open `js/menu.js`. Each item looks like this:

```js
{
  id: "latte",
  name: "Rise Latte",
  desc: "Double shot, steamed milk, a little foam.",
  price: 4.75,
  category: "coffee",
}
```

Copy that pattern for new items, change the category to group them, or add
`soldOut: true` to gray one out temporarily. Commit and push the change —
Netlify redeploys automatically. Whenever you're ready, send me the real
menu and I'll drop it into this file for you.

## 5. A custom domain (optional)

Netlify's free `.netlify.app` address works fine to start. If you'd rather
use something like `risengrindcoffee.com`:

- Buy the domain from any registrar (Namecheap, Google Domains successor
  Squarespace Domains, GoDaddy, etc. — Netlify can also sell you one).
- In Netlify: **Site settings → Domain management → Add a domain**, then
  follow the DNS instructions Netlify gives you.

## Notes

- Orders currently don't get emailed or logged anywhere except Stripe's
  Dashboard (**Payments** tab shows every order with the items in the
  description). If you want order notifications (email/text to staff when
  an order comes in) or a printed ticket, that's a good next addition —
  just ask.
- Card numbers never touch this code — Stripe's own hosted checkout page
  handles that, which keeps you out of PCI-compliance scope.
