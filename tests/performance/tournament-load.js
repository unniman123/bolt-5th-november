import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Ramp up
    { duration: '1m', target: 20 },  // Stay at peak
    { duration: '30s', target: 0 },  // Ramp down
  ],
};

export default function () {
  // List tournaments
  const listResponse = http.get('http://localhost:3000/api/tournaments');
  check(listResponse, {
    'tournaments listed successfully': (r) => r.status === 200,
  });

  // Get tournament details
  const detailsResponse = http.get('http://localhost:3000/api/tournaments/1');
  check(detailsResponse, {
    'tournament details retrieved': (r) => r.status === 200,
  });

  sleep(1);
}