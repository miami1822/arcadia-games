#!/usr/bin/env python3
"""Creates a single offline Roblox Studio Command Bar installer from source files.

The installer only changes the currently-open Studio place; it does not
publish an experience or read external URLs.
"""
from pathlib import Path

base=Path(__file__).resolve().parents[1]
script_paths=[
('ReplicatedStorage','HollowShared','Config','ModuleScript', 'src/shared/Config.luau'),
('ReplicatedStorage','HollowShared','Story','ModuleScript','src/shared/Story.luau'),
('ReplicatedStorage','HollowShared','WorldMath','ModuleScript','src/shared/WorldMath.luau'),
('ServerScriptService','HollowFrontier','WorldBuilder','ModuleScript','src/server/WorldBuilder.luau'),
('ServerScriptService','HollowFrontier','CreatureDirector','ModuleScript','src/server/CreatureDirector.luau'),
('ServerScriptService','HollowFrontier','ProfileStore','ModuleScript','src/server/ProfileStore.luau'),
('ServerScriptService','HollowFrontier','Main','Script','src/server/Main.server.luau'),
('StarterPlayerScripts','HollowFrontier','Main','LocalScript','src/client/Main.client.luau'),
]
code=['''--!strict
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
''']
for service, folder, name, class_name, path in script_paths:
    source=(base/path).read_text()
    n=6
    while ']'+'='*n+']' in source:
        n+=1
    left='['+'='*n+'['
    right=']'+'='*n+']'
    code.append('install(folders.'+service+', '+repr(name).replace("'",'"')+', '+repr(class_name).replace("'",'"')+', '+left+source+right+')\n')
code.append('''print("Hollow Frontier First Light installed. Press Play, select a free world, and begin.")
''')
output=base/'InstallInStudio.commandbar.luau'
output.write_text(''.join(code))
print(f'Generated {output.name}: {output.stat().st_size:,} bytes containing {len(script_paths)} scripts')