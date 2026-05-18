Let's build the Admin area:
1. Create a Login page at `/admin/login` using an MUI Card component. Upon successful login, save the JWT token in cookies/localStorage.
2. Create an `/admin` layout with an MUI `Drawer` (Sidebar navigation) containing links to Dashboard, Clients, and Products.
3. Implement a simple client-side check or middleware: if no JWT token is found, redirect users attempting to access `/admin/*` back to `/admin/login`.