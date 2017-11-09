As the script loops through selected tokens, it marks each token with a numbered yellow badge corresponding to its place in the list of rolls. The "erase" macro clears these badges. This can handle a maximum of 9 tokens at a time, as that is the highest number a badge can display.

I use custom attributes because I feel the character sheets available online do too much. I like keeping things simple.


===== MACROS =====

"Erase"
!group-roll --clearmarkers

"Roll"
!group-roll --roll ?{Roll|attack|perception|stealth|strength|dexterity|constitution|intelligence|wisdom|charisma} ?{Type|standard|advantage|disadvantage}

"Saving-Throw"
!group-roll --save ?{Saving Throw|strength|dexterity|constitution|intelligence|wisdom|charisma} ?{Type|standard|advantage|disadvantage}

"Stealth-Perception"
!group-roll --perception ?{Perception|standard|advantage|disadvantage}
!group-roll --stealth ?{Stealth|standard|advantage|disadvantage}


===== ATTRIBUTES =====

attackHitMod
attackDamageRoll
attackDamageType

perceptionMod
stealthMod
strengthMod
dexterityMod
constitutionMod
intelligenceMod
wisdomMod
charismaMod

strengthSave
dexteritySave
constitutionSave
intelligenceSave
wisdomSave
charismaSave