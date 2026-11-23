--!strict
-- Server-authoritative save store. Uses a short lease and UpdateAsync so one
-- server cannot silently clobber another server's live profile.
local DataStoreService = game:GetService("DataStoreService")
local HttpService = game:GetService("HttpService")
local RunService = game:GetService("RunService")
local Config = require(game:GetService("ReplicatedStorage"):WaitForChild("HollowShared"):WaitForChild("Config"))
local database = DataStoreService:GetDataStore("HF_Profiles_V2")
local legacy = DataStoreService:GetDataStore("HollowFrontier_worlds_v1")
local ProfileStore = {}
local nonce = HttpService:GenerateGUID(false)
local function copy(value: any): any
    if type(value) ~= "table" then return value end
    local nextCopy = {}
    for k, v in pairs(value) do nextCopy[k] = copy(v) end
    return nextCopy
end
function ProfileStore.Load(player: Player)
    local key = "user_" .. tostring(player.UserId)
    local locked = false
    local record: any = nil
    local ok, err = pcall(function()
        record = database:UpdateAsync(key, function(previous: any)
            local current = if typeof(previous) == "table" then previous else {version=2,worlds={}}
            local lease = current.lease
            if typeof(lease) == "table" and lease.nonce ~= nonce and (lease.untilTime or 0) > os.time() then
                locked = true
                return nil
            end
            current.lease = {nonce=nonce,untilTime=os.time()+Config.SaveLockSeconds}
            return current
        end)
    end)
    if not ok or record == nil then
        if RunService:IsStudio() and not locked then
            warn("Hollow Frontier: DataStore unavailable in Studio; using temporary unsaved session", err)
            return {version=2,worlds={},ephemeral=true},nil
        end
        return nil, if locked then "Your worlds are open in another server. Rejoin after they close." else "World storage is unavailable. Nothing has been overwritten."
    end
    if typeof(record.worlds) ~= "table" then record.worlds = {} end
    -- First-time migration: read-only check of v1 storage. Never delete old data.
    if next(record.worlds) == nil then
        local good, old = pcall(function() return legacy:GetAsync("u_"..tostring(player.UserId)) end)
        if good and typeof(old) == "table" and typeof(old.worlds) == "table" then
            record.worlds = copy(old.worlds)
            record.migratedFromV1 = true
        end
    end
    record.version = 2
    return record,nil
end
function ProfileStore.Save(player: Player, profile: any, release: boolean): boolean
    if profile.ephemeral then return true end
    local key = "user_" .. tostring(player.UserId)
    local payload = copy(profile.worlds)
    local ok, result = pcall(function()
        return database:UpdateAsync(key,function(prior: any)
            if typeof(prior) ~= "table" then return nil end
            local lease = prior.lease
            if typeof(lease) ~= "table" or lease.nonce ~= nonce then return nil end
            prior.worlds = payload
            prior.version = 2
            prior.lastSaved = os.time()
            prior.lease = if release then nil else {nonce=nonce,untilTime=os.time()+Config.SaveLockSeconds}
            return prior
        end)
    end)
    if not ok or result == nil then
        warn("Hollow Frontier: save failed",player.UserId, result)
        return false
    end
    return true
end
return ProfileStore