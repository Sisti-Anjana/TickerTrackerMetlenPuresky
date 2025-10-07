# Database Schema for Ticket Tracker

## Overview
This document describes the database schema for the Ticket Tracker application that matches the UI requirements.

## Tables

### 1. users
Stores user account information.

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. categories
Predefined ticket categories.

```sql
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);
```

**Default Values:**
- General
- Technical
- Maintenance
- Emergency
- Bug
- Feature
- Support
- Other

### 3. statuses
Predefined ticket statuses.

```sql
CREATE TABLE statuses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);
```

**Default Values:**
- Open
- In Progress
- Resolved
- Closed

### 4. tickets
Main tickets table with all form fields from UI.

```sql
CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    ticket_number VARCHAR(255) UNIQUE NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Customer Information
    company VARCHAR(255),                 -- Customer Name from UI
    customer_type VARCHAR(255),           -- Customer Type (Puresky, Enterprise, etc.)
    site VARCHAR(255),                    -- Site location
    equipment VARCHAR(255),               -- Equipment type
    
    -- Ticket Classification
    category_id INTEGER REFERENCES categories(id),
    status_id INTEGER REFERENCES statuses(id),
    priority VARCHAR(50) DEFAULT 'Medium', -- Low, Medium, High, Urgent
    
    -- Issue Details
    subject VARCHAR(500),                 -- Subject field from UI
    title VARCHAR(500),                   -- Alternative title field
    description TEXT,                     -- Issue Description
    additional_notes TEXT,                -- Additional Notes
    
    -- Outage and Timeline
    outage VARCHAR(255),                  -- Site Outage (Yes/No/Partial)
    issue_start TIMESTAMP,               -- Issue Start Time
    issue_end TIMESTAMP,                 -- Issue End Time
    kw_down NUMERIC,                     -- KW Down value
    
    -- Tracking
    case_number VARCHAR(255),            -- Reference case number
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 5. comments
Comments on tickets.

```sql
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Form Field Mapping

The UI form fields map to database columns as follows:

| UI Field Name | Database Column | Type | Required |
|---------------|----------------|------|----------|
| Customer Name | company | VARCHAR(255) | Yes |
| Customer Type | customer_type | VARCHAR(255) | Yes |
| Site | site | VARCHAR(255) | Yes |
| Equipment | equipment | VARCHAR(255) | Yes |
| Category | category_id | INTEGER | Yes |
| Site Outage | outage | VARCHAR(255) | Yes |
| Ticket Status | status_id | INTEGER | No |
| Issue Start Time | issue_start | TIMESTAMP | Yes |
| Issue End Time | issue_end | TIMESTAMP | Yes |
| KW Down | kw_down | NUMERIC | Yes |
| Subject | subject | VARCHAR(500) | Yes |
| Priority | priority | VARCHAR(50) | No |
| Issue Description | description | TEXT | Yes |
| Additional Notes | additional_notes | TEXT | No |

## Indexes

Performance indexes for common queries:

```sql
CREATE INDEX idx_tickets_user_id ON tickets(user_id);
CREATE INDEX idx_tickets_category_id ON tickets(category_id);
CREATE INDEX idx_tickets_status_id ON tickets(status_id);
CREATE INDEX idx_tickets_ticket_number ON tickets(ticket_number);
CREATE INDEX idx_tickets_customer_type ON tickets(customer_type);
CREATE INDEX idx_tickets_priority ON tickets(priority);
CREATE INDEX idx_tickets_subject ON tickets USING gin(to_tsvector('english', subject));
CREATE INDEX idx_comments_ticket_id ON comments(ticket_id);
CREATE INDEX idx_comments_author_id ON comments(author_id);
CREATE INDEX idx_users_email ON users(email);
```

## Migration Order

Run migrations in this order:
1. `01_create_tables.sql` - Initial table creation
2. `02_setup_rls.sql` - Row level security
3. `03_fix_constraints.sql` - Constraint fixes
4. `04_add_title_field.sql` - Add title field
5. `05_add_ui_fields.sql` - Add new UI fields (customer_type, subject, priority)

## API Compatibility

The backend model supports both camelCase and snake_case field names for frontend compatibility:

- `ticket_number` / `ticketNumber`
- `created_at` / `createdAt` 
- `customer_type` / `customerType`
- etc.

## Sample Data

For testing, you can insert sample categories and statuses:

```sql
-- Sample categories
INSERT INTO categories (name) VALUES 
    ('General'), ('Technical'), ('Maintenance'), ('Emergency'),
    ('Bug'), ('Feature'), ('Support'), ('Other');

-- Sample statuses  
INSERT INTO statuses (name) VALUES 
    ('Open'), ('In Progress'), ('Resolved'), ('Closed');
```