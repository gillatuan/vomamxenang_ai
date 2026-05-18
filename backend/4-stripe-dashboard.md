Let's finish the backend with payment processing and analytics:
1. Install `stripe`. Create an `OrderModule`.
2. Create `POST /orders/checkout-session` to generate a Stripe Checkout Session URL based on the cart items sent from the frontend.
3. Create a public Webhook endpoint `POST /orders/webhook` to listen to Stripe's `checkout.session.completed` event. When triggered, update the order status to "PAID" and deduct `quantityInStock` in the Product table.
4. Create an endpoint `GET /admin/dashboard-stats` (Protected) that aggregates total revenue from PAID orders, total clients count, and monthly revenue data formatted for charts.