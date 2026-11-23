--!strict
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