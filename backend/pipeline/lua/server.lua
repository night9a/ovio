local http_server = require("http.server")
local http_headers = require("http.headers")
local json = require("dkjson")

local store = require("store")
local hash = require("hash").hash

local function read_json(stream)
  local body = stream:get_body_as_string()
  if not body then return nil end
  return json.decode(body)
end

local function respond(stream, status, body)
  local headers = http_headers.new()
  headers:append(":status", tostring(status))
  headers:append("content-type", "application/json")
  stream:write_headers(headers, false)
  stream:write_chunk(json.encode(body), true)
end

local server = http_server.listen {
  host = "0.0.0.0",
  port = 8080,

  onstream = function(_, stream)
    local req = stream:get_request_headers()
    local method = req:get(":method")
    local path = req:get(":path")

    -- REGISTER
    if method == "POST" and path == "/register" then
      local data = read_json(stream)

      if not data or not data.username or not data.password then
        return respond(stream, 400, { error = "invalid input" })
      end

      if store.users[data.username] then
        return respond(stream, 409, { error = "user exists" })
      end

      store.users[data.username] = hash(data.password)
      return respond(stream, 200, { status = "registered" })
    end

    -- LOGIN
    if method == "POST" and path == "/login" then
      local data = read_json(stream)
      local stored = data and store.users[data.username]

      if not stored or stored ~= hash(data.password) then
        return respond(stream, 401, { error = "invalid credentials" })
      end

      local token = tostring(os.time()) .. ":" .. data.username
      store.sessions[token] = data.username

      return respond(stream, 200, { token = token })
    end

    -- PROTECTED: WHO AM I
    if method == "GET" and path == "/me" then
      local token = req:get("authorization")
      local user = token and store.sessions[token]

      if not user then
        return respond(stream, 401, { error = "unauthorized" })
      end

      return respond(stream, 200, {
        username = user
      })
    end

    -- LOGOUT
    if method == "POST" and path == "/logout" then
      local token = req:get("authorization")
      if token then
        store.sessions[token] = nil
      end
      return respond(stream, 200, { status = "logged out" })
    end

    -- FALLBACK
    respond(stream, 404, { error = "not found" })
  end
}

assert(server:listen())
assert(server:loop())
