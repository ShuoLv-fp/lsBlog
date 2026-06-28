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
function av(i){var id=String(i).padStart(3,"0");return'<img src="https://media.fgo.wiki/Servant'+id+'.jpg" loading="lazy" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">'+
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
var dets=DETAIL.split('\n');
var det=dets[id-1]?dets[id-1].split('~'):['','',''];
var skills=det[0]?det[0].split('|'):[];
var np=det[1]||'';
var passives=det[2]?det[2].split('|'):[];
var html='<div style="display:flex;gap:12px;align-items:flex-start;margin-bottom:12px;text-align:left">'+
'<div style="flex-shrink:0;width:100px">'+av(id)+'</div>'+
'<div style="flex:1">'+
'<h3 style="font-size:16px;margin-bottom:4px">'+s[1]+'</h3>'+
'<p style="color:#7aa2f7;font-size:13px;margin-bottom:6px">'+ss(s[2])+' '+s[3]+'</p>'+
'<div style="display:flex;gap:12px;font-size:12px">'+
'<div><span style="color:#e55">ATK</span> '+s[5].toLocaleString()+'</div>'+
'<div><span style="color:#7aa2f7">HP</span> '+s[6].toLocaleString()+'</div>'+
'</div></div></div>';
if(passives.length>0&&passives[0]){
html+='<div style="text-align:left;margin-bottom:10px"><p style="color:#888;font-size:11px;margin-bottom:3px">\u88ab\u52a8\u6280\u80fd</p><div style="display:flex;flex-wrap:wrap;gap:3px">';
passives.forEach(function(p){if(p)html+='<span style="background:#1e2a4a;padding:2px 6px;border-radius:3px;font-size:11px">'+p+'</span>'});
html+='</div></div>'}
if(skills.length>0){
html+='<div style="text-align:left;margin-bottom:10px"><p style="color:#888;font-size:11px;margin-bottom:3px">\u4e3b\u52a8\u6280\u80fd</p>';
skills.forEach(function(sk,idx){if(sk)html+='<div style="background:#1e2a4a;padding:6px 8px;border-radius:4px;margin-bottom:3px;font-size:12px"><span style="color:#7aa2f7">'+(idx+1)+'.</span> '+sk+'</div>'});
html+='</div>'}
if(np){
html+='<div style="text-align:left;margin-bottom:10px"><p style="color:#888;font-size:11px;margin-bottom:3px">\u5b9d\u5177</p>'+
'<div style="background:#2a1a3a;padding:6px 8px;border-radius:4px;font-size:12px;color:#ffd700">'+np+'</div></div>'}
var ts=s[4].map(function(i){return TI[i]}).join(", ");
if(ts){
html+='<div style="text-align:left;margin-bottom:8px"><p style="color:#888;font-size:11px;margin-bottom:3px">\u7279\u6027</p>'+
'<div style="display:flex;flex-wrap:wrap;gap:3px">';
ts.split(", ").forEach(function(t){html+='<span style="background:#333;padding:2px 6px;border-radius:8px;font-size:10px">'+t+'</span>'});
html+='</div></div>'}
html+='<div style="text-align:center;margin-top:10px"><button class="btn" onclick="closeModal()" style="font-size:12px;padding:5px 14px">\u5173\u95ed</button></div>';
document.getElementById("mimg").style.display="none";
document.getElementById("mnm").style.display="none";
document.getElementById("mcls").style.display="none";
document.getElementById("matk").style.display="none";
document.getElementById("mhp").style.display="none";
document.getElementById("mtr").style.display="none";
document.getElementById("mextra").innerHTML=html;
document.getElementById("mextra").style.display="block";
document.getElementById("mbg").classList.add("on")}
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
