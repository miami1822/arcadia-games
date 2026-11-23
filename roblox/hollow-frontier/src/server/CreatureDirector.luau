--!strict
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