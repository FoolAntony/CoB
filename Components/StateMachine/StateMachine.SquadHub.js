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
          CANCEL:"checkSpells",
          DONE:"idle"
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
          CANCEL: "checkInventory",
          DONE:"idle"
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