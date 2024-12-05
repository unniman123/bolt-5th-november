# Gaming Platform API Documentation

## Authentication

### Sign Up
```http
POST /auth/signup
```

**Request Body:**
```json
{
  "email": "string",
  "password": "string",
  "username": "string",
  "gameId": "string"
}
```

### Sign In
```http
POST /auth/signin
```

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

## Tournaments

### List Tournaments
```http
GET /tournaments
```

**Query Parameters:**
- `status`: Filter by tournament status
- `gameType`: Filter by game type

### Create Tournament
```http
POST /tournaments
```

**Request Body:**
```json
{
  "title": "string",
  "gameType": "string",
  "entryFee": "number",
  "maxParticipants": "number",
  "startTime": "string"
}
```

## Error Codes

| Code | Description |
|------|-------------|
| 401  | Unauthorized |
| 403  | Forbidden |
| 404  | Not Found |
| 422  | Validation Error |
| 429  | Too Many Requests |