--!strict
-- HOLLOW FRONTIER / Roblox First Light vertical slice
-- Server owns world saves, inventory, story, building, interaction and wildlife.
local Players=game:GetService("Players")
local ReplicatedStorage=game:GetService("ReplicatedStorage")
local MarketplaceService=game:GetService("MarketplaceService")
local Lighting=game:GetService("Lighting")
local RunService=game:GetService("RunService")
local Config=require(ReplicatedStorage:WaitForChild("HollowShared"):WaitForChild("Config"))
local WorldMath=require(ReplicatedStorage:WaitForChild("HollowShared"):WaitForChild("WorldMath"))
local WorldBuilder=require(script.Parent:WaitForChild("WorldBuilder"))
local CreatureDirector=require(script.Parent:WaitForChild("CreatureDirector"))
local ProfileStore=require(script.Parent:WaitForChild("ProfileStore"))

local collection=workspace:FindFirstChild("HollowFrontierWorlds") or Instance.new("Folder")
collection.Name="HollowFrontierWorlds";collection.Parent=workspace
local spawn=workspace:FindFirstChild("HollowFrontierLobby")
if not spawn then
    local landing=Instance.new("SpawnLocation")
    landing.Name="HollowFrontierLobby"
    landing.Size=Vector3.new(84,4,84)
    landing.Position=Vector3.new(-700,5,0)
    landing.Anchored=true
    landing.Neutral=true
    landing.Transparency=0
    landing.Color=Color3.fromRGB(46,77,70)
    landing.Material=Enum.Material.Slate
    landing.Parent=workspace
end
local remotes=ReplicatedStorage:FindFirstChild("HollowRemotes") or Instance.new("Folder")
remotes.Name="HollowRemotes";remotes.Parent=ReplicatedStorage
local action=Instance.new("RemoteEvent");action.Name="Action";action.Parent=remotes
local update=Instance.new("RemoteEvent");update.Name="Update";update.Parent=remotes
local getProfile=Instance.new("RemoteFunction");getProfile.Name="GetProfile";getProfile.Parent=remotes

type World = {[string]: any}
type UserState = {loaded:boolean,record:any?,slot:number?,plot:number?,scene:any?,busy:boolean,lastAction:number,lastSave:number,saveOk:boolean,errorText:string?}
local profiles: {[Player]: UserState}={}
local plotNext=0
local elapsed=0
local autosaveTimer=0
local survivalTimer=0
local creatureTimer=0
local cycle=.35
local nightWas=false
local savingThreads: {[Player]: boolean}={}

local function send(player: Player, event: string, payload: any?)
    if player.Parent==Players then update:FireClient(player,event,payload) end
end
local function deepCopy(v: any): any
    if type(v)~="table" then return v end
    local result={}
    for k,val in pairs(v) do result[k]=deepCopy(val) end
    return result
end
local function starter(slot: number): World
    return {
        version=2,name="Frontier "..tostring(slot),seed=math.random(1,2000000000),
        day=1,health=100,hunger=100,scan=false,chapter=0,relay=false,
        inventory=deepCopy(Config.StarterResources),
        buildings={{kind="campfire",x=18,z=14,fuel=0}},
        harvested={},wildlife={},journal={"The Arrival"},
        expeditionNights=0,expedition=false,createdAt=os.time(),
    }
end
local function normalize(w: World)
    if typeof(w.inventory)~="table" then w.inventory=deepCopy(Config.StarterResources) end
    if typeof(w.inventory.berries)~="number" then
        w.inventory.berries=tonumber(w.inventory.berry) or 0
    end
    w.inventory.berry=nil
    for key,_ in pairs(Config.StarterResources) do
        if typeof(w.inventory[key])~="number" then w.inventory[key]=0 end
        w.inventory[key]=math.clamp(math.floor(w.inventory[key]),0,9999)
    end
    w.buildings=if typeof(w.buildings)=="table" then w.buildings else {}
    w.harvested=if typeof(w.harvested)=="table" then w.harvested else {}
    w.wildlife=if typeof(w.wildlife)=="table" then w.wildlife else {}
    w.journal=if typeof(w.journal)=="table" then w.journal else {"The Arrival"}
    w.seed=math.floor(tonumber(w.seed) or 123456)
    w.day=math.clamp(math.floor(tonumber(w.day) or 1),1,99999)
    w.chapter=math.clamp(math.floor(tonumber(w.chapter) or 0),0,3)
    w.health=math.clamp(tonumber(w.health) or 100,1,100)
    w.hunger=math.clamp(tonumber(w.hunger) or 100,0,100)
    w.scan=w.scan==true or w.tool==true
    w.tool=nil
    for _,b in ipairs(w.buildings) do
        if b.kind=="collector" then b.kind="extractor" end
        if b.kind=="lamp" then b.kind="floodlight" end
    end
    w.version=2
