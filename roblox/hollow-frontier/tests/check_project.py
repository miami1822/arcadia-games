#!/usr/bin/env python3
"""Static structural checks. These do not execute Roblox code or replace Studio QA."""
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
files = sorted((ROOT / 'src').rglob('*.luau'))
expected = {
    'src/shared/Config.luau', 'src/shared/Story.luau', 'src/shared/WorldMath.luau',
    'src/server/Main.server.luau', 'src/server/ProfileStore.luau',
    'src/server/WorldBuilder.luau', 'src/server/CreatureDirector.luau',
    'src/client/Main.client.luau'
}
assert set(str(p.relative_to(ROOT)) for p in files) == expected
project=json.loads((ROOT / 'default.project.json').read_text())
assert 'Workspace' in project['tree']
assert project['tree']['ReplicatedStorage']['HollowShared']['$path']=='src/shared'
assert project['tree']['ServerScriptService']['HollowFrontier']['$path']=='src/server'
assert project['tree']['StarterPlayer']['StarterPlayerScripts']['HollowFrontier']['$path']=='src/client'

def balanced(code, path):
    """Check quoted literals and nesting (not a full Luau syntax parser)."""
    stack=[]
    i=0
    line=1
    matching={')':'(',']':'[','}':'{'}
    while i<len(code):
        c=code[i]
        if c=='\n': line+=1
        if code[i:i+2]=='--':
            if code[i:i+4]=='--[[':
                end=code.find(']]',i+4)
                assert end>=0, (path,line,'unclosed block comment')
                line+=code[i:end+2].count('\n');i=end+2;continue
            end=code.find('\n',i)
            if end<0: break
            i=end;continue
        if c in "\"'":
            marker=c
            i+=1
            while i<len(code):
                if code[i]=='\\': i+=2;continue
                if code[i]==marker: i+=1;break
                if code[i]=='\n':line+=1
                i+=1
            else:raise AssertionError((path,line,'unclosed string'))
            continue
        if c in '([{':stack.append((c,line))
        elif c in ')]}':
            assert stack and stack[-1][0]==matching[c],(path,line,'bad bracket')
            stack.pop()
        i+=1
    assert not stack,(path,stack[-1] if stack else None)

for f in files:
    content=f.read_text()
    assert content.startswith('--!strict'),f
    balanced(content,str(f))
    assert '\t' not in content, (f,'tabs')

config=(ROOT/'src/shared/Config.luau').read_text()
server=(ROOT/'src/server/Main.server.luau').read_text()
client=(ROOT/'src/client/Main.client.luau').read_text()
save=(ROOT/'src/server/ProfileStore.luau').read_text()
world=(ROOT/'src/server/WorldBuilder.luau').read_text()
life=(ROOT/'src/server/CreatureDirector.luau').read_text()
assert 'Config.FreeSlots = 3' in config and 'Config.MaxSlots = 6' in config
assert all(re.search(fr'\[{i}\] = 0', config) for i in (4,5,6)), 'Never ship fake pass IDs'
assert 'MarketplaceService:UserOwnsGamePassAsync' in server
assert 'UpdateAsync' in save and 'lease.nonce' in save
assert 'PlayerRemoving' in server and 'BindToClose' in server
assert 'typeof(payload)' in server and 'Config.MinActionDelay' in server
assert 'inRange(player,console,Config.InteractionDistance)' in server
assert 'ProfileStore.Load' in server and 'ProfileStore.Save' in server
assert 'WorldBuilder.Create' in server and 'WorldBuilder.Regrow' in server
assert 'CreatureDirector.Start' in server and 'CreatureDirector.Update' in server
assert 'Enum.Material.Grass' in world and 'Frostline Observatory' in world
assert 'Ashwood Archive' in world and 'Meridian Station Nine' in world
assert 'GetProfile' in client and 'cinematicShow' in client and 'UserInputService' in client
assert 'PromptGamePassPurchase' in client
assert 'player:LoadCharacter' not in client
assert 'GetDataStore' not in client
assert 'HollowFrontierLobby' in server
print(f'PASS: {len(files)} Luau sources, Rojo manifest, save/security contracts, UI, biomes, lore and creature modules.')