import { createMachine, assign } from 'xstate';

function isNoNegotiation(context,event) {
  return context.isNoNegotiationWas && context.isNoBriberyWas
}

function isNoBribery(context, event) {
  return context.isNoBriberyWas && context.isNoNegotiationWas === false
}

const setBriberyIsFailed = assign({
  isNoBriberyWas: (context,event) => context.isNoBriberyWas = false
})

const setNegotiationIsFailed = assign({
  isNoNegotiationWas: (context,event) => context.isNoNegotiationWas = false
});

export const battleMachine = createMachine({
  id: 'battle',
  initial: 'idle',
  context: {
    isNoNegotiationWas: true,
    isNoBriberyWas: true,
  },
  states: {
    idle: {
      on: {
        START: "kindOfMonsters"
      }
    },
    kindOfMonsters: {
      on:{
        NEXT: "monstersAmount"
      }
    },
    monstersAmount: {
      on:{
        NEXT: "findMonstersHP"
      }
    },
    findMonstersHP: {
      on: {
        REPEAT: {
          target: "findMonstersHP"
        },
        NEXT: "chooseAction"
      },
    },
    chooseAction: {
      on: {
        NEGOTIATE: {
          target: "doNegotiation",
          cond: "isNoNegotiation"
          },
        BRIBE: {
          target: "doBribery",
          cond: "isNoBribery"
          },
        FIGHT: "doFight"
      }
    },
    doNegotiation: {
      on: {
        BACK: "chooseAction",
        SUCCESS: "endSession",
        FAIL: {
          target: "chooseAction",
          actions: "setNegotiationIsFailed"
        }
      }
    },
    doBribery: {
      on:{
        BACK: "chooseAction",
        SUCCESS: "endSession",
        FAIL: {
          target: "chooseAction",
          actions: "setBriberyIsFailed"
        }
      }
    },
    doFight: {
      on: {
        BACK: "chooseAction",
        HEROES: "heroesTurn",
        MONSTERS: "monstersTurn"
      }
    },
    heroesTurn: {
      on: {
        FINISH: "monstersTurn",
        DONE: "getGold"
      }
    },
    monstersTurn: {
      on: {
        FINISH: "heroesTurn",
        DONE: "endSession"
      }
    },
    getGold: {
      on: {
        EXIST: "findGold",
        NEXT: "getJewelry"
      }
    },
    findGold:{
      on:{
        NEXT: "getJewelry"
      }
    },
    getJewelry: {
      on:{
        EXIST: "findJewelry",
        NEXT: "getMagicItem"
      }
    },
    findJewelry:{
      on:{
        NEXT: "getMagicItem"
      }
    },
    getMagicItem:{
      on:{
        EXIST: "findMagicItem",
        DONE: "endSession",
        NEXT: "getGold"
      }
    },
    findMagicItem:{
      on:{
        DONE: "endSession",
        NEXT: "getGold"
      }
    },
    endSession: {
      type: 'final'
    },
  },
  predictableActionArguments: true
},
{
  guards: { isNoNegotiation, isNoBribery },
  actions: { setNegotiationIsFailed, setBriberyIsFailed },
});