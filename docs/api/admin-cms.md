# Admin & CMS API Documentation

## Authentication
All endpoints require a Bearer Token in the Authorization header.
`Authorization: Bearer <your_token>`

## CMS (Content Management System)

### Posts
**Base URL**: `/api/v1/cms/posts`

#### List Posts
- **GET** `/api/v1/cms/posts`
- **Query Params**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 15)
  - `status`: Filter by status (`draft`, `published`, `archived`)
  - `search`: Search by title or content

#### Create Post
- **POST** `/api/v1/cms/posts`
- **Body (JSON)**:
  ```json
  {
    "title": "My New Post",
    "content": "<p>Content goes here</p>",
    "excerpt": "Short summary",
    "status": "published",
    "featured_image": "https://example.com/image.jpg",
    "published_at": "2023-12-25 10:00:00"
  }
  ```

#### Get Post Details
- **GET** `/api/v1/cms/posts/{id}`

#### Update Post
- **PUT** `/api/v1/cms/posts/{id}`
- **Body**: Same as Create (fields optional)

#### Delete Post
- **DELETE** `/api/v1/cms/posts/{id}`

### Pages
**Base URL**: `/api/v1/cms/pages`

#### List Pages
- **GET** `/api/v1/cms/pages`
- **Query Params**: `page`, `limit`, `status`, `search`

#### Create Page
- **POST** `/api/v1/cms/pages`
- **Body (JSON)**:
  ```json
  {
    "title": "About Us",
    "content": "<p>About content</p>",
    "status": "published",
    "meta_title": "About Us - Arkanin",
    "meta_description": "Learn more about us"
  }
  ```

## Admin Management

### Users
**Base URL**: `/api/v1/admin/users`

#### List Users
- **GET** `/api/v1/admin/users`
- **Query Params**: `page`, `limit`, `role`, `branch_id`, `search`

#### Create User
- **POST** `/api/v1/admin/users`
- **Body (JSON)**:
  ```json
  {
    "name": "New User",
    "email": "user@example.com",
    "password": "password123",
    "role": "student",
    "branch_id": 1
  }
  ```

#### Update User
- **PUT** `/api/v1/admin/users/{id}`

#### Delete User
- **DELETE** `/api/v1/admin/users/{id}`

### Roles
**Base URL**: `/api/v1/admin/roles`

#### List Roles
- **GET** `/api/v1/admin/roles`

#### List Permissions
- **GET** `/api/v1/admin/permissions`

#### Create Role
- **POST** `/api/v1/admin/roles`
- **Body (JSON)**:
  ```json
  {
    "name": "editor",
    "permissions": ["view_dashboard_global", "manage_content"]
  }
  ```

### Dashboard
- **GET** `/api/v1/admin/dashboard/stats`
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "total_users": 150,
      "total_revenue": 5000000,
      "total_orders": 25,
      "total_exam_attempts": 40,
      "total_programs": 5
    }
  }
  ```

## Finance Reports

### Daily Revenue
- **GET** `/api/v1/finance/revenue/daily`
- **Query Params**:
  - `start_date`: YYYY-MM-DD
  - `end_date`: YYYY-MM-DD

### Revenue Summary
- **GET** `/api/v1/finance/revenue/summary`
