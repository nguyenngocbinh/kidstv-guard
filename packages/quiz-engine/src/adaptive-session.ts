import type { Difficulty, Question, QuizConfig, QuizSession, SessionQuestion, Subject } from "./types.js";
const LEVELS:Difficulty[]=["easy","medium","hard"];
const rank=(d:Difficulty)=>LEVELS.indexOf(d);
const level=(n:number):Difficulty=>LEVELS[Math.max(0,Math.min(2,n))];
function rng(seed:number){let s=seed>>>0;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};}
function shuffle<T>(a:T[],r:()=>number){const x=[...a];for(let i=x.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[x[i],x[j]]=[x[j],x[i]];}return x;}
function pick(bank:Question[],s:QuizSession,role:"base"|"remediation",r:()=>number,pref?:{subject?:Subject;topic?:string;maxDifficulty?:Difficulty}){
 const used=new Set(s.usedQuestionIds);let pool=bank.filter(q=>q.active&&s.config.enabledSubjects.includes(q.subject)&&!used.has(q.id));
 if(pref?.subject){const a=pool.filter(q=>q.subject===pref.subject);if(a.length)pool=a;}
 if(pref?.topic){const a=pool.filter(q=>q.topic===pref.topic);if(a.length)pool=a;}
 if(pref?.maxDifficulty){const a=pool.filter(q=>rank(q.difficulty)<=rank(pref.maxDifficulty!));if(a.length)pool=a;}
 if(!pool.length)return null;
 const d=Math.min(...pool.map(q=>Math.abs(rank(q.difficulty)-rank(s.targetDifficulty))));
 pool=pool.filter(q=>Math.abs(rank(q.difficulty)-rank(s.targetDifficulty))===d);
 if(role==="base"){
  const counts=new Map<Subject,number>();
  for(const h of s.history.filter(x=>x.role==="base")){const q=bank.find(x=>x.id===h.questionId);if(q)counts.set(q.subject,(counts.get(q.subject)||0)+1);}
  const min=Math.min(...s.config.enabledSubjects.map(x=>counts.get(x)||0));
  const balanced=pool.filter(q=>(counts.get(q.subject)||0)===min);if(balanced.length)pool=balanced;
 }
 return shuffle(pool,r)[0];
}
function asCurrent(q:Question,role:"base"|"remediation"):SessionQuestion{return{questionId:q.id,role,subject:q.subject,topic:q.topic,difficulty:q.difficulty};}
function advance(s:QuizSession,bank:Question[],r:()=>number):QuizSession{
 if(s.pendingRemediation>0){
  if(s.extraAsked>=s.config.maxExtraQuestions){s.status="needs_parent_review";s.current=null;return s;}
  const last=[...s.history].reverse().find(x=>!x.correct),missed=last?bank.find(q=>q.id===last.questionId):undefined;
  const q=pick(bank,s,"remediation",r,{subject:missed?.subject,topic:missed?.topic,maxDifficulty:s.targetDifficulty});
  if(!q){s.status="bank_exhausted";s.current=null;return s;}
  s.pendingRemediation--;s.extraAsked++;s.current=asCurrent(q,"remediation");s.usedQuestionIds.push(q.id);return s;
 }
 if(s.baseAnswered<s.config.minimumBaseQuestions){
  const q=pick(bank,s,"base",r);if(!q){s.status="bank_exhausted";s.current=null;return s;}
  s.current=asCurrent(q,"base");s.usedQuestionIds.push(q.id);return s;
 }
 s.status="unlocked";s.current=null;return s;
}
export function startSession(config:QuizConfig,bank:Question[],seed=Date.now()):QuizSession{
 if(!config.enabledSubjects.length)throw new Error("At least one subject must be enabled");
 if(config.minimumBaseQuestions<1)throw new Error("minimumBaseQuestions must be positive");
 const s:QuizSession={id:"quiz-"+seed,config,status:"in_progress",targetDifficulty:config.startingDifficulty,consecutiveCorrect:0,baseAnswered:0,extraAsked:0,pendingRemediation:0,usedQuestionIds:[],current:null,history:[]};
 return advance(s,bank,rng(seed));
}
export function submitAnswer(s:QuizSession,bank:Question[],selectedOptionIds:string[],seed=1):QuizSession{
 if(s.status!=="in_progress"||!s.current)throw new Error("Session is not accepting answers");
 const r=rng(seed+s.history.length),q=bank.find(x=>x.id===s.current!.questionId);if(!q)throw new Error("Current question missing");
 const expected=[...q.correctOptionIds].sort(),selected=[...selectedOptionIds].sort();
 const correct=expected.length===selected.length&&expected.every((x,i)=>x===selected[i]);
 s.history.push({questionId:q.id,role:s.current.role,correct,selectedOptionIds:selected});
 if(s.current.role==="base")s.baseAnswered++;
 if(correct){s.consecutiveCorrect++;if(s.consecutiveCorrect>=2){s.targetDifficulty=level(rank(s.targetDifficulty)+1);s.consecutiveCorrect=0;}}
 else{s.consecutiveCorrect=0;s.targetDifficulty=level(rank(s.targetDifficulty)-1);s.pendingRemediation++;}
 return advance(s,bank,r);
}
export function getCurrentQuestion(s:QuizSession,bank:Question[]){return s.current?bank.find(q=>q.id===s.current!.questionId)??null:null;}
export function getSessionStatus(s:QuizSession){return{status:s.status,baseAnswered:s.baseAnswered,minimumBaseQuestions:s.config.minimumBaseQuestions,extraAsked:s.extraAsked,pendingRemediation:s.pendingRemediation,targetDifficulty:s.targetDifficulty,canUnlock:s.status==="unlocked"};}
export function serializeSession(s:QuizSession){return JSON.stringify(s);}
export function restoreSession(snapshot:string){return JSON.parse(snapshot) as QuizSession;}
