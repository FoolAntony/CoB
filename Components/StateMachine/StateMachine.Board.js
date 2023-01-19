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
          NEXT: "checkMonsters"
        }
      },
      checkMonsters: {
        on: {
          EXIST: "doBattle",
          NONE: {
            target:"idle",
            actions:"restoreGoNewTile"
          }
        }
      },
      doBattle: {
        on:{
          WIN: {
            target:"idle",
            actions:"restoreGoNewTile"
          },
          LOSE: "finish"
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