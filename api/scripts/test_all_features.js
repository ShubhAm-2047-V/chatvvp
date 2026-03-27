const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE = 'http://localhost:3000';
const results = [];
let adminToken = '';
let teacherToken = '';
let studentToken = '';

function req(method, p, body, token) {
  return new Promise((resolve) => {
    const url = new URL(BASE + p);
    const options = {
      hostname: url.hostname, port: url.port, path: url.pathname + url.search,
      method, headers: { 'Content-Type': 'application/json' }
    };
    if (token) options.headers['Authorization'] = 'Bearer ' + token;
    const r = http.request(options, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        let parsed;
        try { parsed = JSON.parse(d); } catch { parsed = d; }
        resolve({ status: res.statusCode, body: parsed });
      });
    });
    r.on('error', e => resolve({ status: 0, body: e.message }));
    if (body) r.write(JSON.stringify(body));
    r.end();
  });
}

function log(iter, feature, test, status, pass, detail) {
  results.push({ iteration: iter, feature, test, httpStatus: status, pass, detail: detail || '' });
}

async function testIteration(iter) {
  let r;
  r = await req('GET', '/api/test');
  log(iter, 'Health', 'API Health Check', r.status, r.status === 200, r.body?.message);

  r = await req('GET', '/api/db-test');
  log(iter, 'Health', 'DB Connection', r.status, r.status === 200 && r.body?.status === 'connected', r.body?.status);

  r = await req('POST', '/api/auth/login', { email: 'admin@chatvvp.com', password: 'adminpassword123' });
  if (r.status === 200 && r.body?.token) adminToken = r.body.token;
  log(iter, 'Auth', 'Admin Login (admin@chatvvp.com)', r.status, !!(r.status === 200 && r.body?.token), r.body?.token ? 'Role: ' + r.body.user?.role : (r.body?.error || ''));

  r = await req('POST', '/api/auth/login', { email: 'admin@test.com', password: 'admin123' });
  if (r.status === 200 && r.body?.token && !adminToken) adminToken = r.body.token;
  log(iter, 'Auth', 'Admin Login (admin@test.com)', r.status, !!(r.status === 200 && r.body?.token), r.body?.token ? 'Role: ' + r.body.user?.role : (r.body?.error || ''));

  r = await req('POST', '/api/auth/login', { email: 'teacher@gmail.com', password: 'password123' });
  if (r.status === 200 && r.body?.token) teacherToken = r.body.token;
  log(iter, 'Auth', 'Teacher Login', r.status, !!(r.status === 200 && r.body?.token), r.body?.token ? 'Role: ' + r.body.user?.role : (r.body?.error || ''));

  r = await req('POST', '/api/auth/login', { email: 'shubhamshendge@gmail.com', password: 'password123' });
  if (r.status === 200 && r.body?.token) studentToken = r.body.token;
  log(iter, 'Auth', 'Student Login', r.status, !!(r.status === 200 && r.body?.token), r.body?.token ? 'Role: ' + r.body.user?.role : (r.body?.error || ''));

  r = await req('POST', '/api/auth/login', { email: 'fake@test.com', password: 'wrong' });
  log(iter, 'Auth', 'Invalid Login Rejected', r.status, r.status === 401, r.body?.error || '');

  r = await req('GET', '/api/admin/stats');
  log(iter, 'Admin', 'Get Stats', r.status, r.status === 200, 'Students:' + r.body?.totalStudents + ' Teachers:' + r.body?.totalTeachers);

  r = await req('GET', '/api/admin/users', null, adminToken);
  log(iter, 'Admin', 'List Users', r.status, r.status === 200 && Array.isArray(r.body), Array.isArray(r.body) ? r.body.length + ' users' : (r.body?.message || ''));

  r = await req('GET', '/api/admin/added-teachers', null, adminToken);
  log(iter, 'Admin', 'List Teachers', r.status, r.status === 200 && Array.isArray(r.body), Array.isArray(r.body) ? r.body.length + ' teachers' : (r.body?.message || ''));

  r = await req('GET', '/api/admin/users');
  log(iter, 'Admin', 'Reject No Token', r.status, r.status === 401, r.body?.message || '');

  if (teacherToken) {
    r = await req('GET', '/api/teacher/stats', null, teacherToken);
    log(iter, 'Teacher', 'Get Stats', r.status, r.status === 200, 'Notes:' + r.body?.totalNotes + ' Views:' + r.body?.totalViews);
    r = await req('GET', '/api/teacher/my-notes', null, teacherToken);
    log(iter, 'Teacher', 'My Notes', r.status, r.status === 200 && Array.isArray(r.body), Array.isArray(r.body) ? r.body.length + ' notes' : '');
    r = await req('GET', '/api/teacher/personal-notes', null, teacherToken);
    log(iter, 'Teacher', 'Personal Notes', r.status, r.status === 200 && Array.isArray(r.body), Array.isArray(r.body) ? r.body.length + ' notes' : '');
  } else {
    log(iter, 'Teacher', 'Get Stats', 0, false, 'No token');
    log(iter, 'Teacher', 'My Notes', 0, false, 'No token');
    log(iter, 'Teacher', 'Personal Notes', 0, false, 'No token');
  }

  if (studentToken) {
    r = await req('GET', '/api/student/notes', null, studentToken);
    log(iter, 'Student', 'Browse Notes', r.status, r.status === 200 && Array.isArray(r.body), Array.isArray(r.body) ? r.body.length + ' notes' : '');
    r = await req('GET', '/api/student/history', null, studentToken);
    log(iter, 'Student', 'View History', r.status, r.status === 200 && Array.isArray(r.body), Array.isArray(r.body) ? r.body.length + ' items' : '');
    r = await req('POST', '/api/student/chat', { prompt: 'What is gravity?' }, studentToken);
    log(iter, 'Student', 'AI Chat', r.status, r.status === 200 && !!r.body?.response, r.body?.response ? r.body.response.substring(0, 80) : (r.body?.error || ''));
  } else {
    log(iter, 'Student', 'Browse Notes', 0, false, 'No token');
    log(iter, 'Student', 'View History', 0, false, 'No token');
    log(iter, 'Student', 'AI Chat', 0, false, 'No token');
  }

  r = await req('GET', '/api/quizzes', null, studentToken || adminToken);
  log(iter, 'Quiz', 'List Quizzes', r.status, r.status === 200 && Array.isArray(r.body), Array.isArray(r.body) ? r.body.length + ' quizzes' : '');

  if (studentToken) {
    r = await req('PUT', '/api/auth/update-profile', { name: 'Test Student' }, studentToken);
    log(iter, 'Auth', 'Update Profile', r.status, r.status === 200, r.body?.message || '');
  } else log(iter, 'Auth', 'Update Profile', 0, false, 'No token');

  r = await req('GET', '/api/nonexistent-route');
  log(iter, 'Health', '404 Handler', r.status, r.status === 404, r.body?.message || '');
}

async function main() {
  for (let i = 1; i <= 3; i++) await testIteration(i);
  const outPath = path.join(__dirname, 'test_results.json');
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2), 'utf8');
  console.log('Results written to ' + outPath);
}

main();
