--!strict
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