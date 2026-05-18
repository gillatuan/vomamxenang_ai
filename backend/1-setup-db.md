We are building the Backend for a Forklift Tire CRM/E-commerce app using NestJS, Prisma, and PostgreSQL. 
Please:
1. Provide the terminal commands to initialize a new NestJS project in the current directory and install Prisma CLI + Client.
2. Create the `schema.prisma` file with the following models:
   - User (id, email, password, role)
   - Client (id, name, email, phone, company, notes, createdAt)
   - Product (id, type [TIRE/RIM/SERVICE], name, importPrice, sellingPrice [nullable], quantityInStock, imageUrl, description)
   - Order (id, clientId, totalAmount, status [PENDING, PAID, FAILED], stripeSessionId, createdAt)
   - Post (id, title, content, videoUrl, createdAt)
3. Set up the Prisma Module and Prisma Service in NestJS so other modules can inject the database database connection.