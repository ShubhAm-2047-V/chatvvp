# Example API Request for Teacher Note Upload

### Endpoint
`POST /api/teacher/upload-note`

### Headers
- `Authorization: Bearer <TEACHER_JWT_TOKEN>`
- `Content-Type: multipart/form-data`

### Body Fields (Form-Data)
- `file`: (Image or PDF file)
- `subject`: "Advanced Mathematics"
- `branch`: "Computer Science"
- `year`: 2

### Sample Node.js Request (using Axios)
```javascript
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const uploadNote = async () => {
  const form = new FormData();
  form.append('file', fs.createReadStream('./my_notes.jpg'));
  form.append('subject', 'Physics');
  form.append('branch', 'Mechanical');
  form.append('year', '1');

  try {
    const response = await axios.post('http://localhost:5000/api/teacher/upload-note', form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': 'Bearer YOUR_TEACHER_TOKEN'
      }
    });
    console.log(response.data);
  } catch (error) {
    console.error(error.response.data);
  }
};
```

### Response
```json
{
  "message": "Note uploaded and processed successfully",
  "note": {
    "_id": "65f...",
    "subject": "Physics",
    "fileUrl": "https://res.cloudinary.com/...",
    "textPreview": "Laws of Motion: Newton's first law states that..."
  }
}
```
