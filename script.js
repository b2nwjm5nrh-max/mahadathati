const chatEl=document.getElementById("chat"),input=document.getElementById("input"),form=document.getElementById("form"),send=document.getElementById("send"),typing=document.getElementById("typing"),welcome=document.getElementById("welcome"),side=document.getElementById("side");
let messages=JSON.parse(localStorage.getItem("mahadathati_messages")||"[]");
let dark=localStorage.getItem("mahadathati_dark")==="1";
if(dark)document.documentElement.classList.add("dark");

function save(){localStorage.setItem("mahadathati_messages",JSON.stringify(messages));}
function render(){chatEl.innerHTML=""; if(!messages.length){chatEl.appendChild(welcome);return} messages.forEach(m=>addBubble(m.role,m.content));}
function addBubble(role,text){const row=document.createElement("div");row.className="msg "+role;const b=document.createElement("div");b.className="bubble";b.textContent=text;row.appendChild(b);chatEl.appendChild(row);chatEl.scrollTop=chatEl.scrollHeight;}
async function ask(text){
 text=text.trim(); if(!text||send.disabled)return;
 if(welcome.parentNode)welcome.remove();
 messages.push({role:"user",content:text});addBubble("user",text);save();
 input.value="";send.disabled=true;typing.hidden=false;
 try{
   const res=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages})});
   const data=await res.json();
   if(!res.ok)throw new Error(data.error||"حدث خطأ");
   messages.push({role:"assistant",content:data.reply});addBubble("assistant",data.reply);save();
 }catch(e){addBubble("assistant","❌ "+e.message);}
 finally{send.disabled=false;typing.hidden=true;input.focus();}
}
form.addEventListener("submit",e=>{e.preventDefault();ask(input.value)});
input.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();ask(input.value)}});
document.querySelectorAll("[data-q]").forEach(b=>b.addEventListener("click",()=>ask(b.dataset.q)));
document.getElementById("newChat").addEventListener("click",()=>{messages=[];save();render();side.classList.remove("open")});
document.getElementById("clearChat").addEventListener("click",()=>{if(confirm("مسح المحادثة؟")){messages=[];save();render()}});
document.getElementById("darkBtn").addEventListener("click",()=>{dark=!dark;document.documentElement.classList.toggle("dark",dark);localStorage.setItem("mahadathati_dark",dark?"1":"0")});
document.getElementById("menu").addEventListener("click",()=>side.classList.toggle("open"));
render();