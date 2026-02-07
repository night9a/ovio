local store = {}

store.users = {}     -- username -> password_hash
store.sessions = {}  -- token -> username

return store
