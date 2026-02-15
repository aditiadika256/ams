# Learning - Curriculum API

API endpoints for managing program curricula, modules, and lessons.

## Base URL

```
/api/v1/learning
```

## Authentication

All endpoints require Bearer token authentication.

```
Authorization: Bearer {token}
```

---

## Endpoints

### Get Program Curriculum

```
GET /api/v1/learning/programs/{program}/curriculum
```

Returns the full curriculum structure with modules and lessons.

**Parameters:**

| Name    | In   | Type    | Required | Description |
|---------|------|---------|----------|-------------|
| program | path | integer | Yes      | Program ID  |

**Response:** `200 OK` — Curriculum structure (modules with nested lessons)

---

### Create Module

```
POST /api/v1/learning/programs/{program}/modules
```

Creates a new module within a program.

**Parameters:**

| Name    | In   | Type    | Required | Description |
|---------|------|---------|----------|-------------|
| program | path | integer | Yes      | Program ID  |

**Request Body:**

| Field        | Type    | Required | Description              |
|--------------|---------|----------|--------------------------|
| title        | string  | Yes      | Module title (max 255)   |
| description  | string  | No       | Module description       |
| order        | integer | No       | Display order            |
| is_published | boolean | No       | Publication status       |

**Responses:**
- `201 Created` — Module created
- `422 Unprocessable Entity` — Validation error

---

### Update Module

```
PUT /api/v1/learning/modules/{module}
```

**Parameters:**

| Name   | In   | Type    | Required | Description |
|--------|------|---------|----------|-------------|
| module | path | integer | Yes      | Module ID   |

**Request Body:** Same as Create Module (all fields optional).

**Responses:**
- `200 OK` — Module updated
- `404 Not Found` — Module not found

---

### Delete Module

```
DELETE /api/v1/learning/modules/{module}
```

**Parameters:**

| Name   | In   | Type    | Required | Description |
|--------|------|---------|----------|-------------|
| module | path | integer | Yes      | Module ID   |

**Responses:**
- `200 OK` — Module deleted
- `404 Not Found` — Module not found

---

### Create Lesson

```
POST /api/v1/learning/modules/{module}/lessons
```

Creates a new lesson within a module.

**Parameters:**

| Name   | In   | Type    | Required | Description |
|--------|------|---------|----------|-------------|
| module | path | integer | Yes      | Module ID   |

**Request Body:**

| Field            | Type    | Required | Description                              |
|------------------|---------|----------|------------------------------------------|
| title            | string  | Yes      | Lesson title (max 255)                   |
| content_type     | string  | Yes      | One of: `video`, `text`, `quiz`, `assignment` |
| content_url      | string  | No       | URL to content (for video/external)      |
| content_body     | string  | No       | Content body (for text)                  |
| duration_minutes | integer | No       | Estimated duration in minutes            |
| order            | integer | No       | Display order                            |
| is_published     | boolean | No       | Publication status                       |
| is_preview       | boolean | No       | Allow preview without enrollment         |

**Responses:**
- `201 Created` — Lesson created
- `422 Unprocessable Entity` — Validation error

---

### Update Lesson

```
PUT /api/v1/learning/lessons/{lesson}
```

**Parameters:**

| Name   | In   | Type    | Required | Description |
|--------|------|---------|----------|-------------|
| lesson | path | integer | Yes      | Lesson ID   |

**Request Body:** Same as Create Lesson (all fields optional).

**Responses:**
- `200 OK` — Lesson updated
- `404 Not Found` — Lesson not found

---

### Delete Lesson

```
DELETE /api/v1/learning/lessons/{lesson}
```

**Parameters:**

| Name   | In   | Type    | Required | Description |
|--------|------|---------|----------|-------------|
| lesson | path | integer | Yes      | Lesson ID   |

**Responses:**
- `200 OK` — Lesson deleted
- `404 Not Found` — Lesson not found
