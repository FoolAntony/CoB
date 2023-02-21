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

const restoreGoNewTile = assign({
  goNewTile: (context,event) => context.goNewTile = false
})

export const boardMachine = createMachine(
  {
    id: "board",
    initial: "idle",
    context: {
      isBossAlive: false,
      goNewTile: false
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
          NEXT: "moveSquad"
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
        on:{
          FURNITURE: "furniture",
          MIRROR: "mirror",
          ART: "art",
          TRAPDOOR: "trapdoor",
          STATUE: "statue",
          STAIRS: "stairs",
          FOUNTAIN: "fountain",
          ALTAR: "altar"
        }
      },
      fountain:{
        on:{
          NEXT:"idle"
        }
      },
      statue:{
        on:{
          TRANSFER: "",
          NEXT:"idle",
        }
      },
      furniture: {
        on:{

        }
      },
      mirror:{
        on:{

        }
      },
      trapdoor:{
        on:{

        }
      },
      stairs:{
        on:{

        }
      },
      altar:{
        on:{

        }
      },
      art:{
        on:{

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
    actions: { setBossIsDefeated, restoreGoNewTile, setGoNewTile },
  }
);