/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
function solution(slug) {
 const text=fs.readFileSync(`src/content/labs/react/${slug}-solution.ts`,'utf8');
 const quoted=/"code":\s*("(?:[^"\\]|\\.)*")/.exec(text);
 return quoted?JSON.parse(quoted[1]):/code: `([\s\S]*?)`,/.exec(text)[1];
}
const cleanup=`import { useEffect, useState } from "react";
export default function Ticker(){const [ticks,setTicks]=useState(0);useEffect(()=>{const id=setInterval(()=>setTicks(previous=>previous+1),1000);return ()=>clearInterval(id)},[]);return <p>Ticks: {ticks}</p>}`;
const reducer = code => code.replace(/useState/g,'useReducer').replace(/useReducer\((""|false|0)\)/g,'useReducer((state, next) => typeof next === "function" ? next(state) : next, $1)');
const fixtures=[
 {id:'react-use-state-counter',code:solution('use-state-counter')},
 {id:'react-controlled-input',code:solution('controlled-input')},
 {id:'react-list-filtering',code:solution('list-filtering')},
 {id:'react-conditional-rendering',code:solution('conditional-rendering')},
 {id:'react-effect-cleanup',code:cleanup},
];
if (fs.existsSync('src/content/labs/react/effect-cleanup-solution.ts')) fixtures[4].code = solution('effect-cleanup');
const cases=fixtures.flatMap(({id,code})=>[
 {id,name:'reference',code,expected:'pass'},
 {id,name:'reducer alternative',code:reducer(code),expected:'pass'},
 {id,name:'syntax',code:'export default function App(){return <main>',expected:'compile-error'},
 {id,name:'render error',code:'export default function App(){throw new Error("ED022 render")}',expected:'nonpass'},
 {id,name:'loop timeout',code:'export default function App(){while(true){} return <p/>}',expected:'nonpass'},
 {id,name:'suspended timeout',code:'import {use} from "react"; const wait=new Promise(()=>{});export default function App(){use(wait);return <p/>}',expected:'nonpass'},
]);
const add=(id,name,code,expected='nonpass')=>cases.push({id,name,code,expected});
const counter=fixtures[0].code,input=fixtures[1].code,list=fixtures[2].code,conditional=fixtures[3].code;
add(fixtures[0].id,'constant hardcoded count',counter.replace('setCount(previous => previous + 1);','setCount(1);'));
add(fixtures[1].id,'hardcoded greeting',input.replace('{name || "stranger"}','{"stranger"}'));
add(fixtures[1].id,'stale greeting',input.replace('setName(event.target.value)','setName(name || event.target.value)'));
add(fixtures[1].id,'wrong empty fallback',input.replace('"stranger"','"friend"'));
add(fixtures[1].id,'class alternative',`import {Component} from "react";export default class App extends Component{state={text:""};render(){return <main><input aria-label="Name" value={this.state.text} onChange={e=>this.setState({text:e.target.value})}/><output aria-label="Greeting">Hello, {this.state.text||"stranger"}!</output></main>}}`,'pass');
add(fixtures[2].id,'hardcoded unfiltered list',list.replace('fruits.filter(fruit => fruit.toLowerCase().includes(query.toLowerCase()))','fruits'));
add(fixtures[2].id,'case sensitive',list.replace('fruit.toLowerCase().includes(query.toLowerCase())','fruit.includes(query)'));
add(fixtures[2].id,'exact rather than partial',list.replace('fruit.toLowerCase().includes(query.toLowerCase())','fruit.toLowerCase() === query.toLowerCase()'));
add(fixtures[2].id,'missing empty state',list.replace('No fruits found.','Nothing here.'));
add(fixtures[2].id,'stale query',list.replace('setQuery(event.target.value)','setQuery(query || event.target.value)'));
add(fixtures[3].id,'CSS only hiding',conditional.replace('{shown && <section id="details">Extra details are visible.</section>}','{<section id="details" style={{display: shown ? "block" : "none"}}>Extra details are visible.</section>}'));
add(fixtures[3].id,'hardcoded initial output',conditional.replace('setShown(previous => !previous)','setShown(true)'));
add(fixtures[3].id,'inaccurate accessibility',conditional.replace('aria-expanded={shown}','aria-expanded="false"'));
add(fixtures[3].id,'class alternative',`import {Component} from "react";export default class App extends Component{state={open:false};render(){return <main><button aria-label="Toggle details" aria-controls="more" aria-expanded={this.state.open} onClick={()=>this.setState(s=>({open:!s.open}))}>{this.state.open?"Hide details":"Show details"}</button>{this.state.open?<div id="more">Extra details are visible.</div>:null}</main>}}`,'pass');
add(fixtures[4].id,'missing cleanup',cleanup.replace('return ()=>clearInterval(id)','return undefined'));
add(fixtures[4].id,'no updates after unmount but leaked timer',cleanup.replace('const id=setInterval(()=>setTicks(previous=>previous+1),1000);return ()=>clearInterval(id)','let mounted=true;setInterval(()=>{if(mounted)setTicks(previous=>previous+1)},1000);return ()=>{mounted=false}'));
add(fixtures[4].id,'duplicate intervals',cleanup.replace('const id=setInterval','setInterval(()=>{},1000);const id=setInterval'));
add(fixtures[4].id,'wrong cadence',cleanup.replace(',1000)',',500)'));
add(fixtures[4].id,'stale closure',cleanup.replace('setTicks(previous=>previous+1)','setTicks(ticks+1)'));
add(fixtures[4].id,'hardcoded ticks',cleanup.replace('setTicks(previous=>previous+1)','setTicks(1)'));
add(fixtures[4].id,'shared clearTimeout cancellation',cleanup.replace('clearInterval(id)','clearTimeout(id)'),'pass');
add(fixtures[4].id,'class lifecycle alternative',`import {Component} from "react";export default class App extends Component{state={ticks:0};componentDidMount(){this.id=setInterval(()=>this.setState(s=>({ticks:s.ticks+1})),1000)}componentWillUnmount(){clearInterval(this.id)}render(){return <p>Ticks: {this.state.ticks}</p>}}`,'pass');
module.exports={fixtures,cases,cleanup,solution};

