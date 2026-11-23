--!strict
-- HOLLOW FRONTIER / STUDIO INSTALLER / Generated from Rojo source.
-- Paste the entire file into Studio's Command Bar while EDITING a separate,
-- otherwise empty place. It will REPLACE an existing HollowFrontier folder in
-- ServerScriptService, StarterPlayerScripts and the HollowShared folder in
-- ReplicatedStorage. Do NOT run inside a published production experience.
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local ServerScriptService = game:GetService("ServerScriptService")
local StarterPlayer = game:GetService("StarterPlayer")
local target = {
    ReplicatedStorage = ReplicatedStorage,
    ServerScriptService = ServerScriptService,
    StarterPlayerScripts = StarterPlayer:WaitForChild("StarterPlayerScripts"),
}
local function ensure(parent: Instance, name: string): Folder
    local existing = parent:FindFirstChild(name)
    if existing then existing:Destroy() end
    local folder = Instance.new("Folder")
    folder.Name = name
    folder.Parent = parent
    return folder
end
local folders = {
    ReplicatedStorage = ensure(ReplicatedStorage, "HollowShared"),
    ServerScriptService = ensure(ServerScriptService, "HollowFrontier"),
    StarterPlayerScripts = ensure(target.StarterPlayerScripts, "HollowFrontier"),
}
local function install(parent: Folder, name: string, class: string, contents: string)
    local scriptObj = Instance.new(class)
    scriptObj.Name = name
    scriptObj.Source = contents
    scriptObj.Parent = parent
