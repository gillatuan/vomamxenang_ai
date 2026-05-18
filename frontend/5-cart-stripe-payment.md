Let's complete the app with the Cart system:
1. Implement a client-side Cart state (using React Context or a lightweight tool like Zustand) to store priced products.
2. Create a Cart drawer or checkout page. When the user clicks "Thanh toán", send the cart details to the backend `POST /orders/checkout-session`.
3. Redirect the user to the Stripe Checkout URL returned by the backend. Create a simple `/checkout/success` and `/checkout/cancel` page in Next.js to handle the user landing back after payment.