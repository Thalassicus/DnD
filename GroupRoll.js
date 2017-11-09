// By: Thalassicus

var GroupRoll = GroupRoll || (function() {
    'use strict'

    var version = '1.0',
        lastUpdate = 1427604271,
		
	getD20Roll = function(rollType, modifier){
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
                    var result = ''
                    var count = 1

                    switch(cmds[0]) {
                        case 'perception':
                            result += 'perception: '
                            _.chain(msg.selected)
                				.map(function(o){return getObj('graphic',o._id)})
                				.compact()
                				.each(function(obj){
                				    var characterID = obj.get('represents')
                				    var modifier = getAttrByName(characterID, 'perception'+'Mod')
                				    if (modifier == 0) modifier = getAttrByName(characterID, 'wisdom'+'Mod')
                				    result += getD20Roll(cmds[1], modifier)
                            })
                            sendChat('', '/w gm '+result)
                            break
                        case 'stealth':
                            result += 'stealth: '
                            _.chain(msg.selected)
                				.map(function(o){return getObj('graphic',o._id)})
                				.compact()
                				.each(function(obj){
                				    var characterID = obj.get('represents')
                				    var modifier = getAttrByName(characterID, 'stealth'+'Mod')
                				    if (modifier == 0) modifier = getAttrByName(characterID, 'dexterity'+'Mod')
                				    result += getD20Roll(cmds[1], modifier)
                            })
                            sendChat('', '/w gm '+result)
                            break
                        case 'save':
                            result += cmds[1]+' saves: '
                            _.chain(msg.selected)
                				.map(function(o){return getObj('graphic',o._id)})
                				.compact()
                				.each(function(obj){
                				    obj.set('status_yellow', count++)
                				    var characterID = obj.get('represents')
                				    var modifier = getAttrByName(characterID, cmds[1]+'Save')
                				    if (modifier == 0) modifier = getAttrByName(characterID, cmds[1]+'Mod')
                				    result += getD20Roll(cmds[2], modifier)
                            })
                            sendChat('DM', result)
                            break
                        case 'roll':
							if (cmds[1] == 'attack'){
								result += 'Mass Attack'
								_.chain(msg.selected)
									.map(function(o){return getObj('graphic',o._id)})
									.compact()
									.each(function(obj){
										obj.set('status_yellow', count++)
										var characterID = obj.get('represents')
										result += '\n' + getD20Roll(cmds[2], getAttrByName(characterID, 'attackHitMod'))
										result += ' for [[' + getAttrByName(characterID, 'attackDamageRoll') + ']] '
										result += getAttrByName(characterID, 'attackDamageType')
								})
								sendChat('DM', result)
							} else {
								result += cmds[1]+' rolls: '
								var modifierName = cmds[1]+'Mod'
								_.chain(msg.selected)
									.map(function(o){return getObj('graphic',o._id)})
									.compact()
									.each(function(obj){
										obj.set('status_yellow', count++)
										var characterID = obj.get('represents')
										var modifier = getAttrByName(characterID, modifierName)
										result += getD20Roll(cmds[2], modifier)
								})
								sendChat('DM', result)
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