end
install(folders.ReplicatedStorage, "Config", "ModuleScript", [======[--!strict
-- HOLLOW FRONTIER / LUCION GAMES
-- Keep paid-slot pass IDs zero until they exist in Creator Dashboard. Do not
-- create prompts to purchase anything until prices and permissions are verified.
local Config = {}
Config.Build = "0.2.0-first-light"
Config.FreeSlots = 3
Config.MaxSlots = 6
Config.ExtraSlotPasses = {[4] = 0, [5] = 0, [6] = 0}
Config.DaySeconds = 300
Config.Sunrise = 6.3
Config.NightStart = 19.2
Config.PlotSize = 650
Config.PlotSpacing = 1450
Config.MaxBuilds = 90
Config.MaxWildlife = 13
Config.MaxThreats = 3
Config.SaveInterval = 95
Config.SaveLockSeconds = 240
Config.InteractionDistance = 20
Config.MinActionDelay = .14
Config.StarterResources = {wood = 8, stone = 5, scrap = 2, berries = 5, lumen = 0}
Config.Costs = {
    scanner = {wood = 5, stone = 3, scrap = 2},
    shelter = {wood = 12, stone = 5},
    campfire = {wood = 4, stone = 3},
    generator = {wood = 8, stone = 5, scrap = 4},
    extractor = {wood = 6, stone = 6, scrap = 6},
    processor = {stone = 7, scrap = 8, lumen = 2},
    floodlight = {stone = 2, scrap = 4},
    wall = {wood = 4, stone = 3},
    habitat = {wood = 7, stone = 2, berries = 2},
}
Config.Placeable = {"shelter", "campfire", "generator", "extractor", "processor", "floodlight", "wall", "habitat"}
Config.ResourceLabels = {wood="Wood", stone="Stone", scrap="Scrap", berries="Berries", lumen="Lumen"}
Config.QuestStages = {
    [0] = {title="THE ARRIVAL", objective="Gather supplies, craft a scanner and find Station Nine.", location="Verdant Reach"},
    [1] = {title="THE FIRST SIGNAL", objective="Restore the Meridian relay with 8 scrap and 6 stone.", location="Meridian Station Nine"},
    [2] = {title="BENEATH THE TREES", objective="Discover the Ashwood research recorder.", location="Ashwood Expanse"},
    [3] = {title="ECHOES OF THE FRONTIER", objective="Build a powered extractor and keep your settlement running.", location="Home Settlement"},
}
return Config
]======])
install(folders.ReplicatedStorage, "Story", "ModuleScript", [======[--!strict
local Story = {}
Story.Scenes = {
    Arrival = {
        title = "THE ARRIVAL",
        eyebrow = "RECOVERY TEAM SEVEN / 04:21",
        lines = {
            {speaker="PILOT", text="Recovery Team Seven, descending into Meridian airspace. Radio contact ends here."},
            {speaker="NORA", text="Warning. Unknown transmission detected beneath the Frontier."},
            {speaker="UNKNOWN SIGNAL", text="If you can hear this... don't wake the last relay."},
            {speaker="FIELD JOURNAL", text="Your transport has lost power. The forest is quiet. For now."},
        },
    },
    Signal = {
        title = "THE FIRST SIGNAL",
        eyebrow = "MERIDIAN RELAY NINE / RESTORED",
        lines = {
            {speaker="DR. MARA VEY", text="This is Dr. Mara Vey. Meridian never understood what Lumen really was."},
            {speaker="DR. MARA VEY", text="The towers didn't merely draw power. They taught the forest to listen."},
            {speaker="NORA", text="Archive restored. Ashwood research recorder coordinates recovered."},
        },
    },
    Ashwood = {
        title = "BENEATH THE TREES",
        eyebrow = "ASHWOOD RESEARCH RECORD / FILE 027",
        lines = {
            {speaker="NORA", text="This station was built to study wildlife migration during extraction cycles."},
            {speaker="DR. MARA VEY", text="The animals moved away from the noise. The guardians moved toward it."},
            {speaker="NORA", text="A safer energy network might still be possible. The next step is yours."},
        },
    },
}
Story.Journal = {
    "The Arrival: a lost recovery team, a dead transport, and a forest that remembers.",
    "The First Signal: Meridian's power towers changed the surrounding ecosystem.",
    "Beneath the Trees: industrial activity draws the Frontier's guardians closer.",
}
return Story
]======])
install(folders.ReplicatedStorage, "WorldMath", "ModuleScript", [======[--!strict
-- Deterministic geometry helpers shared between server world generation and UI.
local WorldMath = {}
function WorldMath.Region(x: number, z: number): string
    if x < -125 and z < -95 then return "Ashwood Expanse" end
    if x > 126 and z < -93 then return "Frostline Ridge" end
    if x < -118 and z > 95 then return "Mirewater Basin" end
    if x > 126 and z > 94 then return "Ironfall Works" end
    return "Verdant Reach"
end
function WorldMath.Height(x: number, z: number): number
    return 2 + math.sin(x / 43) * 2.2 + math.cos(z / 57) * 2.0 + math.sin((x + z) / 30) * 1.0
end
function WorldMath.Origin(index: number): Vector3
    -- Limit plot slots to 10 places/server for a lightweight vertical slice.
    local column = (index - 1) % 5
    local row = math.floor((index - 1) / 5)
    return Vector3.new(column * 1450, 0, row * 1450)
end
return WorldMath
]======])
install(folders.ServerScriptService, "WorldBuilder", "ModuleScript", [======[--!strict
-- Hand-built procedural geometry generated in Studio at server start. No
-- copyrighted third-party place or models are needed for this first alpha.
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Lighting = game:GetService("Lighting")
local Config = require(ReplicatedStorage:WaitForChild("HollowShared"):WaitForChild("Config"))
local WorldMath = require(ReplicatedStorage:WaitForChild("HollowShared"):WaitForChild("WorldMath"))
local WorldBuilder = {}

local COLOR = {
    grass = Color3.fromRGB(47,91,75), wood=Color3.fromRGB(73,58,46), leaf=Color3.fromRGB(31,81,64),
    ash=Color3.fromRGB(92,83,70), frost=Color3.fromRGB(150,180,190), mire=Color3.fromRGB(58,82,75),
    iron=Color3.fromRGB(106,94,83), orange=Color3.fromRGB(244,164,83),
    lumen=Color3.fromRGB(96,219,210), blue=Color3.fromRGB(101,152,200),
}
local function part(parent: Instance, name: string, size: Vector3, at: Vector3, color: Color3, material: Enum.Material?, collide: boolean?): Part
    local p=Instance.new("Part")
    p.Name=name;p.Size=size;p.Position=at;p.Color=color
    p.Anchored=true;p.CastShadow=true;p.Material=material or Enum.Material.SmoothPlastic
    p.CanCollide = collide ~= false
    p.TopSurface=Enum.SurfaceType.Smooth;p.BottomSurface=Enum.SurfaceType.Smooth
    p.Parent=parent
    return p
end
local function ball(parent: Instance, name: string, scale: Vector3, at: Vector3, color: Color3, mat: Enum.Material?): Part
    local b=part(parent,name,scale,at,color,mat,false)
    b.Shape=Enum.PartType.Ball
    return b
end
local function cylinder(parent: Instance, name: string, size: Vector3, at: Vector3, color: Color3, mat: Enum.Material?): Part
    local c=part(parent,name,size,at,color,mat)
    c.Shape=Enum.PartType.Cylinder
    return c
end
local function beam(parent: Instance, at: Vector3, size: Vector3, color: Color3): Part
    return part(parent,"Trim",size,at,color,Enum.Material.Metal)
end
local function prompt(parent: Instance, label: string, action: string, range: number?): ProximityPrompt
    local p=Instance.new("ProximityPrompt")
    p.ObjectText=label;p.ActionText=action
    p.RequiresLineOfSight=false;p.HoldDuration=.5;p.MaxActivationDistance=range or 12
    p.Parent=parent
    return p
end
local function glow(parent: BasePart, color: Color3, brightness: number, range: number)
    local light=Instance.new("PointLight")
    light.Color=color;light.Brightness=brightness;light.Range=range
    light.Shadows=true;light.Parent=parent
    return light
end
local function tree(parent: Instance, origin: Vector3, x: number, z: number, random: Random, region: string)
    local ground=WorldMath.Height(x,z)
    local h=random:NextNumber(16,32)
    local bark=if region=="Frostline Ridge" then Color3.fromRGB(110,112,108) else COLOR.wood
    local leaves=if region=="Ashwood Expanse" then Color3.fromRGB(104,70,55)
        elseif region=="Frostline Ridge" then Color3.fromRGB(87,130,135)
        elseif region=="Mirewater Basin" then Color3.fromRGB(40,88,73)
        else COLOR.leaf
    local trunk=part(parent,"Pine trunk",Vector3.new(3.8,h,3.8),origin+Vector3.new(x,ground+h/2,z),bark,Enum.Material.Wood)
    trunk.Shape=Enum.PartType.Cylinder
    for layer=1,3 do
        local width=(13-layer*2.1)*random:NextNumber(.9,1.15)
        ball(parent,"Pine foliage",Vector3.new(width,width*.8,width),origin+Vector3.new(x,ground+h*.44+layer*3.7,z),leaves,Enum.Material.Grass)
    end
    if random:NextNumber()>.72 then
        ball(parent,"Glow spores",Vector3.new(1.1,1.1,1.1),origin+Vector3.new(x+2.5,ground+2,z),COLOR.lumen,Enum.Material.Neon)
    end
end
local function rock(parent: Instance, origin: Vector3, x: number, z: number, random: Random, region: string)
    local height=WorldMath.Height(x,z)
    local color=if region=="Frostline Ridge" then Color3.fromRGB(167,185,187)
        elseif region=="Ironfall Works" then Color3.fromRGB(135,117,99) else Color3.fromRGB(101,125,119)
    local r=part(parent,"Granite",Vector3.new(random:NextNumber(5,12),random:NextNumber(3,9),random:NextNumber(5,11)),origin+Vector3.new(x,height+2,z),color,Enum.Material.Slate)
    r.Orientation=Vector3.new(random:NextNumber(-9,9),random:NextNumber(0,180),random:NextNumber(-9,9))
end
local function detailGround(parent: Instance, origin: Vector3, random: Random)
    part(parent,"Primary forest floor",Vector3.new(Config.PlotSize,8,Config.PlotSize),origin+Vector3.new(0,-5,0),COLOR.grass,Enum.Material.Grass)
    local biomes={
        {name="Ashwood Expanse",x=-197,z=-184,c=Color3.fromRGB(85,84,70),m=Enum.Material.Ground},
        {name="Frostline Ridge",x=203,z=-179,c=Color3.fromRGB(143,174,182),m=Enum.Material.Snow},
        {name="Mirewater Basin",x=-190,z=199,c=Color3.fromRGB(61,94,84),m=Enum.Material.Mud},
        {name="Ironfall Works",x=205,z=192,c=Color3.fromRGB(121,100,82),m=Enum.Material.Ground},
    }
    for _,b in ipairs(biomes) do
        local plate=part(parent,b.name,Vector3.new(242,2,239),origin+Vector3.new(b.x,-.4,b.z),b.c,b.m)
        plate.CanCollide=true
    end
    -- Landforms use staggered slabs: streamable, inexpensive, and don't rely
    -- on Terrain generated from local clients.
    for i=1,36 do
        local x=random:NextNumber(-300,300)
        local z=random:NextNumber(-300,300)
        local y=WorldMath.Height(x,z)
        if math.sqrt(x*x+z*z)>72 then
            part(parent,"Meadow rise",Vector3.new(random:NextNumber(15,28),random:NextNumber(2,6),random:NextNumber(13,28)),origin+Vector3.new(x,y-1,z),COLOR.grass,Enum.Material.Grass)
        end
    end
    for i=1,27 do
        local x=random:NextNumber(-310,310);local z=random:NextNumber(-310,310)
        if math.abs(x)>55 or math.abs(z)>55 then
            local y=WorldMath.Height(x,z)
            local c=if WorldMath.Region(x,z)=="Frostline Ridge" then COLOR.frost else COLOR.lumen
            ball(parent,"Wildflower",Vector3.new(.6,random:NextNumber(1,2),.6),origin+Vector3.new(x,y+.5,z),c,Enum.Material.Neon)
        end
    end
    local water=part(parent,"Mirewater Pool",Vector3.new(105,.3,75),origin+Vector3.new(-228,.2,250),Color3.fromRGB(46,119,121),Enum.Material.Glass,false)
    water.Transparency=.36;water.Reflectance=.25
end
local function station(parent: Instance, origin: Vector3)
    local px,pz=186,-124
    local model=Instance.new("Model");model.Name="Meridian Station Nine";model.Parent=parent
    part(model,"Foundation",Vector3.new(82,3,76),origin+Vector3.new(px,2,pz),Color3.fromRGB(84,98,99),Enum.Material.Concrete)
    for _,d in ipairs({{-28,-24},{-28,23},{28,-24},{28,23}}) do
        part(model,"Steel support",Vector3.new(5,29,5),origin+Vector3.new(px+d[1],17,pz+d[2]),Color3.fromRGB(73,96,106),Enum.Material.Metal)
    end
    part(model,"Observation deck",Vector3.new(72,3,61),origin+Vector3.new(px,33,pz),Color3.fromRGB(117,133,131),Enum.Material.Metal)
    part(model,"Relay pylon",Vector3.new(13,55,13),origin+Vector3.new(px,62,pz),Color3.fromRGB(61,83,91),Enum.Material.Metal)
    local lens=ball(model,"Signal lens",Vector3.new(13,13,13),origin+Vector3.new(px,94,pz),COLOR.orange,Enum.Material.Neon)
    glow(lens,COLOR.orange,2,52)
    local console=part(model,"Meridian Relay Console",Vector3.new(10,6,7),origin+Vector3.new(px,6,pz+36),Color3.fromRGB(57,75,83),Enum.Material.Metal)
    local screen=part(model,"Console panel",Vector3.new(8,.7,5),origin+Vector3.new(px,9.5,pz+36),COLOR.blue,Enum.Material.Neon,false)
    screen.CanTouch=false
    local restorePrompt=prompt(console,"Meridian Station Nine","Restore Signal",15)
    return restorePrompt,lens,console
end
local function ashwoodArchive(parent: Instance, origin: Vector3)
    local x,z=-213,-176
    local model=Instance.new("Model");model.Name="Ashwood Archive";model.Parent=parent
    part(model,"Archive Platform",Vector3.new(47,3,36),origin+Vector3.new(x,3,z),Color3.fromRGB(74,83,76),Enum.Material.Concrete)
    for _,dx in ipairs({-19,19}) do
        for _,dz in ipairs({-13,13}) do
            part(model,"Ruined pillar",Vector3.new(5,19,5),origin+Vector3.new(x+dx,12,z+dz),Color3.fromRGB(67,91,82),Enum.Material.Slate)
        end
    end
    local archive=part(model,"Archive Recorder",Vector3.new(7,5,6),origin+Vector3.new(x,6,z),Color3.fromRGB(90,121,115),Enum.Material.Metal)
    glow(ball(model,"Recorder status",Vector3.new(2.4,2.4,2.4),origin+Vector3.new(x,9,z),COLOR.lumen,Enum.Material.Neon),COLOR.lumen,1.4,23)
    return prompt(archive,"Ashwood Archive","Recover Log",14),archive
end
local function frostline(parent: Instance, origin: Vector3)
    local m=Instance.new("Model");m.Name="Frostline Observatory";m.Parent=parent
    part(m,"Observation Dome",Vector3.new(33,23,33),origin+Vector3.new(205,22,-210),Color3.fromRGB(105,139,151),Enum.Material.Metal).Shape=Enum.PartType.Ball
    part(m,"West Service Wing",Vector3.new(28,16,35),origin+Vector3.new(182,9,-199),Color3.fromRGB(120,145,148),Enum.Material.Concrete)
    glow(ball(m,"Antenna Beacon",Vector3.new(4,4,4),origin+Vector3.new(205,37,-210),COLOR.lumen,Enum.Material.Neon),COLOR.lumen,1,37)
end
local function ironfall(parent: Instance, origin: Vector3)
    local m=Instance.new("Model");m.Name="Ironfall Works";m.Parent=parent
    part(m,"Assembly Hall",Vector3.new(59,20,44),origin+Vector3.new(203,12,200),Color3.fromRGB(92,98,101),Enum.Material.Metal)
    for i=1,3 do
        part(m,"Reactor Chimney",Vector3.new(7,34+i*5,7),origin+Vector3.new(177+i*14,28,220),Color3.fromRGB(77,88,92),Enum.Material.Metal)
    end
    beam(m,origin+Vector3.new(203,25,175),Vector3.new(42,4,3),COLOR.orange)
end
local function decorate(parent: Instance, origin: Vector3, random: Random)
    for i=1,73 do
        local x=random:NextNumber(-296,296);local z=random:NextNumber(-295,295)
        if Vector2.new(x,z).Magnitude>48 and (x<142 or z>-78 or x>243 or z< -205) then
            tree(parent,origin,x,z,random,WorldMath.Region(x,z))
        end
    end
    for i=1,65 do
        local x=random:NextNumber(-300,300);local z=random:NextNumber(-300,300)
        if Vector2.new(x,z).Magnitude>37 then rock(parent,origin,x,z,random,WorldMath.Region(x,z)) end
    end
end
function WorldBuilder.SetAtmosphere()
    Lighting.ClockTime=14
    Lighting.Brightness=2.2
    Lighting.EnvironmentDiffuseScale=.45
    Lighting.EnvironmentSpecularScale=.5
    Lighting.GlobalShadows=true
    Lighting.Ambient=Color3.fromRGB(70,100,110)
    Lighting.OutdoorAmbient=Color3.fromRGB(120,150,140)
    local atmosphere=Lighting:FindFirstChildOfClass("Atmosphere") or Instance.new("Atmosphere")
    atmosphere.Name="Frontier Air"
    atmosphere.Density=.34;atmosphere.Offset=.1;atmosphere.Glare=.22;atmosphere.Haze=1.55
    atmosphere.Color=Color3.fromRGB(198,221,210);atmosphere.Decay=Color3.fromRGB(80,127,121)
    atmosphere.Parent=Lighting
    local correction=Lighting:FindFirstChildOfClass("ColorCorrectionEffect") or Instance.new("ColorCorrectionEffect")
    correction.Name="Frontier Grade";correction.Contrast=.12;correction.Saturation=-.08;correction.Brightness=.025
    correction.Parent=Lighting
    local bloom=Lighting:FindFirstChildOfClass("BloomEffect") or Instance.new("BloomEffect")
    bloom.Name="Lumen Bloom";bloom.Intensity=.15;bloom.Threshold=1.75;bloom.Size=20;bloom.Parent=Lighting
end
function WorldBuilder.Create(ownerId: number, origin: Vector3, seed: number)
    local root=Instance.new("Folder");root.Name="Frontier_"..tostring(ownerId);root.Parent=workspace:WaitForChild("HollowFrontierWorlds")
    local static=Instance.new("Folder");static.Name="TerrainAndLandmarks";static.Parent=root
    local resources=Instance.new("Folder");resources.Name="Resources";resources.Parent=root
    local structures=Instance.new("Folder");structures.Name="Structures";structures.Parent=root
    local life=Instance.new("Folder");life.Name="Life";life.Parent=root
    local rng=Random.new(seed)
    detailGround(static,origin,rng)
    decorate(static,origin,rng)
    local relayPrompt,relayLens,relayConsole=station(static,origin)
    local archivePrompt,archiveConsole=ashwoodArchive(static,origin)
    frostline(static,origin);ironfall(static,origin)
    return {root=root,static=static,resources=resources,structures=structures,life=life,origin=origin,
        relayPrompt=relayPrompt,relayLens=relayLens,relayConsole=relayConsole,
        archivePrompt=archivePrompt,archiveConsole=archiveConsole}
end
local RESOURCE_KIND = {"wood","wood","wood","wood","stone","stone","scrap","berries","lumen"}
function WorldBuilder.Regrow(world: any, seed: number, day: number, harvested: {[string]: number}, onGather: (number,string,BasePart,Player)->())
    world.resources:ClearAllChildren()
    local random=Random.new(seed+291)
    for i=1,75 do
        local x=random:NextNumber(-292,292);local z=random:NextNumber(-290,290)
        local d=math.sqrt(x*x+z*z)
        local kind=RESOURCE_KIND[random:NextInteger(1,#RESOURCE_KIND)]
        local id=tostring(i)
        local nearLandmark = (Vector2.new(x-186,z+124)).Magnitude<55 or (Vector2.new(x+213,z+176)).Magnitude<48
        if d>42 and not nearLandmark and (harvested[id] or 0)<day then
            local y=WorldMath.Height(x,z)+2
            local resource: Part
            if kind=="wood" then
                resource=part(world.resources,"Fallen Timber",Vector3.new(8,3,3),world.origin+Vector3.new(x,y,z),COLOR.wood,Enum.Material.Wood)
                resource.Orientation=Vector3.new(0,random:NextInteger(0,179),0)
            elseif kind=="berries" then
                resource=ball(world.resources,"Bramble Bush",Vector3.new(6,4,6),world.origin+Vector3.new(x,y+1,z),Color3.fromRGB(108,130,79),Enum.Material.Grass)
                for j=1,3 do
                    ball(world.resources,"Berries",Vector3.new(.85,.85,.85),resource.Position+Vector3.new(j*.8-1.5,2.1,2),Color3.fromRGB(203,66,112),Enum.Material.Neon)
                end
            elseif kind=="lumen" then
                resource=ball(world.resources,"Lumen Outcrop",Vector3.new(5,7,5),world.origin+Vector3.new(x,y+2,z),COLOR.lumen,Enum.Material.Neon)
                glow(resource,COLOR.lumen,1,18)
            else
                resource=part(world.resources,if kind=="scrap" then "Meridian Salvage" else "Stone",Vector3.new(7,5,6),world.origin+Vector3.new(x,y+2,z),if kind=="scrap" then COLOR.orange else COLOR.ash,if kind=="scrap" then Enum.Material.Metal else Enum.Material.Slate)
            end
            local interaction=prompt(resource,Config.ResourceLabels[kind] or kind,"Gather",12)
            interaction.Triggered:Connect(function(actor: Player) onGather(i,kind,resource,actor) end)
        end
    end
end
function WorldBuilder.Building(world: any, b: any, index: number)
    local x,z=tonumber(b.x) or 0,tonumber(b.z) or 0
    local at=world.origin+Vector3.new(x,WorldMath.Height(x,z)+2,z)
    local model=Instance.new("Model");model.Name=string.format("%02d %s",index,b.kind);model.Parent=world.structures
    local main: Part
    if b.kind=="shelter" then
        main=part(model,"Shelter Floor",Vector3.new(22,2,18),at,Color3.fromRGB(130,93,65),Enum.Material.Wood)
        for _,side in ipairs({-1,1}) do
            part(model,"Wall",Vector3.new(2,12,18),at+Vector3.new(side*10,7,0),COLOR.wood,Enum.Material.Wood)
        end
        part(model,"Roof",Vector3.new(24,3,20),at+Vector3.new(0,14,0),Color3.fromRGB(63,89,80),Enum.Material.Slate)
    elseif b.kind=="wall" then
        main=part(model,"Palisade",Vector3.new(16,13,3),at+Vector3.new(0,6,0),COLOR.wood,Enum.Material.Wood)
    elseif b.kind=="campfire" then
        main=cylinder(model,"Fire pit",Vector3.new(7,2,7),at,Color3.fromRGB(82,83,79),Enum.Material.Rock)
        local ember=ball(model,"Warm embers",Vector3.new(4,2,4),at+Vector3.new(0,2,0),COLOR.orange,Enum.Material.Neon)
        glow(ember,COLOR.orange,1.4,27)
    elseif b.kind=="generator" then
        main=part(model,"Generator Chassis",Vector3.new(10,8,8),at+Vector3.new(0,3,0),Color3.fromRGB(69,94,98),Enum.Material.Metal)
        local core=ball(model,"Lumen Reactor",Vector3.new(4,4,4),at+Vector3.new(0,7,0),COLOR.lumen,Enum.Material.Neon)
        glow(core,COLOR.lumen,1,25)
        beam(model,at+Vector3.new(0,8,-3),Vector3.new(9,2,2),COLOR.orange)
    elseif b.kind=="extractor" then
        main=part(model,"Automatic Extractor",Vector3.new(11,6,11),at+Vector3.new(0,3,0),Color3.fromRGB(99,119,116),Enum.Material.Metal)
        part(model,"Extraction Arm",Vector3.new(4,16,4),at+Vector3.new(0,13,0),COLOR.ash,Enum.Material.Metal)
        local light=ball(model,"Activity Lamp",Vector3.new(2,2,2),at+Vector3.new(0,20,0),COLOR.lumen,Enum.Material.Neon)
        glow(light,COLOR.lumen,.7,15)
    elseif b.kind=="processor" then
        main=part(model,"Refinery",Vector3.new(15,10,12),at+Vector3.new(0,5,0),Color3.fromRGB(71,79,88),Enum.Material.Metal)
        local cap=part(model,"Processing Lid",Vector3.new(16,2,13),at+Vector3.new(0,11,0),COLOR.orange,Enum.Material.Metal)
        cap.CanCollide=false
    elseif b.kind=="floodlight" then
        main=part(model,"Light Stand",Vector3.new(3,17,3),at+Vector3.new(0,8,0),Color3.fromRGB(104,115,110),Enum.Material.Metal)
        local lamp=part(model,"Flood Lamp",Vector3.new(8,4,3),at+Vector3.new(0,18,0),Color3.fromRGB(227,245,187),Enum.Material.Neon)
        glow(lamp,Color3.fromRGB(255,246,184),2.5,50)
    elseif b.kind=="habitat" then
        main=part(model,"Habitat Floor",Vector3.new(18,1,19),at,Color3.fromRGB(89,113,82),Enum.Material.Grass)
        for _,dx in ipairs({-8,8}) do
            part(model,"Habitat Fence",Vector3.new(2,5,19),at+Vector3.new(dx,3,0),COLOR.wood,Enum.Material.Wood)
        end
        ball(model,"Wildlife Food",Vector3.new(4,2,4),at+Vector3.new(0,2,0),Color3.fromRGB(141,174,96),Enum.Material.Grass)
    else
        main=part(model,"Unknown Structure",Vector3.new(8,7,8),at,Color3.fromRGB(119,115,111),Enum.Material.Metal)
    end
    model.PrimaryPart=main
    return model
end
function WorldBuilder.PowerLights(world: any, powered: boolean)
    for _,structure in ipairs(world.structures:GetChildren()) do
        if structure:IsA("Model") and (structure.Name:find("floodlight") or structure.Name:find("generator")) then
            for _,object in ipairs(structure:GetDescendants()) do
                if object:IsA("PointLight") then object.Enabled=powered end
            end
        end
    end
end
return WorldBuilder
]======])
install(folders.ServerScriptService, "CreatureDirector", "ModuleScript", [======[--!strict
-- Lightweight roaming wildlife and mysterious night creatures.
-- Creatures are environmental characters, not real-world weapon simulations.
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")
local WorldMath = require(ReplicatedStorage:WaitForChild("HollowShared"):WaitForChild("WorldMath"))
local Config = require(ReplicatedStorage:WaitForChild("HollowShared"):WaitForChild("Config"))
local CreatureDirector = {}
local packs: {[number]: any} = {}
local color = {
    Deer=Color3.fromRGB(168,128,88), Fox=Color3.fromRGB(199,113,75), Hare=Color3.fromRGB(174,163,137),
    Boar=Color3.fromRGB(110,89,79), Owl=Color3.fromRGB(149,129,99),
    Watcher=Color3.fromRGB(47,73,90), Remnant=Color3.fromRGB(98,107,113),
}
local WILDLIFE={"Deer","Deer","Fox","Hare","Hare","Boar","Owl","Fox","Boar","Deer","Hare","Owl","Deer"}
local function visual(parent: Instance, id: string, species: string, at: Vector3, scale: number): Model
    local model=Instance.new("Model")
    model.Name=species.." · "..id
    model.Parent=parent
    local body=Instance.new("Part")
    body.Name="Body";body.Shape=Enum.PartType.Ball;body.Size=Vector3.new(3.6,2.3,5.2)*scale
    body.Position=at;body.Anchored=true;body.CanCollide=false;body.Material=if species=="Watcher" then Enum.Material.Slate else Enum.Material.SmoothPlastic
    body.Color=color[species] or Color3.new(.5,.5,.5);body.Parent=model
    model.PrimaryPart=body
    local head=Instance.new("Part")
    head.Name="Head";head.Shape=Enum.PartType.Ball;head.Size=Vector3.new(2.1,2.2,2.1)*scale
    head.Position=at+Vector3.new(0,1.1,-2.5)*scale;head.Anchored=true;head.CanCollide=false
    head.Color=body.Color;head.Parent=model
    for side=-1,1,2 do
        local eye=Instance.new("Part")
        eye.Name="Eye";eye.Shape=Enum.PartType.Ball;eye.Anchored=true;eye.CanCollide=false
        eye.Size=Vector3.new(.28,.28,.28)*scale;eye.Position=head.Position+Vector3.new(side*.68,.2,-.83)*scale
        eye.Color=if species=="Watcher" or species=="Remnant" then Color3.fromRGB(77,241,211) else Color3.fromRGB(38,42,39)
        eye.Material=if species=="Watcher" or species=="Remnant" then Enum.Material.Neon else Enum.Material.SmoothPlastic
        eye.Parent=model
        if species~="Owl" then
            local leg=Instance.new("Part")
            leg.Name="Leg";leg.Size=Vector3.new(.54,2.1,.6)*scale
            leg.Position=at+Vector3.new(side*1.0,-1.4,1.15)*scale
            leg.Anchored=true;leg.CanCollide=false;leg.Color=body.Color;leg.Parent=model
        end
        if species=="Hare" or species=="Fox" or species=="Deer" then
            local ear=Instance.new("Part")
            ear.Name="Ear";ear.Size=Vector3.new(.46,if species=="Hare" then 2.2 else 1.4,.65)*scale
            ear.Position=head.Position+Vector3.new(side*.6,1.35,-.1)*scale
            ear.Anchored=true;ear.CanCollide=false;ear.Color=body.Color;ear.Parent=model
        end
    end
    if species=="Watcher" then
        local light=Instance.new("PointLight")
        light.Color=Color3.fromRGB(91,200,210);light.Brightness=.7;light.Range=13;light.Parent=head
    end
    return model
end
local function observedPrompt(root: BasePart, species: string, owner: Player, observed: (string,Player)->())
    local proximity=Instance.new("ProximityPrompt")
    proximity.ObjectText=species
    proximity.ActionText="Observe"
    proximity.HoldDuration=.7;proximity.MaxActivationDistance=15;proximity.RequiresLineOfSight=false
    proximity.Parent=root
    proximity.Triggered:Connect(function(who: Player)
        local char=who.Character
        local characterRoot=char and char:FindFirstChild("HumanoidRootPart")
        if who==owner and characterRoot and characterRoot:IsA("BasePart")
            and (characterRoot.Position-root.Position).Magnitude<=20 then
            observed(species,who)
        end
    end)
end
local function spawn(owner: Player, world: any, rng: Random, species: string, count: number, observed: (string,Player)->(), n: number)
    local x=rng:NextNumber(-260,260)
    local z=rng:NextNumber(-270,270)
    if species=="Remnant" then x=190+count*13;z=190+count*8 end
    if species=="Watcher" then x=-170+count*34;z=-125-count*13 end
    local y=WorldMath.Height(x,z)+5
    local scale=if species=="Hare" then .57 elseif species=="Owl" then .67 elseif species=="Watcher" then 1.55 else 1 end
    local model=visual(world.life,tostring(n),species,world.origin+Vector3.new(x,y,z),scale)
    local root=model.PrimaryPart
    if root and species~="Watcher" and species~="Remnant" then observedPrompt(root,species,owner,observed) end
    return {species=species,model=model,x=x,z=z,anchorX=x,anchorZ=z,theta=rng:NextNumber(-math.pi,math.pi),
        speed=if species=="Hare" then 6 elseif species=="Watcher" then 3.5 else 3.1,
        phase=rng:NextNumber(-math.pi,math.pi),nextTurn=rng:NextNumber(1,4),scale=scale}
end
function CreatureDirector.Start(owner: Player, world: any, seed: number, observed: (string,Player)->())
    CreatureDirector.Stop(owner)
    local rng=Random.new(seed+8941)
    local creatures={}
    for i=1,Config.MaxWildlife do
        table.insert(creatures,spawn(owner,world,rng,WILDLIFE[(i-1)%#WILDLIFE+1],i,observed,i))
    end
    for i=1,Config.MaxThreats do
        local species=if i==Config.MaxThreats then "Remnant" else "Watcher"
        table.insert(creatures,spawn(owner,world,rng,species,i,observed,Config.MaxWildlife+i))
    end
    packs[owner.UserId]={world=world,items=creatures,random=rng,tick=0}
end
function CreatureDirector.Stop(owner: Player)
    local pack=packs[owner.UserId]
    if pack then
        for _,c in ipairs(pack.items) do if c.model then c.model:Destroy() end end
        packs[owner.UserId]=nil
    end
end
function CreatureDirector.Update(dt: number, isNight: boolean, playerList: {Player})
    for userId,pack in pairs(packs) do
        pack.tick += dt
        local owner: Player?=nil
        for _,candidate in ipairs(playerList) do if candidate.UserId==userId then owner=candidate;break end end
        if not owner then continue end
        local character=owner.Character
        local root=character and character:FindFirstChild("HumanoidRootPart")
        local playerAt=if root and root:IsA("BasePart") then root.Position else nil
        local count=0
        for _,c in ipairs(pack.items) do
            count+=1
            local threatening=c.species=="Watcher" or c.species=="Remnant"
            if threatening and not isNight then
                -- Guardians are present but dormant during the day.
                c.model:PivotTo(CFrame.new(pack.world.origin+Vector3.new(c.x,-50,c.z)))
                continue
            end
            local here=pack.world.origin+Vector3.new(c.x,WorldMath.Height(c.x,c.z)+5,c.z)
            local near=if playerAt then (here-playerAt).Magnitude else 999
            local towards=if playerAt then Vector3.new(playerAt.X-here.X,0,playerAt.Z-here.Z) else Vector3.zero
            local alert=near<36 and towards.Magnitude>.1
            if alert and not threatening then
                local inverse=-towards.Unit
                c.theta=math.atan2(inverse.Z,inverse.X)
            elseif alert and threatening and near>12 then
                c.theta=math.atan2(towards.Z,towards.X)
            elseif pack.tick>c.nextTurn then
                c.theta+=pack.random:NextNumber(-1.4,1.4)
                c.nextTurn=pack.tick+pack.random:NextNumber(2,6)
            end
            local direction=Vector2.new(math.cos(c.theta),math.sin(c.theta))
            local speed=c.speed*(if alert and not threatening then 1.6 else 1)
            local nextX=math.clamp(c.x+direction.X*dt*speed,-290,290)
            local nextZ=math.clamp(c.z+direction.Y*dt*speed,-290,290)
            if (Vector2.new(nextX-c.anchorX,nextZ-c.anchorZ)).Magnitude>68 then
                c.theta+=math.pi;c.nextTurn=pack.tick+1
            else
                c.x=nextX;c.z=nextZ
            end
            local bob=math.sin(pack.tick*(if c.species=="Hare" then 8 else 5)+c.phase)*.18
            local target=pack.world.origin+Vector3.new(c.x,WorldMath.Height(c.x,c.z)+5+bob,c.z)
            local facing=CFrame.new(target)*CFrame.Angles(0,-c.theta-math.pi/2,0)
            c.model:PivotTo(facing)
        end
    end
end
return CreatureDirector
]======])
install(folders.ServerScriptService, "ProfileStore", "ModuleScript", [======[--!strict
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
]======])
install(folders.ServerScriptService, "Main", "Script", [======[--!strict
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
]======])
install(folders.StarterPlayerScripts, "Main", "LocalScript", [======[--!strict
-- HOLLOW FRONTIER / First Light
-- UI is intentionally created in Luau: open the Rojo place and press Play.
-- Roblox's native R15 avatar and Animate scripts provide rigging + locomotion.
local Players=game:GetService("Players")
local ReplicatedStorage=game:GetService("ReplicatedStorage")
local UserInputService=game:GetService("UserInputService")
local TweenService=game:GetService("TweenService")
local MarketplaceService=game:GetService("MarketplaceService")
local localPlayer=Players.LocalPlayer
local shared=ReplicatedStorage:WaitForChild("HollowShared")
local Config=require(shared:WaitForChild("Config"))
local Story=require(shared:WaitForChild("Story"))
local remotes=ReplicatedStorage:WaitForChild("HollowRemotes")
local action=remotes:WaitForChild("Action") :: RemoteEvent
local update=remotes:WaitForChild("Update") :: RemoteEvent
local getProfile=remotes:WaitForChild("GetProfile") :: RemoteFunction
local gui=Instance.new("ScreenGui")
gui.Name="HF_HUD";gui.ResetOnSpawn=false;gui.IgnoreGuiInset=true
-- Allow Roblox chat and core touch controls to stay operational.
gui.ZIndexBehavior=Enum.ZIndexBehavior.Sibling
gui.Parent=localPlayer:WaitForChild("PlayerGui")
local COLORS={
    ink=Color3.fromRGB(9,20,24),panel=Color3.fromRGB(17,35,40),
    panelHi=Color3.fromRGB(25,49,54),line=Color3.fromRGB(69,104,102),
    white=Color3.fromRGB(240,245,231),soft=Color3.fromRGB(176,196,186),
    mint=Color3.fromRGB(137,234,189),sun=Color3.fromRGB(247,183,106),
    danger=Color3.fromRGB(237,129,122),
}
local function corner(parent: Instance, radius: number)
    local c=Instance.new("UICorner")
    c.CornerRadius=UDim.new(0,radius);c.Parent=parent
end
local function stroke(parent: Instance)
    local s=Instance.new("UIStroke")
    s.Color=COLORS.line;s.Thickness=1;s.Transparency=.35;s.Parent=parent
end
local function frame(parent: Instance, name: string, at: UDim2, size: UDim2, background: Color3?): Frame
    local f=Instance.new("Frame")
    f.Name=name;f.Position=at;f.Size=size;f.BorderSizePixel=0
    f.BackgroundColor3=background or COLORS.panel
    f.Parent=parent;corner(f,13);stroke(f)
    return f
end
local function txt(parent: Instance, value: string, at: UDim2, size: UDim2, sizePt: number, heavy: boolean?): TextLabel
    local l=Instance.new("TextLabel")
    l.Text=value;l.TextSize=sizePt;l.Font=if heavy then Enum.Font.GothamBold else Enum.Font.Gotham
    l.Position=at;l.Size=size;l.BackgroundTransparency=1
    l.TextColor3=if heavy then COLORS.white else COLORS.soft
    l.TextWrapped=true;l.TextXAlignment=Enum.TextXAlignment.Left
    l.TextYAlignment=Enum.TextYAlignment.Center
    l.Parent=parent
    return l
end
local function button(parent: Instance, value: string, at: UDim2, size: UDim2, handler: ()->()): TextButton
    local b=Instance.new("TextButton")
    b.Text=value;b.TextSize=14;b.TextWrapped=true;b.Font=Enum.Font.GothamMedium
    b.BackgroundColor3=COLORS.panelHi;b.TextColor3=COLORS.white
    b.Position=at;b.Size=size;b.BorderSizePixel=0;b.AutoButtonColor=true
    b.Parent=parent;corner(b,9)
    b.Activated:Connect(handler)
    return b
end
local function wipe(instance: Instance?)
    if instance then instance:Destroy() end
end
local camera=workspace.CurrentCamera
local screenWidth=if camera then camera.ViewportSize.X else 1100
local compact=UserInputService.TouchEnabled or screenWidth<850
local scale=Instance.new("UIScale")
scale.Scale=if screenWidth<600 then .86 else 1
scale.Parent=gui
local blackout=frame(gui,"Loading",UDim2.fromScale(.18,.22),UDim2.fromScale(.64,.52),COLORS.ink)
blackout.ZIndex=10
local title=txt(blackout,"HOLLOW FRONTIER",UDim2.fromScale(.08,.1),UDim2.fromScale(.86,.2),32,true)
title.ZIndex=11
local loadingText=txt(blackout,"Connecting to Meridian records…",UDim2.fromScale(.08,.38),UDim2.fromScale(.84,.4),18,false)
loadingText.ZIndex=11
local worldMenu: Frame?=nil
local hud: Frame?=nil
local craftMenu: Frame?=nil
local journalWindow: Frame?=nil
local cinematic: Frame?=nil
local statText: TextLabel?=nil
local objectiveText: TextLabel?=nil
local inventoryText: TextLabel?=nil
local toastLabel: TextLabel?=nil
local lastState: any=nil
local storyToken=0
local reducedMotion=false
local lastProfile: any=nil
local expandedPack=false
local toastIndex=0
local function toast(message: string)
    if not toastLabel then
        toastLabel=txt(gui,"",UDim2.new(.5,-220,1,-82),UDim2.fromOffset(440,50),16,true)
        toastLabel.TextXAlignment=Enum.TextXAlignment.Center
        toastLabel.BackgroundColor3=COLORS.ink
        toastLabel.BackgroundTransparency=.12
        corner(toastLabel,10)
    end
    toastIndex+=1
    local index=toastIndex
    toastLabel.Text=message
    toastLabel.Visible=true
    task.delay(5.2,function()if index==toastIndex and toastLabel then toastLabel.Visible=false end end)
end
local function fetchProfile(): any?
    local ok,output=pcall(function()return getProfile:InvokeServer()end)
    if ok and typeof(output)=="table" and output.ready then return output end
    return nil
end
local function closePanels()
    wipe(craftMenu);craftMenu=nil
    wipe(journalWindow);journalWindow=nil
end
local function showWorldMenu(profile: any)
    lastProfile=profile
    closePanels()
    wipe(worldMenu)
    if hud then hud.Visible=false end
    blackout.Visible=false
    worldMenu=frame(gui,"WorldChooser",UDim2.fromScale(.10,.09),UDim2.fromScale(.80,.81),COLORS.ink)
    worldMenu.ZIndex=9
    txt(worldMenu,"YOUR FRONTIERS",UDim2.fromScale(.055,.04),UDim2.fromScale(.9,.14),30,true)
    txt(worldMenu,"Three free persistent worlds. Additional paid slots remain disabled until officially configured.",UDim2.fromScale(.055,.16),UDim2.fromScale(.9,.13),15)
    if profile.ephemeral then
        local warnText=txt(worldMenu,"STUDIO PREVIEW · progress won't persist until DataStore access is enabled.",UDim2.fromScale(.055,.29),UDim2.fromScale(.9,.075),13,true)
        warnText.TextColor3=COLORS.sun
    end
    local cols=if compact then 2 else 3
    local rows=math.ceil(6/cols)
    local list=Instance.new("Frame")
    list.BackgroundTransparency=1;list.Position=UDim2.fromScale(.055,.38)
    list.Size=UDim2.fromScale(.9,.57);list.Parent=worldMenu
    local padding=.017
    for index=1,6 do
        local world=profile.slots[index]
        local col=(index-1)%cols
        local row=math.floor((index-1)/cols)
        local width=1/cols-padding
        local height=1/rows-.025
        local x=col/cols + padding/2
        local y=row/rows+.015
        local label=string.format("%02d  %s\n%s",index,world.name,if world.exists then "DAY "..tostring(world.day) else "NEW WORLD")
        if not world.free then
            label=string.format("%02d  LOCKED\n%s",index,if world.passId==0 then "COMING LATER" else "EXTRA SLOT")
        end
        local item=button(list,label,UDim2.fromScale(x,y),UDim2.fromScale(width,height),function()
            if not world.free and world.passId==0 then
                toast("Additional slots aren't for sale yet.")
                return
            end
            action:FireServer("SelectSlot",index)
        end)
        item.TextSize=if compact then 13 else 15
        if not world.free then item.TextColor3=COLORS.soft end
    end
end
local function formatInventory(inv: any): string
    return string.format("WOOD  %d       STONE  %d\nSCRAP  %d       BERRIES  %d\nLUMEN  %d",
        inv.wood or 0, inv.stone or 0, inv.scrap or 0, inv.berries or 0, inv.lumen or 0)
end
local function costText(kind: string): string
    local cost=Config.Costs[kind]
    if not cost then return "" end
    local arr={}
    for _,resource in ipairs({"wood","stone","scrap","berries","lumen"}) do
        if cost[resource] then table.insert(arr,tostring(cost[resource]).." "..resource) end
    end
    return table.concat(arr," · ")
end
local function journal()
    if journalWindow then wipe(journalWindow);journalWindow=nil;return end
    local state=lastState
    if not state then return end
    wipe(craftMenu);craftMenu=nil
    journalWindow=frame(gui,"FieldJournal",UDim2.fromScale(.21,.14),UDim2.fromScale(.58,.72),COLORS.ink)
    local panel=journalWindow
    txt(panel,"MERIDIAN FIELD JOURNAL",UDim2.fromScale(.06,.04),UDim2.fromScale(.85,.12),25,true)
    button(panel,"✕",UDim2.fromScale(.89,.035),UDim2.fromScale(.07,.09),function()wipe(journalWindow);journalWindow=nil end)
    local area=Instance.new("ScrollingFrame")
    area.BackgroundTransparency=1;area.BorderSizePixel=0
    area.ScrollBarThickness=4;area.AutomaticCanvasSize=Enum.AutomaticSize.Y
    area.Size=UDim2.fromScale(.86,.77);area.Position=UDim2.fromScale(.07,.18)
    area.Parent=panel
    local text="STORY RECORDS\n\n"
    for _,entry in ipairs(state.journal) do text..="• "..tostring(entry).."\n\n" end
    text..="\nWILDLIFE FIELD GUIDE\n\n"
    for _,species in ipairs({"Deer","Fox","Hare","Boar","Owl"}) do
        text..=(if state.wildlife[species] then "✓ " else "? ")..species.."\n"
    end
    text..="\n\nA scanner is required to record an animal. Observe wildlife using E near the creature."
    local l=txt(area,text,UDim2.fromScale(0,0),UDim2.new(1,-10,0,0),17)
    l.AutomaticSize=Enum.AutomaticSize.Y
    l.TextYAlignment=Enum.TextYAlignment.Top
end
local function buildPack()
    if craftMenu then wipe(craftMenu);craftMenu=nil;expandedPack=false;return end
    local state=lastState
    if not state then return end
    expandedPack=true
    craftMenu=frame(gui,"CraftingAndBuilding",UDim2.new(1,-320,.12,0),UDim2.new(0,302,.77,0),COLORS.ink)
    local panel=craftMenu
    txt(panel,"FIELD PACK",UDim2.fromOffset(14,14),UDim2.new(1,-56,0,42),25,true)
    button(panel,"✕",UDim2.new(1,-42,0,16),UDim2.fromOffset(28,30),function()wipe(craftMenu);craftMenu=nil;expandedPack=false end)
    local contents=Instance.new("ScrollingFrame")
    contents.Position=UDim2.fromOffset(13,66);contents.Size=UDim2.new(1,-26,1,-80)
    contents.BackgroundTransparency=1;contents.BorderSizePixel=0
    contents.AutomaticCanvasSize=Enum.AutomaticSize.Y
    contents.ScrollBarThickness=4;contents.Parent=panel
    local layout=Instance.new("UIListLayout")
    layout.Padding=UDim.new(0,8);layout.SortOrder=Enum.SortOrder.LayoutOrder
    layout.Parent=contents
    local inv=txt(contents,formatInventory(state.inventory),UDim2.fromOffset(0,0),UDim2.new(1,-14,0,92),16,true)
    inv.LayoutOrder=1
    local section=txt(contents,"CRAFT + EQUIPMENT",UDim2.fromOffset(0,0),UDim2.new(1,-14,0,29),14,true)
    section.TextColor3=COLORS.mint;section.LayoutOrder=2
    local function row(label: string, caption: string, onClick: ()->(),order: number)
        local holder=frame(contents,"Item",UDim2.fromScale(0,0),UDim2.new(1,-8,0,63),COLORS.panelHi)
        holder.LayoutOrder=order
        txt(holder,caption,UDim2.fromOffset(14,36),UDim2.new(1,-24,0,21),11)
        button(holder,label,UDim2.fromOffset(10,6),UDim2.new(1,-20,0,28),onClick)
    end
    row("Craft Signal Scanner",costText("scanner"),function()action:FireServer("CraftScanner")end,3)
    row("Eat Berries","Restores hunger while supplies last",function()action:FireServer("Eat")end,4)
    row("Fuel Nearby Generator","3 wood · must stand near a generator",function()action:FireServer("Fuel")end,5)
    local construction=txt(contents,"OUTPOST CONSTRUCTION",UDim2.fromOffset(0,0),UDim2.new(1,-14,0,26),14,true)
    construction.TextColor3=COLORS.mint;construction.LayoutOrder=6
    for index,kind in ipairs(Config.Placeable) do
        row("Build "..string.upper(string.sub(kind,1,1))..string.sub(kind,2),costText(kind),function()
            action:FireServer("Place",kind)
        end,6+index)
    end
    row("Toggle Expedition","Relay must be restored first",function()action:FireServer("Expedition")end,100)
end
local function makeHud()
    wipe(worldMenu);worldMenu=nil
    blackout.Visible=false
    if hud then hud:Destroy() end
    hud=frame(gui,"SurvivalHUD",UDim2.fromOffset(14,16),UDim2.fromOffset(if compact then 265 else 344,220),COLORS.ink)
    local panel=hud
    txt(panel,"HOLLOW FRONTIER",UDim2.fromOffset(16,10),UDim2.new(1,-32,0,34),21,true)
    statText=txt(panel,"Loading…",UDim2.fromOffset(16,49),UDim2.new(1,-32,0,98),14)
    button(panel,"PACK",UDim2.new(0,15,1,-38),UDim2.new(.29,-8,0,30),buildPack)
    button(panel,"JOURNAL",UDim2.new(.31,4,1,-38),UDim2.new(.38,-11,0,30),journal)
    button(panel,"SAVE",UDim2.new(.7,0,1,-38),UDim2.new(.28,-10,0,30),function()action:FireServer("Save")end)
    objectiveText=txt(gui,"",if compact then UDim2.new(.5,-215,1,-169) else UDim2.new(.5,-215,0,18),UDim2.fromOffset(430,64),15,true)
    objectiveText.BackgroundColor3=COLORS.ink;objectiveText.BackgroundTransparency=.1
    objectiveText.TextXAlignment=Enum.TextXAlignment.Center
    corner(objectiveText,9)
    local controls=txt(gui,if compact then "Tap PACK to craft. Tap nearby prompts to gather." else "WASD move   •   Mouse to look   •   E interact   •   B pack   •   J journal",UDim2.new(.5,-225,1,-34),UDim2.fromOffset(450,25),12)
    controls.TextXAlignment=Enum.TextXAlignment.Center
    -- Access to additional save slots without discarding this world.
    button(panel,"WORLD SELECT",UDim2.new(0,16,0,152),UDim2.new(1,-32,0,27),function()
        local data=fetchProfile()
        if data then showWorldMenu(data) else toast("World selection unavailable.") end
    end)
end
local function updateHud(data: any)
    lastState=data
    if not hud then makeHud() end
    if worldMenu then worldMenu:Destroy();worldMenu=nil end
    if hud then hud.Visible=true end
    if statText then
        local phase=if data.night then "NIGHT" else "DAYLIGHT"
        statText.Text=string.format("DAY %d   /   %s   /   SLOT %d\nHEALTH  %d%%     HUNGER  %d%%\n%s\nSTRUCTURES %d    SCANNER %s",
            data.day,phase,data.slot,data.health,data.hunger,data.region or "The Frontier",data.buildings,if data.scanner then "READY" else "OFFLINE")
    end
    local quest=Config.QuestStages[data.chapter] or Config.QuestStages[0]
    if objectiveText then objectiveText.Text=quest.title.."\n"..quest.objective end
    if craftMenu and expandedPack then
        -- Inventory is refreshed when the player reopens the pack. Preserve
        -- scroll position instead of rebuilding it after every server tick.
    end
end
local function cinematicFinish()
    storyToken+=1
    wipe(cinematic);cinematic=nil
    local cam=workspace.CurrentCamera
    if cam then cam.CameraType=Enum.CameraType.Custom end
end
local function cinematicShow(info: any)
    local sceneData=Story.Scenes[info.id]
    if not sceneData then return end
    cinematicFinish()
    storyToken+=1
    local token=storyToken
    local cam=workspace.CurrentCamera
    if cam then
        cam.CameraType=Enum.CameraType.Scriptable
        local eye=Vector3.new(info.eye[1],info.eye[2],info.eye[3])
        local focus=Vector3.new(info.focus[1],info.focus[2],info.focus[3])
        cam.CFrame=CFrame.lookAt(eye,focus)
        if not reducedMotion then
            TweenService:Create(cam,TweenInfo.new(9,Enum.EasingStyle.Sine,Enum.EasingDirection.InOut),{
                CFrame=CFrame.lookAt(eye+Vector3.new(12,4,-6),focus+Vector3.new(0,3,0)),
            }):Play()
        end
    end
    cinematic=frame(gui,"MeridianCinematic",UDim2.fromScale(0,0),UDim2.fromScale(1,1),COLORS.ink)
    local scenePanel=cinematic
    scenePanel.BackgroundTransparency=.68
    scenePanel.ZIndex=15
    local top=Instance.new("Frame")
    top.Size=UDim2.new(1,0,0,70);top.BackgroundColor3=Color3.fromRGB(1,7,12);top.BorderSizePixel=0;top.Parent=scenePanel
    local bottom=Instance.new("Frame")
    bottom.Position=UDim2.new(0,0,1,-200);bottom.Size=UDim2.new(1,0,0,200)
    bottom.BorderSizePixel=0;bottom.BackgroundColor3=Color3.fromRGB(1,7,12);bottom.Parent=scenePanel
    local over=txt(top,sceneData.eyebrow,UDim2.fromScale(.07,.13),UDim2.fromScale(.88,.65),13,true)
    over.TextColor3=COLORS.mint
    txt(bottom,sceneData.title,UDim2.fromScale(.07,.09),UDim2.fromScale(.83,.2),25,true)
    local subtitle=txt(bottom,"",UDim2.fromScale(.07,.32),UDim2.fromScale(.86,.36),20)
    local page=1
    local function writeLine()
        if storyToken~=token then return end
        local line=sceneData.lines[page]
        subtitle.Text=string.upper(line.speaker).."\n"..line.text
    end
    writeLine()
    button(bottom,"NEXT",UDim2.fromScale(.79,.77),UDim2.fromScale(.12,.16),function()
        if storyToken~=token then return end
        page+=1
        if page>#sceneData.lines then cinematicFinish() else writeLine() end
    end)
    button(bottom,"SKIP",UDim2.fromScale(.67,.77),UDim2.fromScale(.1,.16),cinematicFinish)
end
update.OnClientEvent:Connect(function(kind: string, payload: any)
    if kind=="ProfileReady" then
        local data=fetchProfile()
        if data then showWorldMenu(data) else loadingText.Text="Unable to display world selection." end
    elseif kind=="State" then
        updateHud(payload)
    elseif kind=="Cinematic" then
        cinematicShow(payload)
    elseif kind=="Notice" then
        toast(tostring(payload))
    elseif kind=="Error" then
        loadingText.Text=tostring(payload)
        toast(tostring(payload))
    elseif kind=="Locked" then
        local id=string.match(tostring(payload),"^PASS:(%d+)$")
        if id then
            MarketplaceService:PromptGamePassPurchase(localPlayer,tonumber(id))
        else toast(tostring(payload)) end
    end
end)
UserInputService.InputBegan:Connect(function(input: InputObject, handled: boolean)
    if handled or cinematic then return end
    if input.KeyCode==Enum.KeyCode.B then buildPack()
    elseif input.KeyCode==Enum.KeyCode.J then journal()
    elseif input.KeyCode==Enum.KeyCode.R then action:FireServer("Save") end
end)
task.delay(1.4,function()
    if worldMenu or hud then return end
    local data=fetchProfile()
    if data then showWorldMenu(data) end
end)
]======])
print("Hollow Frontier First Light installed. Press Play, select a free world, and begin.")