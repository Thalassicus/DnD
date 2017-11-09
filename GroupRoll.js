// By: Thalassicus

var GroupRoll = GroupRoll || (function() {
    'use strict'

    var version = '1.0',
        lastUpdate = 1427604271,
		
	getD20Roll = function(rollType, modifier){
		modifier = modifier || 0
		if (rollType == 'advantage'){
			return '[[2d20kh1+' + modifier + ']]'
		} else if (rollType == 'disadvantage') {
			return '[[2d20kl1+' + modifier + ']]'
		} else {
			return '[[1d20+' + modifier + ']]'
		}
	},
    
    doCommand = function(msg) {
        if (msg.type != 'api') return
        if (!playerIsGM(msg.playerid)) return
        
        
        var args = msg.content.split(/\s+--/)
        switch(args.shift()) {
            case '!group-roll':
                if(args.length > 0) {
                    var cmds = args.shift().split(/\s+/)
                    var chatOutput = ''
                    var count = 1

                    switch(cmds[0]) {
                        case 'perception':
                            chatOutput += 'perception: '
                            _.chain(msg.selected)
                				.map(function(o){return getObj('graphic',o._id)})
                				.compact()
                				.each(function(obj){
                				    var characterID = obj.get('represents')
                				    var modifier = getAttrByName(characterID, 'perception'+'Mod')
                				    if (!modifier || modifier == 0) modifier = getAttrByName(characterID, 'wisdom'+'Mod') || 0
                				    chatOutput += getD20Roll(cmds[1], modifier)
                            })
                            sendChat('', '/w gm '+chatOutput)
                            break
                        case 'stealth':
                            chatOutput += 'stealth: '
                            _.chain(msg.selected)
                				.map(function(o){return getObj('graphic',o._id)})
                				.compact()
                				.each(function(obj){
                				    var characterID = obj.get('represents')
                				    var modifier = getAttrByName(characterID, 'stealth'+'Mod')
                				    if (!modifier || modifier == 0) modifier = getAttrByName(characterID, 'dexterity'+'Mod') || 0
                				    chatOutput += getD20Roll(cmds[1], modifier)
                            })
                            sendChat('', '/w gm '+chatOutput)
                            break
                        case 'save':
                            chatOutput += cmds[1]+' saves: '
                            _.chain(msg.selected)
                				.map(function(o){return getObj('graphic',o._id)})
                				.compact()
                				.each(function(obj){
                				    obj.set('status_yellow', count++)
                				    var characterID = obj.get('represents')
                				    var modifier = getAttrByName(characterID, cmds[1]+'Save')
                				    if (!modifier || modifier == 0) modifier = getAttrByName(characterID, cmds[1]+'Mod') || 0
                				    chatOutput += getD20Roll(cmds[2], modifier)
                            })
                            sendChat('DM', chatOutput)
                            break
                        case 'roll':
							if (cmds[1] == 'attack'){
								chatOutput += '/me Attacks'
								_.chain(msg.selected)
									.map(function(o){return getObj('graphic',o._id)})
									.compact()
									.each(function(obj){
										obj.set('status_yellow', count++)
										var characterID = obj.get('represents')
										var attackHitMod = getAttrByName(characterID, 'attackHitMod')
										var attackDamageRoll = getAttrByName(characterID, 'attackDamageRoll')
										var attackDamageType = getAttrByName(characterID, 'attackDamageType')
										chatOutput += '\n' + getD20Roll(cmds[2], attackHitMod) + ' to hit'
										if (attackDamageRoll){
											chatOutput += ' for [[' + attackDamageRoll + ']] '+ attackDamageType
										}
								})
								sendChat('DM', chatOutput)
							} else {
								chatOutput += cmds[1]+' rolls: '
								var modifierName = cmds[1]+'Mod'
								_.chain(msg.selected)
									.map(function(o){return getObj('graphic',o._id)})
									.compact()
									.each(function(obj){
										obj.set('status_yellow', count++)
										var characterID = obj.get('represents')
										var modifier = getAttrByName(characterID, modifierName) || 0
										chatOutput += getD20Roll(cmds[2], modifier)
								})
								sendChat('DM', chatOutput)
							}
                            break
                        case 'clearmarkers':
                            _.chain(msg.selected)
                				.map(function(o){return getObj('graphic',o._id)})
                				.compact()
                				.each(function(obj){
                				    obj.set('status_yellow', false)
                            })
                            break
                        default:
                            sendChat('GroupRoll', '/w gm invalid command: '+cmds[0])
                            break
                    }
                }
			default:
				break
        }
    },

    RegisterEventHandlers = function() {
        on('chat:message', doCommand)
    }

    return {
        RegisterEventHandlers: RegisterEventHandlers
    }
}())

on('ready',function(){
    'use strict'

    GroupRoll.RegisterEventHandlers()
})
