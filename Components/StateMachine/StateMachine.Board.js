import { createMachine, assign, actions } from "xstate";

export const boardMachine = createMachine(
  {
    id: "board",
    initial: "idle",
    context: {
    },
    states: {
      idle: {
        on: {
          NEW: "chooseNewTile",
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
          EXIST: "doDetrap",
          NONE: "moveSquad"
        }
      },
      doDetrap: {
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
          NONE: "idle"
        }
      },
      doBattle: {
        on:{
          WIN: "idle",
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
    guards: { },
    actions: { },
  }
);