-- Load Tarantool
box.cfg{
    listen = 3301,        -- TCP port for clients
    wal_mode = 'fsync',   -- durability
}

-- Create users space if not exists
if not box.space.users then
    local users = box.schema.space.create('users')
    users:create_index('primary', { type = 'hash', parts = {1, 'string'} })
end

-- Simple SHA256 password hashing
local crypto = require('crypto')
local function hash_password(password)
    return crypto.digest('sha256', password)
end

-- Register a new user
function register_user(username, password, email)
    if box.space.users:get(username) then
        return false, "User already exists"
    end
    box.space.users:insert{username, hash_password(password), email}
    return true
end

-- Authenticate user
function login_user(username, password)
    local user = box.space.users:get(username)
    if not user then return false, "User not found" end
    if user[2] ~= hash_password(password) then
        return false, "Incorrect password"
    end
    return true
end

-- Optional: list users (for testing)
function list_users()
    local result = {}
    for _, user in box.space.users:pairs() do
        table.insert(result, {user[1], user[3]})
    end
    return result
end

print("Tarantool server is running on port 3301")

