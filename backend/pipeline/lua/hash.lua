local digest = require("openssl.digest")

local function hash_password(password)
  local d = digest.new("sha256")
  d:update(password)
  return d:final()
end

return {
  hash = hash_password
}
