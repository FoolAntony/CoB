import { createMachine, assign, actions } from "xstate";

const setBossIsDefeated = assign({
  isBossAlive: (context,event) => context.isBossAlive = true
})

function BossAlive(context,event) {
  return context.isBossAlive === true
}

const setGoNewTile = assign({
  goNewTile: (context,event) => context.goNewTile = true
})

const setIsRoomTrue = assign({
  isRoom: (context,event) => context.isRoom = true
})

const setIsRoomFalse = assign({
  isRoom: (context,event) => context.isRoom = false
})

const restoreGoNewTile = assign({
  goNewTile: (context,event) => context.goNewTile = false
})

export const boardMachine = createMachine(
  {
    id: "board",
    initial: "idle",
    context: {
      isBossAlive: false,
      goNewTile: false,
      isRoom: false
    },
    states: {
      idle: {
        always: {
          target: "finish",
          cond: "BossAlive"
        },
        on: {
          NEW: {
            target:"chooseNewTile",
            actions:"setGoNewTile"
          },
          OLD: "choosePrevTile"
        },
      },
      chooseNewTile: {
        on: {
          NEXT: "checkTraps"
        },
      },
      checkTraps: {
        on: {
          EXIST: "chooseMember",
          NONE: "moveSquad"
        }
      },
      chooseMember:{
        on:{
          NEXT:"doDetrap"
        }
      },
      doDetrap: {
        on: {
          SUCCESSROOM:"getGold",
          SUCCESS: "moveSquad",
          FAIL: "findType"
        }
      },
      findType: {
        on: {
          NEXT: "doAction"
        }
      },
      doAction: {
        on: {
          NEXT: "moveSquad",
          NEXTROOM: "getGold",
          FAILROOM: {
            target:"idle",
            actions: "setIsRoomFalse"
          }
        }
      },
      choosePrevTile: {
        on: {
          NEXT: "moveSquad"
        }
      },
      moveSquad: {
        on: {
          NEXT: {
            target: "checkMonsters",
          }
        }
      },
      checkMonsters: {
        on: {
          EXIST: {
            target: "doBattle",
            actions:"restoreGoNewTile"
          },
          NONE: {
            target:"chooseAfterBattleAction",
            actions:"restoreGoNewTile"
          }
        }
      },
      doBattle: {
        on:{
          WIN: "chooseAfterBattleAction",
          WINROOM: {
            target: "idle",
            actions: "setIsRoomFalse"
          },
          TREASURE:"getGold",
          LOSE: "finish"
        }
      },
      chooseAfterBattleAction: {
        on:{
          NEXT: "idle",
          CHECK: "chooseRoomMember"
        }
      },
      chooseRoomMember:{
        on: {
          NEXT:{
            target:"checkRoom",
            actions:"setIsRoomTrue"
          }
        }
      },
      checkRoom:{
        on:{
          NEXT: "checkRoomType"
        }
      },
      checkRoomType:{
        on: {
          BATTLE:"doBattle",
          CHECK:"checkMonsters",
          TRAP:"doDetrap",
          TREASURE:"getGold",
          NEXT:{
            target:"idle",
            actions:"setIsRoomFalse"
          }
        }
      },
      getGold: {
        on: {
            EXIST: "findGold",
            NEXT: "getJewelry"
        }
      },
      findGold: {
        on: {
            NEXT: "getJewelry"
        }
      },
      getJewelry: {
        on: {
            EXIST: "findJewelry",
            NEXT: "getMagicItem"
        }
      },
      findJewelry: {
        on: {
            NEXT: "assignJewelry"
        }
      },
      assignJewelry: {
        on: {
            REPEAT: "findJewelry",
            NEXT: "getMagicItem"
        }
      },
      getMagicItem: {
        on: {
            EXIST: "findMagicItem",
            DONE: {
            target:"idle",
            actions:"setIsRoomFalse"
          },
            NEXT: "getGold"
        }
      },
      findMagicItem: {
        on: {
            NEXT: "assignMagicItem"
        }
      },
      assignMagicItem: {
        on: {
            DONE: {
              target:"idle",
              actions:"setIsRoomFalse"
            },
            REPEAT: "findMagicItem"
        }
      },
      finish: {
        type: "final"
      }
    },
    predictableActionArguments:true
  },
  {
    guards: { BossAlive },
    actions: { setBossIsDefeated, restoreGoNewTile, setGoNewTile, setIsRoomTrue, setIsRoomFalse },
  }
);