end
local function worldOf(player: Player): World?
    local p=profiles[player]
    if not p or not p.loaded or not p.slot or not p.record then return nil end
    return p.record.worlds[tostring(p.slot)]
end
local function sceneOf(player: Player): any?
    local p=profiles[player]
    return if p then p.scene else nil
end
local function inventoryCan(inv: any, cost: any): boolean
    for k,count in pairs(cost) do
        if (inv[k] or 0)<count then return false end
    end
    return true
end
local function consume(inv: any, cost: any): boolean
    if not inventoryCan(inv,cost) then return false end
    for k,count in pairs(cost) do inv[k]-=count end
    return true
end
local function characterRoot(player: Player): BasePart?
    local char=player.Character
    local root=char and char:FindFirstChild("HumanoidRootPart")
    if root and root:IsA("BasePart") then return root end
    return nil
end
local function inRange(player: Player, item: BasePart, radius: number): boolean
    local root=characterRoot(player)
    return root~=nil and (root.Position-item.Position).Magnitude<=radius
end
local function playScene(player: Player, id: string)
    local s=sceneOf(player)
    if not s then return end
    local o=s.origin
    local eye=if id=="Arrival" then o+Vector3.new(-36,30,-43)
        elseif id=="Signal" then o+Vector3.new(148,50,-151)
        else o+Vector3.new(-251,41,-209)
    local focus=if id=="Arrival" then o+Vector3.new(10,9,6)
        elseif id=="Signal" then o+Vector3.new(186,54,-124)
        else o+Vector3.new(-213,13,-176)
    send(player,"Cinematic",{id=id,eye={eye.X,eye.Y,eye.Z},focus={focus.X,focus.Y,focus.Z}})
end
local function sendState(player: Player)
    local w=worldOf(player)
    local scene=sceneOf(player)
    if not w or not scene then return end
    local root=characterRoot(player)
    local x,z=0,0
    if root then x=root.Position.X-scene.origin.X;z=root.Position.Z-scene.origin.Z end
    send(player,"State",{
        slot=profiles[player].slot,name=w.name,day=w.day,health=math.floor(w.health),hunger=math.floor(w.hunger),
        chapter=w.chapter,relay=w.relay,scanner=w.scan,inventory=deepCopy(w.inventory),
        buildings=#w.buildings,wildlife=deepCopy(w.wildlife),journal=deepCopy(w.journal),
        expedition=w.expedition,expeditionNights=w.expeditionNights,
        time=Lighting.ClockTime,night=nightWas,region=WorldMath.Region(x,z),
        saveOk=profiles[player].saveOk,ephemeral=profiles[player].record.ephemeral==true,
        origin={scene.origin.X,scene.origin.Y,scene.origin.Z},
    })
end
local function savePlayer(player: Player, release: boolean): boolean
    local p=profiles[player]
    if not p or not p.loaded or not p.record then return false end
    if savingThreads[player] then return false end
    savingThreads[player]=true
    local success=ProfileStore.Save(player,p.record,release)
    savingThreads[player]=nil
    p.saveOk=success
    if not success and not release then send(player,"Notice","Save failed. Your session is still active; please retry.") end
    return success
end
local function grantGather(player: Player, id: number, resource: string, obj: BasePart)
    local w=worldOf(player)
    if not w or not inRange(player,obj,Config.InteractionDistance) then return end
    local idKey=tostring(id)
    if (w.harvested[idKey] or 0)>=w.day then return end
    if w.expedition then return end
    local amount=if resource=="wood" then 3 elseif resource=="berries" then 2 else 2
    w.harvested[idKey]=w.day
    w.inventory[resource]=(w.inventory[resource] or 0)+amount
    obj:Destroy()
    send(player,"Notice","Gathered +"..tostring(amount).." "..(Config.ResourceLabels[resource] or resource))
    sendState(player)
end
local function observe(player: Player, species: string)
    local w=worldOf(player)
    if not w then return end
    if not w.scan then send(player,"Notice","Craft the Signal Scanner to study wildlife.");return end
    if w.wildlife[species] then send(player,"Notice",species.." already recorded.");return end
    w.wildlife[species]=true
    w.inventory.lumen+=1
    table.insert(w.journal,"Observed wildlife: "..species)
    send(player,"Notice","FIELD GUIDE UPDATED · "..species.." / +1 Lumen")
    sendState(player)
