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

const updateAttacks = assign({
  hellGatesAttacks: (context,event) => context.hellGatesAttacks + 1
})

const restoreAttacks = assign({
  hellGatesAttacks: (context,event) => context.hellGatesAttacks = 1
})

export const battleMachine = createMachine({
  id: 'battle',
  initial: 'idle',
  context: {
    isNoNegotiationWas: true,
    isNoBriberyWas: true,
    hellGatesAttacks: 1
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
        DONE: "getGold",
        DONEROOM: "endSession"
      }
    },
    monstersTurn: {
      on: {
        FINISH: "heroesReformation",
        FINISHBOSS: "hellGatesTurn",
        DONE: "endSession"
      }
    },
    hellGatesTurn: {
      on: {
        NEXT: {
          target:"hellGatesTurn",
          actions:"updateAttacks"
        },
        FINISH: {
          target:"heroesReformation",
          actions:"restoreAttacks"
        },
        DONE: "endSession"
      }
    },
    heroesReformation:{
      on:{
        NEXT: "monstersReformation"
      }
    },
    monstersReformation:{
      on:{
        NEXT: "heroesTurn"
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
        NEXT: "assignJewelry"
      }
    },
    assignJewelry:{
      on:{
        REPEAT: "findJewelry",
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
        NEXT: "assignMagicItem"
      }
    },
    assignMagicItem:{
      on:{
        DONE: "endSession",
        REPEAT: "findMagicItem",
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
  actions: { setNegotiationIsFailed, setBriberyIsFailed, updateAttacks, restoreAttacks },
});