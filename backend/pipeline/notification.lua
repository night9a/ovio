-- notification.lua
local NotificationService = {}
NotificationService.__index = NotificationService

function NotificationService.new()
    return setmetatable({
        listeners = {}
    }, NotificationService)
end

-- Subscribe a callback to an event
function NotificationService:on(event, callback)
    if type(callback) ~= "function" then
        error("callback must be a function")
    end

    self.listeners[event] = self.listeners[event] or {}
    table.insert(self.listeners[event], callback)
end

-- Unsubscribe a callback
function NotificationService:off(event, callback)
    local list = self.listeners[event]
    if not list then return end

    for i = #list, 1, -1 do
        if list[i] == callback then
            table.remove(list, i)
        end
    end
end

-- Emit / notify
function NotificationService:emit(event, data)
    local list = self.listeners[event]
    if not list then return end

    for _, callback in ipairs(list) do
        callback(data)
    end
end

return NotificationService

