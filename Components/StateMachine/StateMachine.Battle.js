import { createMachine, assign } from 'xstate';

function isNoNegotiation(context,event) {
  return context.isNoNegotiationWas && context.isNoTradeWas
}

function isNoTrade(context, event) {
  return context.isNoTradeWas
}

const setTradeIsFailed = assign({
  isNoTradeWas: (context,event) => context.isNoTradeWas = false
})

const setNegotiationIsFailed = assign({
  isNoNegotiationWas: (context,event) => context.isNoNegotiationWas = false
});

const battleMachine = createMachine({
  id: 'battle',
  initial: 'idle',
  context: {
    isNoNegotiationWas: true,
    isNoTradeWas: true
  },
  states: {
    idle: {
      on: {
        START: "kindOfMonsters"
      }
    },
    kindOfMonsters: {
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
        TRADE: {
          target: "doTrade",
          cond: "isNoTrade"
          },
        FIGHT: "doFight"
      }
    },
    doNegotiation: {
      on: {
        SUCCESS: "endSession",
        FAIL: {
          target: "chooseAction",
          actions: "setNegotiationIsFailed"
        }
      }
    },
    doTrade: {
      on:{
        SUCCESS: "endSession",
        FAIL: {
          target: "chooseAction",
          actions: "setTradeIsFailed"
        }
      }
    },
    doFight: {
      on: {
        WIN: "endSession",
        LOSE: "endSession"
      }
    },
    endSession: {
      type: 'final'
    },
  },
  predictableActionArguments: true
},
{
  guards: { isNoNegotiation, isNoTrade },
  actions: { setNegotiationIsFailed, setTradeIsFailed },
});