-- lua_server.lua
-- Simple persistent DB server in Lua
local socket = require("socket")

local db_file = "users.db"

-- ensure file exists
local f = io.open(db_file, "a")
f:close()

-- insert a record
local function insert(username, password)
    local f = io.open(db_file, "a")
    f:write(username.."|"..password.."\n")
    f:close()
    return "OK"
end

-- lookup a record
local function lookup(username)
    local f = io.open(db_file, "r")
    for line in f:lines() do
        local user, pass = line:match("([^|]+)|([^|]+)")
        if user == username then
            f:close()
            return pass
        end
    end
    f:close()
    return "NOT_FOUND"
end

-- TCP server
local server = assert(socket.bind("*", 12345))
print("Lua DB server listening on port 12345...")

while true do
    local client = server:accept()
    client:settimeout(10)
    local line, err = client:receive()
    if line then
        local cmd, u, p = line:match("(%S+)%s*(%S*)%s*(%S*)")
        local res = ""
        if cmd == "INSERT" then
            res = insert(u, p)
        elseif cmd == "LOOKUP" then
            res = lookup(u)
        else
            res = "ERROR"
        end
        client:send(res.."\n")
    end
    client:close()
end

