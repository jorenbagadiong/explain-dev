// Learner programs for the real-browser grading integrity suite. None are imported into the app.
const correct = `import {useState} from 'react';
export default function App(){const [count,setCount]=useState(0);return <main><p aria-live="polite">Count: {count}</p><button onClick={()=>setCount(count+1)}>Increment</button><button onClick={()=>setCount(count-1)}>Decrement</button><button onClick={()=>setCount(0)}>Reset</button></main>}`;
module.exports = {
 correct,
 autofocus:correct.replace('onClick={()=>setCount(count+1)}','autoFocus onClick={()=>setCount(count+1)}'),
 functional:correct.replaceAll('setCount(count+1)','setCount(previous=>previous+1)').replaceAll('setCount(count-1)','setCount(previous=>previous-1)'),
 reducer:`import {useReducer} from 'react';export default function App(){const [amount,send]=useReducer((s,a)=>a==='r'?0:s+a,0);return <section><output aria-label="Count">{amount}</output><button aria-label="Increment" onClick={()=>send(1)}>+</button><button aria-label="Decrement" onClick={()=>send(-1)}>-</button><button onClick={()=>send('r')}>Reset</button></section>}`,
 classCounter:`import {Component} from 'react';export default class App extends Component {state={n:0};render(){return <div><span>Count: <strong>{this.state.n}</strong></span><button onClick={()=>this.setState(({n})=>({n:n+1}))}>Increment</button><button onClick={()=>this.setState(({n})=>({n:n-1}))}>Decrement</button><button onClick={()=>this.setState({n:0})}>Reset</button></div>}}`,
 missingIncrement:correct.replace('setCount(count+1)','void 0'),
 wrongDecrement:correct.replace('setCount(count-1)','setCount(count+1)'),
 brokenReset:correct.replace('setCount(0)','setCount(99)'),
 wrongInitial:correct.replace('useState(0)','useState(5)'),
 stale:correct.replace("import {useState}","import {useState,useCallback}").replace('return <main>','const add=useCallback(()=>setCount(count+1),[]);return <main>').replace('onClick={()=>setCount(count+1)}','onClick={add}'),
 noNegative:correct.replace('setCount(count-1)','setCount(Math.max(0,count-1))'),
 globalState:`import {useState} from 'react';let amount=0;export default function App(){const [count,render]=useState(amount);return <div><p>Count: {count}</p><button onClick={()=>render(++amount)}>Increment</button><button onClick={()=>render(--amount)}>Decrement</button><button onClick={()=>render(amount=0)}>Reset</button></div>}`,
 syntax:'export default function App(){return <div>}',
 renderError:'export default function App(){throw new Error("Intentional render failure");}',
 eventError:correct.replace('setCount(count+1)','(()=>{throw new Error("Intentional click failure")})()'),
 loop:'export default function App(){while(true){} return null}',
 neverSettles:`import {use} from 'react'; const pending=new Promise(()=>{});export default function App(){use(pending);return null}`,
};
