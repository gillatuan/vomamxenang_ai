const fs=require('fs');
const allowed={requirement:['planning'],planning:['architecture'],architecture:['development'],development:['review'],review:['qa','development'],qa:['release_ready','development'],release_ready:['human_approval','development'],human_approval:['done'],done:[]};
const owners={requirement:'planner',planning:'planner',architecture:'architect',development:'developer',review:'reviewer',qa:'qa',release_ready:'devops',human_approval:'human',done:'human'};
const req={requirement:['requirement'],planning:['requirement','plan'],architecture:['requirement','plan','architecture'],development:['requirement','plan','architecture'],review:['requirement','plan','architecture'],qa:['requirement','plan','architecture','review'],release_ready:['requirement','plan','architecture','review','qa'],human_approval:['requirement','plan','architecture','review','qa','release'],done:['requirement','plan','architecture','review','qa','release']};
let bad=false;const fail=(f,m)=>{bad=true;console.error('[orchestration] '+f+': '+m)};
for(const f of process.argv.slice(2)){const s=JSON.parse(fs.readFileSync(f,'utf8'));
 if(!/^TASK-\d{4}$/.test(s.taskId||''))fail(f,'invalid taskId');
 if(owners[s.status]!==s.owner)fail(f,'invalid owner for '+s.status);
 for(const a of req[s.status]||[])if(!s.artifacts?.[a])fail(f,'missing artifact '+a);
 const h=s.history||[];if(!h.length)fail(f,'empty history');
 for(let i=0;i<h.length;i++){const x=h[i];if(i===0){if(x.from!==null||x.to!=='requirement')fail(f,'history must start at requirement');continue}const prev=h[i-1].to;if(x.from!==prev)fail(f,'history discontinuity');else if(!(allowed[prev]||[]).includes(x.to))fail(f,'illegal transition '+prev+' -> '+x.to)}
 if(h.at(-1)?.to!==s.status)fail(f,'history/state mismatch');
 if(s.risk?.destructiveDatabase&&['release_ready','human_approval','done'].includes(s.status)&&!h.some(x=>x.by==='human'))fail(f,'destructive DB requires human evidence');
}
if(bad)process.exit(1);console.log('Orchestration state valid');
