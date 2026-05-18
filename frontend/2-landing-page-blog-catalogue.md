Let's build the public website using MUI components:
1. **Home Page**: A professional layout introducing the forklift tire agency. Include a grid to display embedded product video showcases (YouTube cards).
2. **Blog Page (`/blog`)**: Displays cards of posts fetched from `GET /posts`.
3. **Product Catalog (`/products`)**: A product grid. 
   - If a product has a price, show it with an "Add to Cart" button.
   - If `sellingPrice` is null, display "Liên hệ" and a "Nhận Báo Giá" button. Clicking this button opens an MUI `Dialog` (Modal) asking for Name, Phone, and Note. Submitting this form will `POST` this user data straight to the backend `POST /clients` API to save them as a lead.