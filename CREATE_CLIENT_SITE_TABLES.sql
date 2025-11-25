-- Create Client Types and Sites Tables for Client & Site Management Feature

-- Table: client_types
CREATE TABLE IF NOT EXISTS client_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: sites
CREATE TABLE IF NOT EXISTS sites (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    client_type_id INTEGER NOT NULL REFERENCES client_types(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name, client_type_id) -- Prevent duplicate site names for same client
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sites_client_type_id ON sites(client_type_id);
CREATE INDEX IF NOT EXISTS idx_client_types_status ON client_types(status);
CREATE INDEX IF NOT EXISTS idx_sites_status ON sites(status);

-- No dummy data - start with empty tables