end
local function relay(player: Player, console: BasePart, lens: Part)
    local w=worldOf(player)
    if not w or w.relay or not inRange(player,console,Config.InteractionDistance) then return end
    if not w.scan then send(player,"Notice","Craft a scanner before accessing Meridian technology.");return end
    if not consume(w.inventory,{scrap=8,stone=6}) then
        send(player,"Notice","Restoring the relay requires 8 scrap and 6 stone.")
        return
    end
    w.relay=true;w.chapter=math.max(w.chapter,2)
    table.insert(w.journal,"Station Nine: the restored relay transmitted Dr. Vey's warning.")
    lens.Color=Color3.fromRGB(84,237,200)
    playScene(player,"Signal")
    sendState(player)
end
local function archive(player: Player, console: BasePart)
    local w=worldOf(player)
    if not w or not inRange(player,console,Config.InteractionDistance) then return end
    if not w.relay then send(player,"Notice","Find and repair the relay at Station Nine first.");return end
    if w.chapter>=3 then send(player,"Notice","Ashwood's records are already in your journal.");return end
    w.chapter=3
    table.insert(w.journal,"Ashwood Archive: guardians seek out loud machinery and extraction sites.")
    w.inventory.lumen+=3
    playScene(player,"Ashwood")
    sendState(player)
end
local function teardown(player: Player)
    CreatureDirector.Stop(player)
    local p=profiles[player]
    if not p then return end
    if p.scene then p.scene.root:Destroy();p.scene=nil end
end
local function rebuildWorld(player: Player, w: World, teleport: boolean)
    local p=profiles[player]
    if not p then return end
    teardown(player)
    if not p.plot then plotNext+=1;p.plot=plotNext end
    local origin=WorldMath.Origin(p.plot)
    local scene=WorldBuilder.Create(player.UserId,origin,w.seed)
    p.scene=scene
    WorldBuilder.Regrow(scene,w.seed,w.day,w.harvested,function(id: number, kind: string, resource: BasePart, actor: Player)
        if actor~=player or sceneOf(actor)~=scene then return end
        grantGather(actor,id,kind,resource)
    end)
    scene.relayPrompt.Triggered:Connect(function(actor: Player)
        if actor==player and sceneOf(actor)==scene then relay(actor,scene.relayConsole,scene.relayLens) end
    end)
    scene.archivePrompt.Triggered:Connect(function(actor: Player)
        if actor==player and sceneOf(actor)==scene then archive(actor,scene.archiveConsole) end
    end)
    if w.relay then scene.relayLens.Color=Color3.fromRGB(84,237,200) end
    for index,b in ipairs(w.buildings) do
        if typeof(b)=="table" and typeof(b.kind)=="string" and Config.Costs[b.kind] then
            WorldBuilder.Building(scene,b,index)
        end
    end
    CreatureDirector.Start(player,scene,w.seed,function(species: string,actor: Player)
        if actor==player and sceneOf(actor)==scene then observe(actor,species) end
    end)
    if teleport then
        local char=player.Character or player.CharacterAdded:Wait()
        local root=char:WaitForChild("HumanoidRootPart",10)
        if root and root:IsA("BasePart") then
            root.CFrame=CFrame.new(origin+Vector3.new(0,13,0))
        end
    end
end
local function allowedSlot(player: Player, index: number): (boolean, string?)
    if index~=math.floor(index) or index<1 or index>Config.MaxSlots then return false,"Invalid world slot." end
    if index<=Config.FreeSlots then return true,nil end
    local passId=Config.ExtraSlotPasses[index]
    if typeof(passId)~="number" or passId<=0 then return false,"That extra slot is not yet available." end
    local ok,owns=pcall(function() return MarketplaceService:UserOwnsGamePassAsync(player.UserId,passId) end)
    if not ok then return false,"Could not verify this game pass right now." end
    if not owns then return false,"PASS:"..tostring(passId) end
    return true,nil
end
local function openWorld(player: Player, index: number)
    local p=profiles[player]
    if not p or not p.loaded or not p.record or p.busy then return end
    local permitted,reason=allowedSlot(player,index)
    if not permitted then send(player,"Locked",reason);return end
    p.busy=true
    if p.slot then
        local saved=savePlayer(player,false)
        if not saved then
            p.busy=false
            send(player,"Notice","Unable to switch worlds: save your current world first.")
            return
        end
    end
    local id=tostring(index)
    local isNew=p.record.worlds[id]==nil
    if isNew then p.record.worlds[id]=starter(index) end
    local w=p.record.worlds[id]
    normalize(w)
    p.slot=index
    rebuildWorld(player,w,true)
    p.busy=false
    sendState(player)
    if isNew then task.delay(.7,function()if worldOf(player)==w then playScene(player,"Arrival") end end) end
