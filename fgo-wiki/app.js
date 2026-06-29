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

var ICO="assets/images/icons/";
function iconFor(e,t){
var m=[
[/对肃正防御/,"对肃正防御.png"],
[/无敌贯通/,"无敌贯通.png"],
[/无敌(?!.*无效)/,"无敌.png"],
[/回避/,"回避.png"],
[/毅力/,"毅力.png"],
[/必中/,"必中.png"],
[/无视防御/,"无视防御.png"],
[/目标集中/,"目标集中.png"],
[/魅惑/,"魅惑.png"],
[/眩晕/,"眩晕.png"],
[/封印/,"封印.png"],
[/睡眠/,"睡眠.png"],
[/毒(?!.*NP)/,"毒.png"],
[/灼伤/,"灼伤.png"],
[/诅咒/,"诅咒.png"],
[/即死无效/,"即死无效.png"],
[/即死毅力/,"即死毅力.png"],
[/即死成功率提升/,"即死成功率提升.png"],
[/即死成功率下降/,"即死成功率下降.png"],
[/即死耐性提升/,"即死耐性提升.png"],
[/即死耐性下降/,"即死耐性下降.png"],
[/弱化无效/,"弱化无效.png"],
[/弱化解除耐性下降/,"弱化解除耐性下降.png"],
[/弱化解除/,"弱化解除.png"],
[/强化解除耐性提升/,"强化解除耐性提升.png"],
[/强化解除耐性下降/,"强化解除耐性下降.png"],
[/强化无效/,"强化无效.png"],
[/弱化成功率提升/,"弱化成功率提升.png"],
[/弱化成功率下降/,"弱化成功率下降.png"],
[/弱化耐性提升/,"弱化耐性提升.png"],
[/弱化耐性下降/,"弱化耐性下降.png"],
[/弱体耐性提升/,"弱化耐性提升.png"],
[/攻击附加强化/,"攻击附加强化.png"],
[/攻击附加弱化/,"攻击附加弱化.png"],
[/受击NP获得量提升/,"受击NP获得量提升.png"],
[/受击NP获得量下降/,"受击NP获得量下降.png"],
[/NP获得量提升/,"NP获得量提升.png"],
[/充能阶段上升/,"充能阶段上升.png"],
[/宝具充能/,"宝具充能.png"],
[/宝具威力耐性提升/,"宝具威力耐性提升.png"],
[/宝具威力提升/,"宝具威力提升.png"],
[/宝具威力下降/,"宝具威力下降.png"],
[/宝具强化/,"宝具强化.png"],
[/宝具切换/,"宝具切换状态.png"],
[/NP增加|(?<!受击)NP(?!.*获得)/,"充能.png"],
[/Buster.*性能.*提升|Buster.*性能.*上升/,"红放.png"],
[/Quick.*性能.*提升|Quick.*性能.*上升/,"绿放.png"],
[/Arts.*性能.*提升|Arts.*性能.*上升/,"蓝放.png"],
[/三色.*性能.*提升/,"三色魔放.png"],
[/Buster.*Quick.*性能|红绿/,"红绿放.png"],
[/Arts.*Buster.*性能|蓝红/,"红蓝放.png"],
[/Arts.*Quick.*性能|蓝绿/,"蓝绿放.png"],
[/变更为Buster|Buster.*变更/,"红放.png"],
[/变更为Quick|Quick.*变更/,"绿放.png"],
[/变更为Arts|Arts.*变更/,"蓝放.png"],
[/暴击威力提升/,"暴击威力提升.png"],
[/暴击威力下降/,"暴击威力下降.png"],
[/暴击发生率下降/,"暴击发生率下降.png"],
[/暴击星集中度提升|集星(?!.*下降)/,"集星.png"],
[/暴击星集中度下降|反集星/,"反集星.png"],
[/暴击星|获得暴击星|获得.*暴击星/,"暴击星.png"],
[/回合出星|每回合.*获得.*星|每回合.*暴击星/,"回合出星.png"],
[/出星/,"出星.png"],
[/掉星率增加/,"掉星率增加.png"],
[/红卡集星/,"红卡集星.png"],
[/蓝卡集星/,"蓝卡集星.png"],
[/每回合HP回复|每回合回复(?!.*量)/,"每回合回复.png"],
[/HP.*回复|HP回复|HP.*回复(?!.*量)/,"HP回复.png"],
[/回复量提升/,"回复量提升.png"],
[/最大HP|血量上升/,"血量上升.png"],
[/回血/,"回血.png"],
[/灭气/,"灭气.png"],
[/回合充能/,"回合充能.png"],
[/减冷却/,"减冷却.png"],
[/洗牌/,"洗牌.png"],
[/特攻/,"特攻.png"],
[/特殊耐性提升/,"特殊耐性提升.png"],
[/攻击力.*防御力.*提升/,"加攻加防.png"],
[/攻击力.*防御力.*下降/,"降攻防.png"],
[/攻撃力.*防御力.*提升/,"加攻加防.png"],
[/攻撃力.*防御力.*下降/,"降攻防.png"],
[/攻撃力提升|攻击力提升|加攻|攻击力.*上升/,"加攻.png"],
[/防御力提升|加防|防御力.*上升/,"加防.png"],
[/被伤害减免|伤害减免|伤害减免/,"加防.png"],
[/攻撃力.*下降|攻击力.*下降|降攻(?!.*防)/,"降攻.png"],
[/防御力.*下降|降防/,"降防.png"],
[/暴击/,"暴击.png"]
];
for(var i=0;i<m.length;i++){if(m[i][0].test(e))return ICO+"skills/"+m[i][1];}
if(t){
for(var i=0;i<m.length;i++){if(m[i][0].test(t))return ICO+"skills/"+m[i][1];}
}
return null;
}
function sm(id){var s=D.find(function(x){return x[0]===id});if(!s)return;
var me=document.getElementById("mextra");me.innerHTML='<div style="text-align:center;color:#7aa2f7;padding:20px">加载详情中...</div>';me.style.display="block";
document.getElementById("mimg").style.display="none";document.getElementById("mnm").style.display="none";document.getElementById("mcls").style.display="none";document.getElementById("matk").style.display="none";document.getElementById("mhp").style.display="none";document.getElementById("mtr").style.display="none";
var mbg=document.getElementById("mbg");mbg.classList.add("on");
fetch("data/servants/"+id+".json").then(function(r){return r.json()}).then(function(d){
var h='';
var ci=d.card_images||[];
var cardImg=ci.length>0?ci[0].url:"";
var clsEn=s[3];var clsI=ICO+"classes/"+clsEn+".png";
h+='<div class="dt-top">';
if(cardImg)h+='<div class="dt-card-wrap"><img src="'+cardImg+'" class="dt-card" onerror="this.style.display=\'none\'"><div class="dt-card-fb"></div></div>';
h+='<div class="dt-info"><h3>'+s[1]+'</h3>';
h+='<p style="color:#7aa2f7;margin:2px 0">'+ss(s[2])+' <img src="'+clsI+'" style="width:18px;height:18px;vertical-align:middle" onerror="this.style.display=\'none\'"> '+clsEn+'</p>';
h+='<p style="font-size:11px;color:#999">'+escf((d.basic||{})["声优显示"]||(d.basic||{})["声优"]||"")+' / '+escf((d.basic||{})["画师"]||"")+'</p>';
h+='<div style="display:flex;gap:16px;font-size:12px;margin-top:4px"><div><span style="color:#e55">ATK</span> '+s[5].toLocaleString()+'</div><div><span style="color:#7aa2f7">HP</span> '+s[6].toLocaleString()+'</div></div>';
h+='</div></div>';
var pas=d.passive_skills||[];if(pas.length>0){h+='<div class="dt-sec"><div class="dt-sec-tl">被动技能</div>';
pas.forEach(function(p){var ef=p.effect||"";var ico=iconFor(ef,p.name||"");h+='<div class="dt-sk"><div class="dt-sk-hd">'+(ico?'<img src="'+ico+'" class="dt-ico" onerror="this.style.display=\'none\'">':'')+'<b>'+escf(p.name||p.name_jp||"")+'</b> <span style="color:#888;font-size:10px">'+escf(p.rank||"")+'</span></div><div class="dt-sk-ef">'+escf(ef)+'</div></div>'});h+='</div>'}
var aps=d.active_skills||[];if(aps.length>0){h+='<div class="dt-sec"><div class="dt-sec-tl">主动技能</div>';
aps.slice(0,3).forEach(function(sk,i){var ico=null;var ets=sk.effect_tables||[];for(var j=0;j<ets.length;j++){var txt=ets[j].effect||ets[j].text||"";ico=iconFor(txt,sk.name_cn||sk.name_jp||"");if(ico)break}
h+='<div class="dt-sk"><div class="dt-sk-hd">'+(ico?'<img src="'+ico+'" class="dt-ico" onerror="this.style.display=\'none\'">':'')+'<b>'+(i+1)+'. '+escf(sk.name_cn||sk.name_jp||"")+'</b> <span style="color:#888;font-size:10px">CD:'+escf(sk.cooldown||"?")+'</span></div>';
ets.forEach(function(et){var txt=et.effect||"";var i2=iconFor(txt);if(et.has_table){var lvs=et.levels||[];var vals=lvs.slice(0,5).map(function(v){return v||"-"}).join(" / ");h+='<div class="dt-ef">'+(i2?'<img src="'+i2+'" style="width:14px;height:14px;vertical-align:middle;margin-right:3px" onerror="this.style.display=\'none\'">':'')+escf(txt)+": "+vals+'</div>'}else if(et.text){h+='<div class="dt-ef" style="color:#ffd700">'+(i2?'<img src="'+i2+'" style="width:14px;height:14px;vertical-align:middle;margin-right:3px" onerror="this.style.display=\'none\'">':'')+escf(et.text)+'</div>'}});
h+='</div>'});h+='</div>'}
var nps=d.noble_phantasms||[];if(nps.length>0){h+='<div class="dt-sec"><div class="dt-sec-tl">宝具</div>';
nps.slice(0,2).forEach(function(np){var nc=np["卡色"]||"";var ci2=ICO+"cards/"+nc+".png";var ni=iconFor(np["效果A"]||"",np["中文名"]||"");h+='<div class="dt-sk" style="background:#2a1a3a"><div class="dt-sk-hd">'+(ni?'<img src="'+ni+'" class="dt-ico" onerror="this.style.display=\'none\'">':'')+'<b style="color:#ffd700">'+escf(np["中文名"]||"")+'</b> <span style="color:#aaa;font-size:10px">'+(ci2?'<img src="'+ci2+'" style="width:14px;height:14px;vertical-align:middle">':'')+' '+escf(nc)+' '+escf(np["类型"]||"")+' '+escf(np["阶级"]||"")+'</span></div>';
["效果A","效果B","效果C","效果D"].forEach(function(ek){if(np[ek]){var lk=ek.replace("效果","数值");var vk=lk+"1";var vals=np[vk]?np[vk].split("|").map(function(x){var p=x.split("=");return p[p.length-1]}).slice(0,5).join(" / "):"-";var ei=iconFor(np[ek]||"");h+='<div class="dt-ef">'+(ei?'<img src="'+ei+'" style="width:14px;height:14px;vertical-align:middle;margin-right:3px" onerror="this.style.display=\'none\'">':'')+escf(np[ek])+": "+vals+'</div>'}});h+='</div>'});h+='</div>'}
var profs=d.profiles||[];if(profs.length>0){var pf=profs[0];h+='<div class="dt-sec"><div class="dt-sec-tl">背景故事</div>';["资料1","资料2","资料3","资料4","资料5","资料6"].forEach(function(k){if(pf[k])h+='<div class="dt-pr"><b>'+k+'</b>：'+escf(pf[k]).replace(/\n/g,"<br>")+'</div>'});h+='</div>'}
var tr=d.trait_list||[];if(tr.length>0){h+='<div class="dt-sec"><div class="dt-sec-tl">特性</div><div style="display:flex;flex-wrap:wrap;gap:4px">';tr.forEach(function(t){h+='<span style="background:#333;padding:2px 8px;border-radius:10px;font-size:10px">'+escf(t)+'</span>'});h+='</div></div>'}
var b=d.basic||{};
var cards=[];["第一张卡","第二张卡","第三张卡","第四张卡","第五张卡"].forEach(function(ck){if(b[ck]){var v=b[ck];if(Array.isArray(v)&&v.length>1)v=v[1];if(typeof v==="string")cards.push(v);else if(v&&v.name)cards.push(v.name)}});
if(cards.length>0){h+='<div class="dt-sec"><div class="dt-sec-tl">指令卡</div><div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">';cards.forEach(function(c){var ci3=ICO+"cards/"+c+".png";h+='<div style="display:flex;align-items:center;gap:2px;font-size:11px"><img src="'+ci3+'" style="width:16px;height:16px;vertical-align:middle" onerror="this.style.display=\'none\'">'+c+'</div>'});var qa=b["Q卡np率"]||b["A卡np率"]||"";var qh=b["Q卡hit数"]||"";var ah=b["A卡hit数"]||"";var bh=b["B卡hit数"]||"";if(qa||qh){h+='<div style="font-size:10px;color:#888;margin-left:8px">';if(qa)h+='NP率: '+qa;if(qh)h+=' Hit: '+qh+'/'+ah+'/'+bh;h+='</div>'}h+='</div></div>'}
h+='<div style="text-align:center;margin-top:12px"><button onclick="closeModal()" style="background:#7aa2f7;border:none;color:#000;padding:6px 20px;border-radius:6px;cursor:pointer;font-size:13px;font-weight:bold">关闭</button></div>';
me.innerHTML=h}).catch(function(e){me.innerHTML='<div style="text-align:center;color:#e55;padding:20px">加载失败: '+escf(e.message)+'</div><div style="text-align:center;margin-top:10px"><button onclick="closeModal()" style="background:#7aa2f7;border:none;color:#000;padding:5px 14px;border-radius:6px;cursor:pointer">关闭</button></div>'})}

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
