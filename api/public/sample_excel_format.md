# Student Upload Excel Format

To upload students in bulk, create an Excel (.xlsx or .xls) or CSV file with the following headers:

| name | email | branch | year | rollNo |
| :--- | :--- | :--- | :--- | :--- |
| Shubham Vernekar | shubham@example.com | CS | 4 | 49 |
| John Doe | john.doe@university.edu | IT | 3 | 125 |
| Jane Smith | jane.smith@college.in | Mechanical | 2 | 7 |

### Password Generation Logic (FYI):
The system will automatically generate passwords based on the `rollNo` and `name`:
- **Formula**: `first_digit_of_rollNo` + `first_name` + `last_digit_of_rollNo`
- **Example 1**: rollNo = `49`, name = `Shubham Vernekar` -> Password = `4Shubham9`
- **Example 2**: rollNo = `7`, name = `Jane Smith` -> Password = `7Jane7` (if single digit, it's used as both first and last)

### API Details:
- **Endpoint**: `POST /api/admin/upload-excel`
- **Method**: `POST`
- **Auth**: Bearer Token (Admin Role Required)
- **Body**: Multipart-form data with field key `file`
