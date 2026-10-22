import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://127.0.0.1:8080';
const API_TOKEN = __ENV.API_TOKEN || '';

export const options = {
  vus: Number(__ENV.VUS || 1),
  duration: __ENV.DURATION || '10s',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<1000'],
  },
};

export default function () {
  const headers = {
    Accept: 'application/json',
  };

  if (API_TOKEN) {
    headers.Authorization = `Bearer ${API_TOKEN}`;
  }

  const response = http.get(`${BASE_URL}/health`, {
    headers,
    tags: { endpoint: 'health' },
    timeout: '5s',
  });

  check(response, {
    'status is 200': (r) => r.status === 200,
    'response is under 1 second': (r) => r.timings.duration < 1000,
  });

  sleep(1);
}