for (const item of fixtures) {
 let code;
 if (item.id==='react-use-state-counter') code=item.code.replace('setCount(previous => previous + 1);', 'throw new Error("ED022 event");');
 else if(item.id==='react-controlled-input') code=item.code.replace('setName(event.target.value)', '(() => {throw new Error("ED022 input")})()');
 else if(item.id==='react-list-filtering') code=item.code.replace('setQuery(event.target.value)', '(() => {throw new Error("ED022 input")})()');
 else if(item.id==='react-conditional-rendering') code=item.code.replace('setShown(previous => !previous)', '(() => {throw new Error("ED022 toggle")})()');
 else code=item.code.replace('setTicks(previous=>previous+1)', '(() => {throw new Error("ED022 timer")})()');
 add(item.id,'event or timer error',code);
}

add('react-use-state-counter','class counter alternative',require('../../ed-020/tools/fixtures.cjs').classCounter,'pass');
add('react-list-filtering','class filter alternative',`import {Component} from "react";const fruits=["Apple","Apricot","Banana","Blueberry","Cherry","Grape","Pineapple"];export default class App extends Component{state={query:""};render(){const found=fruits.filter(fruit=>fruit.toUpperCase().indexOf(this.state.query.toUpperCase())>=0);return <main><input aria-label="Search fruits" value={this.state.query} onChange={event=>this.setState({query:event.target.value})}/><ol aria-label="Fruits">{found.map(fruit=><li key={fruit}>{fruit}</li>)}</ol>{found.length===0?<output aria-label="Results">No fruits found.</output>:null}</main>}}`,'pass');

add('react-effect-cleanup','positive browser handle alternative',cleanup.replace('return ()=>clearInterval(id)','return ()=>{if(id>0)clearInterval(id)}'),'pass');