end
local function getSnapshot(player: Player)
    local p=profiles[player]
    if not p or not p.loaded or not p.record then return {ready=false,errorText=if p then p.errorText else "Profile is loading."} end
    local slots={}
    for index=1,Config.MaxSlots do
        local w=p.record.worlds[tostring(index)]
        slots[index]={index=index,name=if w then tostring(w.name) else "New Frontier",day=if w then w.day else 0,
            exists=w~=nil,free=index<=Config.FreeSlots,passId=Config.ExtraSlotPasses[index] or 0}
    end
    return {ready=true,slots=slots,ephemeral=p.record.ephemeral==true,build=Config.Build}
end
getProfile.OnServerInvoke=getSnapshot

local function nearestGenerator(player: Player, world: any)
    local scene=sceneOf(player)
    local root=characterRoot(player)
    if not scene or not root then return nil end
    for _,b in ipairs(world.buildings) do
        if b.kind=="generator" then
            local pos=scene.origin+Vector3.new(b.x,0,b.z)
            if (root.Position-pos).Magnitude<38 then return b end
        end
    end
    return nil
end
local function handleAction(player: Player, command: any, payload: any)
    if typeof(command)~="string" or #command>32 then return end
    local p=profiles[player]
    if not p or not p.loaded or not p.record or p.busy then return end
    if os.clock()-p.lastAction<Config.MinActionDelay then return end
    p.lastAction=os.clock()
    if command=="SelectSlot" then
        if typeof(payload)=="number" then openWorld(player,payload) end
        return
    end
    local w=worldOf(player)
    if not w then return end
    local inv=w.inventory
    if command=="CraftScanner" then
        if w.scan then send(player,"Notice","Signal Scanner already equipped.")
        elseif consume(inv,Config.Costs.scanner) then
            w.scan=true;w.chapter=math.max(w.chapter,1)
            table.insert(w.journal,"Signal Scanner assembled. Station Nine is now accessible.")
            send(player,"Notice","Signal Scanner online. Repair the Station Nine relay next.")
        else send(player,"Notice","Scanner: 5 wood, 3 stone, 2 scrap required.") end
    elseif command=="Eat" then
        if inv.berries>0 and w.hunger<100 then
            inv.berries-=1;w.hunger=math.min(100,w.hunger+25);w.health=math.min(100,w.health+3)
        else send(player,"Notice","No berries needed or available.") end
    elseif command=="Place" then
        if typeof(payload)~="string" or not table.find(Config.Placeable,payload) then return end
        local scene=p.scene
        local root=characterRoot(player)
        if not scene or not root or w.expedition then return end
        if #w.buildings>=Config.MaxBuilds then send(player,"Notice","Structure limit reached for this world.");return end
        local position=root.Position+root.CFrame.LookVector*16
        local dx=math.floor(position.X-scene.origin.X)
        local dz=math.floor(position.Z-scene.origin.Z)
        if math.abs(dx)>295 or math.abs(dz)>295 then send(player,"Notice","Build inside your Frontier boundary.");return end
        if (Vector2.new(dx-186,dz+124)).Magnitude<49 or (Vector2.new(dx+213,dz+176)).Magnitude<43 then
            send(player,"Notice","Meridian sites cannot be built over.");return
        end
        for _,existing in ipairs(w.buildings) do
            if (Vector2.new((existing.x or 0)-dx,(existing.z or 0)-dz)).Magnitude<16 then
                send(player,"Notice","Move away from nearby structures first.");return
            end
        end
        if not consume(inv,Config.Costs[payload]) then send(player,"Notice","Not enough resources to build "..payload..".");return end
        local b={kind=payload,x=dx,z=dz,fuel=0}
        table.insert(w.buildings,b)
        WorldBuilder.Building(scene,b,#w.buildings)
        send(player,"Notice","Constructed "..payload..".")
    elseif command=="Fuel" then
        local b=nearestGenerator(player,w)
        if b and consume(inv,{wood=3}) then
            b.fuel=math.min(240,(b.fuel or 0)+90)
            send(player,"Notice","Generator powered for another 90 units.")
        else send(player,"Notice","Stand near a generator with 3 wood to fuel it.") end
    elseif command=="Expedition" then
        if not w.relay then send(player,"Notice","Restore Station Nine before starting an expedition.")
        else
            w.expedition=not w.expedition
            send(player,"Notice",if w.expedition then "EXPEDITION ACTIVE · recover Ashwood records." else "Back at the settlement. All structures remain saved.")
        end
    elseif command=="Save" then
        local ok=savePlayer(player,false)
        send(player,"Notice",if ok then "Frontier saved successfully." else "Save unsuccessful. Please retry.")
    end
    sendState(player)
end
action.OnServerEvent:Connect(handleAction)
local function load(player: Player)
    profiles[player]={loaded=false,record=nil,slot=nil,plot=nil,scene=nil,busy=false,lastAction=0,lastSave=0,saveOk=true}
    player.CharacterAdded:Connect(function(char: Model)
        task.delay(.5,function()
            local state=profiles[player]
            if not state or not state.scene then return end
            local root=char:FindFirstChild("HumanoidRootPart")
            if root and root:IsA("BasePart") then root.CFrame=CFrame.new(state.scene.origin+Vector3.new(0,13,0)) end
        end)
    end)
    local record,errorText=ProfileStore.Load(player)
    local p=profiles[player]
    if not p or player.Parent~=Players then return end
    if not record then
        p.errorText=errorText or "World storage is not available."
        send(player,"Error",p.errorText)
        return
    end
    p.record=record
    p.loaded=true
    send(player,"ProfileReady",true)
    if record.ephemeral then send(player,"Notice","Studio preview: changes are temporary until DataStore testing is enabled.") end
end
Players.PlayerAdded:Connect(function(player)task.spawn(load,player)end)
for _,player in ipairs(Players:GetPlayers()) do task.spawn(load,player) end
Players.PlayerRemoving:Connect(function(player)
    savePlayer(player,true)
    teardown(player)
    profiles[player]=nil
end)
WorldBuilder.SetAtmosphere()
RunService.Heartbeat:Connect(function(dt: number)
    elapsed+=dt;autosaveTimer+=dt;survivalTimer+=dt;creatureTimer+=dt
    cycle=(cycle+dt/Config.DaySeconds)%1
    Lighting.ClockTime=(cycle*24+Config.Sunrise)%24
    local night=Lighting.ClockTime>=Config.NightStart or Lighting.ClockTime<Config.Sunrise
    if nightWas and not night then
        for player,_ in pairs(profiles) do
            local w=worldOf(player)
            local scene=sceneOf(player)
            if w and scene then
                w.day+=1
                if w.expedition then w.expeditionNights+=1 end
                WorldBuilder.Regrow(scene,w.seed,w.day,w.harvested,function(id:number,kind:string,obj:BasePart,actor:Player)
                    if actor==player and sceneOf(actor)==scene then grantGather(actor,id,kind,obj) end
                end)
                send(player,"Notice","DAWN "..tostring(w.day).." · new resources have appeared.")
                sendState(player)
            end
        end
    end
    nightWas=night
    if creatureTimer>.26 then
        CreatureDirector.Update(creatureTimer,night,Players:GetPlayers())
        creatureTimer=0
    end
    if survivalTimer>=6 then
        survivalTimer=0
        for player,p in pairs(profiles) do
            local w=worldOf(player)
            if not w or not p.scene then continue end
            w.hunger=math.max(0,w.hunger-.65)
            if w.hunger==0 then w.health=math.max(10,w.health-.8) end
            local powered=false
            for _,b in ipairs(w.buildings) do
                if b.kind=="generator" and (b.fuel or 0)>0 then
                    b.fuel=math.max(0,b.fuel-6)
                    powered=true
                end
            end
            if powered then
                for _,b in ipairs(w.buildings) do
                    if b.kind=="extractor" then w.inventory.wood+=1;w.inventory.stone+=1 end
                    if b.kind=="processor" and w.inventory.scrap>0 then
                        w.inventory.scrap-=1;w.inventory.lumen+=1
                    end
                end
            end
            WorldBuilder.PowerLights(p.scene,powered)
            if w.chapter==3 and powered then
                -- Main story continues in the next campaign expansion.
                w.journal[4]=w.journal[4] or "First Light: your settlement has begun to live with the Frontier."
            end
            sendState(player)
        end
    end
    if autosaveTimer>=Config.SaveInterval then
        autosaveTimer=0
        for player,p in pairs(profiles) do
            if p.slot then task.spawn(savePlayer,player,false) end
        end
    end
end)
game:BindToClose(function()
    local remaining=0
    for player,p in pairs(profiles) do
        if p.loaded then
            remaining+=1
            task.spawn(function()
                savePlayer(player,true)
                remaining-=1
            end)
        end
    end
    local deadline=os.clock()+23
    while remaining>0 and os.clock()<deadline do task.wait(.12) end
end)