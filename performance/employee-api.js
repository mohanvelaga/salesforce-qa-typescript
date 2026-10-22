import http from 'k6/http';
import { check } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://127.0.0.1:8080';
const VUS = Number(__ENV.VUS || 1);
const DURATION = __ENV.DURATION || '10s';

export const options = {
  scenarios: {
    login_api: {
      executor: 'constant-vus',
      exec: 'loginApi',
      vus: VUS,
      duration: DURATION,
    },
    employee_creation_api: {
      executor: 'constant-vus',
      exec: 'employeeCreationApi',
      vus: VUS,
      duration: DURATION,
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    'http_req_duration{endpoint:login}': ['p(95)<1000'],
    'http_req_duration{endpoint:employee_create}': ['p(95)<1000'],
  },
};

export function loginApi() {
  const response = http.post(
    `${BASE_URL}/login`,
    JSON.stringify({
      username: 'qa-user',
      password: 'test-password',
    }),
    {
      headers: { 'Content-Type': 'application/json' },
      tags: { endpoint: 'login' },
    },
  );

  check(response, {
    'login returns HTTP 200': (r) => r.status === 200,
    'login returns a mock token': (r) => {
      try {
        return Boolean(r.json('token'));
      } catch {
        return false;
      }
    },
  });
}

export function employeeCreationApi() {
  const response = http.post(
    `${BASE_URL}/employees`,
    JSON.stringify({
      name: 'Performance Test Employee',
      role: 'QA Engineer',
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer mock-token',
      },
      tags: { endpoint: 'employee_create' },
    },
  );

  check(response, {
    'employee creation returns HTTP 201': (r) => r.status === 201,
    'created employee has an ID': (r) => {
      try {
        return Boolean(r.json('id'));
      } catch {
        return false;
      }
    },
  });
}
