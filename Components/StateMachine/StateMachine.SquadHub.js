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
          CHOOSE: "chooseAction",
          CANCEL: "idle"
        }
      },
      chooseAction:{
        on:{
          USE: "useItem",
          TRADE: "tradeItem",
          GIVEAWAY: "giveItem",
          CANCEL: "checkInventory"
        }
      },
      useItem:{
        on:{
          CANCEL: "chooseAction",
          DONE:"idle"
        }
      },
      tradeItem:{
        on:{
          CANCEL: "chooseAction",
          DONE:"idle"
        }
      },
      giveItem:{
        on:{
          CANCEL: "chooseAction",
          DONE:"idle"
        }
      },
      startReorganize:{
        on: {
          FINISH:"idle"
        }
      }
    },
    predictableActionArguments:true
  },
  {
    guards: {},
    actions: {},
  }
);