--!strict
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