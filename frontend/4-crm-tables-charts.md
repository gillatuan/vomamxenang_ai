Inside the `/admin` panel, let's implement the data management:
1. `/admin/clients`: Fetch data from `GET /clients`. Display it using MUI `DataGrid` or standard Table with pagination. Add buttons to Edit/Delete.
2. `/admin/products`: CRUD UI for products using MUI forms and dialogs.
3. `/admin/dashboard`: Fetch statistics from `GET /admin/dashboard-stats`. Create summary cards using MUI `Card` and implement a line chart to show monthly revenue using `recharts` (or `@mui/x-charts`).