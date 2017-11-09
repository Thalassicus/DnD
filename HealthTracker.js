// By: Thalassicus

var HealthTracker = HealthTracker || (function() {
    'use strict'

    var version = '1.0',
        lastUpdate = 1427604271,
		HitPointBarNum  = 3,
        TempHitPointsIn = 'temp_HP',

        statusBloodied		= 'status_red',
        statusDeathFail		= 'status_death-zone',
        statusDeathSuccess	= 'status_broken-heart',
        statusUnconscious	= 'status_pummeled',
        statusDead			= 'status_dead',
        statusProne			= 'status_back-pain',


        CurrentHPLocation = 'bar' + HitPointBarNum + '_value',
        MaxHPLocation     = 'bar' + HitPointBarNum + '_max',

    TokenChange = function(obj, prev) {
        if (obj.get("isdrawing")) return
        if (obj.get(CurrentHPLocation) === "") return
        
	    var characterID = obj.get('represents')
	    if (characterID && getAttrByName(characterID, 'isBoss') == 1) return

        var HP = {
            now: parseInt(obj.get(CurrentHPLocation),10) || 0,
            old: parseInt(prev[CurrentHPLocation],10) || 0,
            max: parseInt(obj.get(MaxHPLocation),10) || 0,
            tmp: 0
        },
        deathFailCount  = 0,
        tmpHPInAttr = false,
        tmpHPAttr   ,
        target      = {}

        if (HP.max == 0) return

        if(obj.get(TempHitPointsIn)) {
            HP.tmp = parseInt(obj.get(TempHitPointsIn),10) || 0
        } else if(obj.get('represents')) {
            tmpHPInAttr = true
            tmpHPAttr = findObjs({_type: 'attribute', _characterid: obj.get('represents'), name: TempHitPointsIn})[0]
            if(tmpHPAttr) {
               HP.tmp = parseInt(tmpHPAttr.get('current'),10) || 0
            }
        }
            
        HP.bloodied = Math.floor(HP.max/2) || 0
        HP.dead = -HP.max
        HP.delta = HP.now-HP.old
          
        if ( HP.delta != 0 ) {
            if (HP.tmp && (HP.delta < 0 )) {
                target[TempHitPointsIn] = Math.max( HP.tmp + HP.delta, 0 )
                HP.delta = Math.min( HP.delta + HP.tmp, 0 )
                target[CurrentHPLocation] = Math.min( HP.old + HP.delta, HP.max )
                HP.now = target[CurrentHPLocation]
                HP.tmp = target[TempHitPointsIn]
            } else if (HP.now > HP.max) {
                HP.now=HP.max
                target[CurrentHPLocation]=HP.max
            }

            if ( HP.now <= HP.dead ) {
				target[statusDead]			= true
				target[statusDeathSuccess]	= false
				target[statusDeathFail]		= false
				target[statusProne]			= false
            } else {
				target[statusDead]			= false
            }

            if ( HP.now <= 0 && HP.now > HP.dead ) {
				target[statusProne]	= true
                addDeathFail(obj)
            } else {
				target[statusDeathSuccess]	= false
				target[statusDeathFail]	= false
            }
            
            if (HP.now > 0 && (obj.get(statusDeathFail) || obj.get(statusUnconscious) || obj.get(statusDead))){
				target[statusUnconscious]	= false
				target[statusDead]			= false
				target[statusDeathSuccess]	= false
				target[statusDeathFail]		= false
				target[statusProne]	= true
            }

            if ( HP.now > 0 && HP.now <= HP.bloodied ) {
                target[statusBloodied] = true
            } else {
                target[statusBloodied] = false
            }
            
            if (HP.now < 0) {
                HP.now=0
                target[CurrentHPLocation]=0
            }
            
            if(tmpHPInAttr) {
                if(tmpHPAttr && undefined !== target[TempHitPointsIn] ) {
                   tmpHPAttr.set({current: (target[TempHitPointsIn] || 0)})
                }
                delete target[TempHitPointsIn]
            }
            obj.set(target)
          }
    },
    
    addDeathFail = function(obj){
        if (!isDying(obj)) return
        var deathFailCount = 1 + parseInt(obj.get(statusDeathFail) || -1)
		var target = {}
		log ("deathFailCount = " + deathFailCount)
        if (deathFailCount >= 3) {
			target[statusDead]			= true
			target[statusDeathSuccess]	= false
			target[statusDeathFail]		= false
		    obj.set(target)
        } else {
			obj.set(statusDeathFail, deathFailCount)
        }  
    },
    
    addDeathSuccess = function(obj){
        if (!isDying(obj)) return
        var deathSuccessCount = 1 + parseInt(obj.get(statusDeathSuccess) || 0)
		var target = {}
        if (deathSuccessCount >= 3) {
			target[statusUnconscious]	= true
			target[statusProne]			= true
			target[statusDeathSuccess]	= false
			target[statusDeathFail]		= false
		    obj.set(target)
        } else {
			obj.set(statusDeathSuccess, deathSuccessCount)
        }  
    },
    
    isDying = function(obj){
        return !obj.get(statusDead) && !obj.get(statusUnconscious) && parseInt(obj.get(CurrentHPLocation),10) <= 0
    },
    
    doCommand = function(msg) {
        if (msg.type != "api" || !playerIsGM(msg.playerid)) return
        
        var args = msg.content.split(/\s+--/)
        switch(args.shift()) {
            case '!health-tracker':
                if(args.length > 0) {
                    var cmds = args.shift().split(/\s+/)

                    switch(cmds[0]) {
                        case 'savingthrow':
                            _.chain(msg.selected).map(function(o){return getObj('graphic',o._id)}).compact().each(function(obj){
            				    if (isDying(obj)) {
									var dieRoll = randomInteger(20)
									var chatMessage = "Death saving throw: "+(dieRoll||"undefined")
									if (dieRoll == 20){
    									chatMessage += " (revived!)"
										var target = {}
										target[CurrentHPLocation]	= 1
										target[statusProne]	= true
										target[statusBloodied]	= true
										target[statusDeathSuccess]	= false
										target[statusDeathFail]	= false
									} else if (dieRoll == 1){
    									chatMessage += " (2 fails)"
										addDeathFail(obj)
										addDeathFail(obj)
									} else if (dieRoll >= 10){
    									chatMessage += " (success)"
										addDeathSuccess(obj)
									} else {
    									chatMessage += " (fail)"
										addDeathFail(obj)
									}
									sendChat("DM", chatMessage)
            				    }
                            })
                            break
                        case 'deathfail':
                            _.chain(msg.selected)
                				.map(function(o){return getObj('graphic',o._id)})
                				.compact()
                				.each(function(obj){
                				    addDeathFail(obj)
                            })
                            break
                        default:
                            sendChat("GroupRoll", "/w gm invalid command: "+cmds[0])
                            break
                    }
                }
			default:
				break
        }
    },

	checkInstall = function() {
        log('-=> HealthTracker v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']')
	},

    RegisterEventHandlers = function() {
        on('change:token', TokenChange)
        on('chat:message', doCommand)
    }

    return {
		CheckInstall: checkInstall,
        RegisterEventHandlers: RegisterEventHandlers
    }
}())

on('ready',function(){
    'use strict'

    HealthTracker.CheckInstall()
    HealthTracker.RegisterEventHandlers()
})
