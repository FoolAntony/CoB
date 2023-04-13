import {createMachine} from "xstate";

export const hubMachine = createMachine(
  {
    id: "hub",
    initial: "idle",
    context: {
    },
    states: {
      idle: {
        on: {
          SPELLS: "checkSpells",
          INVENTORY: "checkInventory",
          REORGANIZE: "startReorganize",
        }
      },
      checkSpells:{
        on: {
          USE: "useSpell",
          CANCEL: "idle"
        }
      },
      useSpell:{
        on:{

        }
      },
      checkInventory:{
        on: {
          USE: "useItem",
          CANCEL: "idle"
        }
      },
      useItem:{
        on:{

        }
      },
      startReorganize:{
        on: {
          FINISH:"idle"
        }
      },
      finish: {
        type: "final"
      }
    },
    predictableActionArguments:true
  },
  {
    guards: {},
    actions: {},
  }
);