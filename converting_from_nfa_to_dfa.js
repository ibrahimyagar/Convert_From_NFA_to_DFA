class NFAtoDFAConverter {
  constructor(nfa) {
    this.nfa = nfa;
    this.alphabet = nfa.alphabet;
    this.dfaStates = [];
    this.dfaTransitions = {};
    this.dfaAcceptingStates = [];

    // Dönüşüm işlemini başlat
    this.convert();
  }

  // NFA'yı DFA'ya dönüştür
  convert() {
    const initialState = this.epsilonClosure([this.nfa.initialState]);
    this.dfaStates.push(initialState);

    let unprocessedStates = [initialState];

    // Durumları işleyerek DFA durumlarını ve geçişlerini oluştur
    while (unprocessedStates.length > 0) {
      const currentState = unprocessedStates.pop();
      this.dfaTransitions[currentState] = {};

      for (let symbol of this.alphabet) {
        const nextState = this.epsilonClosure(this.move(currentState, symbol));
        if (nextState.length > 0 && !this.dfaStates.some(state => this.areSetsEqual(state, nextState))) {
          this.dfaStates.push(nextState);
          unprocessedStates.push(nextState);
        }
        this.dfaTransitions[currentState][symbol] = nextState;
      }

      // Durumun NFA'nın kabul durumlarından herhangi birini içerip içermediğini kontrol et
      const isAcceptingState = currentState.some(state => this.nfa.acceptingStates.includes(state));
      if (isAcceptingState) {
        this.dfaAcceptingStates.push(currentState);
      }
    }
  }

  // Bir dizi durumun epsilon kapanışını al
  epsilonClosure(states) {
    let closure = [...states];
    let stack = [...states];

    while (stack.length > 0) {
      const currentState = stack.pop();
      const currentStateTransitions = this.nfa.transitions[currentState];
      const epsilonTransitions = (currentStateTransitions && currentStateTransitions['ε']) || [];

      for (let nextState of epsilonTransitions) {
        if (!closure.includes(nextState)) {
          closure.push(nextState);
          stack.push(nextState);
        }
      }
    }

    return closure;
  }

  // Bir dizi durumdan belirli bir sembolle ulaşılabilecek durumları al
  move(states, symbol) {
    let moveResult = [];
    for (let state of states) {
      const stateTransitions = this.nfa.transitions[state];
      if (stateTransitions && stateTransitions[symbol]) {
        moveResult = moveResult.concat(stateTransitions[symbol]);
      }
    }
    return moveResult;
  }

  // İki durum kümesinin eşit olup olmadığını kontrol et
  areSetsEqual(set1, set2) {
    return set1.length === set2.length && set1.every(state => set2.includes(state));
  }

  // Ortaya çıkan DFA'yı tablo formatında göster
  displayDFATable() {
    console.log('DFA Geçiş Tablosu:');
    console.log('Durum'.padEnd(20) + '0'.padEnd(20) + '1'.padEnd(20));
    for (let state of this.dfaStates) {
      const stateStr = state.join(', ');
      const transition0 = this.dfaTransitions[state]['0'].join(', ') || '{}';
      const transition1 = this.dfaTransitions[state]['1'].join(', ') || '{}';
      console.log(stateStr.padEnd(20) + transition0.padEnd(20) + transition1.padEnd(20));
    }
  }

  // Ortaya çıkan DFA'yı grafik formatında göster
  displayDFAGraph() {
    console.log('DFA Grafiği:');
    for (let state of this.dfaStates) {
      const stateStr = state.join(', ');
      for (let symbol of this.alphabet) {
        const nextState = this.dfaTransitions[state][symbol];
        const nextStateStr = nextState.join(', ') || '{}';
        console.log(`${stateStr} --${symbol}--> ${nextStateStr}`);
      }
    }
  }

  // Ortaya çıkan DFA'yı formal dil tanımı olarak göster
  displayDFAFormal() {
    console.log('DFA\'nın Formal Tanımı:');
    console.log(`Durumlar: { ${this.dfaStates.map(state => `{${state.join(', ')}}`).join(', ')} }`);
    console.log(`Alfabe: { ${this.alphabet.join(', ')} }`);
    console.log(`Geçişler: {`);
    for (let state of this.dfaStates) {
      const stateStr = `{${state.join(', ')}}`;
      for (let symbol of this.alphabet) {
        const nextState = this.dfaTransitions[state][symbol];
        const nextStateStr = `{${nextState.join(', ')}}` || '{}';
        console.log(`  ${stateStr} --${symbol}--> ${nextStateStr}`);
      }
    }
    console.log(`}`);
    console.log(`Başlangıç Durumu: {${this.dfaStates[0].join(', ')}}`);
    console.log(`Kabul Durumları: { ${this.dfaAcceptingStates.map(state => `{${state.join(', ')}}`).join(', ')} }`);
  }

  // Ortaya çıkan DFA'yı göster
  displayDFA() {
    this.displayDFATable();
    console.log();
    this.displayDFAGraph();
    console.log();
    this.displayDFAFormal();
  }
}

// Örnek NFA
const nfa = {
  states: ['A', 'B', 'C'],
  alphabet: ['0', '1'],
  transitions: {
    'A': {'ε': ['B']},
    'B': {'0': ['B'], 'ε': ['C']},
    'C': {'1': ['C']}
  },
  initialState: 'A',
  acceptingStates: ['C']
};

// NFA'yı DFA'ya dönüştür
const converter = new NFAtoDFAConverter(nfa);

// Ortaya çıkan DFA'yı göster
converter.displayDFA();
