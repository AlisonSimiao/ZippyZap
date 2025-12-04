-- Create wuzapi database and user
CREATE DATABASE wuzapi;
CREATE USER wuzapi WITH ENCRYPTED PASSWORD 'wuzapi';
GRANT ALL PRIVILEGES ON DATABASE wuzapi TO wuzapi;

-- Connect to wuzapi database and grant schema privileges
\c wuzapi
GRANT ALL ON SCHEMA public TO wuzapi;
