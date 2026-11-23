--!strict
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