--!strict
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