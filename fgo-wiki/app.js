var bytes=H1+H2+H3;var bin=new Uint8Array(bytes.length/2);for(var i=0;i<bin.length;i++)bin[i]=parseInt(bytes.substr(i*2,2),16);var off=0;
function r16(){var v=(bin[off]<<8)|bin[off+1];off+=2;return v}
function r8(){return bin[off++]}
var S=[];
while(off<bin.length){
var id=r16(),star=r8(),cls=r8(),atk=r16(),hp=r16(),nt=r8(),tr=[];
for(var i=0;i<nt;i++)tr.push(r8());
S.push([id,star,cls,tr,atk,hp]);
}
var N=N1.concat(N2);var D=S.map(function(s,i){return[s[0],N[i],s[1],CI[s[2]],s[3],s[4],s[5]]});
var selT=new Set(),selS=0,box=JSON.parse(localStorage.getItem("fgoBox")||"[]");
function go(i){document.querySelectorAll(".pg").forEach(function(p,j){p.classList.toggle("on",i===j)});document.querySelectorAll("nav a").forEach(function(n,j){n.classList.toggle("on",i===j)});if(i===2)renderBox()}
function av(i){var id=String(i).padStart(3,"0");return'<img src="assets/images/avatars/'+id+'.jpg" loading="lazy" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">'+
'<div class="card-ph" style="display:none"><span class="ph-cl">'+D[i-1][3].charAt(0)+'</span><span class="ph-star">'+D[i-1][2]+'\u2605</span></div>'}
function ss(n){var s="";for(var i=0;i<n;i++)s+="\u2605";return n===0?"-":s}
function gc(){var cs=new Set();D.forEach(function(s){cs.add(s[3])});return Array.from(cs).sort()}
function init(){
var fc=document.getElementById("fc");gc().forEach(function(c){var o=document.createElement("option");o.value=c;o.textContent=c;fc.appendChild(o)});
var sf=document.getElementById("sf");
var a0=document.createElement("span");a0.textContent="\u5168\u90e8";a0.onclick=function(){selS=0;usf();render()};sf.appendChild(a0);
for(var i=1;i<=5;i++){(function(v){var sp=document.createElement("span");sp.textContent=ss(v)+" "+v;sp.onclick=function(){selS=v;usf();render()};sf.appendChild(sp)})(i)};
var tb=document.getElementById("tb");TI.forEach(function(t,i){var lbl=document.createElement("label");lbl.innerHTML="<input type=\"checkbox\" value=\""+i+"\"> "+t;lbl.querySelector("input").onchange=function(){if(this.checked)selT.add(i);else selT.delete(i);render()};tb.appendChild(lbl)});
render()}
function usf(){var sf=document.getElementById("sf");sf.querySelectorAll("span").forEach(function(sp,i){sp.classList.toggle("on",i===selS)})}
function flt(){var q=document.getElementById("q").value.trim().toLowerCase();var c=document.getElementById("fc").value;return D.filter(function(s){if(q&&s[1].toLowerCase().indexOf(q)<0)return false;if(c&&s[3]!==c)return false;if(selS&&s[2]!==selS)return false;if(selT.size>0){var st=new Set(s[4]);var ok=false;selT.forEach(function(t){if(st.has(t))ok=true});if(!ok)return false}return true})}
function render(){var r=flt(),g=document.getElementById("g"),cnt=document.getElementById("cnt");cnt.textContent="\u5171 "+r.length+" / "+D.length;var h="";r.forEach(function(s){h+='<div class="card" onclick="sm('+s[0]+')">'+av(s[0])+'<div class="nm">'+s[1]+'</div><div class="st">'+ss(s[2])+" "+s[3]+'</div></div>'});g.innerHTML=h||'<div class="empty">\u6ca1\u6709\u5339\u914d\u7684\u4ece\u8005</div>'}
function clearTraits(){selT.clear();document.querySelectorAll("#tb input").forEach(function(c){c.checked=false});render()}
function sm(id){var s=D.find(function(x){return x[0]===id});if(!s)return;
var me=document.getElementById("mextra");
me.innerHTML='<div style="text-align:center;color:#7aa2f7;padding:16px">\u52a0\u8f7d\u8be6\u60c5\u4e2d...</div>';
me.style.display="block";
document.getElementById("mimg").style.display="none";
document.getElementById("mnm").style.display="none";
document.getElementById("mcls").style.display="none";
document.getElementById("matk").style.display="none";
document.getElementById("mhp").style.display="none";
document.getElementById("mtr").style.display="none";
document.getElementById("mbg").classList.add("on");
fetch("data/servants/"+id+".json").then(function(r){return r.json()}).then(function(d){
var h='<div style="display:flex;gap:12px;align-items:flex-start;margin-bottom:12px;text-align:left">'+
'<div style="flex-shrink:0;width:100px">'+av(id)+'</div>'+
'<div style="flex:1"><h3 style="font-size:16px;margin-bottom:4px">'+s[1]+'</h3>'+
'<p style="color:#7aa2f7;font-size:13px;margin-bottom:2px">'+ss(s[2])+' '+s[3]+'</p>'+
'<p style="font-size:11px;color:#999">'+escf((d.basic||{})["\u58f0\u4f18\u663e\u793a"]||(d.basic||{})["\u58f0\u4f18"]||"")+' / '+escf((d.basic||{})["\u753b\u5e08"]||"")+'</p>'+
'<div style="display:flex;gap:12px;font-size:12px;margin-top:4px">'+
'<div><span style="color:#e55">ATK</span> '+s[5].toLocaleString()+'</div>'+
'<div><span style="color:#7aa2f7">HP</span> '+s[6].toLocaleString()+'</div>'+
'</div></div></div>';
var pas=d.passive_skills||[];if(pas.length>0){h+='<div style="text-align:left;margin-bottom:10px"><p style="color:#888;font-size:11px;margin-bottom:3px">\u88ab\u52a8\u6280\u80fd</p>';pas.forEach(function(p){if(p.name&&p.effect)h+='<div style="background:#1e2a4a;padding:4px 8px;border-radius:4px;margin-bottom:2px;font-size:11px"><b>'+escf(p.name)+'</b> '+escf(p.rank||"")+': '+escf(p.effect)+'</div>'});h+='</div>'}
var aps=d.active_skills||[];if(aps.length>0){h+='<div style="text-align:left;margin-bottom:10px"><p style="color:#888;font-size:11px;margin-bottom:3px">\u4e3b\u52a8\u6280\u80fd</p>';aps.slice(0,3).forEach(function(sk,i){h+='<div style="background:#1e2a4a;padding:6px 8px;border-radius:4px;margin-bottom:3px;font-size:12px"><div style="color:#7aa2f7;margin-bottom:2px"><b>'+(i+1)+'. '+escf(sk.name_cn||sk.name_jp||"")+'</b> <span style="font-size:10px;color:#888">CD:'+escf(sk.cooldown||"?")+'</span></div>';var ets=sk.effect_tables||[];ets.forEach(function(et){if(et.has_table){var lvs=et.levels||[];var vals=lvs.slice(0,5).map(function(v){return v||"-"}).join(" / ");h+='<div style="color:#ccc;font-size:10px;margin-top:1px">'+escf(et.effect||"")+": "+vals+'</div>'}else if(et.text){h+='<div style="color:#ffd700;font-size:10px;margin-top:1px">'+escf(et.text)+'</div>'}});h+='</div>'});h+='</div>'}
var nps=d.noble_phantasms||[];if(nps.length>0){h+='<div style="text-align:left;margin-bottom:10px"><p style="color:#888;font-size:11px;margin-bottom:3px">\u5b9d\u5177</p>';nps.slice(0,2).forEach(function(np){h+='<div style="background:#2a1a3a;padding:6px 8px;border-radius:4px;margin-bottom:3px;font-size:12px"><div style="color:#ffd700;margin-bottom:2px"><b>'+escf(np["\u4e2d\u6587\u540d"]||"")+'</b> <span style="font-size:10px;color:#aaa">'+escf(np["\u5361\u8272"]||"")+' '+escf(np["\u7c7b\u578b"]||"")+' '+escf(np["\u9636\u7ea7"]||"")+'</span></div>';["\u6548\u679cA","\u6548\u679cB","\u6548\u679cC","\u6548\u679cD"].forEach(function(ek){if(np[ek]){var lk=ek.replace("\u6548\u679c","\u6570\u503c");var vk=lk+"1";var vals=np[vk]?np[vk].split("|").map(function(x){var p=x.split("=");return p[p.length-1]}).slice(0,5).join(" / "):"-";h+='<div style="color:#ccc;font-size:10px;margin-top:1px">'+escf(np[ek])+": "+vals+'</div>'}});h+='</div>'});h+='</div>'}
var tr=d.trait_list||[];if(tr.length>0){h+='<div style="text-align:left;margin-bottom:8px"><p style="color:#888;font-size:11px;margin-bottom:3px">\u7279\u6027</p><div style="display:flex;flex-wrap:wrap;gap:3px">';tr.forEach(function(t){h+='<span style="background:#333;padding:2px 6px;border-radius:8px;font-size:10px">'+escf(t)+'</span>'});h+='</div></div>'}
var b=d.basic||{};var cards=[];["\u7b2c\u4e00\u5f20\u5361","\u7b2c\u4e8c\u5f20\u5361","\u7b2c\u4e09\u5f20\u5361","\u7b2c\u56db\u5f20\u5361","\u7b2c\u4e94\u5f20\u5361"].forEach(function(ck){if(b[ck])cards.push(b[ck][0])});var cardstr=cards.join("");
if(cardstr)h+='<div style="text-align:left;margin-bottom:8px;font-size:11px"><span style="color:#888">\u6307\u4ee4\u5361: </span><span style="color:#ccc">'+cardstr+'</span>';
var qa=b["Q\u5361np\u7387"]||b["A\u5361np\u7387"]||"";var qh=b["Q\u5361hit\u6570"]||"";var ah=b["A\u5361hit\u6570"]||"";var bh=b["B\u5361hit\u6570"]||"";
if(qa)h+=' | NP\u7387: '+qa;
if(qh)h+=' | Hit: '+qh+'/'+ah+'/'+bh;
h+='</div>';
h+='<div style="text-align:center;margin-top:10px"><button class="btn" onclick="closeModal()" style="font-size:12px;padding:5px 14px">\u5173\u95ed</button></div>';
me.innerHTML=h}).catch(function(e){
me.innerHTML='<div style="text-align:center;color:#e55;padding:16px">\u52a0\u8f7d\u5931\u8d25: '+escf(e.message)+'</div><div style="text-align:center;margin-top:10px"><button class="btn" onclick="closeModal()" style="font-size:12px;padding:5px 14px">\u5173\u95ed</button></div>'
})}
function escf(s){return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}
function closeModal(){document.getElementById("mbg").classList.remove("on");setTimeout(function(){
document.getElementById("mimg").style.display="block";
document.getElementById("mnm").style.display="block";
document.getElementById("mcls").style.display="block";
document.getElementById("matk").style.display="block";
document.getElementById("mhp").style.display="block";
document.getElementById("mtr").style.display="block";
document.getElementById("mextra").innerHTML="";
document.getElementById("mextra").style.display="none";
},200)}
function calc(){var a=+document.getElementById("catk").value||0,tk=+document.getElementById("catkw").value||1,sp=+document.getElementById("cspw").value||1,d=+document.getElementById("cdef").value||0,cl=+document.getElementById("cclass").value||1,pa=+document.getElementById("cpass").value||1,bf=+document.getElementById("cbuff").value||1;var dm=a*tk*sp*cl*pa*bf*(0.9*Math.random()+0.23)*900/d;document.getElementById("r1").textContent=Math.round(dm);document.getElementById("r2").textContent=Math.round(dm*2);document.getElementById("r3").textContent=Math.round(dm*1.2)}
function calcNP(){var ct=+document.getElementById("npct").value||0,bf=+document.getElementById("npbuff").value||1,np=ct*bf;document.getElementById("n1").textContent=(np*3*100).toFixed(1)+"%";document.getElementById("n2").textContent=(np*6*100).toFixed(1)+"%";document.getElementById("n3").textContent=(np*100).toFixed(1)+"%"}
function sv(){localStorage.setItem("fgoBox",JSON.stringify(box))}
function renderBox(){var el=document.getElementById("box"),cnt=document.getElementById("bcnt");cnt.textContent="("+box.length+")";if(!box.length){el.innerHTML='<div class="empty">BOX\u4e3a\u7a7a</div>';return}var h="";box.forEach(function(id){var s=D.find(function(x){return x[0]===id});if(!s)return;h+='<div class="bc">'+av(id)+'<div class="nm">'+s[1]+'</div><span class="del" onclick="event.stopPropagation();rb('+id+')">x</span></div>'});el.innerHTML=h}
function rb(id){box=box.filter(function(x){return x!==id});sv();renderBox()}
function clearBox(){if(!confirm("\u786e\u5b9a\u6e05\u7a7aBOX\uff1f"))return;box=[];sv();renderBox()}
function exportBox(){var j=JSON.stringify(box);var ta=document.createElement("textarea");ta.value=j;document.body.appendChild(ta);ta.select();document.execCommand("copy");document.body.removeChild(ta);alert("\u5df2\u590d\u5236\u5230\u526a\u8d34\u677f")}
function doImport(){var txt=document.getElementById("impt").value.trim();if(!txt)return;try{var d=JSON.parse(txt);var ids=[];if(Array.isArray(d)){d.forEach(function(v){if(typeof v==="number")ids.push(v);else if(typeof v==="object"&&v.id)ids.push(v.id)})}else if(d.id){ids.push(d.id)}ids=ids.filter(function(id){return id>0&&box.indexOf(id)<0});box=box.concat(ids);sv();alert("\u5bfc\u5165\u6210\u529f: "+ids.length+"\u4e2a\u4ece\u8005");document.getElementById("impt").value="";go(2)}catch(e){alert("JSON\u683c\u5f0f\u9519\u8bef: "+e.message)}}
function openPicker(){document.getElementById("pk").classList.add("on");renderPicker()}
function closePicker(){document.getElementById("pk").classList.remove("on")}
function renderPicker(){var q=document.getElementById("pkq").value.trim().toLowerCase();var el=document.getElementById("pkg");var r=D.filter(function(s){if(q&&s[1].toLowerCase().indexOf(q)<0)return false;return true});var h="";r.forEach(function(s){h+='<div class="pi" onclick="pick('+s[0]+')">'+av(s[0])+'<div class="nm">'+s[1]+'</div></div>'});el.innerHTML=h}
function pick(id){var i=box.indexOf(id);if(i>=0)box.splice(i,1);else box.push(id);sv();renderPicker();renderBox()}
init();calc();calcNP();
