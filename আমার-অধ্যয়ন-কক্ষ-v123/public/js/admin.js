// public/js/admin.js - মোটিভেশন কন্ট্রোল ও ওয়ান-ওয়ে মেসেজিং সহ পূর্ণাঙ্গ অ্যাডমিন ইঞ্জিন
(function(){
var ADMIN_ID = "admin121";
var ALLOWED_ADMIN_IDS = ["admin121", "admin"];
var PH = "86cea6d99a4b913ee8b217e1cf692d9fbe0a495397f97ef5c4acbbab61c61f34"; // hash for 11201940@
var DEFAULT_PASSWORDS = ["11201940@"];
var DEFAULT_HASHES = [PH];
var VIP = "1432014310";

var db = window.db || (firebase.apps.length ? firebase.database() : firebase.initializeApp(FB_CONFIG).database());
var T = firebase.database.ServerValue.TIMESTAMP;

var $ = function(i){ return document.getElementById(i); };
function el(t,c,x){ var e=document.createElement(t); if(c)e.className=c; if(x!=null)e.textContent=x; return e; }
function escHtml(s){ if(s===null||s===undefined)return ""; return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;"); }
function safePathKey(s){ return String(s==null?"":s).replace(/[.$#\[\]\/]/g,"_"); }
function btn(l,c,f){ var b=el("button","btn"+(c?" "+c:""),l); b.type="button"; b.onclick=f; return b; }
function bn(n){ return Number(n||0).toLocaleString("bn-BD"); }
function fm(m){ m=m||0; return(m>=60?bn(Math.floor(m/60))+"ঘ ":"")+bn(m%60)+"মি"; }
function key(d){ return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); }
function fd(t){ return t?new Date(t).toLocaleString("bn-BD",{day:"numeric",month:"short",hour:"numeric",minute:"2-digit"}):"—"; }
function toast(m){ var t=$("toast"); t.textContent=m; t.classList.add("show"); clearTimeout(toast.t); toast.t=setTimeout(function(){t.classList.remove("show");},3200); }

var R={}, R2={}, R2D={}, VU={}, M={}, L={}, ALERTS={}, NU={}, UP={}, ENTRY_FOOTER=null, view="ov", F={q:"",f:"all",s:"today",room:""}, RF={q:"",status:"all",sort:"recent"}, AF={q:"",status:"all",sort:"recent"}, FB_STATUS={connected:null,errors:[],lastCheckedAt:0,configOk:true}, at=0, live=false;
var ONE_DAY_MS = 86400000;
var BROADCAST_DRAFT = { target: "all", text: "", useTag: true, replyToFeedbackId: "", replyToFeedbackUser: "" };
var FOOTER_DRAFT = null, FOOTER_DIRTY = false, FOOTER_AUTOSAVE_TIMER = null, FOOTER_SAVE_IN_FLIGHT = false;
var ST = { pending:"অপেক্ষমাণ", trial:"৩ দিনের ট্রায়াল", approved:"অনুমোদিত", suspended:"সাময়িক বন্ধ", expired:"মেয়াদ শেষ", blocked:"ব্লক" };
var AN = { delete_user:"মেম্বার মোছা", chat_delete:"মেসেজ মোছা", room_edit:"রুম সেটিংস", notice:"অ্যাডমিন নোটিশ" };

var activeMotCat = "Medical"; // মোটিভেশন ক্যাটাগরি স্টেট

function sanitizeFooterHtml(raw){
  if(raw === null || raw === undefined) return "";
  var s = String(raw);
  if(!s.trim()) return "";
  var hasHtml = /<(?:b|strong|i|em|u|br|div|p|span|font)\b[^>]*>/i.test(s);
  if(!hasHtml){
    return escHtml(s.trim()).replace(/\r?\n/g, "<br>");
  }
  try {
    var doc = new DOMParser().parseFromString(s, "text/html");
    function walk(node){
      if(!node) return "";
      if(node.nodeType === 3){
        return escHtml(node.nodeValue || "").replace(/\r?\n/g, "<br>");
      }
      if(node.nodeType !== 1) return "";
      var tag = node.tagName.toLowerCase();
      if(tag === "script" || tag === "style" || tag === "iframe" || tag === "object" || tag === "embed") return "";
      if(tag === "br") return "<br>";
      var inner = "";
      for(var i = 0; i < node.childNodes.length; i++){
        inner += walk(node.childNodes[i]);
      }
      if(tag === "b" || tag === "strong") return inner ? "<strong>" + inner + "</strong>" : "";
      if(tag === "i" || tag === "em") return inner ? "<em>" + inner + "</em>" : "";
      if(tag === "u") return inner ? "<u>" + inner + "</u>" : "";
      if(tag === "font"){
        var szAttr = node.getAttribute("size");
        var px = (szAttr === "1" || szAttr === "2") ? "11px"
               : (szAttr === "4" || szAttr === "5") ? "17px"
               : (szAttr === "6" || szAttr === "7") ? "21px"
               : (szAttr === "3") ? "13.5px" : "";
        return (px && inner) ? '<span style="font-size:' + px + '">' + inner + '</span>' : inner;
      }
      if(tag === "span"){
        var styles = [];
        var fs = node.style && node.style.fontSize ? node.style.fontSize.trim() : "";
        if(fs && /^(?:[12]?\d(?:\.\d+)?px|0?\.\d+em|[12](?:\.\d+)?em|[12](?:\.\d+)?rem)$/.test(fs)){
          styles.push("font-size:" + fs);
        }
        var fw = node.style && node.style.fontWeight ? String(node.style.fontWeight).trim() : "";
        if(fw === "bold" || fw === "700" || fw === "600" || fw === "800") styles.push("font-weight:" + fw);
        var fst = node.style && node.style.fontStyle ? node.style.fontStyle.trim() : "";
        if(fst === "italic") styles.push("font-style:italic");
        var td = node.style && node.style.textDecoration ? node.style.textDecoration.trim() : "";
        if(td.indexOf("underline") > -1) styles.push("text-decoration:underline");
        return styles.length ? '<span style="' + styles.join(";") + '">' + inner + '</span>' : inner;
      }
      if(tag === "div" || tag === "p"){
        if(!inner) return "";
        if(inner === "<br>") return "\x01";
        return "\x01" + inner.replace(/<br>$/, "");
      }
      return inner;
    }
    var out = "";
    for(var j = 0; j < doc.body.childNodes.length; j++){
      var part = walk(doc.body.childNodes[j]);
      if(!part) continue;
      if(part.charAt(0) === "\x01"){
        out += (out ? "<br>" : "") + part.slice(1);
      } else {
        out += part;
      }
    }
    out = out.replace(/^(?:<br>)+|(?:<br>)+$/g, "");
    var tmp = document.createElement("div");
    tmp.innerHTML = out;
    if(!(tmp.textContent || "").trim()) return "";
    return out;
  } catch(e){
    return escHtml(s.trim()).replace(/\r?\n/g, "<br>");
  }
}

function rn(r){
  if(!r) return "";
  if(r===VIP) return "Queen Room";
  if(M[r] && M[r].name) return M[r].name;
  if(R2[r] && R2[r].meta && R2[r].meta.name) return R2[r].meta.name;
  return r;
}

function act(s){
  var n = Date.now();
  return !!(s && s.t && s.t+(s.d||180)*6e4+(s.pz||0)-(s.ps||n)>0 && (!s.ps || n-s.ps<9e6));
}

function findNumericUidForMember(room, id, directUid){
  var cand = (directUid != null) ? String(directUid).trim() : "";
  if(cand && /^\d{4,10}$/.test(cand)) return cand;
  var up = UP[id] || {};
  if(up.uid && /^\d{4,10}$/.test(String(up.uid))) return String(up.uid);
  if((id === "p1" || id === "p2") && VU[id] && VU[id].uid && /^\d{4,10}$/.test(String(VU[id].uid))){
    return String(VU[id].uid);
  }
  var nuKeys = Object.keys(NU || {});
  for(var i = 0; i < nuKeys.length; i++){
    var u = nuKeys[i], info = NU[u];
    if(!info || typeof info !== "object") continue;
    if(info.memberId === id && (!room || !info.roomId || info.roomId === room)){
      return String(u);
    }
  }
  if(id === "p1" || id === "p2"){
    for(var j = 0; j < nuKeys.length; j++){
      var u2 = nuKeys[j], info2 = NU[u2];
      if(info2 && info2.memberId === id) return String(u2);
    }
  }
  return "";
}

function getRoomExtraUidTokens(room){
  var out = [];
  Object.keys(NU || {}).forEach(function(u){
    var info = NU[u];
    if(!info || typeof info !== "object") return;
    if(info.roomId === room || (room === VIP && (info.memberId === "p1" || info.memberId === "p2"))){
      out.push(String(u));
      if(info.name) out.push(String(info.name));
    }
  });
  if(room === VIP){
    ["p1","p2"].forEach(function(s){
      if(VU[s] && VU[s].uid) out.push(String(VU[s].uid));
      if(R[VIP] && R[VIP][s] && R[VIP][s].uid) out.push(String(R[VIP][s].uid));
    });
  }
  return out.join(" ");
}

function rows(){
  var o = [], k = key(new Date()), n = Date.now(), seen = {};

  Object.keys(R2).forEach(function(room){
    var rm = R2[room] || {}, mems = rm.members || {}, r2d = R2D[room] || {};
    Object.keys(mems).forEach(function(id){
      var uniq = room + "___" + id;
      if(seen[uniq]) return;
      seen[uniq] = true;

      var memInfo = mems[id] || {};
      var roomRec = rm[id] || {};
      var studyRec = r2d[id] || {};
      var up = UP[id] || {};
      var vu = (id === "p1" || id === "p2") ? (VU[id] || {}) : {};
      var daysObj = roomRec.days || studyRec.days || vu.days || {};
      var minsObj = roomRec.mins || studyRec.mins || vu.mins || {};
      var studyObj = roomRec.study || studyRec.study || null;
      var brkObj = roomRec.brk || studyRec.brk || null;
      var prObj = roomRec.pr || studyRec.pr || vu.pr || {};

      var d = (daysObj[k] ? daysObj[k] : []).filter(function(x){ return !x.x; });
      var tot = 0, z, isLive = act(studyObj);
      for(z in minsObj) tot += minsObj[z] || 0;
      var today = (minsObj[k] ? minsObj[k] : 0) + (isLive ? Math.max(0,Math.floor(((studyObj.ps||n)-studyObj.t-(studyObj.pz||0))/6e4)) : 0);
      var resolvedUid = findNumericUidForMember(room, id, memInfo.uid || roomRec.uid || vu.uid || up.uid) || id;

      o.push({
        room: room, id: id, name: memInfo.name || roomRec.name || vu.name || "সদস্য",
        today: today, tot: tot, td: d.filter(function(x){return x.d;}).length, tt: d.length,
        pr: ((prObj[k] ? prObj[k] : "").split("1").length - 1),
        on: ((rm.pres||{})[id] === true), st: isLive && !(brkObj && brkObj.e > n),
        isV2: true, goal: memInfo.goal || roomRec.goal || vu.goal || "সাধারণ",
        mobile: memInfo.mobile || roomRec.mobile || vu.mobile || up.mobile || "",
        uid: resolvedUid,
        cls: memInfo.cls || roomRec.cls || vu.cls || memInfo.classBase || up.classBase || "HSC",
        college: memInfo.college || roomRec.college || vu.college || up.college || "",
        pin: memInfo.pin || roomRec.pin || up.pin || "",
        joinedAt: memInfo.joinedAt || roomRec.joinedAt || memInfo.createdAt || 0,
        expiresAt: Number(memInfo.expiresAt || roomRec.expiresAt || 0)
      });
    });
  });

  Object.keys(R).forEach(function(room){
    ["p1","p2"].forEach(function(id){
      var uniq = room + "___" + id;
      if(seen[uniq]) return;
      seen[uniq] = true;

      var p = (R[room]||{})[id] || {};
      var vu = (room === VIP && VU[id]) ? VU[id] : {};
      var hasVipData = !!(vu.name || Object.keys(vu.mins||{}).length || Object.keys(vu.days||{}).length);
      if(!p.name && !Object.keys(p.mins||{}).length && !Object.keys(p.days||{}).length && !hasVipData) return;
      var daysObj = p.days || vu.days || {};
      var minsObj = p.mins || vu.mins || {};
      var prObj = p.pr || vu.pr || {};
      var d = (daysObj[k] ? daysObj[k] : []).filter(function(x){ return !x.x; });
      var tot = 0, z, isLive = act(p.study);
      for(z in minsObj) tot += minsObj[z] || 0;
      var today = (minsObj[k] ? minsObj[k] : 0) + (isLive ? Math.max(0,Math.floor(((p.study.ps||n)-p.study.t-(p.study.pz||0))/6e4)) : 0);
      var resolvedVipUid = findNumericUidForMember(room, id, vu.uid || p.uid) || (id === "p1" ? "UID-TASFIA" : "UID-RAHMAN");

      o.push({
        room: room, id: id, name: vu.name || p.name || (id==="p1"?"Tasfia Hasan":"Rahman"),
        today: today, tot: tot, td: d.filter(function(x){return x.d;}).length, tt: d.length,
        pr: ((prObj[k] ? prObj[k] : "").split("1").length - 1),
        on: ((R[room].pres||{})[id] === true), st: isLive && !(p.brk && p.brk.e > n),
        isV2: false, goal: vu.goal || p.goal || "মেডিকেল", mobile: vu.mobile || p.mobile || "",
        uid: resolvedVipUid,
        cls: vu.cls || p.cls || vu.classBase || "HSC", college: vu.college || p.college || "DMC", pin: vu.pin || p.pin || ""
      });
    });
  });

  return o;
}

function lr(){
  try{ return JSON.parse(localStorage.getItem("ad-rooms")||"[]"); }catch(e){ return []; }
}

function isAdminEditing(){
  var modalEl = $("modal");
  if(modalEl && !modalEl.hidden) return true;
  if(document.querySelector(".admin-modal-backdrop")) return true;
  var ae = document.activeElement;
  var appEl = $("app");
  if(ae && appEl && appEl.contains(ae)){
    var tag = (ae.tagName || "").toUpperCase();
    if(tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || ae.isContentEditable) return true;
  }
  if(view === "broadcast" && BROADCAST_DRAFT.text && BROADCAST_DRAFT.text.trim().length > 0) return true;
  var footerCard = $("sr_footer_card");
  if(view === "footer" && (
    FOOTER_DIRTY ||
    FOOTER_SAVE_IN_FLIGHT ||
    (footerCard && ae && footerCard.contains(ae))
  )) return true;
  return false;
}

function pruneExpiredAdminAlerts(alertsData){
  var raw = (alertsData && typeof alertsData === "object") ? alertsData : {};
  var now = Date.now();
  var cleanups = {};
  var hasCleanups = false;

  if(raw.notices && typeof raw.notices === "object"){
    Object.keys(raw.notices).forEach(function(nk){
      var it = raw.notices[nk];
      if(!it || typeof it !== "object" || !it.time || (now - Number(it.time) >= ONE_DAY_MS)){
        cleanups["admin_alerts/notices/" + nk] = null;
        delete raw.notices[nk];
        hasCleanups = true;
      }
    });
  }
  if(raw.global && typeof raw.global === "object"){
    if(!raw.global.time || (now - Number(raw.global.time) >= ONE_DAY_MS)){
      cleanups["admin_alerts/global"] = null;
      delete raw.global;
      hasCleanups = true;
    }
  }
  Object.keys(raw).forEach(function(k){
    if(k === "notices" || k === "global" || k === "feedbacks") return;
    var node = raw[k];
    if(!node || typeof node !== "object") return;
    Object.keys(node).forEach(function(sk){
      var sub = node[sk];
      if(!sub || typeof sub !== "object" || !sub.time || (now - Number(sub.time) >= ONE_DAY_MS)){
        cleanups["admin_alerts/" + k + "/" + sk] = null;
        delete node[sk];
        hasCleanups = true;
      }
    });
    if(!Object.keys(node).length) delete raw[k];
  });

  if(hasCleanups){
    db.ref().update(cleanups).catch(function(){});
  }
  return raw;
}

function load(){
  var bad = [];
  FB_STATUS.configOk = !!(window.firebase && typeof FB_CONFIG !== "undefined" && FB_CONFIG.databaseURL);
  function g(q){
    return q.once("value").then(function(x){ return x.val() || {}; }, function(e){ bad.push((e && (e.code || e.message)) || "UNKNOWN_ERROR"); return {}; });
  }

  return Promise.all([
    g(db.ref("room_meta")),
    g(db.ref("rooms_v2")),
    g(db.ref("audit_logs").orderByChild("at").limitToLast(120)),
    g(db.ref("vip_users")),
    db.ref("admin_config/entry_footer_text").once("value").then(function(x){ return x.exists() ? x.val() : null; }, function(e){ if(e) bad.push(e.code || e.message); return null; }),
    g(db.ref("admin_alerts")),
    g(db.ref("numeric_uids")),
    g(db.ref("user_profiles"))
  ]).then(function(r){
    M = r[0]; R2 = r[1]; L = r[2]; VU = r[3];
    ALERTS = pruneExpiredAdminAlerts(r[5]);
    NU = r[6] || {};
    UP = r[7] || {};
    if(!FOOTER_DIRTY && !FOOTER_SAVE_IN_FLIGHT){
      ENTRY_FOOTER = r[4];
    }

    var cs = {};
    cs[VIP] = 1;
    Object.keys(M).forEach(function(k){ cs[k]=1; });
    Object.keys(R2).forEach(function(k){ cs[k]=1; });
    lr().forEach(function(k){ cs[k]=1; });
    var ks = Object.keys(cs);

    return Promise.all([
      Promise.all(ks.map(function(k){ return g(db.ref("rooms/"+k)); })),
      Promise.all(ks.map(function(k){ return g(db.ref("r2data/"+k)); }))
    ]).then(function(res){
      R = {};
      R2D = {};
      ks.forEach(function(k,i){
        R[k] = res[0][i];
        if(res[1][i] && Object.keys(res[1][i]).length) R2D[k] = res[1][i];
      });
      at = Date.now();
      FB_STATUS.errors = Array.from(new Set(bad));
      FB_STATUS.lastCheckedAt = at;
      if(!isAdminEditing()){
        render();
      } else {
        var syncEl = $("ad_sync_time");
        if(syncEl) syncEl.textContent = "আপডেট: " + fd(at);
      }
      if(bad.length) console.warn("Sync info:", bad);
    });
  }).catch(function(e){
    FB_STATUS.errors = Array.from(new Set(bad.concat([(e && (e.code || e.message)) || "SYNC_FAILED"])));
    FB_STATUS.lastCheckedAt = Date.now();
    if(!isAdminEditing()) render();
    console.warn("Load warning:", e);
  });
}

function logTargetName(room){
  if(!room) return "";
  var s = String(room);
  if(s === "all") return "সকল রুম (Global)";
  if(s.indexOf("room:") === 0) return rn(s.slice(5));
  if(s.indexOf("user:") === 0){
    var ps = s.split(":");
    return ps.slice(3).join(":") || ps[2] || rn(ps[1]);
  }
  return rn(s);
}

function log(action, room, det, ups){
  var k = db.ref("audit_logs").push().key;
  ups = ups || {};
  ups["audit_logs/"+k] = {
    action: action, by: "admin", targetUid: String(room || "").slice(0,64),
    targetName: logTargetName(room).slice(0,60), details: String(det||"").slice(0,500), at: T
  };
  return db.ref().update(ups).then(function(){
    toast("সফল হয়েছে ✓");
    return load();
  }, function(e){
    toast("ব্যর্থ: " + (e.code||e.message));
  });
}

function deleteSingleLog(kId, lObj){
  var isVip = (lObj.targetUid === VIP) || (lObj.targetUid === "1432014310") || (lObj.targetName && lObj.targetName.indexOf("Queen Room") > -1);
  if(isVip){
    return alert("নিরাপত্তা সতর্কতা: VIP রুমের রেকর্ড স্থায়ী এবং সুরক্ষিত। এটি কোনোভাবেই মোছা যাবে না!");
  }

  if(!confirm("এই লগটি পাকাপাকিভাবে মুছে ফেলতে চান?")) return;

  db.ref("audit_logs/" + kId).remove().then(function(){
    delete L[kId];
    toast("লগ মুছে ফেলা হয়েছে ✓");
    render();
  }).catch(function(e){
    toast("ব্যর্থ: " + (e.code || e.message));
  });
}

function cleanupLingeringBackdrops() {
  document.querySelectorAll(".admin-modal-backdrop, [data-admin-overlay]").forEach(function(o){
    try {
      o.style.display = "none";
      o.style.pointerEvents = "none";
      o.remove();
    } catch(e){}
  });
  var defModal = $("modal");
  if (defModal) {
    defModal.hidden = true;
    defModal.style.display = "none";
    defModal.style.pointerEvents = "none";
  }
}
window.cleanupLingeringBackdrops = cleanupLingeringBackdrops;

function openM(){ 
  var b = $("mbox"); 
  b.textContent = ""; 
  b.onclick = function(e){ e.stopPropagation(); };
  b.onmousedown = function(e){ e.stopPropagation(); };
  var m = $("modal");
  m.hidden = false; 
  m.style.display = "grid"; 
  m.style.pointerEvents = "auto";
  return b; 
}
function closeM(){ 
  var m = $("modal");
  if (m) {
    m.hidden = true; 
    m.style.display = "none"; 
    m.style.pointerEvents = "none";
  }
  cleanupLingeringBackdrops();
}
// Rule 2 Fix: Modal closes ONLY on Cross button (✕) or Cancel button. Backdrop clicks do NOT close modal.
$("modal").onclick = function(e){ e.stopPropagation(); };
document.addEventListener("keydown", function(e){ if(e.key==="Escape") { closeM(); cleanupLingeringBackdrops(); if(typeof window.__closeAdminDropdown==="function") window.__closeAdminDropdown(); } });

function detail(room, id){
  var m = openM();
  var r = rows().filter(function(x){ return x.room===room && x.id===id; })[0] || {
    name: "অজানা", today: 0, tot: 0, td: 0, tt: 0, pr: 0
  };

  m.appendChild(el("h2", null, r.name + " · " + rn(room)));
  var c = el("div","chips");
  [["আজ", fm(r.today)], ["মোট", fm(r.tot)], ["কাজ", bn(r.td)+"/"+bn(r.tt)], ["নামাজ", bn(r.pr)+"/৫"]].forEach(function(a){
    c.appendChild(el("span","chip", a[0]+": "+a[1]));
  });
  m.appendChild(c);

  if(r.goal || r.mobile) m.appendChild(el("p", "mute", "টার্গেট: " + (r.goal || "সাধারণ") + (r.mobile ? " · মোবাইল: " + r.mobile : "")));
  var infoEl = el("div", "mute",
    "রুম কোড: " + room +
    " · UID: " + (r.uid || id) +
    " · শ্রেণি: " + (r.cls || "HSC") +
    (r.college ? " · প্রতিষ্ঠান: " + r.college : "") +
    (r.pin ? " · PIN: " + r.pin : "") +
    (r.joinedAt ? " · যোগদান: " + fd(r.joinedAt) : "") +
    (r.on ? " · 🟢 অনলাইন" : " · ⚪ অফলাইন")
  );
  m.appendChild(infoEl);
  if(!r.pin){
    var pinKey = safePathKey(r.uid && /^\d{4,10}$/.test(String(r.uid)) ? r.uid : id);
    db.ref("user_pins/" + pinKey).once("value").then(function(ps){
      var pv = ps.val();
      if(pv && pv.pin && infoEl.isConnected){
        infoEl.textContent += " · PIN: " + pv.pin;
      } else if(pinKey !== safePathKey(id)){
        db.ref("user_pins/" + safePathKey(id)).once("value").then(function(ps2){
          var pv2 = ps2.val();
          if(pv2 && pv2.pin && infoEl.isConnected){
            infoEl.textContent += " · PIN: " + pv2.pin;
          }
        }).catch(function(){});
      }
    }).catch(function(){});
  }

  if(room !== VIP && id !== "p1" && id !== "p2" && R2[room]){
    var roomMetaD = M[room] || (R2[room] && R2[room].meta) || {};
    var roomExpTs = Number(roomMetaD.expiresAt || roomMetaD.trialEnds || 0);
    var memExpTs = Number(r.expiresAt || 0);
    var isMemExpired = memExpTs > 0 && Date.now() > memExpTs;
    var expCard = el("div", "card");
    expCard.style.cssText = "margin-top:12px;padding:12px 14px;border-radius:14px;background:var(--bg);border:1px solid var(--line)";
    var statusTxt = memExpTs > 0
      ? (isMemExpired
          ? "🔴 ব্যক্তিগত মেয়াদ শেষ (" + fd(memExpTs) + ")"
          : "🟢 ব্যক্তিগত মেয়াদ: " + fd(memExpTs) + " (বাকি " + bn(Math.max(1, Math.ceil((memExpTs - Date.now()) / 864e5))) + " দিন)")
      : ("রুমের সাধারণ মেয়াদ অনুসরণ করছে" + (roomExpTs ? " (" + fd(roomExpTs) + ")" : ""));
    expCard.appendChild(el("b", null, "ব্যক্তিগত রুম ব্যবহারের মেয়াদ"));
    var stLine = el("div", "mute", statusTxt);
    stLine.style.cssText = "font-size:12.5px;margin:4px 0 8px;color:" + (isMemExpired ? "var(--danger)" : memExpTs > 0 ? "var(--a)" : "var(--mute)");
    expCard.appendChild(stLine);

    var dInp = el("input");
    dInp.type = "date";
    dInp.value = key(new Date(memExpTs || roomExpTs || Date.now()));
    dInp.style.cssText = "width:100%;margin-bottom:8px";
    expCard.appendChild(dInp);

    function shiftDateInp(deltaDays){
      var baseMs = dInp.value ? new Date(dInp.value + "T12:00:00").getTime() : (memExpTs || roomExpTs || Date.now());
      if(deltaDays > 0 && baseMs < Date.now()) baseMs = Date.now();
      dInp.value = key(new Date(baseMs + deltaDays * 864e5));
    }

    var qRow = el("div", "row");
    qRow.style.cssText = "margin-top:0;gap:6px;flex-wrap:wrap";
    var bPlus7 = btn("+৭ দিন", "alt", function(){ shiftDateInp(7); });
    var bPlus30 = btn("+৩০ দিন", "alt", function(){ shiftDateInp(30); });
    var bMinus7 = btn("-৭ দিন", "ghost", function(){ shiftDateInp(-7); });
    var bExpireNow = btn("🚫 আজই শেষ", "dn", function(){ dInp.value = key(new Date(Date.now() - 864e5)); });
    [bPlus7, bPlus30, bMinus7, bExpireNow].forEach(function(qb){
      qb.style.cssText = "padding:5px 10px;font-size:12px;border-radius:8px";
      qRow.appendChild(qb);
    });
    expCard.appendChild(qRow);

    var actRow = el("div", "row");
    actRow.style.cssText = "margin-top:8px;gap:8px;flex-wrap:wrap";
    var saveExpBtn = btn("মেয়াদ সেভ করো", null, function(){
      if(!dInp.value) return toast("তারিখ নির্বাচন করুন");
      var ts = new Date(dInp.value + "T23:59:59").getTime();
      var u = {};
      u["rooms_v2/" + room + "/members/" + id + "/expiresAt"] = ts;
      if(R2[room] && R2[room][id]) u["rooms_v2/" + room + "/" + id + "/expiresAt"] = ts;
      log("room_edit", "user:" + room + ":" + id + ":" + r.name, "ব্যক্তিগত মেয়াদ (" + r.name + "): " + dInp.value, u).then(function(){
        if(R2[room] && R2[room].members && R2[room].members[id]) R2[room].members[id].expiresAt = ts;
        if(R2[room] && R2[room][id]) R2[room][id].expiresAt = ts;
        detail(room, id);
      });
    });
    saveExpBtn.style.cssText = "padding:6px 12px;font-size:12.5px";
    actRow.appendChild(saveExpBtn);

    if(memExpTs > 0){
      var resetExpBtn = btn("রুমের মেয়াদে ফেরান", "ghost", function(){
        var u = {};
        u["rooms_v2/" + room + "/members/" + id + "/expiresAt"] = null;
        if(R2[room] && R2[room][id]) u["rooms_v2/" + room + "/" + id + "/expiresAt"] = null;
        log("room_edit", "user:" + room + ":" + id + ":" + r.name, r.name + " রুমের সাধারণ মেয়াদে ফিরিয়ে আনা হলো", u).then(function(){
          if(R2[room] && R2[room].members && R2[room].members[id]) delete R2[room].members[id].expiresAt;
          if(R2[room] && R2[room][id]) delete R2[room][id].expiresAt;
          detail(room, id);
        });
      });
      resetExpBtn.style.cssText = "padding:6px 12px;font-size:12.5px";
      actRow.appendChild(resetExpBtn);
    }
    expCard.appendChild(actRow);
    m.appendChild(expCard);
  }

  var row = el("div","row");
  row.style.marginTop = "16px";
  row.style.flexWrap = "wrap";
  row.style.gap = "8px";

  var blkBtn = btn("🚫 পরীক্ষা এক্সেস চেক...", "ghost", function(){
    var targetId = safePathKey(r.uid || id);
    db.ref("exam_blocked_targets/" + targetId).once("value").then(function(snap){
      var isBlk = snap.val() && snap.val().blocked;
      if(isBlk){
        if(!confirm("এই শিক্ষার্থীর পরীক্ষা দেওয়ার নিষেধাজ্ঞা তুলে দিতে চান?")) return;
        db.ref("exam_blocked_targets/" + targetId).remove().then(function(){
          toast("পরীক্ষার এক্সেস পুনরায় সচল করা হয়েছে ✓");
          blkBtn.textContent = "🚫 পরীক্ষা ব্লক করুন";
          blkBtn.className = "btn dn";
        });
      } else {
        if(!confirm("আপনি কি নিশ্চিত যে এই শিক্ষার্থীর পরীক্ষা দেওয়া সাময়িকভাবে স্থগিত করতে চান?")) return;
        db.ref("exam_blocked_targets/" + targetId).set({
          blocked: true,
          blockedAt: Date.now(),
          targetName: r.name,
          room: room
        }).then(function(){
          toast("পরীক্ষা দেওয়ার সুবিধা ব্লক করা হয়েছে ✓");
          blkBtn.textContent = "✅ পরীক্ষা আনব্লক করুন";
          blkBtn.className = "btn alt";
        });
      }
    });
  });
  blkBtn.style.padding = "6px 14px";
  blkBtn.style.fontSize = "13px";
  // Initial check
  db.ref("exam_blocked_targets/" + safePathKey(r.uid || id)).once("value").then(function(s){
    var isBlk = s.val() && s.val().blocked;
    blkBtn.textContent = isBlk ? "✅ পরীক্ষা আনব্লক করুন" : "🚫 পরীক্ষা ব্লক করুন";
    blkBtn.className = isBlk ? "btn alt" : "btn dn";
  });
  row.appendChild(blkBtn);

  if(room !== VIP){
    row.appendChild(btn("🗑 রুম থেকে সরান (Remove)", "dn", function(){
      removeMemberFromRoom(room, id, r, function(){
        closeM();
      });
    }));
  }
  row.appendChild(btn("বন্ধ","ghost", closeM));
  m.appendChild(row);
}

function removeMemberFromRoom(room, id, rObj, onSuccess){
  if(room === VIP) return toast("VIP রুম থেকে সদস্য সরানো যাবে না");
  var memName = (rObj && rObj.name) || "সদস্য";
  if(!confirm(memName + " কে '" + rn(room) + "' রুম থেকে সরাতে চান?\nসরিয়ে দিলে রুমের সিট খালি হবে এবং ইউজার স্বয়ংক্রিয়ভাবে রুম থেকে বের হয়ে যাবে।")) return;

  var u = {};
  if(!rObj || rObj.isV2 !== false){
    u["rooms_v2/"+room+"/members/"+id] = null;
    u["rooms_v2/"+room+"/"+id] = null;
    u["rooms_v2/"+room+"/pres/"+id] = null;
    u["r2data/"+room+"/"+id] = null;
  } else {
    u["rooms/"+room+"/"+id] = null;
  }
  if(id !== "p1" && id !== "p2"){
    u["user_pins/"+id] = null;
    u["user_profiles/"+id] = null;
    var delUid = (rObj && rObj.uid) ? String(rObj.uid) : "";
    if(delUid && /^\d{4,10}$/.test(delUid)){
      u["numeric_uids/"+delUid] = null;
      u["user_pins/"+delUid] = null;
    }
    Object.keys(NU || {}).forEach(function(nuKey){
      var info = NU[nuKey];
      if(info && info.roomId === room && info.memberId === id){
        u["numeric_uids/"+nuKey] = null;
        u["user_pins/"+nuKey] = null;
      }
    });
  }

  log("delete_user", room, id + " ("+memName+") রুম থেকে সরানো হলো", u).then(function(){
    if(R2[room]){
      if(R2[room].members) delete R2[room].members[id];
      delete R2[room][id];
      if(R2[room].pres) delete R2[room].pres[id];
    }
    if(R2D[room]) delete R2D[room][id];
    if(id !== "p1" && id !== "p2"){
      delete UP[id];
      Object.keys(NU || {}).forEach(function(nuKey){
        if(NU[nuKey] && NU[nuKey].roomId === room && NU[nuKey].memberId === id) delete NU[nuKey];
      });
    }
    if(typeof onSuccess === "function") onSuccess();
  });
}

function metaM(room){
  var m = openM(), d = M[room] || (R2[room] && R2[room].meta) || {};
  var r2Meta = (R2[room] && R2[room].meta) || {};
  var roomMems = rows().filter(function(x){ return x.room === room; });
  var regMems = room === VIP ? roomMems : roomMems.filter(function(x){ return x.id !== "p1" && x.id !== "p2"; });
  var vipVisitorsCount = room === VIP ? 0 : (roomMems.length - regMems.length);
  var curMemCount = regMems.length;
  var curMax = parseInt(r2Meta.max || d.max || (room===VIP ? 2 : 8), 10) || 8;
  var createdTs = getRoomCreatedAt(room);
  var totalToday = roomMems.reduce(function(a,x){ return a + (x.today || 0); }, 0);
  var totalAll = roomMems.reduce(function(a,x){ return a + (x.tot || 0); }, 0);

  m.appendChild(el("h2", null, "রুম কন্ট্রোল ও A–Z তথ্য · " + rn(room)));

  // A–Z রুম সামারি বক্স
  var azBox = el("div", "card");
  azBox.style.cssText = "margin-top:8px;margin-bottom:12px;padding:12px 14px;border-radius:14px;background:var(--bg);border:1px solid var(--line)";
  azBox.innerHTML = `
    <div style="font-size:13.5px;line-height:1.65">
      <div><b>রুম কোড / পাসকোড:</b> <code>${escHtml(room)}</code> · <b>সদস্য:</b> ${bn(curMemCount)}/${bn(room===VIP?2:curMax)} জন${vipVisitorsCount > 0 ? " (+ " + bn(vipVisitorsCount) + " VIP)" : ""}</div>
      <div><b>তৈরির সময়:</b> ${escHtml(createdTs ? fd(createdTs) : "অজানা")} · <b>আজ / মোট পড়া:</b> ${escHtml(fm(totalToday))} / ${escHtml(fm(totalAll))}</div>
      ${room === VIP ? `<div style="margin-top:4px;color:var(--a);font-weight:700">মেয়াদ: আনলিমিটেড (VIP রুমের মেয়াদ অ্যাডমিনও পরিবর্তন করতে পারবেন না)</div>` : ""}
    </div>
  `;
  if(roomMems.length){
    var memWrap = el("div");
    memWrap.style.cssText = "margin-top:8px;display:flex;flex-direction:column;gap:5px;max-height:190px;overflow-y:auto";
    roomMems.forEach(function(xm){
      var isVipVisitor = (room !== VIP && (xm.id === "p1" || xm.id === "p2"));
      var indExpHtml = (!isVipVisitor && room !== VIP && xm.expiresAt > 0)
        ? ` · <span style="color:${Date.now() > xm.expiresAt ? "var(--danger)" : "var(--a)"};font-weight:600">ব্যক্তিগত মেয়াদ: ${escHtml(key(new Date(xm.expiresAt)))}${Date.now() > xm.expiresAt ? " (শেষ)" : ""}</span>`
        : "";
      var rowM = el("div", "sw");
      rowM.style.cssText = "padding:6px 10px;border-radius:10px;background:var(--card);border:1px solid var(--line);font-size:12.5px;gap:8px";
      var infoBtn = el("div");
      infoBtn.style.cssText = "flex:1;min-width:0;cursor:pointer";
      infoBtn.innerHTML = `
        <div><b>${escHtml(xm.name)}</b> ${isVipVisitor ? "VIP " : ""}${xm.on ? "🟢" : ""} · UID: <b>${escHtml(xm.uid || xm.id)}</b>${xm.pin ? " · PIN: <b>"+escHtml(xm.pin)+"</b>" : ""}${xm.mobile ? " · "+escHtml(xm.mobile) : ""}</div>
        <div class="mute" style="font-size:11.5px">পড়া: ${escHtml(fm(xm.today))} / ${escHtml(fm(xm.tot))}${indExpHtml} (মেয়াদ ও বিস্তারিত দেখতে চাপুন ›)</div>
      `;
      infoBtn.onclick = function(){ detail(room, xm.id); };
      rowM.appendChild(infoBtn);
      if(room !== VIP){
        var rmBtn = btn("🗑 সরান", "dn", function(ev){
          if(ev) ev.stopPropagation();
          removeMemberFromRoom(room, xm.id, xm, function(){
            metaM(room);
          });
        });
        rmBtn.style.cssText = "padding:4px 10px;font-size:11.5px;border-radius:8px;flex-shrink:0";
        rowM.appendChild(rmBtn);
      }
      memWrap.appendChild(rowM);
    });
    azBox.appendChild(memWrap);
  }
  m.appendChild(azBox);

  var n = el("input"); n.placeholder = "রুমের নাম"; n.maxLength = 40;
  n.value = d.name || (room===VIP ? "Queen Room" : "");

  var codeInp = el("input");
  codeInp.placeholder = "রুমের পাসকোড (কমপক্ষে ৪ অক্ষর)";
  codeInp.maxLength = 40;
  codeInp.value = room;
  codeInp.disabled = (room === VIP || !R2[room]);

  var s = el("select");
  Object.keys(ST).forEach(function(x){
    var o = el("option", null, ST[x]); o.value = x; s.appendChild(o);
  });
  s.value = room === VIP ? "approved" : (d.status || "trial");
  s.disabled = room === VIP;

  var curExp = d.expiresAt || d.trialEnds || 0;
  var e = el("input"); e.type = "date";
  e.value = (room !== VIP && curExp) ? key(new Date(curExp)) : "";
  e.disabled = room === VIP;

  var maxSel = el("select");
  for(var i = 1; i <= 8; i++){
    var mo = el("option", null, bn(i) + " জন" + (i === 8 ? " (সর্বোচ্চ)" : ""));
    mo.value = String(i);
    maxSel.appendChild(mo);
  }
  maxSel.value = String(Math.min(8, Math.max(1, curMax)));
  maxSel.disabled = room === VIP;

  m.appendChild(el("small", "mute", "রুমের নাম:")); m.appendChild(n);
  if(room !== VIP && R2[room]){
    m.appendChild(el("small", "mute", "রুমের পাসকোড (প্রয়োজনে পরিবর্তন করুন):")); m.appendChild(codeInp);
  }
  m.appendChild(el("small", "mute", "সর্বোচ্চ সদস্য সংখ্যা (শুধুমাত্র অ্যাডমিন পরিবর্তন করতে পারবেন · বর্তমান সদস্য: " + bn(curMemCount) + " জন):")); m.appendChild(maxSel);
  m.appendChild(el("small", "mute", "স্ট্যাটাস:")); m.appendChild(s);
  if(room === VIP){
    m.appendChild(el("small", "mute", "মেয়াদ:"));
    var vipUnlimNote = el("div", "card", "আনলিমিটেড — কখনো শেষ হবে না (অ্যাডমিনও পরিবর্তন করতে পারবেন না)");
    vipUnlimNote.style.cssText = "padding:10px 12px;border-radius:10px;font-size:13px;font-weight:700;color:var(--a);background:var(--bg);margin-top:4px";
    m.appendChild(vipUnlimNote);
  } else {
    m.appendChild(el("small", "mute", "মেয়াদ শেষ হওয়ার তারিখ:")); m.appendChild(e);
  }

  if(room !== VIP){
    var quickDiv = el("div","row");
    quickDiv.style.marginTop = "12px";
    quickDiv.appendChild(btn("+ ৩০ দিন অনুমোদন দিন", "alt", function(){
      var nowPlus30 = Date.now() + 30 * 864e5;
      e.value = key(new Date(nowPlus30));
      s.value = "approved";
      toast("৩০ দিন সিলেক্ট হয়েছে, 'সেভ করুন' চাপুন");
    }));
    quickDiv.appendChild(btn("+ ৬০ দিন", "ghost", function(){
      var nowPlus60 = Date.now() + 60 * 864e5;
      e.value = key(new Date(nowPlus60));
      s.value = "approved";
      toast("৬০ দিন সিলেক্ট হয়েছে, 'সেভ করুন' চাপুন");
    }));
    m.appendChild(quickDiv);
  }

  var row = el("div","row");
  row.style.marginTop = "16px";
  var svBtn = btn("সেভ করুন", null, function(){
    var newMax = parseInt(maxSel.value, 10) || 8;
    var targetCode = (room !== VIP && R2[room]) ? codeInp.value.trim().replace(/[.$#\[\]\/]/g, "_") : room;
    if(targetCode !== room){
      if(targetCode.length < 4 || targetCode.length > 40){
        return alert("নতুন রুম পাসকোড ৪ থেকে ৪০ অক্ষরের মধ্যে হতে হবে।");
      }
      if(targetCode === VIP){
        return alert("VIP পাসকোড ব্যবহার করা যাবে না।");
      }
    }

    var o = { updatedAt: T };
    if(n.value.trim()) o.name = n.value.trim().slice(0,40);
    if(room !== VIP) {
      o.status = s.value;
      o.max = newMax;
      if(e.value) o.expiresAt = new Date(e.value+"T23:59:59").getTime();
    }

    if(targetCode === room){
      var u = {};
      u["room_meta/"+room+"/updatedAt"] = T;
      if(o.name !== undefined) u["room_meta/"+room+"/name"] = o.name;
      if(o.status !== undefined) u["room_meta/"+room+"/status"] = o.status;
      if(o.max !== undefined) u["room_meta/"+room+"/max"] = o.max;
      if(o.expiresAt) u["room_meta/"+room+"/expiresAt"] = o.expiresAt;
      if(R2[room]) {
        if(o.name !== undefined) u["rooms_v2/"+room+"/meta/name"] = o.name;
        if(o.status !== undefined) u["rooms_v2/"+room+"/meta/status"] = o.status;
        if(o.max !== undefined) u["rooms_v2/"+room+"/meta/max"] = o.max;
        if(o.expiresAt) u["rooms_v2/"+room+"/meta/expiresAt"] = o.expiresAt;
      }
      closeM();
      log("room_edit", room, "স্ট্যাটাস="+(o.status||"VIP")+", সর্বোচ্চ সদস্য="+newMax+", মেয়াদ="+e.value, u);
      return;
    }

    // রুম পাসকোড পরিবর্তন (অ্যাডমিন কন্ট্রোল — কোনো ডেটা হারানো ছাড়াই)
    svBtn.disabled = true;
    Promise.all([
      db.ref("rooms_v2/" + targetCode).once("value"),
      db.ref("rooms/" + targetCode).once("value"),
      db.ref("rooms_v2/" + room).once("value"),
      db.ref("r2data/" + room).once("value"),
      db.ref("admin_alerts/" + room).once("value")
    ]).then(function(checks){
      if(checks[0].exists() || checks[1].exists()){
        svBtn.disabled = false;
        alert("এই পাসকোডটি (" + targetCode + ") ইতোমধ্যে অন্য একটি রুম ব্যবহার করছে!");
        return;
      }
      var freshRoom = checks[2].val() || R2[room] || {};
      var clonedRoom = JSON.parse(JSON.stringify(freshRoom));
      if(!clonedRoom.meta) clonedRoom.meta = {};
      if(o.name !== undefined) clonedRoom.meta.name = o.name;
      if(o.status !== undefined) clonedRoom.meta.status = o.status;
      if(o.max !== undefined) clonedRoom.meta.max = o.max;
      if(o.expiresAt) clonedRoom.meta.expiresAt = o.expiresAt;
      if(clonedRoom.meta.createdAt) o.createdAt = clonedRoom.meta.createdAt;

      var u = {};
      u["rooms_v2/" + targetCode] = clonedRoom;
      u["rooms_v2/" + room] = null;
      u["room_meta/" + targetCode] = o;
      u["room_meta/" + room] = null;

      if(checks[3].exists()){
        u["r2data/" + targetCode] = checks[3].val();
        u["r2data/" + room] = null;
      }
      if(checks[4].exists()){
        u["admin_alerts/" + targetCode] = checks[4].val();
        u["admin_alerts/" + room] = null;
      }

      if(clonedRoom.members && typeof clonedRoom.members === "object"){
        Object.keys(clonedRoom.members).forEach(function(mid){
          var mUid = clonedRoom.members[mid] && clonedRoom.members[mid].uid;
          if(mUid && /^\d{4,10}$/.test(String(mUid))){
            u["numeric_uids/" + mUid + "/roomId"] = targetCode;
            u["user_pins/" + mUid + "/roomId"] = targetCode;
          }
        });
      }
      closeM();
      log("room_edit", targetCode, "রুম কোড পরিবর্তন ("+room+" ➔ "+targetCode+"), স্ট্যাটাস="+(o.status||"VIP")+", সর্বোচ্চ সদস্য="+newMax, u);
    }).catch(function(){
      svBtn.disabled = false;
      alert("সংযোগ সমস্যার কারণে পাসকোড পরিবর্তন করা যায়নি।");
    });
  });
  row.appendChild(svBtn);
  row.appendChild(btn("বাতিল","ghost", closeM));
  m.appendChild(row);
}

function delRoom(room){
  if(room === VIP) return toast("VIP রুম মোছা যাবে না");
  if(prompt("রুম মুছতে কোডটি হুবহু লিখুন: " + room) !== room) return toast("কোড মেলেনি");
  if(!confirm("রুম " + room + "-এর সব তথ্য মুছে যাবে। নিশ্চিত?")) return;

  var u = {};
  u["rooms/"+room] = null;
  u["rooms_v2/"+room] = null;
  u["room_meta/"+room] = null;
  u["r2data/"+room] = null;
  u["r2chat/"+room] = null;
  u["admin_alerts/"+room] = null;

  var roomMems = (R2[room] && R2[room].members) ? Object.keys(R2[room].members) : [];
  roomMems.forEach(function(mid){
    if(mid !== "p1" && mid !== "p2"){
      var memObj = R2[room].members[mid] || {};
      u["user_pins/"+mid] = null;
      u["user_profiles/"+mid] = null;
      if(memObj.uid && /^\d{4,10}$/.test(String(memObj.uid))){
        u["numeric_uids/"+String(memObj.uid)] = null;
        u["user_pins/"+String(memObj.uid)] = null;
      }
    }
  });
  Object.keys(NU || {}).forEach(function(nuKey){
    var info = NU[nuKey];
    if(info && info.roomId === room && info.memberId !== "p1" && info.memberId !== "p2"){
      u["numeric_uids/"+nuKey] = null;
      u["user_pins/"+nuKey] = null;
    }
  });

  log("delete_user", room, "পুরো রুম ডিলিট", u);
}

/* ---------- ভিউসমূহ ---------- */
var V = {};

// ১. ওভারভিউ (ক্লিকেবল KPI বাটন)
V.ov = function(m){
  var r = rows();
  var allRooms = Array.from(new Set(Object.keys(R).concat(Object.keys(R2))));
  var on = r.filter(function(x){ return x.on; }).length;
  var st = r.filter(function(x){ return x.st; }).length;
  var sum = r.reduce(function(a,x){ return a + x.today; }, 0);

  var k = el("div","kpi");
  var cardsData = [
    { title: "মোট রুম", val: bn(allRooms.length), click: function(){ view="rooms"; render(); } },
    { title: "মোট সদস্য", val: bn(r.length), click: function(){ F.f="all"; view="users"; render(); } },
    { title: "অনলাইন", val: bn(on), click: function(){ F.f="on"; view="users"; render(); } },
    { title: "এখন পড়ছে", val: bn(st), click: function(){ F.f="st"; view="users"; render(); } },
    { title: "আজকের মোট পড়া", val: fm(sum), click: function(){ F.s="today"; view="users"; render(); } }
  ];

  cardsData.forEach(function(a){
    var c = el("div","card");
    c.title = a.title + " দেখতে চাপুন";
    c.appendChild(el("div","mute", a.title + " ›"));
    c.appendChild(el("b", null, a.val));
    c.onclick = a.click;
    k.appendChild(c);
  });
  m.appendChild(k);

  m.appendChild(el("h3", null, "আজ সবচেয়ে বেশি পড়েছে"));
  r.slice().sort(function(a,b){ return b.today - a.today; }).slice(0, 5).forEach(function(x, i){
    var c = el("div","card sw");
    c.appendChild(el("span", null, bn(i+1) + ". " + x.name + " · " + rn(x.room)));
    c.appendChild(el("b", null, fm(x.today)));
    c.onclick = function(){ detail(x.room, x.id); };
    c.style.cursor = "pointer";
    m.appendChild(c);
  });

  // সিস্টেম ও Firebase হেলথ স্ট্যাটাস কার্ড (শুধু অ্যাডমিনের জন্য)
  var hasFbIssue = !FB_STATUS.configOk || FB_STATUS.connected === false || (FB_STATUS.errors && FB_STATUS.errors.length > 0);
  var fbCard = el("div", "card");
  fbCard.style.marginTop = "16px";
  fbCard.style.borderColor = hasFbIssue ? "var(--danger)" : "var(--line)";
  var fbTitle = hasFbIssue ? "⚠️ সিস্টেম ও Firebase স্ট্যাটাস (সমস্যা শনাক্ত)" : "সিস্টেম ও Firebase স্ট্যাটাস";
  var fbStatusTxt = !FB_STATUS.configOk ? "কনফিগ ত্রুটি (databaseURL অনুপস্থিত)"
    : (FB_STATUS.connected === false) ? "ডাটাবেস সংযোগ বিচ্ছিন্ন (Offline / Blocked)"
    : (FB_STATUS.errors && FB_STATUS.errors.length) ? ("সিঙ্ক ত্রুটি: " + FB_STATUS.errors.join(", "))
    : "সচল এবং স্বাভাবিক ✓";
  var projLabel = (typeof FB_CONFIG !== "undefined" && FB_CONFIG.projectId) ? FB_CONFIG.projectId : "—";
  fbCard.innerHTML = `
    <div class="sw">
      <div>
        <b>${escHtml(fbTitle)}</b>
        <div class="mute" style="margin-top:4px;font-size:13.5px">
          অবস্থা: <strong style="color:${hasFbIssue ? 'var(--danger)' : 'var(--a)'}">${escHtml(fbStatusTxt)}</strong> · প্রোজেক্ট: <code>${escHtml(projLabel)}</code>
        </div>
        ${FB_STATUS.lastCheckedAt ? `<small class="mute">সর্বশেষ যাচাই: ${escHtml(fd(FB_STATUS.lastCheckedAt))}</small>` : ""}
      </div>
    </div>
  `;
  var checkRow = el("div", "row");
  checkRow.style.marginTop = "10px";
  checkRow.appendChild(btn("🔄 সংযোগ পরীক্ষা করুন", "ghost", function(){
    toast("Firebase সংযোগ যাচাই করা হচ্ছে...");
    load();
  }));
  fbCard.appendChild(checkRow);
  m.appendChild(fbCard);
};

function getRoomCreatedAt(room){
  var rm = R2[room] || {};
  var meta = rm.meta || {};
  var mMeta = M[room] || {};
  if(meta.createdAt && Number(meta.createdAt) > 0) return Number(meta.createdAt);
  if(mMeta.createdAt && Number(mMeta.createdAt) > 0) return Number(mMeta.createdAt);

  var earliestJoin = 0;
  var mems = rm.members || {};
  Object.keys(mems).forEach(function(mid){
    var j = Number((mems[mid] && (mems[mid].joinedAt || mems[mid].createdAt)) || 0);
    if(j > 0 && (!earliestJoin || j < earliestJoin)) earliestJoin = j;
  });
  if(earliestJoin > 0) return earliestJoin;

  if(meta.trialEnds && Number(meta.trialEnds) > 0){
    return Math.max(1, Number(meta.trialEnds) - (3 * 86400000));
  }
  if(mMeta.updatedAt && Number(mMeta.updatedAt) > 0) return Number(mMeta.updatedAt);

  var earliestChat = 0;
  var chatObj = rm.chat || (R[room] && R[room].chat) || {};
  Object.keys(chatObj).forEach(function(ck){
    var ct = Number((chatObj[ck] && (chatObj[ck].t || chatObj[ck].time)) || 0);
    if(ct > 0 && (!earliestChat || ct < earliestChat)) earliestChat = ct;
  });
  if(earliestChat > 0) return earliestChat;

  return 0;
}

function sortRoomIds(ids, sortMode, rowsByRoom){
  var list = ids.slice();
  list.sort(function(a, b){
    if(sortMode === "az" || sortMode === "za"){
      var na = String(rn(a) || a).trim();
      var nb = String(rn(b) || b).trim();
      var cmp = na.localeCompare(nb, undefined, { sensitivity: "base", numeric: true });
      return sortMode === "az" ? cmp : -cmp;
    }
    if(sortMode === "study" && rowsByRoom){
      var sa = (rowsByRoom[a] || []).reduce(function(acc, x){ return acc + (x.today || 0); }, 0);
      var sb = (rowsByRoom[b] || []).reduce(function(acc, x){ return acc + (x.today || 0); }, 0);
      if(sb !== sa) return sb - sa;
    }
    if(sortMode === "members" && rowsByRoom){
      var ma = (rowsByRoom[a] || []).length;
      var mb = (rowsByRoom[b] || []).length;
      if(mb !== ma) return mb - ma;
    }
    var ta = getRoomCreatedAt(a);
    var tb = getRoomCreatedAt(b);
    if(sortMode === "oldest"){
      if(ta !== tb) return ta - tb;
    } else {
      if(tb !== ta) return tb - ta;
    }
    return String(rn(a) || a).localeCompare(String(rn(b) || b), undefined, { sensitivity: "base", numeric: true });
  });
  return list;
}

// ২. রুম তালিকা
V.rooms = function(m){
  var allRoomIds = Array.from(new Set(Object.keys(R).concat(Object.keys(R2))));
  if(!allRoomIds.length){ m.appendChild(el("p","mute","কোনো সক্রিয় রুম নেই।")); return; }

  var allRows = rows();
  var rowsByRoom = {};
  allRows.forEach(function(x){
    if(!rowsByRoom[x.room]) rowsByRoom[x.room] = [];
    rowsByRoom[x.room].push(x);
  });

  var bar = el("div", "row bar");
  var qInp = el("input");
  qInp.placeholder = "🔍 রুমের নাম, কোড বা সদস্য খুঁজুন...";
  qInp.value = RF.q;
  qInp.style.flex = "2";

  var stSel = el("select");
  [
    ["all", "সব স্ট্যাটাস"],
    ["trial", "৩ দিনের ট্রায়াল"],
    ["approved", "অনুমোদিত"],
    ["expired", "মেয়াদ শেষ"],
    ["off", "বন্ধ / ব্লক"],
    ["vip", "VIP রুম"]
  ].forEach(function(a){
    var o = el("option", null, a[1]); o.value = a[0]; stSel.appendChild(o);
  });
  stSel.value = RF.status;

  var sortSel = el("select");
  [
    ["recent", "নতুন আগে (Recent → পুরোনো)"],
    ["oldest", "পুরোনো আগে (পুরোনো → নতুন)"],
    ["az", "নাম (A → Z)"],
    ["za", "নাম (Z → A)"],
    ["study", "আজকের পড়া বেশি"],
    ["members", "সদস্য বেশি"]
  ].forEach(function(a){
    var o = el("option", null, a[1]); o.value = a[0]; sortSel.appendChild(o);
  });
  sortSel.value = RF.sort;

  bar.appendChild(qInp);
  bar.appendChild(stSel);
  bar.appendChild(sortSel);
  m.appendChild(bar);

  var infoRow = el("div", "sw");
  infoRow.style.marginTop = "8px";
  var countLbl = el("small", "mute", "");
  var resetBtn = btn("রিসেট", "ghost", function(){
    RF.q = ""; RF.status = "all"; RF.sort = "recent";
    qInp.value = ""; stSel.value = "all"; sortSel.value = "recent";
    drawRooms();
  });
  resetBtn.style.cssText = "padding:4px 10px;font-size:12px";
  infoRow.appendChild(countLbl);
  infoRow.appendChild(resetBtn);
  m.appendChild(infoRow);

  var list = el("div");
  m.appendChild(list);

  function drawRooms(){
    list.textContent = "";
    var t = RF.q.trim().toLowerCase();
    var filtered = allRoomIds.filter(function(room){
      var d = M[room] || (R2[room] && R2[room].meta) || {};
      var isVip = (room === VIP);
      var curStatus = d.status || (isVip ? "approved" : "trial");
      var expTime = d.expiresAt || d.trialEnds || 0;
      var isExpired = !isVip && expTime && (Date.now() > expTime);
      var isOff = !isVip && (curStatus === "suspended" || curStatus === "blocked");

      if(RF.status === "vip" && !isVip) return false;
      if(RF.status === "off" && !isOff) return false;
      if(RF.status === "expired" && !isExpired) return false;
      if(RF.status === "trial" && (isVip || isOff || isExpired || curStatus !== "trial")) return false;
      if(RF.status === "approved" && (isVip || isOff || isExpired || curStatus !== "approved")) return false;

      if(!t) return true;
      var mem = rowsByRoom[room] || [];
      var memText = mem.map(function(x){ return (x.name || "") + " " + (x.uid || "") + " " + (x.mobile || ""); }).join(" ");
      var extraUidText = getRoomExtraUidTokens(room);
      var hay = (rn(room) + " " + room + " " + memText + " " + extraUidText).toLowerCase();
      return hay.indexOf(t) > -1;
    });

    var sorted = sortRoomIds(filtered, RF.sort, rowsByRoom);
    countLbl.textContent = "মোট " + bn(sorted.length) + "টি রুম দেখানো হচ্ছে (সর্বমোট " + bn(allRoomIds.length) + "টি)";
    resetBtn.style.display = (RF.q.trim() || RF.status !== "all" || RF.sort !== "recent") ? "inline-flex" : "none";

    if(!sorted.length){
      list.appendChild(el("p","mute","ফিল্টার অনুযায়ী কোনো রুম পাওয়া যায়নি।"));
      return;
    }

    sorted.forEach(function(room){
      var mem = rowsByRoom[room] || [];
      var d = M[room] || (R2[room] && R2[room].meta) || {};
      var isVip = (room === VIP);
      var c = el("div","card"), h = el("div","sw");

      var curStatus = d.status || (isVip ? "approved" : "trial");
      var expTime = d.expiresAt || d.trialEnds || 0;
      var isExpired = !isVip && expTime && (Date.now() > expTime);
      var isOff = !isVip && (curStatus === "suspended" || curStatus === "blocked");

      var badgeText = isVip ? "প্রাইভেট (VIP)" : isOff ? (ST[curStatus] || "বন্ধ") : isExpired ? "মেয়াদ শেষ" : (ST[curStatus] || "অনুমোদিত");
      var badgeClass = isVip ? "" : (isExpired || isOff) ? " x" : (curStatus === "trial" || curStatus === "pending" ? " s" : "");

      h.appendChild(el("b", null, rn(room) + (isVip ? " (লক করা)" : "")));
      h.appendChild(el("span","badge" + badgeClass, badgeText));
      c.appendChild(h);

      var expMsg = "";
      if(isVip){
        expMsg = " · মেয়াদ: আনলিমিটেড";
      } else if(expTime){
        var daysLeft = Math.ceil((expTime - Date.now()) / 864e5);
        expMsg = isExpired ? " · মেয়াদোত্তীর্ণ" : (" · মেয়াদ বাকি: " + bn(Math.max(0, daysLeft)) + " দিন");
      }
      var createdTs = getRoomCreatedAt(room);
      var createdMsg = createdTs ? (" · তৈরি: " + fd(createdTs)) : "";

      var regMemCount = isVip ? mem.length : mem.filter(function(x){ return x.id !== "p1" && x.id !== "p2"; }).length;
      var vipVisCount = isVip ? 0 : (mem.length - regMemCount);
      var maxMem = isVip ? 2 : (parseInt((R2[room] && R2[room].meta && R2[room].meta.max) || d.max || 8, 10) || 8);
      var todaySum = mem.reduce(function(a,x){ return a+x.today; }, 0);
      var totSum = mem.reduce(function(a,x){ return a+x.tot; }, 0);

      c.appendChild(el("div","mute",
        "কোড: " + room + " · সদস্য: " + bn(regMemCount) + "/" + bn(maxMem) + (vipVisCount > 0 ? " (+" + bn(vipVisCount) + " VIP)" : "") +
        " · আজ পড়া: " + fm(todaySum) + " · মোট: " + fm(totSum) + expMsg + createdMsg
      ));

      var ch = el("div","chips");
      mem.forEach(function(x){
        var s = el("span","chip" + (x.on ? " dot" : ""), x.name);
        s.style.cursor = "pointer";
        s.onclick = function(){ detail(x.room, x.id); };
        ch.appendChild(s);
      });
      c.appendChild(ch);

      var row = el("div","row");
      row.appendChild(btn("⚙️ রুম কন্ট্রোল ও A–Z তথ্য", "ghost", function(){ metaM(room); }));
      row.appendChild(btn("💬 চ্যাট", "ghost", function(){ F.room=room; view="chat"; render(); }));
      if(!isVip){
        row.appendChild(btn("🗑 রুম মুছুন", "dn", function(){ delRoom(room); }));
      }
      c.appendChild(row);
      list.appendChild(c);
    });
  }

  qInp.oninput = function(){ RF.q = qInp.value; drawRooms(); };
  stSel.onchange = function(){ RF.status = stSel.value; drawRooms(); };
  sortSel.onchange = function(){ RF.sort = sortSel.value; drawRooms(); };
  drawRooms();
};

// ৩. ইউজার তালিকা
V.users = function(m){
  var bar = el("div","row bar");
  var q = el("input"); q.placeholder = "🔍 নাম, রুম কোড বা UID দিয়ে খুঁজুন..."; q.value = F.q;
  q.style.flex = "2";

  var f = el("select");
  [["all","সবাই"],["on","অনলাইন"],["st","এখন পড়ছে"]].forEach(function(a){
    var o = el("option", null, a[1]); o.value = a[0]; f.appendChild(o);
  });
  f.value = F.f;

  var s = el("select");
  [["today","আজকের পড়া"],["tot","মোট পড়া"],["name","নাম"]].forEach(function(a){
    var o = el("option", null, a[1]); o.value = a[0]; s.appendChild(o);
  });
  s.value = F.s;

  var uidSearchBtn = btn("🔍 ৫-ডিজিট UID সার্চ", "ghost", function(){
    var targetUID = prompt("যে শিক্ষার্থীর সম্পূর্ণ ডিটেইলস দেখতে চান তার ৫-ডিজিটের UID লিখুন (যেমন: 45821):");
    if(!targetUID) return;
    targetUID = targetUID.trim();
    var found = rows().filter(function(x){ return String(x.uid||"").toLowerCase() === targetUID.toLowerCase(); })[0];
    if(found){
      detail(found.room, found.id);
    } else if(NU[targetUID] && NU[targetUID].roomId && NU[targetUID].memberId){
      detail(NU[targetUID].roomId, NU[targetUID].memberId);
    } else {
      toast("ডাটাবেসে খোঁজা হচ্ছে...");
      db.ref("numeric_uids/" + targetUID).once("value").then(function(snap){
        var uInfo = snap.val();
        if(uInfo && uInfo.roomId && uInfo.memberId){
          detail(uInfo.roomId, uInfo.memberId);
        } else {
          Promise.all([
            db.ref("rooms_v2").once("value"),
            db.ref("vip_users").once("value"),
            db.ref("rooms/" + VIP).once("value"),
            db.ref("user_profiles").once("value")
          ]).then(function(snaps){
            var allRooms = snaps[0].val() || {};
            var vipUsers = snaps[1].val() || {};
            var vipRoom = snaps[2].val() || {};
            var profiles = snaps[3].val() || {};
            var matchRoom = null, matchMemId = null;

            ["p1","p2"].forEach(function(slot){
              if(matchRoom) return;
              if((vipUsers[slot] && String(vipUsers[slot].uid || "") === targetUID) ||
                 (vipRoom[slot] && String(vipRoom[slot].uid || "") === targetUID)){
                matchRoom = VIP;
                matchMemId = slot;
              }
            });

            if(!matchRoom){
              Object.keys(allRooms).forEach(function(rKey){
                var rObj = allRooms[rKey] || {};
                var mems = rObj.members || {};
                Object.keys(mems).forEach(function(mKey){
                  var mUid = (mems[mKey] && mems[mKey].uid) || (rObj[mKey] && rObj[mKey].uid) || (profiles[mKey] && profiles[mKey].uid) || "";
                  if(String(mUid) === targetUID){
                    matchRoom = rKey;
                    matchMemId = mKey;
                  }
                });
              });
            }

            if(matchRoom && matchMemId){
              detail(matchRoom, matchMemId);
            } else {
              alert("এই ৫-ডিজিটের UID (" + targetUID + ") দিয়ে কোনো শিক্ষার্থী খুঁজে পাওয়া যায়নি।");
            }
          });
        }
      }).catch(function(){
        alert("এই ৫-ডিজিটের UID (" + targetUID + ") দিয়ে কোনো শিক্ষার্থী খুঁজে পাওয়া যায়নি।");
      });
    }
  });
  uidSearchBtn.style.padding = "8px 12px";
  uidSearchBtn.style.fontSize = "12.5px";

  bar.appendChild(q); bar.appendChild(f); bar.appendChild(s); bar.appendChild(uidSearchBtn);
  m.appendChild(bar);

  var list = el("div");
  m.appendChild(list);

  function draw(){
    list.textContent = "";
    var t = F.q.trim().toLowerCase();
    var r = rows().filter(function(x){
      var matchText = (x.name + " " + x.room + " " + rn(x.room) + " " + (x.uid || "") + " " + (x.cls || "") + " " + (x.college || "") + " " + (x.mobile || "")).toLowerCase().indexOf(t) > -1;
      var matchFilter = (F.f === "all") || (F.f === "on" ? x.on : x.st);
      return matchText && matchFilter;
    });

    r.sort(function(a,b){
      return F.s === "name" ? a.name.localeCompare(b.name) : b[F.s] - a[F.s];
    });

    if(!r.length){ list.appendChild(el("p","mute","কাউকে পাওয়া যায়নি।")); return; }

    r.forEach(function(x){
      var c = el("div","card sw");
      c.style.cursor = "pointer";

      var l = el("div");
      var titleRow = el("div");
      titleRow.appendChild(el("b", x.on ? "dot" : "", x.name));
      if(x.uid){
        var uBadge = el("span", "badge", x.uid);
        uBadge.style.cssText = "font-size:11px;padding:2px 6px;margin-left:6px;background:rgba(59,130,246,0.15);color:#60a5fa";
        titleRow.appendChild(uBadge);
      }
      if(x.cls){
        var cBadge = el("span", "badge", x.cls);
        cBadge.style.cssText = "font-size:11px;padding:2px 6px;margin-left:4px;background:rgba(16,185,129,0.15);color:#34d399";
        titleRow.appendChild(cBadge);
      }
      l.appendChild(titleRow);

      l.appendChild(el("div","mute",
        rn(x.room) + " · কাজ: " + bn(x.td)+"/"+bn(x.tt) +
        " · নামাজ: " + bn(x.pr)+"/৫" + (x.st ? " · 📖 পড়ছে" : "")
      ));
      c.appendChild(l);

      var rt = el("div");
      rt.style.textAlign = "right";
      rt.appendChild(el("b", null, fm(x.today)));
      rt.appendChild(el("div","mute", "মোট: " + fm(x.tot)));
      c.appendChild(rt);

      c.onclick = function(){ detail(x.room, x.id); };
      list.appendChild(c);
    });
  }

  q.oninput = function(){ F.q=q.value; draw(); };
  f.onchange = function(){ F.f=f.value; draw(); };
  s.onchange = function(){ F.s=s.value; draw(); };
  draw();
};

// ৪. চ্যাট পর্যবেক্ষণ
V.chat = function(m){
  var allRoomIds = Array.from(new Set(Object.keys(R).concat(Object.keys(R2))));
  if(!F.room || allRoomIds.indexOf(F.room) < 0) F.room = allRoomIds[0] || "";

  var s = el("select"); s.style.width = "100%";
  allRoomIds.forEach(function(r){
    var o = el("option", null, rn(r) + " (" + r + ")"); o.value = r; s.appendChild(o);
  });
  s.value = F.room;
  s.onchange = function(){ F.room = s.value; render(); };
  m.appendChild(s);

  var c = (R2[F.room] && R2[F.room].chat) || (R[F.room] && R[F.room].chat) || {};
  var isV2 = !!(R2[F.room] && R2[F.room].chat);
  var ks = Object.keys(c).sort().slice(-60).reverse();

  if(!ks.length){ m.appendChild(el("p","mute","এই রুমে কোনো মেসেজ নেই।")); return; }

  ks.forEach(function(k){
    var x = c[k] || {};
    var d = el("div","card");
    d.appendChild(el("b", null, (x.name || x.n || x.uid || "সদস্য") + " · " + fd(x.time || x.t) + (x.e ? " (সম্পাদিত)" : "")));
    d.appendChild(el("div", null, x.text || x.x || ""));

    var row = el("div","row");
    var chatPath = isV2 ? ("rooms_v2/"+F.room+"/chat/"+k) : ("rooms/"+F.room+"/chat/"+k);
    row.appendChild(btn("✏️ এডিট", "ghost", function(){
      var b = openM();
      b.appendChild(el("h2", null, "✏️ চ্যাট মেসেজ এডিট"));
      var ta = el("textarea", "bc-textarea");
      ta.rows = 4;
      ta.value = x.text || x.x || "";
      b.appendChild(ta);
      var actRow = el("div", "row");
      actRow.style.marginTop = "14px";
      var svBtn = btn("💾 সেভ করুন", "alt", function(){
        var newTxt = ta.value.trim();
        if(!newTxt) return toast("মেসেজ খালি রাখা যাবে না!");
        var ups = {};
        if(x.x !== undefined || x.text === undefined){
          ups[chatPath + "/x"] = newTxt.slice(0, 500);
          ups[chatPath + "/e"] = 1;
        } else {
          ups[chatPath + "/text"] = newTxt.slice(0, 500);
          ups[chatPath + "/e"] = 1;
        }
        closeM();
        log("notice", F.room, "চ্যাট এডিট: " + newTxt.slice(0, 120), ups);
      });
      actRow.appendChild(svBtn);
      actRow.appendChild(btn("বাতিল", "ghost", closeM));
      b.appendChild(actRow);
      setTimeout(function(){ ta.focus(); }, 40);
    }));
    row.appendChild(btn("🗑 মুছুন", "dn", function(){
      if(!confirm("মেসেজটি মুছে ফেলতে চান?")) return;
      var u = {};
      u[chatPath] = null;
      log("chat_delete", F.room, (x.name||x.n||"")+": "+(x.text||x.x||"").slice(0,100), u);
    }));
    d.appendChild(row);
    m.appendChild(d);
  });
};

function fmtAdminRemain24h(ts){
  var rem = Math.max(0, (Number(ts) + ONE_DAY_MS) - Date.now());
  var hrs = Math.floor(rem / 3600000);
  var mins = Math.floor((rem % 3600000) / 60000);
  if(hrs > 0) return bn(hrs) + " ঘণ্টা " + bn(mins) + " মিনিট বাকি";
  return bn(Math.max(1, mins)) + " মিনিট বাকি";
}

function collectAdminSentMessages(){
  var now = Date.now();
  var items = [];
  var coveredChatPaths = {};
  var matchedLegacyKeys = {};

  function findChatPath(rId, msgKey){
    if(R2[rId] && R2[rId].chat && R2[rId].chat[msgKey]) return "rooms_v2/" + rId + "/chat/" + msgKey;
    if(R[rId] && R[rId].chat && R[rId].chat[msgKey]) return "rooms/" + rId + "/chat/" + msgKey;
    return null;
  }

  function findMatchingChatRefsByText(text, time, limitRoom){
    var refs = [];
    var roomsList = limitRoom ? [limitRoom] : Array.from(new Set(Object.keys(R).concat(Object.keys(R2))));
    roomsList.forEach(function(rId){
      var cObj = (R2[rId] && R2[rId].chat) || (R[rId] && R[rId].chat) || {};
      var base = (R2[rId] && R2[rId].chat) ? ("rooms_v2/" + rId + "/chat/") : ("rooms/" + rId + "/chat/");
      Object.keys(cObj).forEach(function(mk){
        var cm = cObj[mk];
        if(!cm || cm.u !== "admin") return;
        var p = base + mk;
        if(coveredChatPaths[p]) return;
        var cTxt = String(cm.x || cm.text || "");
        var cTime = Number(cm.t || cm.time || 0);
        if(cTxt === text && (!time || !cTime || Math.abs(cTime - Number(time)) < 180000)){
          refs.push({ path: p, roomId: rId, msgKey: mk });
        }
      });
    });
    return refs;
  }

  // ১. স্ট্রাকচার্ড অ্যাডমিন নোটিশ (admin_alerts/notices)
  var noticesObj = (ALERTS && ALERTS.notices && typeof ALERTS.notices === "object") ? ALERTS.notices : {};
  Object.keys(noticesObj).forEach(function(nk){
    var n = noticesObj[nk];
    if(!n || typeof n !== "object" || !n.text || !n.time) return;
    var activeChatRefs = [];
    if(Array.isArray(n.chatRefs)){
      n.chatRefs.forEach(function(cr){
        if(!cr || !cr.path) return;
        var exists = false;
        if(cr.roomId && cr.msgKey){
          exists = !!findChatPath(cr.roomId, cr.msgKey);
        }
        if(exists){
          activeChatRefs.push(cr);
          coveredChatPaths[cr.path] = true;
        }
      });
    }
    var legacyPath = null;
    if(n.targetType === "all"){
      if(ALERTS.global && (ALERTS.global.id === (n.id || nk) || ALERTS.global.text === n.text)){
        legacyPath = "admin_alerts/global";
        matchedLegacyKeys["global"] = true;
      }
    } else if(n.targetType === "room" && n.roomId){
      var rNode = ALERTS[n.roomId];
      if(rNode && rNode.all && (rNode.all.id === (n.id || nk) || rNode.all.text === n.text)){
        legacyPath = "admin_alerts/" + n.roomId + "/all";
        matchedLegacyKeys[n.roomId + "/all"] = true;
      }
    } else if(n.targetType === "user" && n.roomId && n.userId){
      var uNode = ALERTS[n.roomId];
      if(uNode && uNode[n.userId] && (uNode[n.userId].id === (n.id || nk) || uNode[n.userId].text === n.text)){
        legacyPath = "admin_alerts/" + n.roomId + "/" + n.userId;
        matchedLegacyKeys[n.roomId + "/" + n.userId] = true;
      }
    }
    var isActiveNotif = (now - Number(n.time) < ONE_DAY_MS);
    items.push({
      uidKey: "notice_" + nk,
      noticeKey: nk,
      id: n.id || nk,
      legacyPath: legacyPath,
      chatRefs: activeChatRefs,
      text: String(n.text),
      time: Number(n.time),
      updatedAt: n.updatedAt || null,
      targetLabel: n.targetLabel || (n.targetType === "all" ? "🌐 সকল রুম (Global)" : n.targetType === "room" ? ("🏠 রুম: " + rn(n.roomId)) : ("👤 স্টুডেন্ট: " + (n.userName || n.userId || "") + " (" + rn(n.roomId) + ")")),
      logTarget: n.targetVal || (n.roomId || "all"),
      isActiveNotif: isActiveNotif
    });
  });

  // ২. আগে থেকে থাকা লিগ্যাসি অ্যালার্ট (যেগুলো notices-এ নেই)
  if(ALERTS && ALERTS.global && ALERTS.global.text && ALERTS.global.time && !matchedLegacyKeys["global"]){
    var gAl = ALERTS.global;
    if(now - Number(gAl.time) < ONE_DAY_MS){
      var gRefs = findMatchingChatRefsByText(String(gAl.text), gAl.time, null);
      gRefs.forEach(function(cr){ coveredChatPaths[cr.path] = true; });
      items.push({
        uidKey: "legacy_global",
        noticeKey: null,
        id: gAl.id || "",
        legacyPath: "admin_alerts/global",
        chatRefs: gRefs,
        text: String(gAl.text),
        time: Number(gAl.time),
        updatedAt: gAl.updatedAt || null,
        targetLabel: "🌐 সকল রুম (Global)",
        logTarget: "all",
        isActiveNotif: true
      });
    }
  }
  Object.keys(ALERTS || {}).forEach(function(rId){
    if(rId === "notices" || rId === "global" || rId === "feedbacks") return;
    var rObj = ALERTS[rId];
    if(!rObj || typeof rObj !== "object") return;
    Object.keys(rObj).forEach(function(subK){
      if(matchedLegacyKeys[rId + "/" + subK]) return;
      var al = rObj[subK];
      if(!al || !al.text || !al.time || (now - Number(al.time) >= ONE_DAY_MS)) return;
      var mRefs = findMatchingChatRefsByText(String(al.text), al.time, rId);
      mRefs.forEach(function(cr){ coveredChatPaths[cr.path] = true; });
      var uLabel = subK === "all"
        ? ("🏠 রুম: " + rn(rId))
        : ("👤 স্টুডেন্ট (" + rn(rId) + ")");
      if(subK !== "all"){
        var uMatch = rows().filter(function(x){ return x.room === rId && x.id === subK; })[0];
        if(uMatch) uLabel = "👤 স্টুডেন্ট: " + uMatch.name + " (" + rn(rId) + ")";
      }
      items.push({
        uidKey: "legacy_" + rId + "_" + subK,
        noticeKey: null,
        id: al.id || "",
        legacyPath: "admin_alerts/" + rId + "/" + subK,
        chatRefs: mRefs,
        text: String(al.text),
        time: Number(al.time),
        updatedAt: al.updatedAt || null,
        targetLabel: uLabel,
        logTarget: subK === "all" ? ("room:" + rId) : ("user:" + rId + ":" + subK),
        isActiveNotif: true
      });
    });
  });

  // ৩. রুমের চ্যাটে থাকা অ্যাডমিন বার্তা (যেগুলো এখনো উপরে কভার হয়নি)
  var chatOnlyRaw = [];
  var allRooms = Array.from(new Set(Object.keys(R).concat(Object.keys(R2))));
  allRooms.forEach(function(rId){
    var isV2 = !!(R2[rId] && R2[rId].chat);
    var cObj = isV2 ? R2[rId].chat : ((R[rId] && R[rId].chat) || {});
    var base = isV2 ? ("rooms_v2/" + rId + "/chat/") : ("rooms/" + rId + "/chat/");
    Object.keys(cObj).forEach(function(mk){
      var cm = cObj[mk];
      if(!cm || cm.u !== "admin") return;
      var p = base + mk;
      if(coveredChatPaths[p]) return;
      var cTxt = String(cm.x || cm.text || "").trim();
      if(!cTxt) return;
      chatOnlyRaw.push({
        path: p,
        roomId: rId,
        msgKey: mk,
        text: cTxt,
        time: Number(cm.t || cm.time || 0),
        edited: !!cm.e
      });
    });
  });

  // একই সময়ে একাধিক রুমে পাঠানো ব্রডকাস্ট একসাথে গ্রুপ করা
  var groups = [];
  chatOnlyRaw.sort(function(a, b){ return b.time - a.time; }).forEach(function(cm){
    var grp = null;
    for(var i = 0; i < groups.length; i++){
      var g = groups[i];
      if(g.text === cm.text && Math.abs(g.time - cm.time) <= 10000){
        grp = g;
        break;
      }
    }
    if(grp){
      grp.chatRefs.push({ path: cm.path, roomId: cm.roomId, msgKey: cm.msgKey });
      if(grp.roomIds.indexOf(cm.roomId) < 0) grp.roomIds.push(cm.roomId);
      if(cm.edited) grp.edited = true;
    } else {
      groups.push({
        text: cm.text,
        time: cm.time,
        edited: cm.edited,
        roomIds: [cm.roomId],
        chatRefs: [{ path: cm.path, roomId: cm.roomId, msgKey: cm.msgKey }]
      });
    }
  });

  groups.forEach(function(g, idx){
    var lbl = g.roomIds.length > 1
      ? ("🌐 " + bn(g.roomIds.length) + "টি রুমে ব্রডকাস্ট")
      : ("🏠 রুম: " + rn(g.roomIds[0]));
    items.push({
      uidKey: "chatgrp_" + idx + "_" + g.time,
      noticeKey: null,
      id: "",
      legacyPath: null,
      chatRefs: g.chatRefs,
      text: g.text,
      time: g.time,
      updatedAt: g.edited ? g.time : null,
      targetLabel: lbl,
      logTarget: g.roomIds.length === 1 ? g.roomIds[0] : "all",
      isActiveNotif: false
    });
  });

  return items.sort(function(a, b){ return (b.time || 0) - (a.time || 0); });
}

function openEditAdminMessageModal(item){
  var b = openM();
  b.appendChild(el("h2", null, "✏️ অ্যাডমিন বার্তা সম্পাদনা"));
  b.appendChild(el("p", "mute", item.targetLabel + (item.isActiveNotif ? " · 🔔 নোটিফিকেশন ও চ্যাট উভয়েই আপডেট হবে" : " · 💬 চ্যাটে আপডেট হবে")));

  var ta = el("textarea", "bc-textarea");
  ta.rows = 5;
  ta.value = item.text || "";
  b.appendChild(ta);

  var errEl = el("div", null, "");
  errEl.style.cssText = "color:var(--danger);font-size:13px;min-height:1.2em;margin-top:6px";
  b.appendChild(errEl);

  var row = el("div", "row");
  row.style.marginTop = "14px";
  var saveBtn = btn("💾 আপডেট সেভ করুন", "alt", function(){
    var newTxt = ta.value.trim();
    if(!newTxt){
      errEl.textContent = "বার্তা খালি রাখা যাবে না!";
      ta.focus();
      return;
    }
    saveBtn.disabled = true;
    var now = Date.now();
    var ups = {};
    if(item.noticeKey){
      ups["admin_alerts/notices/" + item.noticeKey + "/text"] = newTxt;
      ups["admin_alerts/notices/" + item.noticeKey + "/rawText"] = newTxt;
      ups["admin_alerts/notices/" + item.noticeKey + "/updatedAt"] = now;
    }
    if(item.legacyPath){
      ups[item.legacyPath + "/text"] = newTxt;
      ups[item.legacyPath + "/updatedAt"] = now;
    }
    (item.chatRefs || []).forEach(function(cr){
      if(!cr || !cr.path) return;
      var msgObj = null;
      if(cr.roomId && cr.msgKey){
        msgObj = (R2[cr.roomId] && R2[cr.roomId].chat && R2[cr.roomId].chat[cr.msgKey]) || (R[cr.roomId] && R[cr.roomId].chat && R[cr.roomId].chat[cr.msgKey]) || null;
      }
      if(!msgObj) return;
      if(msgObj.x !== undefined || msgObj.text === undefined){
        ups[cr.path + "/x"] = newTxt.slice(0, 500);
        ups[cr.path + "/e"] = 1;
      } else {
        ups[cr.path + "/text"] = newTxt.slice(0, 500);
        ups[cr.path + "/e"] = 1;
      }
    });

    if(!Object.keys(ups).length){
      closeM();
      return toast("আপডেট করার মতো কোনো রেকর্ড পাওয়া যায়নি");
    }
    closeM();
    log("notice", item.logTarget || "all", "বার্তা এডিট: " + newTxt.slice(0, 120), ups);
  });
  row.appendChild(saveBtn);
  row.appendChild(btn("বাতিল", "ghost", closeM));
  b.appendChild(row);
  setTimeout(function(){ ta.focus(); }, 40);
}

function openRemoveAdminMessageModal(item){
  var b = openM();
  b.appendChild(el("h2", null, "🗑 বার্তাটি মুছে ফেলতে চান?"));
  b.appendChild(el("p", "mute", item.targetLabel + (item.isActiveNotif ? " — এটি নোটিফিকেশন এবং রুমের চ্যাট উভয় জায়গা থেকে পাকাপাকিভাবে মুছে যাবে।" : " — এটি রুমের চ্যাট থেকে পাকাপাকিভাবে মুছে যাবে।")));

  var preview = el("div", "bc-msg-body", item.text || "");
  preview.style.marginTop = "10px";
  b.appendChild(preview);

  var row = el("div", "row");
  row.style.marginTop = "16px";
  var delBtn = btn("🗑 হ্যাঁ, রিমুভ করুন", "dn", function(){
    delBtn.disabled = true;
    var ups = {};
    if(item.noticeKey){
      ups["admin_alerts/notices/" + item.noticeKey] = null;
    }
    if(item.legacyPath){
      ups[item.legacyPath] = null;
    }
    (item.chatRefs || []).forEach(function(cr){
      if(cr && cr.path) ups[cr.path] = null;
    });
    closeM();
    log("notice", item.logTarget || "all", "বার্তা রিমুভ: " + String(item.text || "").slice(0, 100), ups);
  });
  row.appendChild(delBtn);
  row.appendChild(btn("বাতিল", "ghost", closeM));
  b.appendChild(row);
}

function getFeedbackItems(){
  var fbObj = (ALERTS && ALERTS.feedbacks && typeof ALERTS.feedbacks === "object") ? ALERTS.feedbacks : {};
  return Object.keys(fbObj).map(function(fk){
    var x = fbObj[fk];
    if(!x || typeof x !== "object" || !x.text) return null;
    return {
      fbKey: fk,
      id: x.id || fk,
      text: String(x.text),
      roomId: x.roomId || "",
      roomName: x.roomName || (x.roomId ? rn(x.roomId) : "স্টাডি রুম"),
      userId: x.userId || "",
      userName: x.userName || "ব্যবহারকারী",
      userUid: x.userUid || "",
      time: Number(x.time || 0),
      status: x.status || "unread",
      repliedAt: x.repliedAt || null
    };
  }).filter(Boolean).sort(function(a, b){ return (b.time || 0) - (a.time || 0); });
}

function openRemoveFeedbackModal(fb){
  var b = openM();
  b.appendChild(el("h2", null, "🗑 ফিডব্যাকটি মুছে ফেলতে চান?"));
  b.appendChild(el("p", "mute", "👤 " + fb.userName + " (" + fb.roomName + ") — এটি পাকাপাকিভাবে মুছে যাবে।"));

  var preview = el("div", "bc-msg-body", fb.text || "");
  preview.style.marginTop = "10px";
  b.appendChild(preview);

  var row = el("div", "row");
  row.style.marginTop = "16px";
  var delBtn = btn("🗑 হ্যাঁ, রিমুভ করুন", "dn", function(){
    delBtn.disabled = true;
    var ups = {};
    ups["admin_alerts/feedbacks/" + fb.fbKey] = null;
    if(ALERTS && ALERTS.feedbacks) delete ALERTS.feedbacks[fb.fbKey];
    if(BROADCAST_DRAFT.replyToFeedbackId === fb.fbKey){
      BROADCAST_DRAFT.replyToFeedbackId = "";
      BROADCAST_DRAFT.replyToFeedbackUser = "";
    }
    closeM();
    log("notice", fb.roomId || "all", "ফিডব্যাক রিমুভ (" + fb.userName + "): " + String(fb.text || "").slice(0, 100), ups);
  });
  row.appendChild(delBtn);
  row.appendChild(btn("বাতিল", "ghost", closeM));
  b.appendChild(row);
}

// ৫. ওয়ান-ওয়ে বার্তা, নোটিশ পাঠান ও ইউজার ফিডব্যাক ইনবক্স
V.broadcast = function(m){
  m.appendChild(el("h2", null, "📢 ওয়ান-ওয়ে বার্তা / নোটিশ পাঠান"));
  m.appendChild(el("p", "mute", "যেকোনো একক স্টুডেন্ট, নির্দিষ্ট কোনো রুমের সদস্য অথবা সকল রুমের সবাইকে নোটিশ পাঠান। ব্যবহারকারীর নোটিফিকেশন বেল আইকনে এটি ১ দিন (২৪ ঘণ্টা) সংরক্ষিত থাকবে এবং এরপর স্বয়ংক্রিয়ভাবে মুছে যাবে।"));

  var card = el("div", "card");
  card.id = "sr_broadcast_card";

  // টার্গেট ড্রপডাউন তৈরি
  var targetSel = el("select");
  targetSel.style.width = "100%";
  targetSel.appendChild(new Option("🌐 সকল রুমের সবাইকে (Global Broadcast)", "all"));

  // রুমভিত্তিক টার্গেট
  var allRoomIds = Array.from(new Set(Object.keys(R).concat(Object.keys(R2))));
  allRoomIds.forEach(function(r){
    targetSel.appendChild(new Option("🏠 রুম: " + rn(r) + " এর সবাইকে", "room:" + r));
  });

  // ব্যক্তিভিত্তিক টার্গেট
  rows().forEach(function(u){
    targetSel.appendChild(new Option("👤 স্টুডেন্ট: " + u.name + " (" + rn(u.room) + ")", "user:" + u.room + ":" + u.id + ":" + u.name));
  });

  if(BROADCAST_DRAFT.target){
    var hasOpt = Array.prototype.some.call(targetSel.options, function(o){ return o.value === BROADCAST_DRAFT.target; });
    if(hasOpt) targetSel.value = BROADCAST_DRAFT.target;
  }
  targetSel.onchange = function(){ BROADCAST_DRAFT.target = targetSel.value; };

  var replyBanner = null;
  if(BROADCAST_DRAFT.replyToFeedbackId){
    replyBanner = el("div", "fb-reply-banner");
    replyBanner.appendChild(el("span", null, "↩️ ফিডব্যাকের উত্তর পাঠানো হচ্ছে: " + (BROADCAST_DRAFT.replyToFeedbackUser || "ব্যবহারকারী")));
    var cancelReplyBtn = btn("✕ বাতিল", "ghost", function(){
      BROADCAST_DRAFT.replyToFeedbackId = "";
      BROADCAST_DRAFT.replyToFeedbackUser = "";
      render();
    });
    cancelReplyBtn.style.cssText = "padding:3px 10px;font-size:12px";
    replyBanner.appendChild(cancelReplyBtn);
  }

  var msgArea = el("textarea", "bc-textarea");
  msgArea.id = "sr_broadcast_msg";
  msgArea.placeholder = "আপনার বার্তাটি লিখুন... (লেখার সময় পেজ অটো-রিফ্রেশ হয়ে মুছে যাবে না)";
  msgArea.rows = 4;
  msgArea.value = BROADCAST_DRAFT.text || "";
  msgArea.oninput = function(){ BROADCAST_DRAFT.text = msgArea.value; };

  // @ ট্যাগ অপশন
  var tagDiv = el("div", "row");
  tagDiv.style.marginTop = "10px";
  var chkTag = el("input");
  chkTag.type = "checkbox";
  chkTag.id = "chk_at_tag";
  chkTag.checked = BROADCAST_DRAFT.useTag !== false;
  chkTag.style.cssText = "width:18px;height:18px;cursor:pointer";
  chkTag.onchange = function(){ BROADCAST_DRAFT.useTag = chkTag.checked; };

  var tagLabel = el("label", null, " @ ইউজারনেম ট্যাগ চালু রাখো (মেসেজের শুরুতে রিসিভারের নাম বসবে)");
  tagLabel.style.cssText = "cursor:pointer;font-weight:600;display:flex;align-items:center;gap:8px";
  tagLabel.prepend(chkTag);
  tagDiv.appendChild(tagLabel);

  var sendBtn = btn("বার্তা পাঠান ➤", "alt", function(){
    var txt = msgArea.value.trim();
    if(!txt) return toast("আগে বার্তা লিখুন!");

    var targetVal = targetSel.value;
    var useTag = chkTag.checked;
    var finalMsg = txt;
    var now = Date.now();
    var noticeId = db.ref("admin_alerts/notices").push().key || ("n_" + now.toString(36) + Math.floor(Math.random()*1e3));

    sendBtn.disabled = true;
    toast("পাঠানো হচ্ছে...");

    var tasks = [];
    var chatRefs = [];
    var targetType = "all";
    var targetLabel = "🌐 সকল রুম (Global)";
    var targetRoomId = "";
    var targetUserId = "";
    var targetUserName = "";

    if(targetVal === "all"){
      if(useTag) finalMsg = "@Everyone, " + txt;
      allRoomIds.forEach(function(rId){
        var chatPath = R2[rId] ? ("rooms_v2/" + rId + "/chat") : ("rooms/" + rId + "/chat");
        var cRef = db.ref(chatPath).push();
        chatRefs.push({ path: chatPath + "/" + cRef.key, roomId: rId, msgKey: cRef.key });
        tasks.push(cRef.set({ u:"admin", n:"অ্যাডমিন নোটিশ", x:finalMsg, t:T }));
      });
      tasks.push(db.ref("admin_alerts/global").set({ id: noticeId, text:finalMsg, time:now }));
    }
    else if(targetVal.startsWith("room:")){
      var rId = targetVal.split(":")[1];
      targetType = "room";
      targetRoomId = rId;
      targetLabel = "রুম: " + rn(rId);
      if(useTag) finalMsg = "@" + rn(rId) + ", " + txt;
      var chatPath = R2[rId] ? ("rooms_v2/" + rId + "/chat") : ("rooms/" + rId + "/chat");
      var cRef = db.ref(chatPath).push();
      chatRefs.push({ path: chatPath + "/" + cRef.key, roomId: rId, msgKey: cRef.key });
      tasks.push(cRef.set({ u:"admin", n:"অ্যাডমিন নোটিশ", x:finalMsg, t:T }));
      tasks.push(db.ref("admin_alerts/" + rId + "/all").set({ id: noticeId, text:finalMsg, time:now }));
    }
    else if(targetVal.startsWith("user:")){
      var parts = targetVal.split(":");
      var rId = parts[1], uId = parts[2], uName = parts.slice(3).join(":");
      targetType = "user";
      targetRoomId = rId;
      targetUserId = uId;
      targetUserName = uName;
      targetLabel = "স্টুডেন্ট: " + uName + " (" + rn(rId) + ")";
      if(useTag) finalMsg = "@" + uName + ", " + txt;
      var chatPath = R2[rId] ? ("rooms_v2/" + rId + "/chat") : ("rooms/" + rId + "/chat");
      var cRef = db.ref(chatPath).push();
      chatRefs.push({ path: chatPath + "/" + cRef.key, roomId: rId, msgKey: cRef.key });
      tasks.push(cRef.set({ u:"admin", n:"অ্যাডমিন নোটিশ", x:finalMsg, t:T }));
      tasks.push(db.ref("admin_alerts/" + rId + "/" + uId).set({ id: noticeId, text:finalMsg, time:now }));
    }

    var noticeObj = {
      id: noticeId,
      text: finalMsg,
      rawText: txt,
      useTag: useTag,
      targetType: targetType,
      targetVal: targetVal,
      targetLabel: targetLabel,
      roomId: targetRoomId,
      userId: targetUserId,
      userName: targetUserName,
      time: now,
      expiresAt: now + ONE_DAY_MS,
      chatRefs: chatRefs
    };
    tasks.push(db.ref("admin_alerts/notices/" + noticeId).set(noticeObj));

    Promise.all(tasks).then(function(){
      sendBtn.disabled = false;
      var replyUps = {};
      if(BROADCAST_DRAFT.replyToFeedbackId){
        replyUps["admin_alerts/feedbacks/" + BROADCAST_DRAFT.replyToFeedbackId + "/status"] = "replied";
        replyUps["admin_alerts/feedbacks/" + BROADCAST_DRAFT.replyToFeedbackId + "/repliedAt"] = now;
        replyUps["admin_alerts/feedbacks/" + BROADCAST_DRAFT.replyToFeedbackId + "/replyNoticeId"] = noticeId;
        if(ALERTS && ALERTS.feedbacks && ALERTS.feedbacks[BROADCAST_DRAFT.replyToFeedbackId]){
          ALERTS.feedbacks[BROADCAST_DRAFT.replyToFeedbackId].status = "replied";
          ALERTS.feedbacks[BROADCAST_DRAFT.replyToFeedbackId].repliedAt = now;
        }
      }
      BROADCAST_DRAFT.text = "";
      BROADCAST_DRAFT.replyToFeedbackId = "";
      BROADCAST_DRAFT.replyToFeedbackUser = "";
      msgArea.value = "";
      toast("বার্তা সফলভাবে পৌঁছেছে ✓");
      log("notice", targetVal, finalMsg, replyUps);
    }).catch(function(err){
      sendBtn.disabled = false;
      toast("ব্যর্থ: " + err.message);
    });
  });
  sendBtn.style.marginTop = "14px";
  sendBtn.style.padding = "10px 24px";

  card.appendChild(el("small", "mute", "কার কাছে পাঠাতে চান:"));
  card.appendChild(targetSel);
  if(replyBanner) card.appendChild(replyBanner);
  card.appendChild(msgArea);
  card.appendChild(tagDiv);
  card.appendChild(sendBtn);
  m.appendChild(card);

  // ইউজারদের পাঠানো ফিডব্যাক ইনবক্স
  var fbItems = getFeedbackItems();
  var unreadFbCount = fbItems.filter(function(f){ return f.status === "unread"; }).length;
  var fbHeadSec = el("div", "bc-section-head");
  fbHeadSec.appendChild(el("h3", null, "💬 ইউজারদের পাঠানো ফিডব্যাকসমূহ (" + bn(fbItems.length) + ")" + (unreadFbCount > 0 ? " · 🔴 " + bn(unreadFbCount) + "টি নতুন" : "")));
  if(unreadFbCount > 0){
    var markAllBtn = btn("✓ সব পঠিত করুন", "ghost", function(){
      var now = Date.now();
      var ups = {};
      fbItems.forEach(function(f){
        if(f.status === "unread"){
          ups["admin_alerts/feedbacks/" + f.fbKey + "/status"] = "read";
          ups["admin_alerts/feedbacks/" + f.fbKey + "/readAt"] = now;
          if(ALERTS && ALERTS.feedbacks && ALERTS.feedbacks[f.fbKey]){
            ALERTS.feedbacks[f.fbKey].status = "read";
          }
        }
      });
      db.ref().update(ups).then(function(){
        toast("সকল ফিডব্যাক পঠিত হিসেবে চিহ্নিত হয়েছে ✓");
        render();
      }).catch(function(){ toast("আপডেট করা যায়নি"); });
    });
    markAllBtn.style.cssText = "padding:4px 12px;font-size:12.5px";
    fbHeadSec.appendChild(markAllBtn);
  }
  m.appendChild(fbHeadSec);

  if(!fbItems.length){
    var emptyFbCard = el("div", "card");
    emptyFbCard.appendChild(el("p", "mute", "এখনো কোনো ব্যবহারকারী ফিডব্যাক পাঠাননি। ব্যবহারকারীরা নোটিফিকেশন বক্সের '💬 Feedback' বাটনের মাধ্যমে এখানে বার্তা পাঠাতে পারবেন।"));
    m.appendChild(emptyFbCard);
  } else {
    var fbListWrap = el("div", "bc-msg-list");
    fbItems.forEach(function(fb){
      var fc = el("div", "card fb-card" + (fb.status === "unread" ? " unread" : ""));
      var top = el("div", "bc-msg-top");

      var left = el("div");
      var senderLine = "👤 " + fb.userName + (fb.userUid ? " (UID: " + fb.userUid + ")" : "") + " · 🏠 " + fb.roomName;
      left.appendChild(el("div", "bc-msg-target", senderLine));
      left.appendChild(el("div", "bc-msg-time", "পাঠানো হয়েছে: " + fd(fb.time) + (fb.repliedAt ? " · উত্তর দেওয়া হয়েছে: " + fd(fb.repliedAt) : "")));
      top.appendChild(left);

      var stCls = fb.status === "replied" ? "replied" : (fb.status === "read" ? "read" : "unread");
      var stLbl = fb.status === "replied" ? "↩️ উত্তর দেওয়া হয়েছে" : (fb.status === "read" ? "✓ দেখা হয়েছে" : "🔴 নতুন ফিডব্যাক");
      top.appendChild(el("span", "fb-status-pill " + stCls, stLbl));
      fc.appendChild(top);

      fc.appendChild(el("div", "bc-msg-body", fb.text));

      var actRow = el("div", "bc-msg-actions");
      actRow.appendChild(btn("↩️ উত্তর দিন", "alt", function(){
        var userPrefix = (fb.roomId && fb.userId && fb.userId !== "mon") ? ("user:" + fb.roomId + ":" + fb.userId + ":") : "";
        var roomOptVal = fb.roomId ? ("room:" + fb.roomId) : "";
        var matchedTarget = "all";
        var opts = Array.prototype.slice.call(targetSel.options);
        if(userPrefix){
          var uOpt = opts.filter(function(o){ return o.value.indexOf(userPrefix) === 0; })[0];
          if(uOpt) matchedTarget = uOpt.value;
          else if(roomOptVal && opts.some(function(o){ return o.value === roomOptVal; })) matchedTarget = roomOptVal;
        } else if(roomOptVal && opts.some(function(o){ return o.value === roomOptVal; })){
          matchedTarget = roomOptVal;
        }
        BROADCAST_DRAFT.target = matchedTarget;
        BROADCAST_DRAFT.replyToFeedbackId = fb.fbKey;
        BROADCAST_DRAFT.replyToFeedbackUser = fb.userName + " (" + fb.roomName + ")";
        if(fb.status === "unread"){
          if(ALERTS && ALERTS.feedbacks && ALERTS.feedbacks[fb.fbKey]){
            ALERTS.feedbacks[fb.fbKey].status = "read";
          }
          db.ref("admin_alerts/feedbacks/" + fb.fbKey).update({ status: "read", readAt: Date.now() }).catch(function(){});
        }
        render();
        setTimeout(function(){
          var bcCard = $("sr_broadcast_card");
          var bcInp = $("sr_broadcast_msg");
          if(bcCard){ try{ bcCard.scrollIntoView({ behavior: "smooth", block: "start" }); }catch(e){} }
          if(bcInp) bcInp.focus();
        }, 40);
      }));
      if(fb.status === "unread"){
        actRow.appendChild(btn("✓ পঠিত", "ghost", function(){
          if(ALERTS && ALERTS.feedbacks && ALERTS.feedbacks[fb.fbKey]){
            ALERTS.feedbacks[fb.fbKey].status = "read";
          }
          db.ref("admin_alerts/feedbacks/" + fb.fbKey).update({ status: "read", readAt: Date.now() }).then(function(){
            toast("পঠিত হিসেবে চিহ্নিত ✓");
            render();
          }).catch(function(){ toast("আপডেট করা যায়নি"); });
        }));
      }
      actRow.appendChild(btn("🗑 রিমুভ", "dn", function(){ openRemoveFeedbackModal(fb); }));
      fc.appendChild(actRow);

      fbListWrap.appendChild(fc);
    });
    m.appendChild(fbListWrap);
  }

  // পাঠানো সকল বার্তা ও নোটিশ তালিকা (Edit & Remove)
  var sentItems = collectAdminSentMessages();
  var headSec = el("div", "bc-section-head");
  headSec.appendChild(el("h3", null, "📨 পাঠানো সকল অ্যাডমিন বার্তা ও নোটিশ (" + bn(sentItems.length) + ")"));
  headSec.appendChild(el("small", "mute", "এডিট বা রিমুভ করলে ব্যবহারকারীর নোটিফিকেশন ও রুমের চ্যাট থেকে সাথে সাথে আপডেট/মুছে যাবে"));
  m.appendChild(headSec);

  if(!sentItems.length){
    var emptyCard = el("div", "card");
    emptyCard.appendChild(el("p", "mute", "এখনো অ্যাডমিন থেকে কোনো বার্তা পাঠানো হয়নি।"));
    m.appendChild(emptyCard);
    return;
  }

  var listWrap = el("div", "bc-msg-list");
  sentItems.forEach(function(item){
    var ic = el("div", "card bc-msg-card");
    var top = el("div", "bc-msg-top");

    var left = el("div");
    left.appendChild(el("div", "bc-msg-target", item.targetLabel));
    left.appendChild(el("div", "bc-msg-time", "পাঠানো হয়েছে: " + fd(item.time) + (item.updatedAt ? " · সম্পাদিত" : "")));
    top.appendChild(left);

    var pill = el("span", "bc-status-pill" + (item.isActiveNotif ? "" : " chat-only"),
      item.isActiveNotif ? ("🔔 নোটিফিকেশনে সক্রিয় (" + fmtAdminRemain24h(item.time) + ")") : "💬 চ্যাটে সংরক্ষিত"
    );
    top.appendChild(pill);
    ic.appendChild(top);

    ic.appendChild(el("div", "bc-msg-body", item.text));

    var actRow = el("div", "bc-msg-actions");
    actRow.appendChild(btn("✏️ এডিট", "ghost", function(){ openEditAdminMessageModal(item); }));
    actRow.appendChild(btn("🗑 রিমুভ", "dn", function(){ openRemoveAdminMessageModal(item); }));
    ic.appendChild(actRow);

    listWrap.appendChild(ic);
  });
  m.appendChild(listWrap);
};

// ৬. রুম ও ক্লাস অনুমোদন
var activeApprovalTab = "rooms";

V.approvals = function(m){
  m.appendChild(el("h2", null, "অনুমোদন ব্যবস্থাপনা"));

  var tabs = el("div", "row");
  tabs.style.margin = "12px 0 16px";
  
  var bRooms = btn("🏠 রুম অনুমোদন", activeApprovalTab === "rooms" ? "alt" : "ghost", function(){
    activeApprovalTab = "rooms";
    render();
  });
  var bClass = btn("🎓 ক্লাস পরিবর্তনের আবেদন", activeApprovalTab === "class_requests" ? "alt" : "ghost", function(){
    activeApprovalTab = "class_requests";
    render();
  });
  tabs.appendChild(bRooms);
  tabs.appendChild(bClass);
  m.appendChild(tabs);

  if(activeApprovalTab === "class_requests"){
    var reqCard = el("div", "card");
    reqCard.innerHTML = "<h3>🎓 শিক্ষার্থীদের ক্লাস পরিবর্তনের আবেদনসমূহ</h3><div id='class_req_list'>লোড হচ্ছে...</div>";
    m.appendChild(reqCard);

    db.ref("class_change_requests").once("value").then(function(snap){
      var cont = document.getElementById("class_req_list");
      if(!cont) return;
      cont.textContent = "";

      var data = snap.val();
      if(!data){
        cont.innerHTML = "<p class='mute'>বর্তমানে কোনো ক্লাস পরিবর্তনের আবেদন জমা নেই।</p>";
        return;
      }

      var keys = Object.keys(data).reverse();
      keys.forEach(function(k){
        var r = data[k];
        var item = el("div", "ses");
        item.style.cssText = "padding:14px;border-radius:12px;margin-bottom:10px;background:var(--bg);border:1px solid var(--line);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px";

        var left = el("div");
        var safeRoom = r.roomName || rn(r.room) || "স্টাডি রুম";
        var isPending = (!r.status || r.status === "pending");

        left.innerHTML = `
          <div>
            <strong style="font-size:16px;color:var(--ink)">${escHtml(r.name || "শিক্ষার্থী")}</strong>
            <span style="font-size:12px;color:var(--mute);margin-left:6px">(${escHtml(r.uid || "UID")}) · রুম: ${escHtml(safeRoom)}</span>
          </div>
          <div style="margin-top:6px;font-size:13.5px">
            বর্তমান ক্লাস: <span class="badge s">${escHtml(r.oldClass || r.currentClass || "--")}</span> ➔ 
            আবেদনকৃত ক্লাস: <span class="badge" style="background:var(--as);color:var(--a);font-weight:700">${escHtml(r.requestedClass || "--")}</span>
          </div>
          <small class="mute" style="display:block;margin-top:4px">আবেদনের সময়: ${fd(r.requestedAt || r.createdAt)} · স্ট্যাটাস: <strong style="color:${isPending ? '#eab308' : r.status==='approved' ? '#10b981' : '#ef4444'}">${isPending ? 'অপেক্ষমাণ' : r.status==='approved' ? 'অনুমোদিত' : 'বাতিল'}</strong></small>
        `;
        item.appendChild(left);

        var actions = el("div", "row");
        actions.style.margin = "0";

        if(isPending){
          var approveBtn = btn("✅ অনুমোদন", "alt", function(){
            var upd = {};
            upd["class_change_requests/" + k + "/status"] = "approved";
            upd["class_change_requests/" + k + "/reviewedAt"] = T;

            var reqCls = String(r.requestedClass || "HSC");
            var reqLow = reqCls.toLowerCase();
            var isBcsReq = reqLow.indexOf("bcs") > -1 || reqLow.indexOf("job") > -1 || reqLow.indexOf("graduate") > -1 || reqLow.indexOf("bachelor") > -1 || reqLow.indexOf("honours") > -1 || reqLow.indexOf("hons") > -1 || reqLow.indexOf("masters") > -1 || reqLow.indexOf("degree") > -1 || reqLow.indexOf("বিসিএস") > -1 || reqLow.indexOf("চাকরি") > -1 || reqLow.indexOf("চাকুরী") > -1 || reqLow.indexOf("অনার্স") > -1 || reqLow.indexOf("স্নাতক") > -1 || reqLow.indexOf("মাস্টার্স") > -1;
            var baseCls = isBcsReq ? "BCS" : reqLow.indexOf("ssc") > -1 ? "SSC" : reqLow.indexOf("admission") > -1 ? "Admission" : "HSC";
            if(r.room && r.memberId){
              if(r.room === "1432014310"){
                upd["rooms/1432014310/" + r.memberId + "/cls"] = reqCls;
                upd["rooms/1432014310/" + r.memberId + "/classBase"] = baseCls;
                if(r.passingYear) upd["rooms/1432014310/" + r.memberId + "/passingYear"] = String(r.passingYear);
              } else {
                upd["rooms_v2/" + r.room + "/members/" + r.memberId + "/cls"] = reqCls;
                upd["rooms_v2/" + r.room + "/members/" + r.memberId + "/classBase"] = baseCls;
                upd["rooms_v2/" + r.room + "/" + r.memberId + "/cls"] = reqCls;
                upd["rooms_v2/" + r.room + "/" + r.memberId + "/classBase"] = baseCls;
                if(r.passingYear){
                  upd["rooms_v2/" + r.room + "/members/" + r.memberId + "/passingYear"] = String(r.passingYear);
                  upd["rooms_v2/" + r.room + "/" + r.memberId + "/passingYear"] = String(r.passingYear);
                }
              }
              if(r.room === "1432014310" || r.memberId === "p1" || r.memberId === "p2"){
                upd["vip_users/" + r.memberId + "/cls"] = reqCls;
                upd["vip_users/" + r.memberId + "/classBase"] = baseCls;
                upd["rooms/1432014310/" + r.memberId + "/cls"] = reqCls;
                upd["rooms/1432014310/" + r.memberId + "/classBase"] = baseCls;
                if(r.passingYear){
                  upd["vip_users/" + r.memberId + "/passingYear"] = String(r.passingYear);
                  upd["rooms/1432014310/" + r.memberId + "/passingYear"] = String(r.passingYear);
                }
              }
            }

            db.ref().update(upd).then(function(){
              toast("ক্লাস পরিবর্তনের আবেদন অনুমোদিত হয়েছে ✓");
              render();
            });
          });
          approveBtn.style.padding = "4px 12px";
          actions.appendChild(approveBtn);

          var rejectBtn = btn("❌ বাতিল", "ghost", function(){
            db.ref("class_change_requests/" + k + "/status").set("rejected").then(function(){
              toast("আবেদন বাতিল করা হয়েছে");
              render();
            });
          });
          rejectBtn.style.padding = "4px 12px";
          actions.appendChild(rejectBtn);
        }

        var delReqBtn = btn("🗑 মুছুন", "dn", function(){
          if(!confirm("এই আবেদন রেকর্ডটি মুছে ফেলতে চান?")) return;
          db.ref("class_change_requests/" + k).remove().then(function(){
            toast("আবেদন রেকর্ড মুছে ফেলা হয়েছে ✓");
            render();
          });
        });
        delReqBtn.style.padding = "4px 10px";
        actions.appendChild(delReqBtn);

        item.appendChild(actions);
        cont.appendChild(item);
      });
    }).catch(function(){
      var cont = document.getElementById("class_req_list");
      if(cont) cont.innerHTML = "<p class='mute'>আবেদন তালিকা লোড করা যায়নি।</p>";
    });

    return;
  }

  var v2Rooms = Object.keys(R2);

  if(!v2Rooms.length){ m.appendChild(el("p","mute","কোনো নতুন রুম পাওয়া যায়নি।")); return; }

  var bar = el("div", "row bar");
  var qInp = el("input");
  qInp.placeholder = "🔍 রুমের নাম, কোড বা নির্মাতা খুঁজুন...";
  qInp.value = AF.q;
  qInp.style.flex = "2";

  var stSel = el("select");
  [
    ["all", "সব রুম"],
    ["pending", "ট্রায়াল / মেয়াদ শেষ"],
    ["approved", "অনুমোদিত"],
    ["expired", "মেয়াদ শেষ"]
  ].forEach(function(a){
    var o = el("option", null, a[1]); o.value = a[0]; stSel.appendChild(o);
  });
  stSel.value = AF.status;

  var sortSel = el("select");
  [
    ["recent", "নতুন আগে (Recent → পুরোনো)"],
    ["oldest", "পুরোনো আগে (পুরোনো → নতুন)"],
    ["az", "নাম (A → Z)"],
    ["za", "নাম (Z → A)"]
  ].forEach(function(a){
    var o = el("option", null, a[1]); o.value = a[0]; sortSel.appendChild(o);
  });
  sortSel.value = AF.sort;

  bar.appendChild(qInp);
  bar.appendChild(stSel);
  bar.appendChild(sortSel);
  m.appendChild(bar);

  var list = el("div");
  m.appendChild(list);

  function drawApprovals(){
    list.textContent = "";
    var t = AF.q.trim().toLowerCase();
    var filtered = v2Rooms.filter(function(cId){
      var rm = R2[cId] || {}, meta = rm.meta || {}, mems = rm.members || {};
      var memKeys = Object.keys(mems);
      var creator = mems[memKeys[0]] || {};
      var curExp = meta.expiresAt || meta.trialEnds || 0;
      var isExpired = curExp && (Date.now() > curExp);
      var isApproved = (meta.status === "approved" && !isExpired);

      if(AF.status === "approved" && !isApproved) return false;
      if(AF.status === "expired" && !isExpired) return false;
      if(AF.status === "pending" && isApproved) return false;

      if(!t) return true;
      var hay = (String(meta.name || "") + " " + cId + " " + String(creator.name || "") + " " + String(creator.mobile || "")).toLowerCase();
      return hay.indexOf(t) > -1;
    });

    var sorted = sortRoomIds(filtered, AF.sort);
    if(!sorted.length){
      list.appendChild(el("p","mute","ফিল্টার অনুযায়ী কোনো রুম পাওয়া যায়নি।"));
      return;
    }

    sorted.forEach(function(cId){
      var rm = R2[cId] || {}, meta = rm.meta || {}, mems = rm.members || {};
      var memKeys = Object.keys(mems);
      var creator = mems[memKeys[0]] || {};
      var curExp = meta.expiresAt || meta.trialEnds || 0;
      var isExpired = curExp && (Date.now() > curExp);
      var isApproved = (meta.status === "approved" && !isExpired);
      var createdTs = getRoomCreatedAt(cId);

      var maxMem = parseInt(meta.max || (M[cId] && M[cId].max) || 8, 10) || 8;
      var card = el("div","card");
      card.innerHTML = `
        <div class="sw">
          <div>
            <b style="font-size:18px">${escHtml(meta.name || cId)}</b> (কোড: ${escHtml(cId)})
            <div class="mute" style="margin-top:4px">তৈরি করেছে: <b>${escHtml(creator.name || 'সদস্য')}</b> ${creator.mobile ? '('+escHtml(creator.mobile)+')' : ''}</div>
            <small class="mute">তৈরির সময়: ${fd(createdTs)} · সদস্য: ${bn(memKeys.length)}/${bn(maxMem)} জন</small>
          </div>
          <div>
            <span class="badge ${isApproved ? '' : (meta.status === 'suspended' || meta.status === 'blocked' || isExpired) ? 'x' : 's'}">
              ${isApproved ? 'অনুমোদিত' : (meta.status === 'suspended' || meta.status === 'blocked') ? (ST[meta.status] || 'বন্ধ') : isExpired ? 'মেয়াদ শেষ' : '৩ দিনের ট্রায়াল'}
            </span>
          </div>
        </div>
        <div style="margin-top:10px;font-size:14px;color:var(--mute)">
          বর্তমান মেয়াদ: <b>${curExp ? fd(curExp) : 'সেট করা নেই'}</b> ${isExpired ? '<span style="color:var(--danger)"> (মেয়াদোত্তীর্ণ)</span>' : ''}
        </div>
      `;

      var row = el("div","row");
      row.style.marginTop = "14px";
      row.appendChild(btn("⚡ + ৩০ দিন অনুমোদন দিন", "alt", function(){
        var newDate = Date.now() + (30 * 864e5);
        var u = {};
        u["rooms_v2/"+cId+"/meta/status"] = "approved";
        u["rooms_v2/"+cId+"/meta/expiresAt"] = newDate;
        u["room_meta/"+cId+"/name"] = meta.name || cId;
        u["room_meta/"+cId+"/status"] = "approved";
        u["room_meta/"+cId+"/expiresAt"] = newDate;
        u["room_meta/"+cId+"/updatedAt"] = T;
        log("room_edit", cId, "৩০ দিন অনুমোদন", u);
      }));

      row.appendChild(btn("+ ৬০ দিন", "ghost", function(){
        var newDate = Date.now() + (60 * 864e5);
        var u = {};
        u["rooms_v2/"+cId+"/meta/status"] = "approved";
        u["rooms_v2/"+cId+"/meta/expiresAt"] = newDate;
        u["room_meta/"+cId+"/name"] = meta.name || cId;
        u["room_meta/"+cId+"/status"] = "approved";
        u["room_meta/"+cId+"/expiresAt"] = newDate;
        u["room_meta/"+cId+"/updatedAt"] = T;
        log("room_edit", cId, "৬০ দিন অনুমোদন", u);
      }));

      row.appendChild(btn("✏️ কাস্টম তারিখ / স্ট্যাটাস", "ghost", function(){ metaM(cId); }));
      card.appendChild(row);
      list.appendChild(card);
    });
  }

  qInp.oninput = function(){ AF.q = qInp.value; drawApprovals(); };
  stSel.onchange = function(){ AF.status = stSel.value; drawApprovals(); };
  sortSel.onchange = function(){ AF.sort = sortSel.value; drawApprovals(); };
  drawApprovals();
};

// ৭. অডিট লগ
V.log = function(m){
  m.appendChild(el("h2", null, "সিস্টেম অডিট লগ"));
  var ks = Object.keys(L).sort(function(a,b){ return L[b].at - L[a].at; });
  if(!ks.length){ m.appendChild(el("p","mute","কোনো লগ হিস্টোরি নেই।")); return; }

  ks.forEach(function(k){
    var l = L[k] || {};
    var isVipLog = (l.targetUid === VIP) || (l.targetUid === "1432014310") || (l.targetName && l.targetName.indexOf("Queen Room") > -1);
    
    var c = el("div","card");
    var topRow = el("div","sw");
    topRow.appendChild(el("b", null, (AN[l.action] || l.action) + (l.targetName ? " — " + l.targetName : "")));
    
    if(isVipLog){
      topRow.appendChild(el("span","badge s","🔒 VIP স্থায়ী রেকর্ড"));
    } else {
      var delBtn = btn("🗑 মুছুন", "dn", function(){ deleteSingleLog(k, l); });
      delBtn.style.cssText = "padding:3px 10px;font-size:12px;border-radius:8px";
      topRow.appendChild(delBtn);
    }
    c.appendChild(topRow);
    c.appendChild(el("div","mute", fd(l.at) + (l.by ? " · দ্বারা: " + l.by : "")));
    if(l.details) c.appendChild(el("div", null, l.details));
    m.appendChild(c);
  });
};

// ৮. লগ-এর নিচে "💬 অনুপ্রেরণা" কন্ট্রোল (৪ ক্যাটাগরি, ১টি করে মোছা ও বাল্ক পেস্ট অ্যাড)
V.motivation = function(m){
  m.appendChild(el("h2", null, "💬 অনুপ্রেরণা / মোটিভেশন নিয়ন্ত্রণ"));
  m.appendChild(el("p", "mute", "যেকোনো লক্ষ্য নির্বাচন করে তার উক্তিগুলো দেখুন, ডিলিট করুন অথবা একসাথে অনেকগুলো উক্তি পেস্ট করে যোগ করুন।"));

  // ৪টি ক্যাটাগরি বাটন
  var catTabs = el("div", "row");
  catTabs.style.margin = "12px 0";
  [
    { id: "Medical", label: "🩺 Medical" },
    { id: "Engineering", label: "⚙️ Engineering" },
    { id: "Varsity", label: "🏛️ Varsity" },
    { id: "Other", label: "🎯 Other" }
  ].forEach(function(c){
    var b = btn(c.label, activeMotCat === c.id ? "alt" : "ghost", function(){
      activeMotCat = c.id;
      render();
    });
    b.style.padding = "8px 18px";
    catTabs.appendChild(b);
  });
  m.appendChild(catTabs);

  // একসাথে অনেক উক্তি যোগ করার বক্স (Bulk Add)
  var addCard = el("div", "card");
  addCard.appendChild(el("h3", null, "➕ " + activeMotCat + " ক্যাটাগরিতে নতুন উক্তি যোগ করো"));
  var bulkArea = el("textarea");
  bulkArea.placeholder = "এখানে এক বা একাধিক উক্তি পেস্ট করুন। প্রতি লাইনে একটি করে উক্তি রাখবেন...";
  bulkArea.rows = 4;
  bulkArea.style.cssText = "width:100%;margin-top:8px;padding:12px;border-radius:12px;border:1.5px solid var(--line);font:inherit;background:var(--card);color:var(--ink)";
  addCard.appendChild(bulkArea);

  var addBtn = btn("➕ একসাথে সব যোগ করো", null, function(){
    var txt = bulkArea.value.trim();
    if(!txt) return toast("আগে উক্তি লিখুন বা পেস্ট করুন!");
    var lines = txt.split("\n").map(function(s){ return s.trim(); }).filter(function(s){ return s.length > 2; });
    if(!lines.length) return toast("সঠিক উক্তি পাওয়া যায়নি!");

    addBtn.disabled = true;
    var updates = {};
    lines.forEach(function(line){
      var newKey = db.ref("motivational_quotes/" + activeMotCat).push().key;
      updates["motivational_quotes/" + activeMotCat + "/" + newKey] = line;
    });

    db.ref().update(updates).then(function(){
      addBtn.disabled = false;
      bulkArea.value = "";
      toast(lines.length + "টি উক্তি সফলভাবে যোগ হয়েছে ✓");
      render();
    }).catch(function(err){
      addBtn.disabled = false;
      toast("ব্যর্থ: " + err.message);
    });
  });
  addBtn.style.marginTop = "10px";
  addCard.appendChild(addBtn);
  m.appendChild(addCard);

  // বিদ্যমান উক্তিগুলোর তালিকা
  var listCard = el("div", "card");
  listCard.innerHTML = `<h3>📋 ${activeMotCat} এর বর্তমান সকল উক্তি</h3><div id="mot_list">লোড হচ্ছে...</div>`;
  m.appendChild(listCard);

  db.ref("motivational_quotes/" + activeMotCat).once("value").then(function(snap){
    var cont = document.getElementById("mot_list");
    if(!cont) return;
    cont.textContent = "";

    if(!snap.exists()){
      cont.innerHTML = "<p class='mute'>এই ক্যাটাগরিতে এখনো কাস্টম উক্তি নেই। উপরের বক্সে পেস্ট করে যোগ করুন।</p>";
      return;
    }

    var quotesObj = snap.val() || {};
    var qKeys = Object.keys(quotesObj).reverse();
    cont.appendChild(el("p", "mute", "মোট উক্তি: " + bn(qKeys.length) + " টি"));

    qKeys.forEach(function(k, idx){
      var qText = quotesObj[k];
      var r = el("div", "ses");
      r.style.cssText = "display:flex;justify-content:space-between;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--line)";
      
      var txtSpan = el("span", null, bn(idx+1) + ". " + qText);
      txtSpan.style.cssText = "flex:1;font-size:15px;line-height:1.5";
      r.appendChild(txtSpan);

      var actionBox = el("div", "row");
      actionBox.style.margin = "0";

      // উক্তি এডিট বাটন
      var editB = btn("✏️", "ghost", function(){
        var newText = prompt("উক্তিটি এডিট করুন:", qText);
        if(!newText || newText.trim() === qText) return;
        db.ref("motivational_quotes/" + activeMotCat + "/" + k).set(newText.trim()).then(function(){
          toast("উক্তি আপডেট হয়েছে ✓");
          render();
        });
      });
      editB.style.cssText = "padding:4px 8px;font-size:13px;border-radius:8px;margin-right:4px";
      actionBox.appendChild(editB);

      // ১টি করে ডিলিট করার বাটন
      var delB = btn("🗑", "dn", function(){
        if(!confirm("এই উক্তিটি মুছে ফেলতে চান?")) return;
        db.ref("motivational_quotes/" + activeMotCat + "/" + k).remove().then(function(){
          toast("উক্তিটি মুছে ফেলা হয়েছে ✓");
          render();
        });
      });
      delB.style.cssText = "padding:4px 8px;font-size:13px;border-radius:8px";
      actionBox.appendChild(delB);
      r.appendChild(actionBox);
      cont.appendChild(r);
    });
  });
};

/* ---------- ৯. ডায়নামিক এক্সাম ম্যানেজমেন্ট সিস্টেম ---------- */
var activeExamTab = "qbank";
var activeExamCategory = "HSC";
var selectedSubId = null;
var selectedChapId = null;

function getDefaultSubs() {
  if (activeExamCategory === "SSC") {
    return [
      { id: "ssc_phy", category: "SSC", titleBn: "পদার্থবিজ্ঞান (SSC)", titleEn: "Physics", chapters: [{ id: "ssc_phy_ch1", num: 1, name: "ভৌত রাশি ও পরিমাপ" }, { id: "ssc_phy_ch2", num: 2, name: "গতি" }] },
      { id: "ssc_chem", category: "SSC", titleBn: "রসায়ন (SSC)", titleEn: "Chemistry", chapters: [{ id: "ssc_chem_ch1", num: 1, name: "পদার্থের অবস্থা" }, { id: "ssc_chem_ch2", num: 2, name: "পদার্থের গঠন" }] },
      { id: "ssc_bio", category: "SSC", titleBn: "জীববিজ্ঞান (SSC)", titleEn: "Biology", chapters: [{ id: "ssc_bio_ch1", num: 1, name: "জীবন পাঠ" }, { id: "ssc_bio_ch2", num: 2, name: "জীবকোষ ও টিস্যু" }] },
      { id: "ssc_math", category: "SSC", titleBn: "সাধারণ গণিত (SSC)", titleEn: "General Math", chapters: [{ id: "ssc_math_ch1", num: 1, name: "বাস্তব সংখ্যা" }, { id: "ssc_math_ch2", num: 2, name: "সেট ও ফাংশন" }] }
    ];
  } else if (activeExamCategory === "Admission") {
    return [
      { id: "adm_med_bio", category: "Admission", titleBn: "মেডিকেল জীববিজ্ঞান", titleEn: "Medical Biology", chapters: [{ id: "adm_bio_ch1", num: 1, name: "কোষ ও বংশগতি" }, { id: "adm_bio_ch2", num: 2, name: "মানব শারীরতত্ত্ব" }] },
      { id: "adm_med_chem", category: "Admission", titleBn: "মেডিকেল ও ভার্সিটি রসায়ন", titleEn: "Admission Chemistry", chapters: [{ id: "adm_chem_ch1", num: 1, name: "গুণগত ও জৈব রসায়ন" }] },
      { id: "adm_eng_phy", category: "Admission", titleBn: "ইঞ্জিনিয়ারিং পদার্থবিজ্ঞান", titleEn: "Engineering Physics", chapters: [{ id: "adm_phy_ch1", num: 1, name: "বলবিদ্যা ও গতিবিদ্যা" }] },
      { id: "adm_eng_math", category: "Admission", titleBn: "ইঞ্জিনিয়ারিং উচ্চতর গণিত", titleEn: "Engineering Math", chapters: [{ id: "adm_math_ch1", num: 1, name: "ক্যালকুলাস ও কনিক্স" }] },
      { id: "adm_gk_eng", category: "Admission", titleBn: "জিকে ও ইংরেজি (ভর্তি)", titleEn: "GK & English", chapters: [{ id: "adm_gk_ch1", num: 1, name: "সাধারণ জ্ঞান বাংলাদেশ ও বিশ্ব" }] }
    ];
  } else if (activeExamCategory === "BCS") {
    return [
      { id: "bcs_bangla", category: "BCS", titleBn: "বাংলা ভাষা ও সাহিত্য (BCS)", titleEn: "Bangla Language & Literature", chapters: [{ id: "bcs_ban_ch1", num: 1, name: "প্রাচীন ও মধ্যযুগ" }, { id: "bcs_ban_ch2", num: 2, name: "আধুনিক যুগ" }, { id: "bcs_ban_ch3", num: 3, name: "বাংলা ব্যাকরণ ও ভাষা" }] },
      { id: "bcs_english", category: "BCS", titleBn: "ইংরেজি ভাষা ও সাহিত্য (BCS)", titleEn: "English Language & Literature", chapters: [{ id: "bcs_eng_ch1", num: 1, name: "English Grammar & Parts of Speech" }, { id: "bcs_eng_ch2", num: 2, name: "Vocabulary, Idioms & Correction" }, { id: "bcs_eng_ch3", num: 3, name: "English Literature" }] },
      { id: "bcs_bd", category: "BCS", titleBn: "বাংলাদেশ বিষয়াবলি (BCS)", titleEn: "Bangladesh Affairs", chapters: [{ id: "bcs_bd_ch1", num: 1, name: "বাংলার ইতিহাস ও মুক্তিযুদ্ধ" }, { id: "bcs_bd_ch2", num: 2, name: "সংবিধান, অর্থনীতি ও শাসনব্যবস্থা" }, { id: "bcs_bd_ch3", num: 3, name: "ভূগোল ও সাম্প্রতিক বাংলাদেশ" }] },
      { id: "bcs_intl", category: "BCS", titleBn: "আন্তর্জাতিক বিষয়াবলি (BCS)", titleEn: "International Affairs", chapters: [{ id: "bcs_intl_ch1", num: 1, name: "বৈশ্বিক ইতিহাস ও ভূ-রাজনীতি" }, { id: "bcs_intl_ch2", num: 2, name: "আন্তর্জাতিক সংস্থা ও চুক্তি" }, { id: "bcs_intl_ch3", num: 3, name: "সাম্প্রতিক বিশ্ব ও পরিবেশ" }] },
      { id: "bcs_math", category: "BCS", titleBn: "গাণিতিক যুক্তি ও মানসিক দক্ষতা", titleEn: "Math & Mental Ability", chapters: [{ id: "bcs_math_ch1", num: 1, name: "পাটিগণিত ও শতকরা-লাভক্ষতি" }, { id: "bcs_math_ch2", num: 2, name: "বীজগণিত ও জ্যামিতি" }, { id: "bcs_math_ch3", num: 3, name: "মানসিক দক্ষতা ও বিশ্লেষণ" }] },
      { id: "bcs_sci_ict", category: "BCS", titleBn: "সাধারণ বিজ্ঞান, কম্পিউটার ও নৈতিকতা", titleEn: "General Science, ICT & Ethics", chapters: [{ id: "bcs_sci_ch1", num: 1, name: "দৈনন্দিন ও ভৌত-জীববিজ্ঞান" }, { id: "bcs_sci_ch2", num: 2, name: "কম্পিউটার ও তথ্যপ্রযুক্তি" }, { id: "bcs_sci_ch3", num: 3, name: "নৈতিকতা, মূল্যবোধ ও সুশাসন" }] }
    ];
  }
  return [
    { id: "phy1", category: "HSC", titleBn: "পদার্থবিজ্ঞান ১ম", titleEn: "Physics 1st Paper", chapters: [{ id: "phy1_ch1", num: 1, name: "ভৌত জগৎ ও পরিমাপ" }, { id: "phy1_ch2", num: 2, name: "ভেক্টর" }, { id: "phy1_ch3", num: 3, name: "গতিবিদ্যা" }, { id: "phy1_ch4", num: 4, name: "নিউটনীয় বলবিদ্যা" }] },
    { id: "phy2", category: "HSC", titleBn: "পদার্থবিজ্ঞান ২য়", titleEn: "Physics 2nd Paper", chapters: [{ id: "phy2_ch1", num: 1, name: "তাপগতিবিদ্যা" }, { id: "phy2_ch2", num: 2, name: "স্থির তড়িৎ" }, { id: "phy2_ch3", num: 3, name: "চল তড়িৎ" }] },
    { id: "chem1", category: "HSC", titleBn: "রসায়ন ১ম", titleEn: "Chemistry 1st Paper", chapters: [{ id: "chem1_ch1", num: 1, name: "ল্যাবরেটরির নিরাপদ ব্যবহার" }, { id: "chem1_ch2", num: 2, name: "গুণগত রসায়ন" }, { id: "chem1_ch3", num: 3, name: "পর্যায়বৃত্ত ধর্ম" }] },
    { id: "chem2", category: "HSC", titleBn: "রসায়ন ২য়", titleEn: "Chemistry 2nd Paper", chapters: [{ id: "chem2_ch1", num: 1, name: "পরিবেশ রসায়ন" }, { id: "chem2_ch2", num: 2, name: "জৈব রসায়ন" }, { id: "chem2_ch3", num: 3, name: "পরিমাণগত রসায়ন" }, { id: "chem2_ch4", num: 4, name: "তড়িৎ রসায়ন" }] },
    { id: "math1", category: "HSC", titleBn: "উচ্চতর গণিত ১ম", titleEn: "Higher Math 1st Paper", chapters: [{ id: "math1_ch1", num: 1, name: "ম্যাট্রিক্স ও নির্ণায়ক" }, { id: "math1_ch3", num: 3, name: "সরলরেখা" }, { id: "math1_ch4", num: 4, name: "বৃত্ত" }] },
    { id: "math2", category: "HSC", titleBn: "উচ্চতর গণিত ২য়", titleEn: "Higher Math 2nd Paper", chapters: [{ id: "math2_ch1", num: 1, name: "বাস্তব সংখ্যা" }, { id: "math2_ch3", num: 3, name: "জটিল সংখ্যা" }, { id: "math2_ch6", num: 6, name: "কনিক্স" }] },
    { id: "bio1", category: "HSC", titleBn: "জীববিজ্ঞান ১ম", titleEn: "Biology 1st Paper", chapters: [{ id: "bio1_ch1", num: 1, name: "কোষ ও এর গঠন" }, { id: "bio1_ch2", num: 2, name: "কোষ বিভাজন" }] },
    { id: "bio2", category: "HSC", titleBn: "জীববিজ্ঞান ২য়", titleEn: "Biology 2nd Paper", chapters: [{ id: "bio2_ch1", num: 1, name: "প্রাণীর বিভিন্নতা" }, { id: "bio2_ch4", num: 4, name: "রক্ত ও সংবহন" }] },
    { id: "eng", category: "HSC", titleBn: "ইংরেজি", titleEn: "English", chapters: [{ id: "eng_ch1", num: 1, name: "Parts of Speech" }, { id: "eng_ch2", num: 2, name: "Right Form of Verbs" }] },
    { id: "gk", category: "HSC", titleBn: "সাধারণ জ্ঞান", titleEn: "General Knowledge", chapters: [{ id: "gk_ch1", num: 1, name: "প্রাচীন বাংলা" }, { id: "gk_ch2", num: 2, name: "মুক্তিযুদ্ধ ও সেক্টর" }] },
    { id: "ict", category: "HSC", titleBn: "তথ্য ও যোগাযোগ প্রযুক্তি", titleEn: "ICT", chapters: [{ id: "ict_ch1", num: 1, name: "বিশ্ব ও বাংলাদেশ প্রেক্ষিত" }, { id: "ict_ch2", num: 2, name: "কমিউনিকেশন সিস্টেমস" }] },
    { id: "bangla1", category: "HSC", titleBn: "বাংলা ১ম", titleEn: "Bangla 1st Paper", chapters: [{ id: "ban1_ch1", num: 1, name: "অপরিচিতা" }, { id: "ban1_ch2", num: 2, name: "বিলাসী" }] },
    { id: "bangla2", category: "HSC", titleBn: "বাংলা ২য়", titleEn: "Bangla 2nd Paper", chapters: [{ id: "ban2_ch1", num: 1, name: "উচ্চারণের নিয়ম" }, { id: "ban2_ch2", num: 2, name: "বানানের নিয়ম" }] }
  ];
}

// চ্যাপ্টার টেস্ট / এক্সাম সেট তৈরি ও এডিটের আধুনিক মডাল (Image 3 অনুযায়ী হুবহু ডিজাইন)
function openTestSetEditorModal(ch, existingSet, onSaved, initialTab, parentSub) {
  cleanupLingeringBackdrops();
  var overlay = el("div", "admin-modal-backdrop");
  overlay.setAttribute("data-admin-overlay", "true");
  overlay.style.cssText = "position:fixed;inset:0;background:rgba(15,23,42,0.85);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:100005;padding:16px;box-sizing:border-box";

  var modal = el("div", "card admin-modal-dialog");
  modal.onclick = function(e){ e.stopPropagation(); };
  modal.onmousedown = function(e){ e.stopPropagation(); };
  modal.style.cssText = "width:100%;max-width:620px;max-height:92vh;overflow-y:auto;background:#0f172a;border:1.5px solid rgba(52,211,153,0.35);border-radius:18px;padding:24px;box-shadow:0 24px 60px rgba(0,0,0,0.85);z-index:100010;position:relative;display:flex;flex-direction:column;box-sizing:border-box";

  var isEdit = (existingSet !== null && existingSet !== undefined);
  var defTitle = isEdit ? (existingSet.title || existingSet.name || "") : ("টেস্ট: " + ch.name + " মডেল টেস্ট");
  var defTag = isEdit ? (existingSet.tag || existingSet.badge || "মক টেস্ট") : "মক টেস্ট";
  var defDur = isEdit ? (existingSet.durationMinutes || existingSet.timeLimit || 15) : 15;
  var defDesc = isEdit ? (existingSet.desc || "") : "";
  var defQs = isEdit ? (existingSet.questions || []) : [];
  var activeTab = (initialTab === "json") ? "json" : "form";

  modal.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:14px;margin-bottom:14px">
      <div>
        <h3 style="margin:0 0 4px;font-size:18px;font-weight:700;color:#f8fafc;display:flex;align-items:center;gap:8px">
          <span>📝</span> ➕ ${isEdit ? "এক্সাম সেট সম্পাদনা" : "নতুন টেস্ট সেট যোগ করুন"}
        </h3>
        <small style="color:#94a3b8;font-size:12.5px">অধ্যায়: ${escHtml(ch.name)} (চ্যাপ্টার ${escHtml(ch.num)})</small>
      </div>
      <button type="button" id="btn_close_test_modal" style="background:transparent;border:none;color:#94a3b8;font-size:24px;cursor:pointer;line-height:1;padding:0 6px" title="বন্ধ করুন (✕)">✕</button>
    </div>

    <!-- 2 Tabs: Form vs JSON -->
    <div style="display:flex;gap:8px;margin-bottom:14px;background:#1e293b;padding:4px;border-radius:12px;border:1px solid rgba(255,255,255,0.08)">
      <button type="button" id="tab_ts_form" style="flex:1;padding:8px 12px;border-radius:9px;font-size:13px;font-weight:700;cursor:pointer;border:none;background:#059669;color:#fff;transition:all .2s ease">
        📝 সাধারণ তথ্য ও সময়সীমা
      </button>
      <button type="button" id="tab_ts_json" style="flex:1;padding:8px 12px;border-radius:9px;font-size:13px;font-weight:700;cursor:pointer;border:none;background:transparent;color:#94a3b8;transition:all .2s ease">
        💻 প্রশ্নব্যাংক JSON কোড
      </button>
    </div>

    <div style="overflow-y:auto;flex:1;padding-right:4px">
      <!-- Panel 1: General Info & Time -->
      <div id="panel_ts_form">
        <div style="margin-bottom:12px">
          <label style="font-size:13px;font-weight:600;color:#cbd5e1;display:block;margin-bottom:4px">টেস্ট সেটের নাম (Title):</label>
          <input type="text" id="ts_input_title" value="${escHtml(defTitle)}" placeholder="যেমন: টেস্ট: ${escHtml(ch.name)} মডেল টেস্ট" style="width:100%;box-sizing:border-box;padding:10px 14px;border-radius:10px;border:1.5px solid #334155;background:#1e293b;color:#f8fafc;font:inherit;outline:none" />
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">
          <div>
            <label style="font-size:13px;font-weight:600;color:#cbd5e1;display:block;margin-bottom:4px">ট্যাগ / ক্যাটাগরি:</label>
            <input type="text" id="ts_input_tag" value="${escHtml(defTag)}" placeholder="যেমন: মক টেস্ট, মৌলিক ধারণা" style="width:100%;box-sizing:border-box;padding:10px 14px;border-radius:10px;border:1.5px solid #334155;background:#1e293b;color:#f8fafc;font:inherit;outline:none" />
          </div>
          <div>
            <label style="font-size:13px;font-weight:600;color:#cbd5e1;display:block;margin-bottom:4px">সময়সীমা (মিনিট):</label>
            <input type="number" id="ts_input_dur" min="1" max="180" value="${Number(defDur) || 15}" style="width:100%;box-sizing:border-box;padding:10px 14px;border-radius:10px;border:1.5px solid #334155;background:#1e293b;color:#f8fafc;font:inherit;font-weight:700;outline:none" />
          </div>
        </div>

        <div style="margin-bottom:12px">
          <label style="font-size:12.5px;color:#94a3b8;font-weight:600;display:block;margin-bottom:6px">দ্রুত সময় নির্বাচন:</label>
          <div style="display:flex;gap:6px;flex-wrap:wrap" id="ts_preset_dur_row">
            <button type="button" class="btn-preset-dur" data-dur="10" style="padding:4px 12px;font-size:12px;border-radius:8px;cursor:pointer;font-weight:600">১০ মি.</button>
            <button type="button" class="btn-preset-dur" data-dur="15" style="padding:4px 12px;font-size:12px;border-radius:8px;cursor:pointer;font-weight:600">১৫ মি.</button>
            <button type="button" class="btn-preset-dur" data-dur="20" style="padding:4px 12px;font-size:12px;border-radius:8px;cursor:pointer;font-weight:600">২০ মি.</button>
            <button type="button" class="btn-preset-dur" data-dur="25" style="padding:4px 12px;font-size:12px;border-radius:8px;cursor:pointer;font-weight:600">২৫ মি.</button>
            <button type="button" class="btn-preset-dur" data-dur="30" style="padding:4px 12px;font-size:12px;border-radius:8px;cursor:pointer;font-weight:600">৩০ মি.</button>
          </div>
        </div>

        <div style="margin-bottom:12px">
          <label style="font-size:13px;font-weight:600;color:#cbd5e1;display:block;margin-bottom:4px">সংক্ষিপ্ত বিবরণ:</label>
          <input type="text" id="ts_input_desc" value="${escHtml(defDesc)}" placeholder="যেমন: অধ্যায় রিভিশন ও পূর্ণাঙ্গ এমসিকিউ টেস্ট সেট" style="width:100%;box-sizing:border-box;padding:10px 14px;border-radius:10px;border:1.5px solid #334155;background:#1e293b;color:#f8fafc;font:inherit;outline:none" />
        </div>
      </div>

      <!-- Panel 2: Full JSON Questions Editor -->
      <div id="panel_ts_json" style="display:none">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
          <label style="font-size:13px;font-weight:600;color:#cbd5e1">প্রশ্নব্যাংক (JSON Array):</label>
          <div style="display:flex;gap:6px">
            <button type="button" id="ts_btn_load_sample" style="background:rgba(52,211,153,0.15);border:1px solid #34d399;color:#34d399;font-size:11.5px;padding:4px 10px;border-radius:6px;cursor:pointer;font-weight:700">📋 ডেমো প্রশ্ন</button>
            <button type="button" id="ts_btn_format_json" style="background:rgba(56,189,248,0.15);border:1px solid #38bdf8;color:#38bdf8;font-size:11.5px;padding:4px 10px;border-radius:6px;cursor:pointer;font-weight:600">✨ Format</button>
          </div>
        </div>
        <textarea id="ts_input_json" rows="10" placeholder='[&#10;  {&#10;    "question": "প্রশ্ন এখানে...",&#10;    "options": ["ক অপশন", "খ অপশন", "গ অপশন", "ঘ অপশন"],&#10;    "correct": 0,&#10;    "explanation": "ব্যাখ্যা..."&#10;  }&#10;]' style="width:100%;font-family:monospace;font-size:12.5px;padding:12px;border-radius:10px;border:1.5px solid #334155;background:#1e293b;color:#f8fafc;box-sizing:border-box;line-height:1.45"></textarea>
        <small style="color:#94a3b8;font-size:11.5px;display:block;margin-top:4px">💡 টিপস: প্রতিটি প্রশ্নে প্রশ্ন (question), ৪টি অপশন (options array), সঠিক উত্তরের ইনডেক্স ০-৩ (correct) এবং ব্যাখ্যা (explanation) অন্তর্ভুক্ত করুন।</small>
      </div>
    </div>

    <div id="ts_modal_err" style="color:#f87171;font-size:12.5px;margin-top:8px;min-height:16px"></div>

    <div style="display:flex;gap:10px;border-top:1px solid rgba(255,255,255,0.08);padding-top:14px;margin-top:10px">
      <button type="button" id="btn_cancel_test_set" style="flex:1;justify-content:center;padding:12px;font-weight:600;border-radius:10px;background:#1e293b;border:1px solid #334155;color:#cbd5e1;cursor:pointer">বাতিল</button>
      <button type="button" id="btn_save_test_set" class="btn btn-green-gradient" style="flex:1;border-radius:10px;font-weight:700;cursor:pointer;padding:12px;font-size:14px">
        ${isEdit ? "💾 এক্সাম সেট আপডেট করুন" : "➕ এক্সাম সেট তৈরি করুন"}
      </button>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Tab elements
  var tabBtnForm = modal.querySelector("#tab_ts_form");
  var tabBtnJson = modal.querySelector("#tab_ts_json");
  var panelForm = modal.querySelector("#panel_ts_form");
  var panelJson = modal.querySelector("#panel_ts_json");
  var inpDur = modal.querySelector("#ts_input_dur");
  var errEl = modal.querySelector("#ts_modal_err");

  // Populate questions JSON if editing
  if (defQs && defQs.length > 0) {
    try {
      modal.querySelector("#ts_input_json").value = JSON.stringify(defQs, null, 2);
    } catch(e) {}
  }

  // Duration Presets setup & live synchronization
  function updatePresetHighlight(val) {
    var num = parseInt(val, 10);
    modal.querySelectorAll(".btn-preset-dur").forEach(function(btnEl){
      var btnDur = parseInt(btnEl.getAttribute("data-dur"), 10);
      if (btnDur === num) {
        btnEl.style.background = "rgba(52,211,153,0.15)";
        btnEl.style.border = "1px solid #34d399";
        btnEl.style.color = "#34d399";
      } else {
        btnEl.style.background = "rgba(255,255,255,0.06)";
        btnEl.style.border = "1px solid rgba(255,255,255,0.1)";
        btnEl.style.color = "#e2e8f0";
      }
    });
  }
  updatePresetHighlight(defDur);

  modal.querySelectorAll(".btn-preset-dur").forEach(function(btnEl){
    btnEl.onclick = function() {
      var d = btnEl.getAttribute("data-dur");
      inpDur.value = d;
      updatePresetHighlight(d);
    };
  });

  inpDur.oninput = function() {
    updatePresetHighlight(inpDur.value);
  };

  // Tab Switching logic
  function switchTab(tab) {
    activeTab = tab;
    if (tab === "form") {
      tabBtnForm.style.background = "#059669";
      tabBtnForm.style.color = "#fff";
      tabBtnJson.style.background = "transparent";
      tabBtnJson.style.color = "#94a3b8";
      panelForm.style.display = "block";
      panelJson.style.display = "none";
    } else {
      tabBtnJson.style.background = "#059669";
      tabBtnJson.style.color = "#fff";
      tabBtnForm.style.background = "transparent";
      tabBtnForm.style.color = "#94a3b8";
      panelForm.style.display = "none";
      panelJson.style.display = "block";
    }
  }

  tabBtnForm.onclick = function() { switchTab("form"); };
  tabBtnJson.onclick = function() { switchTab("json"); };
  if (activeTab === "json") { switchTab("json"); }

  // JSON formatting & Sample loading
  modal.querySelector("#ts_btn_format_json").onclick = function() {
    var txt = modal.querySelector("#ts_input_json").value.trim();
    if (!txt) return;
    try {
      var p = JSON.parse(txt);
      modal.querySelector("#ts_input_json").value = JSON.stringify(p, null, 2);
      errEl.textContent = "";
    } catch(e) {
      errEl.textContent = "ভুল JSON সিনট্যাক্স: " + e.message;
    }
  };

  modal.querySelector("#ts_btn_load_sample").onclick = function() {
    var sample = [
      {
        question: ch.name + " সম্পর্কিত মৌলিক ও গুরুত্বপূর্ণ তথ্য কোনটি?",
        options: ["আদর্শ গ্যাসের অবস্থা সমীকরণ", "বয়েল ও চার্লসের মৌলিক সমন্বয়", "ভর ও পরিমাণের অনুপাত", "সবগুলো সত্য"],
        correct: 3,
        explanation: "অধ্যায়ের মূল পাঠ্যবই এবং বোর্ড পরীক্ষার স্ট্যান্ডার্ড প্রশ্নাবলী।"
      },
      {
        question: ch.name + " এর ক্ষেত্রে প্রমাণ অবস্থা ও মোলার আয়তন কত?",
        options: ["২২.৪ লিটার", "২৪.৭৮৯ লিটার", "১.০ বায়ুমণ্ডলীয় চাপ", "কোনোটিই নয়"],
        correct: 0,
        explanation: "প্রমাণ তাপমাত্রা ও চাপে মোলার গ্যাসের প্রমাণ মান।"
      }
    ];
    modal.querySelector("#ts_input_json").value = JSON.stringify(sample, null, 2);
    errEl.textContent = "";
  };

  // Modal Close Cleanup
  function closeModal() {
    overlay.style.display = "none";
    overlay.style.pointerEvents = "none";
    overlay.remove();
    cleanupLingeringBackdrops();
  }
  modal.querySelector("#btn_close_test_modal").onclick = closeModal;
  modal.querySelector("#btn_cancel_test_set").onclick = closeModal;
  overlay.onclick = function(e){ if (e.target === overlay) { e.stopPropagation(); } };

  // Save Test Set logic
  modal.querySelector("#btn_save_test_set").onclick = function() {
    var title = modal.querySelector("#ts_input_title").value.trim();
    var tag = modal.querySelector("#ts_input_tag").value.trim() || "মক টেস্ট";
    var dur = parseInt(modal.querySelector("#ts_input_dur").value, 10) || 15;
    var desc = modal.querySelector("#ts_input_desc").value.trim();
    var jsonTxt = modal.querySelector("#ts_input_json").value.trim();

    if (!title) {
      errEl.textContent = "টেস্টের একটি নাম লিখুন।";
      switchTab("form");
      modal.querySelector("#ts_input_title").focus();
      return;
    }

    var questions = [];
    if (jsonTxt) {
      try {
        questions = JSON.parse(jsonTxt);
        if (!Array.isArray(questions)) {
          errEl.textContent = "প্রশ্ন কোড অবশ্যই একটি Array (তালিকা) হতে হবে!";
          switchTab("json");
          return;
        }
      } catch(e) {
        errEl.textContent = "JSON সিনট্যাক্স ভুল: " + e.message;
        switchTab("json");
        return;
      }
    } else if (isEdit && defQs.length > 0) {
      questions = defQs;
    }

    var testId = (isEdit && existingSet.id) ? existingSet.id : ("test_" + ch.id + "_" + Date.now().toString(36));
    var testObj = {
      id: testId,
      title: title,
      tag: tag,
      durationMinutes: dur,
      timeLimit: dur,
      desc: desc || "অধ্যায়ভিত্তিক নির্ধারিত টেস্ট সেট",
      questions: questions,
      qCount: questions.length,
      updatedAt: Date.now()
    };

    // Immediate LocalStorage caching to prevent any data loss
    try {
      localStorage.setItem("sr_local_ts_" + ch.id + "_" + testId, JSON.stringify(testObj));
      localStorage.setItem("sr_local_time_" + ch.id + "_" + testId, String(dur));
    } catch(e) {}

    var btnSave = modal.querySelector("#btn_save_test_set");
    if (btnSave) {
      btnSave.disabled = true;
      btnSave.innerHTML = "⏳ সেভ হচ্ছে...";
    }

    var subId = (parentSub && parentSub.id) || (typeof selectedSubId !== "undefined" && selectedSubId) || (ch && ch.subId) || "default";

    var isTestSetDone = false;
    function finishTestSetSave() {
      if (isTestSetDone) return;
      isTestSetDone = true;
      toast(isEdit ? "এক্সাম সেট আপডেট হয়েছে ✓" : "নতুন এক্সাম সেট সফলভাবে তৈরি হয়েছে ✓");
      closeModal();
      if (onSaved) onSaved(testObj);
    }
    var testSetTimer = setTimeout(finishTestSetSave, 2200);

    // Ensure Auth before writing
    (window.ensureAuth ? window.ensureAuth() : Promise.resolve()).then(function() {
      var p1 = db.ref("exam_chapter_tests/" + ch.id + "/" + testId).set(testObj).catch(function(){ return null; });
      var p2 = db.ref("examSets/" + ch.id + "/" + testId).set(testObj).catch(function(){ return null; });
      var p3 = db.ref("exam_chapter_durations/" + ch.id).set(dur).catch(function(){ return null; });
      var p4 = db.ref("exam_chapter_tests/" + ch.id + "/_initialized").set(true).catch(function(){ return null; });
      var p5 = db.ref("chapter_exams/" + ch.id + "/" + testId).set(testObj).catch(function(){ return null; });
      var p6 = (subId && subId !== "default")
        ? db.ref("subjects/" + subId + "/chapters/" + ch.id + "/examSets/" + testId).set(testObj).catch(function(){ return null; })
        : Promise.resolve();

      return Promise.all([p1, p2, p3, p4, p5, p6]);
    }).then(function() {
      clearTimeout(testSetTimer);
      finishTestSetSave();
    }).catch(function(err) {
      console.warn("Save note:", err);
      clearTimeout(testSetTimer);
      finishTestSetSave();
    });
  };
}
window.openTestSetEditorModal = openTestSetEditorModal;

// ২-অপশন বিশিষ্ট আধুনিক পপ-আপ মডাল: অপশন ১ (সাধারণ এডিট) এবং অপশন ২ (জেসন কোড এডিট)
function openQuestionEditorModal(ch, existingQ, qIdx, questionsList, onSaved, initialTab, options) {
  var overlay = el("div", "admin-modal-backdrop");
  overlay.setAttribute("data-admin-overlay", "true");
  overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.8);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:100020 !important;padding:16px";

  var modal = el("div", "card admin-modal-dialog");
  modal.onclick = function(e){ e.stopPropagation(); };
  modal.onmousedown = function(e){ e.stopPropagation(); };
  modal.style.cssText = "width:100%;max-width:640px;max-height:92vh;overflow-y:auto;background:var(--card);border:1.5px solid var(--line);border-radius:18px;padding:24px;box-shadow:0 24px 48px rgba(0,0,0,0.65);z-index:100060 !important;position:relative";

  var isEdit = (existingQ !== null && existingQ !== undefined);
  var activeTab = (initialTab === "json") ? "json" : "form"; // "form" or "json"

  // Base state
  var currentQObj = isEdit ? JSON.parse(JSON.stringify(existingQ)) : {
    question: "",
    options: ["", "", "", ""],
    correct: 0,
    explanation: ""
  };
  while ((currentQObj.options || []).length < 4) {
    currentQObj.options.push("");
  }

  modal.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--line);padding-bottom:14px;margin-bottom:16px">
      <div>
        <h3 style="margin:0 0 4px;font-size:18px;color:var(--ink)">${isEdit ? "✏️ প্রশ্ন সম্পাদনা ও সেটিংস" : "➕ নতুন প্রশ্ন ও সেটিংস"}</h3>
        <small class="mute" style="font-size:12px">অধ্যায়: ${escHtml(ch.name)} (চ্যাপ্টার ${escHtml(ch.num)})</small>
      </div>
      <button type="button" id="btn_close_q_modal" style="background:transparent;border:none;color:var(--mute);font-size:26px;cursor:pointer;line-height:1;padding:0 4px">×</button>
    </div>

    <!-- Duration Setting Box -->
    <div style="display:flex;align-items:center;justify-content:space-between;background:var(--bg);border:1.5px solid var(--line);border-radius:12px;padding:10px 14px;margin-bottom:16px">
      <div style="display:flex;align-items:center;gap:8px">
        <span style="font-size:18px">⏱</span>
        <div>
          <strong style="font-size:13.5px;color:var(--ink);display:block">পরীক্ষার সময়সীমা (মিনিট)</strong>
          <small class="mute" style="font-size:11.5px">এই অধ্যায়ের পরীক্ষার ডিফল্ট টাইমার নির্ধারণ করুন</small>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:6px">
        <input type="number" id="modal_ch_duration" min="1" max="180" value="15" style="width:65px;padding:6px 8px;border-radius:8px;border:1.5px solid var(--line);font-weight:700;text-align:center;font-size:14px;background:var(--card);color:var(--ink)" />
        <span class="mute" style="font-size:13px;font-weight:600">মিনিট</span>
      </div>
    </div>

    <!-- 2-Option Tab Navigation Bar -->
    <div style="display:flex;gap:8px;margin-bottom:16px;background:var(--bg);padding:4px;border-radius:12px;border:1px solid var(--line)">
      <button type="button" id="tab_btn_form" style="flex:1;padding:9px 12px;border-radius:9px;font-size:13px;font-weight:700;cursor:pointer;border:none;transition:all .2s ease;background:var(--a);color:#fff">
        📝 ১ম অপশন: সাধারণ এডিট (Form View)
      </button>
      <button type="button" id="tab_btn_json" style="flex:1;padding:9px 12px;border-radius:9px;font-size:13px;font-weight:700;cursor:pointer;border:none;transition:all .2s ease;background:transparent;color:var(--mute)">
        💻 ২য় অপশন: জেসন কোড এডিট (JSON Editor)
      </button>
    </div>

    <!-- Tab 1: Form View Panel -->
    <div id="panel_form_view">
      <label class="mute" style="font-size:13px;font-weight:600;display:block;margin-bottom:6px">প্রশ্নের বিবরণ (Question Title):</label>
      <textarea id="q_input_text" rows="3" placeholder="প্রশ্ন এখানে লিখুন..." style="width:100%;padding:10px 12px;border-radius:10px;border:1.5px solid var(--line);font-size:14px;box-sizing:border-box;margin-bottom:14px;font:inherit;background:var(--bg);color:var(--ink)"></textarea>

      <label class="mute" style="font-size:13px;font-weight:600;display:block;margin-bottom:8px">৪টি অপশন (ক, খ, গ, ঘ):</label>
      <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:14px">
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-weight:800;color:var(--a);width:26px;text-align:center">ক)</span>
          <input type="text" id="q_opt_0" placeholder="প্রথম অপশন" style="flex:1;padding:9px 12px;border-radius:8px;border:1.5px solid var(--line);font:inherit;background:var(--bg);color:var(--ink)" />
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-weight:800;color:var(--a);width:26px;text-align:center">খ)</span>
          <input type="text" id="q_opt_1" placeholder="দ্বিতীয় অপশন" style="flex:1;padding:9px 12px;border-radius:8px;border:1.5px solid var(--line);font:inherit;background:var(--bg);color:var(--ink)" />
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-weight:800;color:var(--a);width:26px;text-align:center">গ)</span>
          <input type="text" id="q_opt_2" placeholder="তৃতীয় অপশন" style="flex:1;padding:9px 12px;border-radius:8px;border:1.5px solid var(--line);font:inherit;background:var(--bg);color:var(--ink)" />
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-weight:800;color:var(--a);width:26px;text-align:center">ঘ)</span>
          <input type="text" id="q_opt_3" placeholder="চতুর্থ অপশন" style="flex:1;padding:9px 12px;border-radius:8px;border:1.5px solid var(--line);font:inherit;background:var(--bg);color:var(--ink)" />
        </div>
      </div>

      <div style="margin-bottom:14px">
        <label class="mute" style="font-size:13px;font-weight:600;display:block;margin-bottom:6px">সঠিক উত্তর নির্বাচন করুন (Correct Answer):</label>
        <select id="q_input_correct" style="width:100%;padding:10px 12px;border-radius:8px;border:1.5px solid var(--line);font:inherit;font-weight:600;background:var(--bg);color:var(--ink)">
          <option value="0">ক (প্রথম অপশন)</option>
          <option value="1">খ (দ্বিতীয় অপশন)</option>
          <option value="2">গ (তৃতীয় অপশন)</option>
          <option value="3">ঘ (চতুর্থ অপশন)</option>
        </select>
      </div>

      <label class="mute" style="font-size:13px;font-weight:600;display:block;margin-bottom:6px">উত্তরের ব্যাখ্যা / সল্যুশন (ঐচ্ছিক):</label>
      <input type="text" id="q_input_exp" placeholder="যেমন: এই সূত্রের মূল কারণ হলো..." style="width:100%;padding:10px 12px;border-radius:8px;border:1.5px solid var(--line);font:inherit;box-sizing:border-box;background:var(--bg);color:var(--ink)" />
    </div>

    <!-- Tab 2: Full JSON Editor Panel -->
    <div id="panel_json_view" style="display:none">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <label class="mute" style="font-size:13px;font-weight:600">প্রশ্নের সম্পূর্ণ JSON কোড:</label>
        <button type="button" id="btn_format_json" style="background:transparent;border:1px solid var(--line);color:var(--a);font-size:11.5px;padding:3px 8px;border-radius:6px;cursor:pointer">✨ Format JSON</button>
      </div>
      <textarea id="q_json_code" rows="11" placeholder="{\n  &quot;question&quot;: &quot;...&quot;,\n  &quot;options&quot;: [&quot;ক&quot;, &quot;খ&quot;, &quot;গ&quot;, &quot;ঘ&quot;],\n  &quot;correct&quot;: 0,\n  &quot;explanation&quot;: &quot;...&quot;\n}" style="width:100%;padding:12px;border-radius:10px;border:1.5px solid var(--line);font-family:monospace;font-size:13px;box-sizing:border-box;background:var(--bg);color:var(--ink);line-height:1.4"></textarea>
      <small class="mute" style="font-size:11.5px;display:block;margin-top:4px">টিপস: আপনি সরাসরি সম্পূর্ণ অবজেক্টটি কপি-পেস্ট বা সম্পাদনা করতে পারবেন।</small>
    </div>

    <div id="q_modal_err" style="color:var(--danger);font-size:13px;margin-top:10px;min-height:1.2em"></div>

    <div class="row" style="margin-top:18px;display:flex;gap:10px">
      <button type="button" class="btn" id="btn_save_q_item" style="flex:1;padding:12px;border-radius:10px;font-weight:700">${isEdit ? "💾 পরিবর্তন সংরক্ষণ করুন" : "➕ নতুন প্রশ্ন যোগ করুন"}</button>
      <button type="button" class="btn ghost" id="btn_cancel_q_item" style="flex:1;padding:12px;border-radius:10px;font-weight:600">বাতিল</button>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Load duration from DB
  var durInput = document.getElementById("modal_ch_duration");
  db.ref("exam_chapter_durations/" + ch.id).once("value").then(function(dSnap){
    if (dSnap.val()) durInput.value = dSnap.val();
  }).catch(function(){});

  // Populate Form
  document.getElementById("q_input_text").value = currentQObj.question || "";
  var opts = currentQObj.options || [];
  if (opts[0] !== undefined) document.getElementById("q_opt_0").value = opts[0];
  if (opts[1] !== undefined) document.getElementById("q_opt_1").value = opts[1];
  if (opts[2] !== undefined) document.getElementById("q_opt_2").value = opts[2];
  if (opts[3] !== undefined) document.getElementById("q_opt_3").value = opts[3];
  document.getElementById("q_input_correct").value = String(currentQObj.correct || 0);
  document.getElementById("q_input_exp").value = currentQObj.explanation || "";

  // Populate JSON
  document.getElementById("q_json_code").value = JSON.stringify(currentQObj, null, 2);

  // Tab switching logic
  var btnFormTab = document.getElementById("tab_btn_form");
  var btnJsonTab = document.getElementById("tab_btn_json");
  var panelForm = document.getElementById("panel_form_view");
  var panelJson = document.getElementById("panel_json_view");

  function getFormQObject() {
    var o0 = document.getElementById("q_opt_0").value.trim();
    var o1 = document.getElementById("q_opt_1").value.trim();
    var o2 = document.getElementById("q_opt_2").value.trim();
    var o3 = document.getElementById("q_opt_3").value.trim();
    var options = [o0, o1];
    if (o2) options.push(o2);
    if (o3) options.push(o3);
    var cor = parseInt(document.getElementById("q_input_correct").value, 10) || 0;
    if (cor >= options.length) cor = 0;
    return {
      question: document.getElementById("q_input_text").value.trim(),
      options: options,
      correct: cor,
      explanation: document.getElementById("q_input_exp").value.trim()
    };
  }

  function applyQObjectToForm(obj) {
    if (!obj) return;
    document.getElementById("q_input_text").value = obj.question || "";
    var op = obj.options || [];
    document.getElementById("q_opt_0").value = op[0] || "";
    document.getElementById("q_opt_1").value = op[1] || "";
    document.getElementById("q_opt_2").value = op[2] || "";
    document.getElementById("q_opt_3").value = op[3] || "";
    document.getElementById("q_input_correct").value = String(obj.correct || 0);
    document.getElementById("q_input_exp").value = obj.explanation || "";
  }

  btnFormTab.onclick = function() {
    if (activeTab === "form") return;
    // Sync JSON back to Form
    try {
      var parsed = JSON.parse(document.getElementById("q_json_code").value);
      applyQObjectToForm(parsed);
    } catch(e) {}
    activeTab = "form";
    btnFormTab.style.background = "var(--a)";
    btnFormTab.style.color = "#fff";
    btnJsonTab.style.background = "transparent";
    btnJsonTab.style.color = "var(--mute)";
    panelForm.style.display = "block";
    panelJson.style.display = "none";
  };

  btnJsonTab.onclick = function() {
    if (activeTab === "json") return;
    // Sync Form into JSON
    var curObj = getFormQObject();
    document.getElementById("q_json_code").value = JSON.stringify(curObj, null, 2);
    activeTab = "json";
    btnJsonTab.style.background = "var(--a)";
    btnJsonTab.style.color = "#fff";
    btnFormTab.style.background = "transparent";
    btnFormTab.style.color = "var(--mute)";
    panelForm.style.display = "none";
    panelJson.style.display = "block";
  };

  if (activeTab === "json") {
    btnFormTab.style.background = "transparent";
    btnFormTab.style.color = "var(--mute)";
    btnJsonTab.style.background = "var(--a)";
    btnJsonTab.style.color = "#fff";
    panelForm.style.display = "none";
    panelJson.style.display = "block";
  }

  document.getElementById("btn_format_json").onclick = function() {
    try {
      var p = JSON.parse(document.getElementById("q_json_code").value);
      document.getElementById("q_json_code").value = JSON.stringify(p, null, 2);
    } catch(e) {
      alert("ভুল JSON সিনট্যাক্স: " + e.message);
    }
  };

  function closeModal() {
    overlay.style.display = "none";
    overlay.style.pointerEvents = "none";
    overlay.remove();
    if (!(options && options.singleQuestionMode)) {
      cleanupLingeringBackdrops();
    }
  }
  document.getElementById("btn_close_q_modal").onclick = closeModal;
  document.getElementById("btn_cancel_q_item").onclick = closeModal;
  overlay.onclick = function(e){ if (e.target === overlay) { e.stopPropagation(); } };

  document.getElementById("btn_save_q_item").onclick = function() {
    var errEl = document.getElementById("q_modal_err");
    errEl.textContent = "";

    var finalObj = null;
    if (activeTab === "json") {
      try {
        finalObj = JSON.parse(document.getElementById("q_json_code").value);
        if (!finalObj.question || !Array.isArray(finalObj.options) || finalObj.options.length < 2) {
          errEl.textContent = "JSON অবজেক্টে অবশ্যই 'question' এবং কমপক্ষে ২টি 'options' থাকতে হবে।";
          return;
        }
      } catch(e) {
        errEl.textContent = "JSON কোডে সিনট্যাক্স ভুল: " + e.message;
        return;
      }
    } else {
      finalObj = getFormQObject();
      if (!finalObj.question) { errEl.textContent = "প্রশ্নের বিবরণ লিখুন।"; return; }
      if (!finalObj.options[0] || !finalObj.options[1]) { errEl.textContent = "কমপক্ষে ২টি অপশন (ক ও খ) পূরণ করুন।"; return; }
    }

    // Save duration if changed
    var durVal = Number(durInput.value) || 15;
    db.ref("exam_chapter_durations/" + ch.id).set(durVal).catch(function(){});

    if (options && options.singleQuestionMode) {
      closeModal();
      onSaved(finalObj);
      return;
    }

    var updatedList = (questionsList || []).slice();
    if (isEdit) {
      updatedList[qIdx] = finalObj;
    } else {
      updatedList.push(finalObj);
    }

    db.ref("exam_questions/" + ch.id).set(updatedList).then(function(){
      toast(isEdit ? "প্রশ্ন আপডেট হয়েছে ✓" : "নতুন প্রশ্ন যোগ হয়েছে ✓");
      closeModal();
      onSaved(updatedList);
    }).catch(function(err){
      errEl.textContent = "সেভ ব্যর্থ: " + err.message;
    });
  };
}

// ৩-লেভেলের ডাইনামিক ইন-প্লেস কোশ্চেন ব্যাংক ভিউয়ার (জিরো স্ক্রলিং)
function renderQBankView(container, allSubs) {
  container.textContent = "";
  window.scrollTo(0, 0);
  try { container.scrollIntoView({ behavior: "instant", block: "start" }); } catch(e){}

  var catLower = (activeExamCategory || "HSC").toLowerCase();
  var filteredSubs = (allSubs || []).filter(function(s) {
    if (!s) return false;
    if (!s.category) {
      var sidL = s.id ? String(s.id).toLowerCase() : "";
      if (sidL.startsWith("ssc_") || sidL.startsWith("subj_ssc_")) return catLower === "ssc";
      if (sidL.startsWith("adm_") || sidL.startsWith("admission_") || sidL.startsWith("subj_admission_")) return catLower === "admission";
      if (sidL.startsWith("bcs_") || sidL.startsWith("subj_bcs_")) return catLower === "bcs";
      return catLower === "hsc";
    }
    return String(s.category).toLowerCase() === catLower;
  });

  // LEVEL 3: অধ্যায়ের সমস্ত প্রশ্ন প্রদর্শন, নতুন প্রশ্ন যোগ, এডিট ও রিমুভ
  if (selectedSubId && selectedChapId) {
    var activeSub = filteredSubs.find(function(s){ return s.id === selectedSubId; });
    var ch = activeSub && (activeSub.chapters || []).find(function(c){ return c.id === selectedChapId; });
    if (!activeSub || !ch) {
      selectedChapId = null;
      renderQBankView(container, allSubs);
      return;
    }

    var qCard = el("div", "card");
    qCard.id = "admin_q_mgmt_card";

    // Top Navigation & Action Header
    var topBar = el("div", "sw");
    topBar.style.cssText = "align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;border-bottom:1px solid var(--line);padding-bottom:14px;margin-bottom:16px";

    var leftNav = el("div");
    leftNav.style.cssText = "display:flex;align-items:center;gap:10px;flex-wrap:wrap";
    
    var backBtn = btn("← অধ্যায় তালিকায় ফিরে যান", null, function(){
      cleanupLingeringBackdrops();
      selectedChapId = null;
      renderQBankView(container, allSubs);
    });
    backBtn.className = "btn btn-green-gradient";
    backBtn.style.cssText = "padding:8px 18px;font-size:13px;border-radius:10px;font-weight:700;cursor:pointer";
    leftNav.appendChild(backBtn);

    var titleBox = el("div");
    titleBox.innerHTML = "<h3 style='margin:0;font-size:17px;color:var(--ink)'>" + escHtml(activeSub.titleBn) + " › <span style='color:var(--a)'>অধ্যায় " + escHtml(ch.num) + ": " + escHtml(ch.name) + "</span></h3>";
    leftNav.appendChild(titleBox);
    topBar.appendChild(leftNav);

    // Action Buttons
    var rightActions = el("div");
    rightActions.style.cssText = "display:flex;align-items:center;gap:8px;flex-wrap:wrap";

    var addTestBtn = btn("➕ নতুন টেস্ট সেট যোগ করুন", null, function(e){
      if (e && e.stopPropagation) e.stopPropagation();
      if (typeof window.__closeAdminDropdown === "function") window.__closeAdminDropdown();
      openTestSetEditorModal(ch, null, function(){
        loadAndRenderExamSets();
      }, null, activeSub);
    });
    addTestBtn.id = "btn_admin_add_test_set";
    addTestBtn.className = "btn btn-green-gradient";
    addTestBtn.style.cssText = "padding:8px 18px;border-radius:10px;font-weight:700;font-size:13.5px;cursor:pointer";
    rightActions.appendChild(addTestBtn);

    topBar.appendChild(rightActions);
    qCard.appendChild(topBar);

    // Section: Exam Sets Container (Option 2 Modern Glass Cards)
    var listContainer = el("div");
    listContainer.id = "admin_exam_sets_container";
    qCard.appendChild(listContainer);

    // ১. Set Name Edit Modal
    function openSetNameEditModal(ch, ts, onSaved) {
      var overlay = el("div", "admin-modal-backdrop");
      overlay.setAttribute("data-admin-overlay", "true");
      overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.8);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:1000;padding:16px";
      var m = el("div", "card admin-modal-dialog");
      m.onclick = function(e){ e.stopPropagation(); };
      m.onmousedown = function(e){ e.stopPropagation(); };
      m.style.cssText = "width:100%;max-width:480px;background:var(--card);border:1.5px solid var(--line);border-radius:16px;padding:22px;box-shadow:0 20px 45px rgba(0,0,0,0.6);z-index:1050;position:relative";
      m.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;border-bottom:1px solid var(--line);padding-bottom:10px">
          <h3 style="margin:0;font-size:17px;color:var(--ink)">✏️ Set Name Edit (সেটের নাম পরিবর্তন)</h3>
          <button type="button" id="btn_close_name_modal" style="background:transparent;border:none;color:var(--mute);font-size:20px;cursor:pointer">✕</button>
        </div>
        <div style="margin-bottom:14px">
          <label class="mute" style="font-size:13px;display:block;margin-bottom:6px">এক্সাম সেটের বর্তমান নাম:</label>
          <input type="text" id="set_name_input" value="${escHtml(ts.title || '')}" placeholder="যেমন: সেট ১, মডেল টেস্ট ৩" style="width:100%;padding:10px 12px;border-radius:10px;border:1.5px solid var(--line);font:inherit;background:var(--bg);color:var(--ink);box-sizing:border-box" />
          <div id="set_name_err" style="color:var(--danger);font-size:12.5px;margin-top:6px;min-height:1.2em"></div>
        </div>
        <div class="row" style="display:flex;gap:10px;margin-top:16px">
          <button type="button" class="btn" id="btn_save_set_name" style="flex:1;padding:11px;border-radius:10px">💾 সেভ করুন</button>
          <button type="button" class="btn ghost" id="btn_cancel_set_name" style="flex:1;padding:11px;border-radius:10px">বাতিল</button>
        </div>
      `;
      overlay.appendChild(m);
      document.body.appendChild(overlay);
      var inp = m.querySelector("#set_name_input");
      var er = m.querySelector("#set_name_err");
      setTimeout(function(){ if(inp) inp.focus(); }, 50);
      function close() {
        overlay.style.display = "none";
        overlay.style.pointerEvents = "none";
        overlay.remove();
        cleanupLingeringBackdrops();
      }
      m.querySelector("#btn_close_name_modal").onclick = close;
      m.querySelector("#btn_cancel_set_name").onclick = close;
      overlay.onclick = function(e){ if(e.target === overlay) { e.stopPropagation(); } };
      m.querySelector("#btn_save_set_name").onclick = function(){
        var val = inp.value.trim();
        if(!val){ er.textContent = "সেটের একটি নাম লিখুন।"; return; }
        var updatePayload = {
          title: val,
          updatedAt: Date.now()
        };
        (window.ensureAuth ? window.ensureAuth() : Promise.resolve()).then(function() {
          var subId = (typeof activeSub !== "undefined" && activeSub && activeSub.id) ? activeSub.id : "default";
          var p1 = db.ref("exam_chapter_tests/" + ch.id + "/" + ts.id).update(updatePayload);
          var p2 = db.ref("examSets/" + ch.id + "/" + ts.id).update(updatePayload);
          var p3 = db.ref("subjects/" + subId + "/chapters/" + ch.id + "/examSets/" + ts.id).update(updatePayload).catch(function(){});
          var p4 = db.ref("subjects/chapters/" + ch.id + "/examSets/" + ts.id).update(updatePayload).catch(function(){});
          var p5 = db.ref("examSets/" + ts.id).update(updatePayload).catch(function(){});
          Promise.all([p1, p2, p3, p4, p5]).then(function(){
            ts.title = val;
            try { localStorage.setItem("sr_local_ts_" + ch.id + "_" + ts.id, JSON.stringify(ts)); } catch(e) {}
            toast("সেটের নাম পরিবর্তিত হয়েছে ✓");
            close();
            if(onSaved) onSaved();
          }).catch(function(err){
            console.warn("Set name update fallback:", err);
            db.ref("exam_chapter_tests/" + ch.id + "/" + ts.id + "/title").set(val);
            db.ref("examSets/" + ch.id + "/" + ts.id + "/title").set(val);
            ts.title = val;
            try { localStorage.setItem("sr_local_ts_" + ch.id + "_" + ts.id, JSON.stringify(ts)); } catch(e) {}
            toast("সেটের নাম পরিবর্তিত হয়েছে ✓");
            close();
            if(onSaved) onSaved();
          });
        });
      };
    }

    // ২. Time Edit Modal (with timeLimit update & auth fallback - Point 1)
    function openTimeEditModal(ch, ts, onSaved) {
      var overlay = el("div", "admin-modal-backdrop");
      overlay.setAttribute("data-admin-overlay", "true");
      overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.8);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:1000;padding:16px";
      var m = el("div", "card admin-modal-dialog");
      m.onclick = function(e){ e.stopPropagation(); };
      m.onmousedown = function(e){ e.stopPropagation(); };
      m.style.cssText = "width:100%;max-width:480px;background:var(--card);border:1.5px solid var(--line);border-radius:16px;padding:22px;box-shadow:0 20px 45px rgba(0,0,0,0.6);z-index:1050;position:relative";
      var curDur = ts.durationMinutes || ts.timeLimit || 15;
      m.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;border-bottom:1px solid var(--line);padding-bottom:10px">
          <h3 style="margin:0;font-size:17px;color:var(--ink)">⏱️ Time Edit (সময়সীমা পরিবর্তন)</h3>
          <button type="button" id="btn_close_time_modal" style="background:transparent;border:none;color:var(--mute);font-size:20px;cursor:pointer">✕</button>
        </div>
        <div style="margin-bottom:12px">
          <label class="mute" style="font-size:13px;display:block;margin-bottom:6px">দ্রুত নির্বাচন করুন (ক্লিক করুন):</label>
          <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:8px;margin-bottom:12px" id="time_presets_row">
            <button type="button" class="btn ghost time-preset-btn" data-dur="10">১০ মি.</button>
            <button type="button" class="btn ghost time-preset-btn" data-dur="15">১৫ মি.</button>
            <button type="button" class="btn ghost time-preset-btn" data-dur="20">২০ মি.</button>
            <button type="button" class="btn ghost time-preset-btn" data-dur="25">২৫ মি.</button>
            <button type="button" class="btn ghost time-preset-btn" data-dur="30">৩০ মি.</button>
            <button type="button" class="btn ghost time-preset-btn" data-dur="40">৪০ মি.</button>
            <button type="button" class="btn ghost time-preset-btn" data-dur="50">৫০ মি.</button>
            <button type="button" class="btn ghost time-preset-btn" data-dur="60">৬০ মি.</button>
          </div>
          <label class="mute" style="font-size:13px;display:block;margin-bottom:6px">অথবা নির্দিষ্ট মিনিট লিখুন:</label>
          <input type="number" id="set_time_input" min="1" max="180" value="${curDur}" style="width:100%;padding:10px 12px;border-radius:10px;border:1.5px solid var(--line);font:inherit;background:var(--bg);color:var(--ink);font-weight:700;font-size:16px;box-sizing:border-box" />
          <div id="set_time_err" style="color:var(--danger);font-size:12.5px;margin-top:6px;min-height:1.2em"></div>
        </div>
        <div class="row" style="display:flex;gap:10px;margin-top:16px">
          <button type="button" class="btn" id="btn_save_set_time" style="flex:1;padding:11px;border-radius:10px">💾 সময় সেট করুন</button>
          <button type="button" class="btn ghost" id="btn_cancel_set_time" style="flex:1;padding:11px;border-radius:10px">বাতিল</button>
        </div>
      `;
      overlay.appendChild(m);
      document.body.appendChild(overlay);
      var inp = m.querySelector("#set_time_input");
      var er = m.querySelector("#set_time_err");
      m.querySelectorAll(".time-preset-btn").forEach(function(b){
        b.onclick = function(){
          inp.value = b.getAttribute("data-dur");
        };
      });
      function close() {
        overlay.style.display = "none";
        overlay.style.pointerEvents = "none";
        overlay.remove();
        cleanupLingeringBackdrops();
      }
      m.querySelector("#btn_close_time_modal").onclick = close;
      m.querySelector("#btn_cancel_set_time").onclick = close;
      overlay.onclick = function(e){ if(e.target === overlay) { e.stopPropagation(); } };
      m.querySelector("#btn_save_set_time").onclick = function(){
        var val = parseInt(inp.value, 10);
        if(!val || val < 1 || val > 180){ er.textContent = "সঠিক মিনিট লিখুন (১ থেকে ১৮০)।"; return; }

        var btnSave = m.querySelector("#btn_save_set_time");
        if(btnSave) {
          btnSave.disabled = true;
          btnSave.textContent = "⏳ সেভ হচ্ছে...";
        }

        var updatePayload = {
          timeLimit: val,
          durationMinutes: val,
          updatedAt: Date.now()
        };

        function doSave() {
          var subId = (typeof activeSub !== "undefined" && activeSub && activeSub.id) ? activeSub.id : "default";
          try {
            localStorage.setItem("sr_local_time_" + ch.id + "_" + ts.id, val.toString());
          } catch(e) {}

          var candidatePromises = [
            db.ref("subjects/" + subId + "/chapters/" + ch.id + "/examSets/" + ts.id).update(updatePayload).then(function(){ return true; }).catch(function(){ return false; }),
            db.ref("subjects/chapters/" + ch.id + "/examSets/" + ts.id).update(updatePayload).then(function(){ return true; }).catch(function(){ return false; }),
            db.ref("examSets/" + ch.id + "/" + ts.id).update(updatePayload).then(function(){ return true; }).catch(function(){ return false; }),
            db.ref("exam_chapter_tests/" + ch.id + "/" + ts.id).update(updatePayload).then(function(){ return true; }).catch(function(){ return false; }),
            db.ref("chapter_exams/" + ch.id + "/" + ts.id).update(updatePayload).then(function(){ return true; }).catch(function(){ return false; }),
            db.ref("exam_chapter_durations/" + ch.id).set(val).then(function(){ return true; }).catch(function(){ return false; })
          ];

          Promise.all(candidatePromises).then(function(results){
            var successCount = results.filter(Boolean).length;
            ts.timeLimit = val;
            ts.durationMinutes = val;
            try { localStorage.setItem("sr_local_ts_" + ch.id + "_" + ts.id, JSON.stringify(ts)); } catch(e) {}
            if (successCount > 0) {
              toast("সময়সীমা " + val + " মিনিটে পরিবর্তিত হয়েছে ✓");
            } else {
              toast("সময়সীমা " + val + " মিনিট সেট হয়েছে (লোকাল) ✓");
            }
            close();
            if(onSaved) onSaved();
          });
        }

        (window.ensureAuth ? window.ensureAuth() : Promise.resolve()).then(doSave).catch(doSave);
      };
    }

    // ৩. Individual Qn Edit Modal (Question Manager)
    function openIndividualQuestionManagerModal(ch, ts, onSaved) {
      var overlay = el("div", "admin-modal-backdrop");
      overlay.setAttribute("data-admin-overlay", "true");
      overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.85);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:1000;padding:16px";
      
      var modal = el("div", "card admin-modal-dialog");
      modal.onclick = function(e){ e.stopPropagation(); };
      modal.onmousedown = function(e){ e.stopPropagation(); };
      modal.style.cssText = "width:100%;max-width:740px;max-height:92vh;overflow-y:auto;background:var(--card);border:1.5px solid var(--line);border-radius:18px;padding:24px;box-shadow:0 24px 50px rgba(0,0,0,0.7);z-index:1050;position:relative";
      
      function renderManager() {
        var questions = ts.questions || [];
        modal.innerHTML = `
          <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--line);padding-bottom:14px;margin-bottom:16px;flex-wrap:wrap;gap:10px">
            <div>
              <h3 style="margin:0 0 4px;font-size:18px;color:var(--ink)">📝 ${escHtml(ts.title)}</h3>
              <p class="mute" style="margin:0;font-size:13px">একক প্রশ্ন সম্পাদনা ও ব্যবস্থাপনা (মোট ${questions.length}টি প্রশ্ন)</p>
            </div>
            <div style="display:flex;gap:8px">
              <button type="button" class="btn" id="btn_modal_add_single_q" style="padding:7px 14px;font-size:12.5px;border-radius:10px;background:#10b981;color:#fff;border:none;font-weight:700">➕ নতুন প্রশ্ন যোগ করুন</button>
              <button type="button" id="btn_modal_close_iqm" style="background:transparent;border:none;color:var(--mute);font-size:22px;cursor:pointer">✕</button>
            </div>
          </div>
          <div id="iqm_questions_list" style="display:flex;flex-direction:column;gap:12px;max-height:60vh;overflow-y:auto;padding-right:4px">
            ${questions.length === 0 ? '<p class="mute" style="text-align:center;padding:30px">এই সেটে এখনও কোনো প্রশ্ন নেই। উপরে "➕ নতুন প্রশ্ন যোগ করুন" বাটনে চাপুন।</p>' : ''}
          </div>
          <div style="margin-top:16px;border-top:1px solid var(--line);padding-top:12px;display:flex;justify-content:flex-end">
            <button type="button" class="btn ghost" id="btn_iqm_done" style="padding:8px 20px;border-radius:10px">সম্পন্ন ✓</button>
          </div>
        `;

        var listEl = modal.querySelector("#iqm_questions_list");
        questions.forEach(function(q, qIdx) {
          var item = el("div");
          item.style.cssText = "background:rgba(255,255,255,0.04);border:1px solid var(--line);border-radius:12px;padding:14px 16px;display:flex;justify-content:space-between;align-items:flex-start;gap:14px";
          
          var letters = ["(ক)", "(খ)", "(গ)", "(ঘ)", "(ঙ)"];
          var optionsHTML = (q.options || []).map(function(opt, oIdx) {
            var isCor = (q.correct === oIdx);
            return `<div style="font-size:13px;color:${isCor ? '#34d399' : 'var(--mute)'};font-weight:${isCor ? '700' : '500'};margin-top:3px">${letters[oIdx] || ''} ${escHtml(opt)} ${isCor ? '✓ (সঠিক উত্তর)' : ''}</div>`;
          }).join('');

          item.innerHTML = `
            <div style="flex:1;min-width:0">
              <div style="font-size:14.5px;font-weight:700;color:var(--ink);margin-bottom:6px">
                <span style="color:var(--a);margin-right:6px">প্রশ্ন ${qIdx + 1}:</span> ${escHtml(q.question || 'প্রশ্ন উল্লেখ নেই')}
              </div>
              <div style="margin-left:14px">${optionsHTML}</div>
              ${q.explanation ? `<small style="display:block;margin-top:6px;margin-left:14px;color:#94a3b8;font-style:italic">ব্যাখ্যা: ${escHtml(q.explanation)}</small>` : ''}
            </div>
            <div style="display:flex;flex-direction:column;gap:6px;flex-shrink:0">
              <button type="button" class="btn ghost btn-iqm-edit" data-idx="${qIdx}" style="padding:4px 10px;font-size:12px;border-radius:8px">✏️ এডিট</button>
              <button type="button" class="btn dn btn-iqm-del" data-idx="${qIdx}" style="padding:4px 10px;font-size:12px;border-radius:8px">🗑️ মুছুন</button>
            </div>
          `;
          listEl.appendChild(item);
        });

        modal.querySelectorAll(".btn-iqm-edit").forEach(function(btnEl) {
          btnEl.onclick = function() {
            var idx = parseInt(btnEl.getAttribute("data-idx"), 10);
            openQuestionEditorModal(ch, questions[idx], idx, questions, function(savedQ) {
              questions[idx] = savedQ;
              saveQuestionsToDB();
            }, "form", { singleQuestionMode: true });
          };
        });

        modal.querySelectorAll(".btn-iqm-del").forEach(function(btnEl) {
          btnEl.onclick = function() {
            var idx = parseInt(btnEl.getAttribute("data-idx"), 10);
            if (!confirm("আপনি কি নিশ্চিতভাবে এই প্রশ্নটি মুছে ফেলতে চান?")) return;
            questions.splice(idx, 1);
            saveQuestionsToDB();
          };
        });

        modal.querySelector("#btn_modal_add_single_q").onclick = function() {
          openQuestionEditorModal(ch, null, -1, questions, function(newQ) {
            questions.push(newQ);
            saveQuestionsToDB();
          }, "form", { singleQuestionMode: true });
        };

        function close() {
          overlay.style.display = "none";
          overlay.style.pointerEvents = "none";
          overlay.remove();
          cleanupLingeringBackdrops();
        }
        modal.querySelector("#btn_modal_close_iqm").onclick = close;
        modal.querySelector("#btn_iqm_done").onclick = close;
        overlay.onclick = function(e) { if (e.target === overlay) { e.stopPropagation(); } };
      }

      function saveQuestionsToDB() {
        ts.questions = ts.questions || [];
        ts.qCount = ts.questions.length;
        ts.updatedAt = Date.now();
        try {
          localStorage.setItem("sr_local_ts_" + ch.id + "_" + ts.id, JSON.stringify(ts));
        } catch(e) {}
        var qPayload = {
          title: ts.title || (ch.name + " টেস্ট সেট"),
          questions: ts.questions,
          qCount: ts.questions.length,
          updatedAt: ts.updatedAt
        };
        (window.ensureAuth ? window.ensureAuth() : Promise.resolve()).then(function() {
          return Promise.all([
            db.ref("exam_chapter_tests/" + ch.id + "/" + ts.id).update(qPayload).catch(function(){}),
            db.ref("examSets/" + ch.id + "/" + ts.id).update(qPayload).catch(function(){}),
            db.ref("chapter_exams/" + ch.id + "/" + ts.id).update(qPayload).catch(function(){})
          ]);
        }).then(function() {
          toast("প্রশ্ন সংরক্ষিত হয়েছে ✓");
          renderManager();
          if (onSaved) onSaved();
        }).catch(function(err) {
          toast("ত্রুটি: " + err.message);
        });
      }

      overlay.appendChild(modal);
      document.body.appendChild(overlay);
      renderManager();
    }

    function loadAndRenderExamSets() {
      listContainer.innerHTML = "<p class='mute' style='text-align:center;padding:24px'>এক্সাম সেট লোড হচ্ছে...</p>";
      Promise.all([
        db.ref("exam_chapter_tests/" + ch.id).once("value").catch(function(){ return { val: function(){ return null; } }; }),
        db.ref("examSets/" + ch.id).once("value").catch(function(){ return { val: function(){ return null; } }; }),
        db.ref("chapter_exams/" + ch.id).once("value").catch(function(){ return { val: function(){ return null; } }; })
      ]).then(function(snaps){
        var val1 = snaps[0].val() || {};
        var val2 = snaps[1].val() || {};
        var val3 = snaps[2].val() || {};
        var merged = Object.assign({}, val3, val1, val2);

        // Merge locally cached sets for resilience
        try {
          for (var i = 0; i < localStorage.length; i++) {
            var lk = localStorage.key(i);
            if (lk && lk.indexOf("sr_local_ts_" + ch.id + "_") === 0) {
              var cached = JSON.parse(localStorage.getItem(lk));
              if (cached && cached.id && !merged[cached.id]) {
                merged[cached.id] = cached;
              }
            }
          }
        } catch(e){}

        var sets = [];
        if (merged && typeof merged === "object") {
          sets = Object.keys(merged)
            .filter(function(k){
              return !k.startsWith("_") && merged[k] && typeof merged[k] === "object" && (merged[k].title || merged[k].name);
            })
            .map(function(k){
              var item = merged[k];
              var normQs = Array.isArray(item.questions)
                ? item.questions
                : (item.questions && typeof item.questions === "object" ? Object.values(item.questions) : []);
              return {
                id: k,
                ...item,
                questions: normQs,
                title: item.title || item.name || (ch.name + " টেস্ট সেট")
              };
            });
        }

        renderExamSetCards(sets);
      }).catch(function(){
        renderExamSetCards([]);
      });
    }

    function renderExamSetCards(setList) {
      listContainer.textContent = "";
      if (!setList || !setList.length) {
        listContainer.innerHTML = `
          <div style="text-align:center;padding:40px 16px;background:rgba(30,41,59,0.5);border-radius:14px;border:1.5px dashed rgba(255,255,255,0.12);margin-top:10px">
            <div style="font-size:32px;margin-bottom:8px">📚</div>
            <h4 style="margin:0 0 6px;font-size:16px;color:#f8fafc">এই অধ্যায়ে এখনও কোনো এক্সাম সেট যোগ করা হয়নি</h4>
            <p class="mute" style="font-size:13px;margin:0 0 16px;color:#94a3b8">নিচের বা উপরের '➕ নতুন টেস্ট সেট যোগ করুন' বাটনে চাপ দিয়ে প্রথম এক্সাম সেট তৈরি করুন।</p>
            <button type="button" class="btn btn-green-gradient" id="btn_empty_add_test_set" style="padding:10px 22px;border-radius:10px;font-weight:700;font-size:14px;cursor:pointer">➕ নতুন টেস্ট সেট যোগ করুন</button>
          </div>
        `;
        var emptyAddBtn = listContainer.querySelector("#btn_empty_add_test_set");
        if (emptyAddBtn) {
          emptyAddBtn.onclick = function(e) {
            if (e && e.stopPropagation) e.stopPropagation();
            if (typeof window.__closeAdminDropdown === "function") window.__closeAdminDropdown();
            openTestSetEditorModal(ch, null, function(){
              loadAndRenderExamSets();
            }, null, activeSub);
          };
        }
        return;
      }

      var statsBar = el("div");
      statsBar.style.cssText = "display:flex;justify-content:space-between;align-items:center;padding:10px 16px;margin-bottom:14px;border-radius:12px;background:rgba(30,41,59,0.7);border:1px solid rgba(255,255,255,0.08);font-size:13px;color:#94a3b8";
      statsBar.innerHTML = "<span>মোট সক্রিয় এক্সাম সেট: <strong style='color:#f8fafc'>" + bn(setList.length) + "টি</strong></span><span style='color:#38bdf8;font-weight:700'>Option 2: Modern Glass Cards (Exam Sets)</span>";
      listContainer.appendChild(statsBar);

      // Question Cards List (Exam Sets)
      var qListContainer = el("div");
      qListContainer.style.cssText = "display:flex;flex-direction:column;overflow:visible;position:relative";

      // Global click listener to close open dropdown (bound once)
      function closeActiveDropdown() {
        if (window.__adminOpenDropdown) {
          window.__adminOpenDropdown.remove();
          window.__adminOpenDropdown = null;
        }
        if (window.__adminOpenCard) {
          window.__adminOpenCard.classList.remove("dropdown-active");
          window.__adminOpenCard.style.zIndex = "";
          window.__adminOpenCard = null;
        }
      }
      window.__closeAdminDropdown = closeActiveDropdown;
      if (!window.__ADMIN_DD_CLICK_BOUND__) {
        window.__ADMIN_DD_CLICK_BOUND__ = true;
        document.addEventListener("click", function(e) {
          if (!window.__adminOpenDropdown && !window.__adminOpenCard) return;
          if (!e.target.closest(".q-glass-actions-col")) {
            closeActiveDropdown();
          }
        });
      }

      setList.forEach(function(ts, idx){
        var card = el("div", "q-glass-card");
        card.style.cssText = "position:relative;overflow:visible";

        // Left info column (Title & Subtitle with Questions & Duration)
        var leftCol = el("div");
        leftCol.style.cssText = "flex:1;min-width:0";

        var qTitle = el("div", "q-glass-title");
        qTitle.textContent = ts.title;
        leftCol.appendChild(qTitle);

        var qLen = Array.isArray(ts.questions)
          ? ts.questions.length
          : (ts.questions && typeof ts.questions === "object" ? Object.keys(ts.questions).length : 0);
        var qNum = qLen > 0 ? qLen : (Number(ts.qCount) || 0);
        var dur = ts.durationMinutes || ts.timeLimit || 15;

        var timeBadge = el("div", "q-glass-time-badge");
        timeBadge.innerHTML = "মোট প্রশ্ন: " + bn(qNum) + "টি &nbsp;·&nbsp; সময়: " + bn(dur) + " মিনিট";
        leftCol.appendChild(timeBadge);

        card.appendChild(leftCol);

        // Right actions column (Edit on top, Remove underneath, matching image_f232fbf4.png)
        var actionsCol = el("div", "q-glass-actions-col");
        actionsCol.style.cssText = "position:relative;overflow:visible;z-index:9999";

        // Yellow Edit Button
        var editBtn = el("button", "btn-glass-edit");
        editBtn.type = "button";
        editBtn.innerHTML = "✏️ এডিট";
        actionsCol.appendChild(editBtn);

        // Red Remove Button with Firebase remove() binding & confirm prompt (Requirement 4)
        var removeBtn = el("button", "btn-glass-remove");
        removeBtn.type = "button";
        removeBtn.innerHTML = "🗑️ রিমুভ";
        removeBtn.addEventListener("click", function(e) {
          e.preventDefault();
          e.stopPropagation();
          closeActiveDropdown();
          cleanupLingeringBackdrops();

          if (!confirm("আপনি কি নিশ্চিত এই সেটটি মুছে ফেলতে চান? (" + ts.title + ")")) return;

          removeBtn.disabled = true;
          removeBtn.innerHTML = "⏳ ডিলিট হচ্ছে...";

          sessionStorage.setItem('ch_deleted_' + ch.id, '1');
          try {
            localStorage.removeItem("sr_local_ts_" + ch.id + "_" + ts.id);
            localStorage.removeItem("sr_local_time_" + ch.id + "_" + ts.id);
          } catch(err) {}

          var targetId = ts.id;
          var subId = (typeof activeSub !== "undefined" && activeSub && activeSub.id) ? activeSub.id : "";

          (window.ensureAuth ? window.ensureAuth() : Promise.resolve()).then(function() {
            var p1 = db.ref("exam_chapter_tests/" + ch.id + "/" + targetId).remove();
            var p2 = db.ref("examSets/" + ch.id + "/" + targetId).remove();
            var p3 = subId ? db.ref("subjects/" + subId + "/chapters/" + ch.id + "/examSets/" + targetId).remove().catch(function(){}) : Promise.resolve();
            var p4 = db.ref("subjects/chapters/" + ch.id + "/examSets/" + targetId).remove().catch(function(){});
            var p5 = db.ref("chapter_exams/" + ch.id + "/" + targetId).remove().catch(function(){});
            var p6 = db.ref("exam_sets/" + ch.id + "/" + targetId).remove().catch(function(){});
            var p7 = db.ref("examSets/" + targetId).remove().catch(function(){});
            var p8 = db.ref("exam_chapter_tests/" + ch.id + "/_initialized").set(true);

            Promise.all([p1, p2, p3, p4, p5, p6, p7]).then(function() {
              toast("এক্সাম সেটটি সফলভাবে মুছে ফেলা হয়েছে ✓");
              card.remove();
              cleanupLingeringBackdrops();
              loadAndRenderExamSets();
            }).catch(function(err) {
              console.warn("Delete fallback:", err);
              db.ref("exam_chapter_tests/" + ch.id + "/" + targetId).set(null);
              db.ref("examSets/" + ch.id + "/" + targetId).set(null);
              db.ref("exam_chapter_tests/" + ch.id + "/_initialized").set(true);
              toast("এক্সাম সেটটি মুছে ফেলা হয়েছে ✓");
              card.remove();
              cleanupLingeringBackdrops();
              loadAndRenderExamSets();
            });
          });
        });
        actionsCol.appendChild(removeBtn);

        // Edit button click -> toggles 4-Button Edit System Menu (Requirement 2: z-index 99999)
        editBtn.addEventListener("click", function(e) {
          e.stopPropagation();
          var existingMenu = actionsCol.querySelector(".q-edit-dropdown");
          if (existingMenu) {
            closeActiveDropdown();
            return;
          }
          closeActiveDropdown();

          // Elevate current card to top layer so dropdown is never covered
          window.__adminOpenCard = card;
          card.classList.add("dropdown-active");
          card.style.zIndex = "9999";

          var dropdown = el("div", "q-edit-dropdown");
          dropdown.style.zIndex = "99999";
          dropdown.style.position = "absolute";
          window.__adminOpenDropdown = dropdown;

          dropdown.innerHTML = `
            <div class="q-edit-dropdown-header">🛠️ ৪-বাটন এডিট সিস্টেম</div>
            
            <button type="button" class="q-edit-dropdown-item" id="opt_set_name_edit">
              <span style="font-size:16px;margin-right:8px;line-height:1">✏️</span>
              <div style="flex:1">
                <div style="font-weight:700;color:#f8fafc">১. Set Name Edit</div>
                <div style="font-size:11px;color:#94a3b8">সেটের নাম/টাইটেল পরিবর্তন</div>
              </div>
            </button>

            <button type="button" class="q-edit-dropdown-item" id="opt_set_time_edit">
              <span style="font-size:16px;margin-right:8px;line-height:1">⏱️</span>
              <div style="flex:1">
                <div style="font-weight:700;color:#f8fafc">২. Time Edit</div>
                <div style="font-size:11px;color:#94a3b8">নির্ধারিত সময়সীমা পরিবর্তন</div>
              </div>
            </button>

            <button type="button" class="q-edit-dropdown-item" id="opt_set_individual_edit">
              <span style="font-size:16px;margin-right:8px;line-height:1">📝</span>
              <div style="flex:1">
                <div style="font-weight:700;color:#f8fafc">৩. Individual Qn Edit</div>
                <div style="font-size:11px;color:#94a3b8">একক প্রশ্ন ফর্ম এডিটর</div>
              </div>
            </button>

            <button type="button" class="q-edit-dropdown-item" id="opt_set_json_edit">
              <span style="font-size:16px;margin-right:8px;line-height:1">💻</span>
              <div style="flex:1">
                <div style="font-weight:700;color:#f8fafc">৪. Full JSON File Edit</div>
                <div style="font-size:11px;color:#94a3b8">সব প্রশ্ন একসাথে JSON এডিট</div>
              </div>
            </button>
          `;

          // ১. Set Name Edit
          dropdown.querySelector("#opt_set_name_edit").onclick = function(ev) {
            ev.stopPropagation();
            closeActiveDropdown();
            openSetNameEditModal(ch, ts, function(){
              loadAndRenderExamSets();
            });
          };

          // ২. Time Edit
          dropdown.querySelector("#opt_set_time_edit").onclick = function(ev) {
            ev.stopPropagation();
            closeActiveDropdown();
            openTimeEditModal(ch, ts, function(){
              loadAndRenderExamSets();
            });
          };

          // ৩. Individual Qn Edit
          dropdown.querySelector("#opt_set_individual_edit").onclick = function(ev) {
            ev.stopPropagation();
            closeActiveDropdown();
            openIndividualQuestionManagerModal(ch, ts, function(){
              loadAndRenderExamSets();
            });
          };

          // ৪. Full JSON File Edit
          dropdown.querySelector("#opt_set_json_edit").onclick = function(ev) {
            ev.stopPropagation();
            closeActiveDropdown();
            openTestSetEditorModal(ch, ts, function(){
              loadAndRenderExamSets();
            }, "json", activeSub);
          };

          actionsCol.appendChild(dropdown);
          window.__adminOpenDropdown = dropdown;
        });

        card.appendChild(actionsCol);
        qListContainer.appendChild(card);
      });

      listContainer.appendChild(qListContainer);
    }

    loadAndRenderExamSets();
    container.appendChild(qCard);
    return;
  }

  // LEVEL 2: অধ্যায় পরিচালনা (Graphical Cards & Dynamic Navigation, No '২. অধ্যায়...' Title)
  if (selectedSubId && !selectedChapId) {
    var activeSub = filteredSubs.find(function(s){ return s.id === selectedSubId; });
    if (!activeSub) {
      selectedSubId = null;
      renderQBankView(container, allSubs);
      return;
    }

    var chapCard = el("div", "card");
    chapCard.id = "admin_chap_card";

    // Top Header with Back to Subjects & Add Chapter (Removed "২. অধ্যায় নির্বাচন ও পরিচালনা")
    var chHeader = el("div", "sw");
    chHeader.style.cssText = "align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;border-bottom:1px solid var(--line);padding-bottom:14px;margin-bottom:16px";

    var leftSide = el("div");
    leftSide.style.cssText = "display:flex;align-items:center;gap:12px;flex-wrap:wrap";

    var backToSubsBtn = btn("← সকল বিষয়ে ফিরে যান", null, function(){
      selectedSubId = null;
      selectedChapId = null;
      renderQBankView(container, allSubs);
    });
    backToSubsBtn.className = "btn btn-green-gradient";
    backToSubsBtn.style.cssText = "padding:7px 16px;font-size:13px;border-radius:10px;font-weight:700;cursor:pointer";
    leftSide.appendChild(backToSubsBtn);

    var titleHeader = el("div");
    titleHeader.innerHTML = "<h3 style='margin:0;font-size:18px;color:var(--ink)'><span style='color:var(--a)'>" + escHtml(activeSub.titleBn) + "</span> <small class='mute' style='font-size:12px;font-weight:600'>(" + escHtml(activeExamCategory) + " — " + (activeSub.chapters ? activeSub.chapters.length : 0) + "টি অধ্যায়)</small></h3>";
    leftSide.appendChild(titleHeader);
    chHeader.appendChild(leftSide);

    function openAddChapterModal(subObj, onSaved) {
      cleanupLingeringBackdrops();

      var overlay = el("div", "admin-modal-backdrop");
      overlay.setAttribute("data-admin-overlay", "true");
      overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.85);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:999999;padding:16px";
      
      var m = el("div", "card admin-modal-dialog");
      m.onclick = function(e){ e.stopPropagation(); };
      m.onmousedown = function(e){ e.stopPropagation(); };
      m.style.cssText = "width:100%;max-width:520px;background:var(--card);border:1.5px solid rgba(52,211,153,0.5);border-radius:18px;padding:24px;box-shadow:0 24px 50px rgba(0,0,0,0.8);z-index:1000000;position:relative";
      
      var existingChs = (subObj && subObj.chapters) ? subObj.chapters : [];
      var nextNum = existingChs.length + 1;
      
      m.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:12px">
          <div>
            <h3 style="margin:0 0 4px;font-size:18px;color:var(--ink);display:flex;align-items:center;gap:6px">
              <span>📂</span> নতুন চ্যাপ্টার যোগ করুন
            </h3>
            <p class="mute" style="margin:0;font-size:12.5px;color:#34d399">বিষয়: ${escHtml(subObj ? subObj.titleBn : '')}</p>
          </div>
          <button type="button" id="btn_close_add_ch_modal" style="background:transparent;border:none;color:var(--mute);font-size:22px;cursor:pointer;padding:0 4px">✕</button>
        </div>
        
        <div style="margin-bottom:12px">
          <label class="mute" style="font-size:13px;font-weight:600;display:block;margin-bottom:4px">অধ্যায় নম্বর (Chapter Number):</label>
          <input type="number" id="inp_ch_num" min="1" max="100" value="${nextNum}" placeholder="যেমন: 1, 2, 5" style="width:100%;padding:10px 12px;border-radius:10px;border:1.5px solid var(--line);font:inherit;background:var(--bg);color:var(--ink);box-sizing:border-box;font-weight:700" />
        </div>

        <div style="margin-bottom:12px">
          <label class="mute" style="font-size:13px;font-weight:600;display:block;margin-bottom:4px">অধ্যায়ের নাম (Chapter Name):</label>
          <input type="text" id="inp_ch_name" placeholder="যেমন: পরিবেশ রসায়ন, ভেক্টর, গতিবিদ্যা..." style="width:100%;padding:10px 12px;border-radius:10px;border:1.5px solid var(--line);font:inherit;background:var(--bg);color:var(--ink);box-sizing:border-box" />
          <div id="add_ch_err" style="color:var(--danger);font-size:12.5px;margin-top:6px;min-height:1.2em"></div>
        </div>

        <div style="margin-bottom:16px">
          <label class="mute" style="font-size:13px;font-weight:600;display:block;margin-bottom:6px">৩ডি থিম ও আইকন নির্বাচন (3D Theme):</label>
          <div id="theme_icon_picker" style="display:grid;grid-template-columns:repeat(4, 1fr);gap:8px">
            <button type="button" class="btn ghost theme-icon-choice active" data-icon="🔬" style="padding:8px 4px;font-size:13px;border-radius:10px;border:1.5px solid #10b981;background:rgba(52,211,153,0.15);color:var(--ink);cursor:pointer">🔬 ল্যাব</button>
            <button type="button" class="btn ghost theme-icon-choice" data-icon="📐" style="padding:8px 4px;font-size:13px;border-radius:10px;border:1.5px solid var(--line);background:var(--bg);color:var(--ink);cursor:pointer">📐 ভেক্টর</button>
            <button type="button" class="btn ghost theme-icon-choice" data-icon="⚛️" style="padding:8px 4px;font-size:13px;border-radius:10px;border:1.5px solid var(--line);background:var(--bg);color:var(--ink);cursor:pointer">⚛️ কোয়ান্টাম</button>
            <button type="button" class="btn ghost theme-icon-choice" data-icon="🌿" style="padding:8px 4px;font-size:13px;border-radius:10px;border:1.5px solid var(--line);background:var(--bg);color:var(--ink);cursor:pointer">🌿 জীব</button>
            <button type="button" class="btn ghost theme-icon-choice" data-icon="⚡" style="padding:8px 4px;font-size:13px;border-radius:10px;border:1.5px solid var(--line);background:var(--bg);color:var(--ink);cursor:pointer">⚡ তড়িৎ</button>
            <button type="button" class="btn ghost theme-icon-choice" data-icon="💻" style="padding:8px 4px;font-size:13px;border-radius:10px;border:1.5px solid var(--line);background:var(--bg);color:var(--ink);cursor:pointer">💻 আইসিটি</button>
            <button type="button" class="btn ghost theme-icon-choice" data-icon="🧪" style="padding:8px 4px;font-size:13px;border-radius:10px;border:1.5px solid var(--line);background:var(--bg);color:var(--ink);cursor:pointer">🧪 রসায়ন</button>
            <button type="button" class="btn ghost theme-icon-choice" data-icon="📖" style="padding:8px 4px;font-size:13px;border-radius:10px;border:1.5px solid var(--line);background:var(--bg);color:var(--ink);cursor:pointer">📖 সাহিত্য</button>
          </div>
        </div>

        <div class="row" style="display:flex;gap:10px;margin-top:16px">
          <button type="button" class="btn btn-green-gradient" id="btn_save_new_chapter" style="flex:1;padding:12px;border-radius:10px;font-weight:700">💾 চ্যাপ্টার সেভ করুন</button>
          <button type="button" class="btn ghost" id="btn_cancel_add_chapter" style="flex:1;padding:12px;border-radius:10px;font-weight:600">বাতিল</button>
        </div>
      `;

      overlay.appendChild(m);
      document.body.appendChild(overlay);

      var inpNum = m.querySelector("#inp_ch_num");
      var inpName = m.querySelector("#inp_ch_name");
      var errEl = m.querySelector("#add_ch_err");
      var selectedIcon = "🔬";

      m.querySelectorAll(".theme-icon-choice").forEach(function(btnCh) {
        btnCh.onclick = function() {
          m.querySelectorAll(".theme-icon-choice").forEach(function(b) {
            b.style.borderColor = "var(--line)";
            b.style.background = "var(--bg)";
          });
          btnCh.style.borderColor = "#10b981";
          btnCh.style.background = "rgba(52,211,153,0.15)";
          selectedIcon = btnCh.getAttribute("data-icon");
        };
      });

      setTimeout(function(){ if(inpName) inpName.focus(); }, 60);

      function close() {
        overlay.style.display = "none";
        overlay.style.pointerEvents = "none";
        overlay.remove();
        cleanupLingeringBackdrops();
      }

      m.querySelector("#btn_close_add_ch_modal").onclick = close;
      m.querySelector("#btn_cancel_add_chapter").onclick = close;
      overlay.onclick = function(e){ if(e.target === overlay) { e.stopPropagation(); } };

      m.querySelector("#btn_save_new_chapter").onclick = function() {
        var cNum = parseInt(inpNum.value, 10) || nextNum;
        var cName = inpName.value.trim();
        if (!cName) {
          errEl.textContent = "অধ্যায়ের নাম লিখুন।";
          inpName.focus();
          return;
        }

        var btnSave = m.querySelector("#btn_save_new_chapter");
        btnSave.disabled = true;
        btnSave.textContent = "⏳ সেভ হচ্ছে...";

        var chapters = (subObj && Array.isArray(subObj.chapters)) ? subObj.chapters : [];
        var newChapId = (subObj ? subObj.id : "ch") + "_ch" + cNum + "_" + Date.now().toString(36);
        var newChapterObj = {
          id: newChapId,
          num: cNum,
          name: cName,
          icon: selectedIcon,
          theme3d: selectedIcon,
          createdAt: Date.now()
        };
        chapters.push(newChapterObj);
        if (subObj) {
          subObj.chapters = chapters;
          delete subObj.noChapters;
        }

        var isDone = false;
        function finishSave() {
          if (isDone) return;
          isDone = true;
          if (subObj) {
            subObj.chapters = chapters;
            delete subObj.noChapters;
          }
          try {
            localStorage.setItem("sr_custom_subject_" + subObj.id, JSON.stringify(subObj));
          } catch(e) {}
          toast("নতুন চ্যাপ্টার সফলভাবে যোগ হয়েছে ✓");
          close();
          if (onSaved) onSaved(newChapterObj);
        }

        // Safety fallback timer so save never hangs or freezes
        var saveTimer = setTimeout(finishSave, 2000);

        try {
          if (db && subObj) {
            delete subObj.noChapters;
            var p1 = db.ref("exam_subjects/" + subObj.id).set(subObj);
            var p2 = db.ref("exam_subjects/" + subObj.id + "/chapters").set(chapters);
            var p3 = db.ref("subjects/" + subObj.id).set(subObj).catch(function(){});
            var p4 = db.ref("exam_subjects/" + subObj.id + "/noChapters").remove().catch(function(){});
            Promise.all([p1, p2, p3, p4]).then(function() {
              clearTimeout(saveTimer);
              finishSave();
            }).catch(function(err) {
              console.warn("Chapter save fallback note:", err);
              clearTimeout(saveTimer);
              finishSave();
            });
          } else {
            clearTimeout(saveTimer);
            finishSave();
          }
        } catch(e) {
          clearTimeout(saveTimer);
          finishSave();
        }
      };
    }

    // Expose global invoker
    window.openAddChapterModalGlobal = function() {
      cleanupLingeringBackdrops();
      openAddChapterModal(activeSub, function() {
        renderQBankView(container, allSubs);
      });
    };

    var addChBtn = btn("➕ নতুন চ্যাপ্টার যোগ করুন", null, function(e) {
      if (e && e.stopPropagation) e.stopPropagation();
      cleanupLingeringBackdrops();
      openAddChapterModal(activeSub, function() {
        renderQBankView(container, allSubs);
      });
    });
    addChBtn.id = "btn_admin_add_new_chapter";
    addChBtn.className = "btn btn-green-gradient";
    addChBtn.style.cssText = "padding:9px 20px;border-radius:10px;font-size:13.5px;font-weight:700;cursor:pointer";
    chHeader.appendChild(addChBtn);
    chapCard.appendChild(chHeader);

    var chapters = activeSub.chapters || [];
    if (!chapters.length) {
      var emptyBox = el("div");
      emptyBox.innerHTML = `
        <div style="text-align:center;padding:40px 16px;background:rgba(30,41,59,0.5);border-radius:14px;border:1.5px dashed rgba(52,211,153,0.3);margin-top:10px">
          <div style="font-size:32px;margin-bottom:8px">📖</div>
          <h4 style="margin:0 0 6px;font-size:16px;color:var(--ink)">এই বিষয়ের অধীনে এখনও কোনো চ্যাপ্টার নেই</h4>
          <p class="mute" style="font-size:13px;margin:0 0 16px">নিচের বা উপরের '➕ নতুন চ্যাপ্টার যোগ করুন' বাটনে চাপ দিয়ে প্রথম চ্যাপ্টার যুক্ত করুন।</p>
          <button type="button" class="btn btn-green-gradient" id="btn_empty_add_chapter" style="padding:10px 22px;border-radius:10px;font-weight:700;font-size:14px;cursor:pointer">➕ নতুন চ্যাপ্টার যোগ করুন</button>
        </div>
      `;
      var emptyAddChBtn = emptyBox.querySelector("#btn_empty_add_chapter");
      if (emptyAddChBtn) {
        emptyAddChBtn.onclick = function(e) {
          if (e && e.stopPropagation) e.stopPropagation();
          cleanupLingeringBackdrops();
          openAddChapterModal(activeSub, function() {
            renderQBankView(container, allSubs);
          });
        };
      }
      chapCard.appendChild(emptyBox);
      container.appendChild(chapCard);
      return;
    }

    var chList = el("div");
    chList.style.cssText = "display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;margin-top:14px";

    chapters.forEach(function(ch) {
      var row = el("div", "sub-card-glossy-green");
      row.style.cssText = "padding:16px;border-radius:14px;background:linear-gradient(135deg, #022c22 0%, #064e3b 50%, #047857 100%) !important;border:1.5px solid rgba(52,211,153,0.35) !important;box-shadow:0 6px 20px rgba(0,0,0,0.3) !important;transition:all .2s ease;display:flex;flex-direction:column;justify-content:space-between;gap:14px;cursor:pointer;color:#fff !important";

      var top = el("div");
      top.innerHTML = "<div style='color:#34d399;font-weight:700;font-size:13px;margin-bottom:4px'>অধ্যায় " + escHtml(ch.num) + "</div><div style='font-size:16px;font-weight:700;color:#f8fafc;line-height:1.4'>" + escHtml(ch.name) + "</div>";
      top.onclick = function() {
        cleanupLingeringBackdrops();
        selectedChapId = ch.id;
        renderQBankView(container, allSubs);
      };
      row.appendChild(top);

      var footer = el("div");
      footer.style.cssText = "display:flex;align-items:center;justify-content:space-between;gap:8px;border-top:1px solid rgba(255,255,255,0.18);padding-top:12px;margin:0;flex-wrap:wrap";

      var openJsonBtn = el("button", "btn btn-green-gradient");
      openJsonBtn.type = "button";
      openJsonBtn.innerHTML = "📋 প্রশ্ন ও টেস্ট সেট ›";
      openJsonBtn.style.cssText = "padding:7px 14px;font-size:12.5px;border-radius:8px;font-weight:700;cursor:pointer";
      openJsonBtn.onclick = function(e) {
        e.stopPropagation();
        cleanupLingeringBackdrops();
        selectedChapId = ch.id;
        renderQBankView(container, allSubs);
      };
      footer.appendChild(openJsonBtn);

      var actBtns = el("div");
      actBtns.style.cssText = "display:flex;gap:6px;align-items:center";

      var editBtn = el("button", "btn-glass-edit");
      editBtn.type = "button";
      editBtn.innerHTML = "✏️ এডিট";
      editBtn.title = "অধ্যায় এডিট করুন";
      editBtn.style.cssText = "padding:6px 12px;font-size:12px;border-radius:8px;cursor:pointer;font-weight:700";
      editBtn.onclick = function(e) {
        e.stopPropagation();
        var newName = prompt("অধ্যায়ের নতুন নাম লিখুন:", ch.name);
        if (!newName || !newName.trim() || newName.trim() === ch.name) return;
        ch.name = newName.trim();
        try {
          localStorage.setItem("sr_custom_subject_" + activeSub.id, JSON.stringify(activeSub));
        } catch(err) {}
        db.ref("exam_subjects/" + activeSub.id).set(activeSub);
        db.ref("exam_subjects/" + activeSub.id + "/chapters").set(chapters).then(function() {
          toast("চ্যাপ্টারের নাম আপডেট হয়েছে ✓");
          renderQBankView(container, allSubs);
        });
      };
      actBtns.appendChild(editBtn);

      var delChBtn = el("button", "btn-glass-remove");
      delChBtn.type = "button";
      delChBtn.innerHTML = "🗑️ রিমুভ";
      delChBtn.title = "অধ্যায় ডিলিট করুন";
      delChBtn.style.cssText = "padding:6px 12px;font-size:12px;border-radius:8px;cursor:pointer;font-weight:700";
      delChBtn.onclick = function(e) {
        e.stopPropagation();
        if (!confirm("আপনি কি নিশ্চিতভাবে '" + ch.name + "' চ্যাপ্টারটি ডিলিট করতে চান? এর অধীনে থাকা সমস্ত প্রশ্ন মুছে যাবে।")) return;
        var remaining = chapters.filter(function(c) { return c.id !== ch.id; });
        activeSub.chapters = remaining;
        if (remaining.length === 0) activeSub.noChapters = true;
        else delete activeSub.noChapters;
        try {
          localStorage.setItem("sr_custom_subject_" + activeSub.id, JSON.stringify(activeSub));
          Object.keys(localStorage).forEach(function(lk) {
            if (lk.indexOf("sr_local_ts_" + ch.id + "_") === 0 || lk.indexOf("sr_local_time_" + ch.id + "_") === 0) {
              localStorage.removeItem(lk);
            }
          });
        } catch(err) {}
        var subPayload = Object.assign({}, activeSub, { chapters: remaining });
        if (remaining.length === 0) subPayload.noChapters = true;
        db.ref("exam_subjects/" + activeSub.id).set(subPayload).then(function() {
          db.ref("subjects/" + activeSub.id).set(subPayload).catch(function(){});
          db.ref("exam_questions/" + ch.id).remove().catch(function(){});
          db.ref("exam_chapter_tests/" + ch.id).remove().catch(function(){});
          db.ref("examSets/" + ch.id).remove().catch(function(){});
          db.ref("chapter_exams/" + ch.id).remove().catch(function(){});
          toast("চ্যাপ্টার ডিলিট করা হয়েছে ✓");
          renderQBankView(container, allSubs);
        });
      };
      actBtns.appendChild(delChBtn);

      footer.appendChild(actBtns);
      row.appendChild(footer);
      chList.appendChild(row);
    });

    chapCard.appendChild(chList);
    container.appendChild(chapCard);
    return;
  }

  // LEVEL 1: বিষয় নির্বাচন করুন (মূল স্ক্রিন)
  var subCard = el("div", "card");
  var subHeader = el("div", "sw");
  subHeader.style.cssText = "align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;border-bottom:1px solid var(--line);padding-bottom:12px;margin-bottom:16px";
  
  var titleH = el("h3", null, "১. বিষয় নির্বাচন করুন (Subject Hierarchy) — " + activeExamCategory);
  titleH.style.margin = "0";
  subHeader.appendChild(titleH);

  function openAddSubjectModal(onSaved) {
    var overlay = el("div", "admin-modal-backdrop");
    overlay.setAttribute("data-admin-overlay", "true");
    overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.82);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:1000;padding:16px";
    
    var m = el("div", "card admin-modal-dialog");
    m.onclick = function(e){ e.stopPropagation(); };
    m.onmousedown = function(e){ e.stopPropagation(); };
    m.style.cssText = "width:100%;max-width:520px;background:var(--card);border:1.5px solid var(--line);border-radius:18px;padding:24px;box-shadow:0 24px 50px rgba(0,0,0,0.7);z-index:1050;position:relative";
    
    m.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;border-bottom:1px solid var(--line);padding-bottom:12px">
        <div>
          <h3 style="margin:0 0 4px;font-size:18px;color:var(--ink)">📚 নতুন বিষয় যোগ করুন</h3>
          <p class="mute" style="margin:0;font-size:12.5px">ক্যাটাগরি: ${escHtml(activeExamCategory)} — প্রিমিয়াম Glossy Green থিম</p>
        </div>
        <button type="button" id="btn_close_add_sub_modal" style="background:transparent;border:none;color:var(--mute);font-size:22px;cursor:pointer;padding:0 4px">✕</button>
      </div>
      
      <div style="margin-bottom:12px">
        <label class="mute" style="font-size:13px;font-weight:600;display:block;margin-bottom:4px">বিষয়ের নাম (বাংলায়):</label>
        <input type="text" id="inp_sub_name_bn" placeholder="যেমন: তথ্য ও যোগাযোগ প্রযুক্তি, পদার্থবিজ্ঞান..." style="width:100%;padding:10px 12px;border-radius:10px;border:1.5px solid var(--line);font:inherit;background:var(--bg);color:var(--ink);box-sizing:border-box" />
        <div id="add_sub_err" style="color:var(--danger);font-size:12.5px;margin-top:6px;min-height:1.2em"></div>
      </div>

      <div style="margin-bottom:12px">
        <label class="mute" style="font-size:13px;font-weight:600;display:block;margin-bottom:4px">English Name (ঐচ্ছিক):</label>
        <input type="text" id="inp_sub_name_en" placeholder="e.g. ICT, Physics 1st Paper..." style="width:100%;padding:10px 12px;border-radius:10px;border:1.5px solid var(--line);font:inherit;background:var(--bg);color:var(--ink);box-sizing:border-box" />
      </div>

      <div style="margin-bottom:14px;padding:12px;border-radius:12px;background:linear-gradient(135deg, #022c22 0%, #064e3b 35%, #059669 70%, #10b981 100%);border:1px solid rgba(52,211,153,0.5);color:#fff">
        <div style="font-size:12px;font-weight:700;color:#a7f3d0;margin-bottom:3px">🎨 ডিফল্ট থিম: Glossy Dark Light Gradient Green</div>
        <div style="font-size:12px;color:#e2e8f0">গাঢ় ডার্ক-সবুজ থেকে লাইট নিয়ন গ্রিন গ্লসি গ্রেডিয়েন্ট স্বয়ংক্রিয়ভাবে প্রযুক্ত হবে।</div>
      </div>

      <div class="row" style="display:flex;gap:10px;margin-top:16px">
        <button type="button" class="btn" id="btn_save_new_subject" style="flex:1;padding:12px;border-radius:10px;font-weight:700">💾 বিষয় তৈরি করুন</button>
        <button type="button" class="btn ghost" id="btn_cancel_add_subject" style="flex:1;padding:12px;border-radius:10px;font-weight:600">বাতিল</button>
      </div>
    `;

    overlay.appendChild(m);
    document.body.appendChild(overlay);

    var inpBn = m.querySelector("#inp_sub_name_bn");
    var inpEn = m.querySelector("#inp_sub_name_en");
    var errEl = m.querySelector("#add_sub_err");

    setTimeout(function(){ if(inpBn) inpBn.focus(); }, 60);

    function close() {
      overlay.style.display = "none";
      overlay.style.pointerEvents = "none";
      overlay.remove();
      cleanupLingeringBackdrops();
    }

    m.querySelector("#btn_close_add_sub_modal").onclick = close;
    m.querySelector("#btn_cancel_add_subject").onclick = close;
    overlay.onclick = function(e){ if(e.target === overlay) { e.stopPropagation(); } };

    m.querySelector("#btn_save_new_subject").onclick = function() {
      var nameBn = inpBn.value.trim();
      if (!nameBn) {
        errEl.textContent = "বিষয়ের নাম বাংলায় লিখুন।";
        inpBn.focus();
        return;
      }
      var nameEn = inpEn.value.trim() || nameBn;
      var btnSave = m.querySelector("#btn_save_new_subject");
      btnSave.disabled = true;
      btnSave.textContent = "⏳ তৈরি হচ্ছে...";

      var newId = "subj_" + activeExamCategory.toLowerCase() + "_" + Date.now();
      var newSub = {
        id: newId,
        category: activeExamCategory,
        titleBn: nameBn,
        titleEn: nameEn,
        tag: activeExamCategory + " প্রস্তুতি",
        theme: "glossy_green",
        gradient: "linear-gradient(135deg, #022c22 0%, #064e3b 35%, #059669 70%, #10b981 100%)",
        borderGlow: "rgba(52, 211, 153, 0.9)",
        neonGlow: "rgba(16, 185, 129, 0.6)",
        chapters: [],
        noChapters: true
      };

      var isSubDone = false;
      function finishSubSave() {
        if (isSubDone) return;
        isSubDone = true;
        selectedSubId = newId;
        selectedChapId = null;
        try {
          localStorage.setItem("sr_custom_subject_" + newId, JSON.stringify(newSub));
        } catch(e) {}
        if (!allSubs.some(function(x){ return x.id === newSub.id; })) {
          allSubs.push(newSub);
        }
        toast("নতুন বিষয় তৈরি হয়েছে ✓");
        close();
        if (onSaved) onSaved(newSub);
      }
      var subTimer = setTimeout(finishSubSave, 2000);

      try {
        if (db) {
          var pSub1 = db.ref("exam_subjects/" + newId).set(newSub);
          var pSub2 = db.ref("subjects/" + newId).set(newSub).catch(function(){});
          var pSub3 = db.ref("exam_deleted_subjects/" + newId).remove().catch(function(){});
          Promise.all([pSub1, pSub2, pSub3]).then(function() {
            clearTimeout(subTimer);
            finishSubSave();
          }).catch(function() {
            clearTimeout(subTimer);
            finishSubSave();
          });
        } else {
          clearTimeout(subTimer);
          finishSubSave();
        }
      } catch(e) {
        clearTimeout(subTimer);
        finishSubSave();
      }
    };
  }

  var addSubBtn = btn("➕ নতুন বিষয় যোগ করুন", null, function(e) {
    if (e && e.stopPropagation) e.stopPropagation();
    cleanupLingeringBackdrops();
    openAddSubjectModal(function() {
      renderQBankView(container, allSubs);
    });
  });
  addSubBtn.id = "btn_admin_add_new_subject";
  addSubBtn.className = "btn btn-green-gradient";
  addSubBtn.style.cssText = "padding:9px 20px;border-radius:10px;font-size:13.5px;font-weight:700;cursor:pointer";
  subHeader.appendChild(addSubBtn);
  subCard.appendChild(subHeader);

  var subGrid = el("div");
  subGrid.style.cssText = "display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px;margin:14px 0";

  if (!filteredSubs.length) {
    var emptyDiv = el("div");
    emptyDiv.style.cssText = "grid-column: 1 / -1; text-align:center; padding:40px 16px; background:rgba(30,41,59,0.5); border-radius:14px; border:1.5px dashed rgba(52,211,153,0.3); margin:14px 0";
    emptyDiv.innerHTML = `
      <div style="font-size:32px;margin-bottom:8px">📚</div>
      <h4 style="margin:0 0 6px;font-size:16px;color:#f8fafc">${escHtml(activeExamCategory)} ক্যাটাগরিতে এখনও কোনো বিষয় যোগ করা হয়নি</h4>
      <p class="mute" style="font-size:13px;margin:0 0 16px;color:#94a3b8">নিচের বাটনে চাপ দিয়ে প্রথম বিষয় ও অধ্যায় যুক্ত করুন।</p>
      <button type="button" class="btn btn-green-gradient" id="btn_empty_add_sub" style="padding:10px 22px;border-radius:10px;font-weight:700;font-size:14px;cursor:pointer">➕ নতুন বিষয় যোগ করুন</button>
    `;
    var emptyAddBtn = emptyDiv.querySelector("#btn_empty_add_sub");
    if (emptyAddBtn) {
      emptyAddBtn.onclick = function(e) {
        if (e && e.stopPropagation) e.stopPropagation();
        cleanupLingeringBackdrops();
        openAddSubjectModal(function() {
          renderQBankView(container, allSubs);
        });
      };
    }
    subGrid.appendChild(emptyDiv);
  } else {
    filteredSubs.forEach(function(s) {
      var card = el("div", "sub-card-glossy-green");
      card.style.cssText = "padding:18px;border-radius:14px;cursor:pointer;display:flex;flex-direction:column;justify-content:space-between;gap:14px;background:linear-gradient(135deg, #022c22 0%, #064e3b 35%, #059669 70%, #10b981 100%) !important;border:1.5px solid rgba(52,211,153,0.45) !important;box-shadow:0 10px 28px rgba(5,150,105,0.22), 0 0 18px rgba(16,185,129,0.25) !important;color:#fff !important;";
      
      var top = el("div");
      top.onclick = function() {
        cleanupLingeringBackdrops();
        selectedSubId = s.id;
        selectedChapId = null;
        renderQBankView(container, allSubs);
      };
      var tag = el("div", "mute", s.titleEn || activeExamCategory);
      tag.style.cssText = "font-size:11.5px;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;font-weight:700;color:#a7f3d0";
      var title = el("div", null, s.titleBn);
      title.style.cssText = "font-size:17px;font-weight:700;color:#f8fafc;line-height:1.4";
      var count = el("div", "mute", (s.chapters ? s.chapters.length : 0) + "টি অধ্যায় সংযুক্ত");
      count.style.cssText = "font-size:12.5px;margin-top:6px;color:#d1fae5";
      top.appendChild(tag);
      top.appendChild(title);
      top.appendChild(count);
      card.appendChild(top);

      var actions = el("div");
      actions.style.cssText = "display:flex;justify-content:space-between;align-items:center;border-top:1px solid rgba(255,255,255,0.18);padding-top:12px;margin-top:4px;flex-wrap:wrap;gap:8px";

      var selectBtn = el("button", "btn btn-green-gradient");
      selectBtn.type = "button";
      selectBtn.innerHTML = "📂 অধ্যায়গুলো দেখুন ›";
      selectBtn.style.cssText = "padding:7px 14px;font-size:12.5px;border-radius:8px;font-weight:700;cursor:pointer";
      selectBtn.onclick = function(e) {
        e.stopPropagation();
        cleanupLingeringBackdrops();
        selectedSubId = s.id;
        selectedChapId = null;
        renderQBankView(container, allSubs);
      };
      actions.appendChild(selectBtn);

      var iconGroup = el("div");
      iconGroup.style.cssText = "display:flex;gap:6px;align-items:center";

      var sEdit = el("button", "btn-glass-edit");
      sEdit.type = "button";
      sEdit.innerHTML = "✏️ এডিট";
      sEdit.title = "বিষয়ের নাম এডিট করুন";
      sEdit.style.cssText = "padding:6px 12px;font-size:12px;border-radius:8px;cursor:pointer;font-weight:700";
      sEdit.onclick = function(e) {
        e.stopPropagation();
        var newBn = prompt("বিষয়ের নতুন বাংলা নাম লিখুন:", s.titleBn);
        if (!newBn || !newBn.trim()) return;
        var newEn = prompt("বিষয়ের নতুন ইংরেজি নাম লিখুন:", s.titleEn || s.titleBn);
        s.titleBn = newBn.trim();
        s.titleEn = (newEn !== null && newEn.trim()) ? newEn.trim() : (s.titleEn || s.titleBn);
        try {
          localStorage.setItem("sr_custom_subject_" + s.id, JSON.stringify(s));
        } catch(err) {}
        db.ref("exam_subjects/" + s.id).update({
          titleBn: s.titleBn,
          titleEn: s.titleEn,
          category: s.category || activeExamCategory
        }).then(function() {
          toast("বিষয় আপডেট হয়েছে ✓");
          renderQBankView(container, allSubs);
        });
      };
      iconGroup.appendChild(sEdit);

      var sDel = el("button", "btn-glass-remove");
      sDel.type = "button";
      sDel.innerHTML = "🗑️ রিমুভ";
      sDel.title = "বিষয় ডিলিট করুন";
      sDel.style.cssText = "padding:6px 12px;font-size:12px;border-radius:8px;cursor:pointer;font-weight:700";
      sDel.onclick = function(e) {
        e.stopPropagation();
        if (!confirm("আপনি কি নিশ্চিতভাবে '" + s.titleBn + "' বিষয়টি মুছে ফেলতে চান? এর অধীনে থাকা সব অধ্যায় মুছে যাবে।")) return;
        try {
          localStorage.removeItem("sr_custom_subject_" + s.id);
          var delList = [];
          try { delList = JSON.parse(localStorage.getItem("sr_deleted_subjects") || "[]"); } catch(e2) { delList = []; }
          if (!Array.isArray(delList)) delList = [];
          if (delList.indexOf(s.id) === -1) delList.push(s.id);
          localStorage.setItem("sr_deleted_subjects", JSON.stringify(delList));
        } catch(err) {}
        Promise.all([
          db.ref("exam_subjects/" + s.id).remove(),
          db.ref("subjects/" + s.id).remove().catch(function(){}),
          db.ref("exam_deleted_subjects/" + s.id).set(true).catch(function(){})
        ]).then(function() {
          toast("বিষয় মুছে ফেলা হয়েছে ✓");
          var idx = allSubs.findIndex(function(x){ return x.id === s.id; });
          if (idx !== -1) allSubs.splice(idx, 1);
          renderQBankView(container, allSubs);
        });
      };
      iconGroup.appendChild(sDel);

      actions.appendChild(iconGroup);
      card.appendChild(actions);
    subGrid.appendChild(card);
  });
  }

  subCard.appendChild(subGrid);
  container.appendChild(subCard);
}

function renderSchedulingUI(m) {
  var formCard = el("div", "card");
  var titleH = el("h3", null, "➕ নতুন পরীক্ষা শিডিউলিং ও অটো-অ্যাক্টিভেশন");
  titleH.style.cssText = "color:#10b981;font-weight:700;font-size:18px;margin-bottom:6px";
  formCard.appendChild(titleH);

  var formGrid = el("div");
  formGrid.style.cssText = "display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:14px;margin-top:14px";

  // Exam Title
  var titleBox = el("div");
  titleBox.appendChild(el("label", "mute", "পরীক্ষার নাম:"));
  var titleInput = el("input");
  titleInput.placeholder = "যেমন: রসায়ন ২য় পত্র মডেল টেস্ট";
  titleInput.style.cssText = "width:100%;padding:10px 14px;border-radius:10px;border:1.5px solid var(--line);font-size:14px";
  titleBox.appendChild(titleInput);
  formGrid.appendChild(titleBox);

  // Subject Name
  var subBox = el("div");
  subBox.appendChild(el("label", "mute", "বিষয় / পেপারের নাম:"));
  var subInput = el("input");
  subInput.placeholder = "যেমন: রসায়ন ২য় পত্র (জৈব রসায়ন)";
  subInput.style.cssText = "width:100%;padding:10px 14px;border-radius:10px;border:1.5px solid var(--line);font-size:14px";
  subBox.appendChild(subInput);
  formGrid.appendChild(subBox);

  // Target Type
  var targetBox = el("div");
  targetBox.appendChild(el("label", "mute", "টার্গেট ইউজার / রুম:"));
  var targetSelect = el("select");
  targetSelect.style.cssText = "width:100%;padding:10px 14px;border-radius:10px;border:1.5px solid var(--line);font-size:14px";
  [
    ["all", "সকল শিক্ষার্থী (All Users)"],
    ["room", "নির্দিষ্ট রুম কোড (Room Code)"],
    ["uid", "নির্দিষ্ট ইউজার UID"]
  ].forEach(function(o) {
    var opt = el("option", null, o[1]); opt.value = o[0]; targetSelect.appendChild(opt);
  });
  targetBox.appendChild(targetSelect);
  formGrid.appendChild(targetBox);

  // Target Value
  var valBox = el("div");
  valBox.appendChild(el("label", "mute", "রুম কোড বা UID:"));
  var valInput = el("input");
  valInput.placeholder = "যেমন: 1432014310 বা 14320 (সবাই হলে ফাঁকা রাখুন)";
  valInput.style.cssText = "width:100%;padding:10px 14px;border-radius:10px;border:1.5px solid var(--line);font-size:14px";
  valBox.appendChild(valInput);
  formGrid.appendChild(valBox);

  // Scheduled Date Time
  var dtBox = el("div");
  dtBox.appendChild(el("label", "mute", "তারিখ ও সময় (Auto-Activation):"));
  var dtInput = el("input");
  dtInput.type = "datetime-local";
  dtInput.style.cssText = "width:100%;padding:10px 14px;border-radius:10px;border:1.5px solid var(--line);font-size:14px";
  dtBox.appendChild(dtInput);
  formGrid.appendChild(dtBox);

  // Duration
  var durBox = el("div");
  durBox.appendChild(el("label", "mute", "টাইমার / সময়সীমা:"));
  var durSelect = el("select");
  durSelect.style.cssText = "width:100%;padding:10px 14px;border-radius:10px;border:1.5px solid var(--line);font-size:14px";
  [
    ["15", "১৫ মিনিট"],
    ["30", "৩০ মিনিট"],
    ["45", "৪৫ মিনিট"],
    ["60", "৬০ মিনিট (১ ঘণ্টা)"],
    ["90", "৯০ মিনিট (১.৫ ঘণ্টা)"],
    ["120", "১২০ মিনিট (২ ঘণ্টা)"]
  ].forEach(function(d) {
    var opt = el("option", null, d[1]); opt.value = d[0]; durSelect.appendChild(opt);
  });
  durSelect.value = "30";
  durBox.appendChild(durSelect);
  formGrid.appendChild(durBox);

  // PDF Link
  var pdfBox = el("div");
  pdfBox.style.gridColumn = "1 / -1";
  pdfBox.appendChild(el("label", "mute", "প্রশ্নপত্রের PDF লিংক (ঐচ্ছিক - ড্রাইভ বা ওয়েব লিংক):"));
  var pdfInput = el("input");
  pdfInput.placeholder = "https://drive.google.com/file/d/.../view?usp=sharing";
  pdfInput.style.cssText = "width:100%;padding:10px 14px;border-radius:10px;border:1.5px solid var(--line);font-size:14px";
  pdfBox.appendChild(pdfInput);
  formGrid.appendChild(pdfBox);

  // JSON Code Textarea
  var jsonBox = el("div");
  jsonBox.style.gridColumn = "1 / -1";
  jsonBox.appendChild(el("label", "mute", "প্রশ্নের JSON কোড (ঐচ্ছিক - কুইজ/প্রশ্ন সরাসরি শিডিউল করতে নিচে পেস্ট করুন):"));
  var jsonArea = el("textarea");
  jsonArea.rows = 7;
  jsonArea.style.cssText = "width:100%;font-family:monospace;font-size:13px;padding:12px;border-radius:10px;border:1.5px solid var(--line);background:var(--card);color:var(--ink);box-sizing:border-box";
  jsonArea.placeholder = '[\n  {\n    "question": "নিচের কোনটি উদ্ভিদের বৃদ্ধি নিয়ন্ত্রক হরমোন?",\n    "options": ["অক্সিন", "ইনসুলিন", "থাইরক্সিন", "হিমোগ্লোবিন"],\n    "correct": 0\n  }\n]';
  jsonBox.appendChild(jsonArea);
  formGrid.appendChild(jsonBox);

  formCard.appendChild(formGrid);

  var btnGroup = el("div", "row");
  btnGroup.style.marginTop = "16px";

  var publishBtn = btn("পরীক্ষা শিডিউল ও অ্যাসাইন করুন", null, function() {
    var title = titleInput.value.trim();
    if (!title) return toast("পরীক্ষার নাম লিখুন!");

    var examObj = {
      title: title,
      category: activeExamCategory,
      subjectName: subInput.value.trim() || "সাধারণ বিষয়",
      target: targetSelect.value,
      targetValue: valInput.value.trim() || "all",
      scheduledDate: dtInput.value || "আজকে",
      durationMinutes: Number(durSelect.value) || 30,
      pdfUrl: pdfInput.value.trim() || null,
      createdAt: Date.now()
    };

    var qText = jsonArea.value.trim();
    if (qText) {
      try {
        var parsedQ = JSON.parse(qText);
        if (Array.isArray(parsedQ)) {
          examObj.questions = parsedQ;
        } else {
          return alert("ভুল ফরম্যাট! প্রশ্নের JSON অবশ্যই একটি Array হতে হবে।");
        }
      } catch (err) {
        return alert("JSON সিনট্যাক্স ভুল! কোড ঠিকভাবে পরীক্ষা করুন:\n" + err.message);
      }
    }

    publishBtn.disabled = true;
    db.ref("assigned_exams").push(examObj).then(function() {
      publishBtn.disabled = false;
      toast("পরীক্ষা সফলভাবে অ্যাসাইন করা হয়েছে ✓");
      render();
    }).catch(function(err) {
      publishBtn.disabled = false;
      toast("ব্যর্থ: " + err.message);
    });
  });
  publishBtn.style.cssText = "padding:10px 24px;border-radius:10px;font-size:15px;font-weight:700";
  btnGroup.appendChild(publishBtn);

  formCard.appendChild(btnGroup);
  m.appendChild(formCard);

  // Existing Scheduled Exams
  var listCard = el("div", "card");
  listCard.innerHTML = "<h3>📋 বর্তমানে সক্রিয় ও নির্ধারিত পরীক্ষাসমূহ</h3><div id='admin_exam_list'>লোড হচ্ছে...</div>";
  m.appendChild(listCard);

  db.ref("assigned_exams").once("value").then(function(snap) {
    var c = document.getElementById("admin_exam_list");
    if (!c) return;
    c.textContent = "";

    var data = snap.val();
    if (!data) {
      c.innerHTML = "<p class='mute'>বর্তমানে কোনো নির্ধারিত পরীক্ষা নেই।</p>";
      return;
    }

    var keys = Object.keys(data).reverse();
    keys.forEach(function(k) {
      var ex = data[k];
      var row = el("div", "ses");
      row.style.cssText = "display:flex;justify-content:space-between;align-items:center;padding:12px;border-bottom:1px solid var(--line);flex-wrap:wrap;gap:8px";

      var info = el("div");
      var catBadge = ex.category ? `<span class="badge" style="font-size:11px;padding:2px 7px;margin-right:6px">${escHtml(ex.category)}</span>` : "";
      info.innerHTML = catBadge + "<strong>" + escHtml(ex.title) + "</strong> (" + escHtml(ex.subjectName || "") + ")<div class='mute' style='font-size:12.5px'>টার্গেট: " + (ex.target === "room" ? "রুম " + escHtml(ex.targetValue) : ex.target === "uid" ? "ইউজার " + escHtml(ex.targetValue) : "সকল শিক্ষার্থী") + " · সময়: " + (Number(ex.durationMinutes) || 30) + " মিনিট · তারিখ: " + escHtml(ex.scheduledDate || "আজ") + "</div>";
      row.appendChild(info);

      var actionGroup = el("div", "row");
      actionGroup.style.margin = "0";

      var editB = btn("✏️ এডিট", "ghost", function() {
        var newTitle = prompt("পরীক্ষার নতুন নাম লিখুন:", ex.title);
        if (!newTitle) return;
        var newDur = prompt("নতুন সময়সীমা (মিনিট):", ex.durationMinutes || 30);
        db.ref("assigned_exams/" + k).update({
          title: newTitle,
          durationMinutes: Number(newDur) || ex.durationMinutes
        }).then(function() {
          toast("পরীক্ষার তথ্য আপডেট হয়েছে ✓");
          render();
        });
      });
      editB.style.cssText = "padding:4px 10px;font-size:12px;border-radius:8px;margin-right:4px";
      actionGroup.appendChild(editB);

      var delB = btn("🗑 মুছুন", "dn", function() {
        if (!confirm("আপনি কি নিশ্চিত যে '" + ex.title + "' পরীক্ষাটি মুছে ফেলতে চান?")) return;
        db.ref("assigned_exams/" + k).remove().then(function() {
          toast("পরীক্ষা মুছে ফেলা হয়েছে ✓");
          render();
        });
      });
      delB.style.cssText = "padding:4px 10px;font-size:12px;border-radius:8px";
      actionGroup.appendChild(delB);

      row.appendChild(actionGroup);
      c.appendChild(row);
    });
  });

  // 1. Exam Access Blocker Section
  var blockCard = el("div", "card");
  blockCard.innerHTML = `
    <h3>🚫 পরীক্ষা এক্সেস কন্ট্রোল ও ব্লকার (Exam Access Control)</h3>
    <p class="mute" style="font-size:13px;margin:0 0 12px">নির্দিষ্ট শিক্ষার্থী (UID) বা পুরো রুমের ডিজিটাল পরীক্ষা সাময়িকভাবে স্থগিত বা চালু করুন</p>
    <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:12px">
      <input type="text" id="admin_blk_target" placeholder="ইউজার UID বা রুম কোড লিখুন" style="flex:1;min-width:200px;padding:9px 12px;border-radius:10px;border:1.5px solid var(--line);font:inherit" />
      <input type="text" id="admin_blk_reason" placeholder="স্থগিতের কারণ (ঐচ্ছিক)" style="flex:1;min-width:180px;padding:9px 12px;border-radius:10px;border:1.5px solid var(--line);font:inherit" />
      <button class="btn dn" id="btn_admin_block_target" style="padding:9px 16px;border-radius:10px">🚫 ব্লক করুন</button>
      <button class="btn ghost" id="btn_admin_unblock_target" style="padding:9px 16px;border-radius:10px">✅ আনব্লক করুন</button>
    </div>
    <div id="admin_blocked_list_container" style="background:var(--bg);border-radius:12px;padding:10px;border:1px solid var(--line)">লোড হচ্ছে...</div>
  `;
  m.appendChild(blockCard);

  function refreshBlockedList(){
    db.ref("exam_blocked_targets").once("value").then(function(bSnap){
      var bCont = document.getElementById("admin_blocked_list_container");
      if(!bCont) return;
      bCont.innerHTML = "";
      var bData = bSnap.val();
      if(!bData || Object.keys(bData).length === 0){
        bCont.innerHTML = "<span class='mute' style='font-size:13px'>বর্তমানে কোনো শিক্ষার্থী বা রুম ব্লক করা নেই।</span>";
        return;
      }
      var ul = el("div");
      Object.keys(bData).forEach(function(tId){
        var info = bData[tId];
        var item = el("div", "row");
        item.style.cssText = "display:flex;justify-content:space-between;align-items:center;padding:6px 8px;border-bottom:1px solid var(--line);font-size:13px";
        item.innerHTML = `<div><strong style="color:var(--danger)">🚫 ${escHtml(tId)}</strong> ${info.targetName ? "("+escHtml(info.targetName)+")" : ""} <span class="mute">${info.reason ? "· কারণ: " + escHtml(info.reason) : ""}</span></div>`;
        var unb = btn("আনব্লক", "ghost", function(){
          db.ref("exam_blocked_targets/" + safePathKey(tId)).remove().then(function(){
            toast(tId + " এর পরীক্ষা এক্সেস সচল করা হয়েছে ✓");
            refreshBlockedList();
          });
        });
        unb.style.cssText = "padding:3px 10px;font-size:12px;border-radius:6px";
        item.appendChild(unb);
        ul.appendChild(item);
      });
      bCont.appendChild(ul);
    }).catch(function(){});
  }
  refreshBlockedList();

  var blkInp = document.getElementById("admin_blk_target");
  var blkRsn = document.getElementById("admin_blk_reason");
  var btnBlk = document.getElementById("btn_admin_block_target");
  var btnUnblk = document.getElementById("btn_admin_unblock_target");

  if(btnBlk){
    btnBlk.onclick = function(){
      var t = safePathKey(blkInp.value.trim());
      if(!t) return toast("টার্গেট UID বা রুম কোড লিখুন!");
      db.ref("exam_blocked_targets/" + t).set({
        blocked: true,
        blockedAt: Date.now(),
        reason: blkRsn.value.trim() || "অ্যাডমিন কর্তৃক পরীক্ষা সাময়িক স্থগিত"
      }).then(function(){
        toast(t + " ব্লক করা হয়েছে ✓");
        blkInp.value = "";
        blkRsn.value = "";
        refreshBlockedList();
      });
    };
  }

  if(btnUnblk){
    btnUnblk.onclick = function(){
      var t = safePathKey(blkInp.value.trim());
      if(!t) return toast("টার্গেট UID বা রুম কোড লিখুন!");
      db.ref("exam_blocked_targets/" + t).remove().then(function(){
        toast(t + " আনব্লক করা হয়েছে ✓");
        blkInp.value = "";
        refreshBlockedList();
      });
    };
  }
}

function renderAdminResultsUI(m) {
  var card = el("div", "card");
  card.innerHTML = "<h3>🏆 শিক্ষার্থীদের পরীক্ষার ফলাফল ও লিডারবোর্ড রেকর্ড</h3><div id='admin_res_table'>লোড হচ্ছে...</div>";
  m.appendChild(card);

  db.ref("exam_leaderboard").limitToLast(100).once("value").then(function(snap) {
    var cont = document.getElementById("admin_res_table");
    if (!cont) return;
    cont.textContent = "";

    var data = snap.val();
    if (!data) {
      cont.innerHTML = "<p class='mute'>এখনও কোনো পরীক্ষার ফলাফল জমা হয়নি।</p>";
      return;
    }

    var keys = Object.keys(data).reverse();
    cont.appendChild(el("p", "mute", "মোট জমা হওয়া ফলাফল: " + keys.length + " টি"));

    var table = el("table");
    table.style.cssText = "width:100%;border-collapse:collapse;font-size:13.5px;margin-top:10px";
    table.innerHTML = `
      <thead>
        <tr style="background:var(--bg);text-align:left">
          <th style="padding:8px 10px;border-bottom:1px solid var(--line)">শিক্ষার্থীর নাম</th>
          <th style="padding:8px 10px;border-bottom:1px solid var(--line)">Room Name</th>
          <th style="padding:8px 10px;border-bottom:1px solid var(--line)">পরীক্ষার নাম</th>
          <th style="padding:8px 10px;border-bottom:1px solid var(--line)">নম্বর</th>
          <th style="padding:8px 10px;border-bottom:1px solid var(--line)">শতাংশ</th>
          <th style="padding:8px 10px;border-bottom:1px solid var(--line)">সময়</th>
          <th style="padding:8px 10px;border-bottom:1px solid var(--line)">অ্যাকশন</th>
        </tr>
      </thead>
      <tbody id="admin_res_tbody"></tbody>
    `;
    cont.appendChild(table);

    var tbody = document.getElementById("admin_res_tbody");
    keys.forEach(function(k) {
      var r = data[k];
      var tr = el("tr");
      var timeFormatted = r.timeSpentSeconds ? Math.floor(r.timeSpentSeconds / 60) + "মি " + (r.timeSpentSeconds % 60) + "সে" : "--";
      var safeRoom = r.roomName || rn(r.room) || (r.room === "1432014310" ? "Queen Room" : "স্টাডি রুম");

      tr.innerHTML = `
        <td style="padding:8px 10px;border-bottom:1px solid var(--line)"><strong>${escHtml(r.name || "শিক্ষার্থী")}</strong></td>
        <td style="padding:8px 10px;border-bottom:1px solid var(--line);color:var(--a);font-weight:600">${escHtml(safeRoom)}</td>
        <td style="padding:8px 10px;border-bottom:1px solid var(--line)">${escHtml(r.examTitle || "মডেল টেস্ট")}</td>
        <td style="padding:8px 10px;border-bottom:1px solid var(--line);font-weight:700;color:${r.penalty ? "var(--danger)" : "var(--a)"}">${escHtml(r.score)}/${Number(r.total) || 0} ${r.penalty ? "(শাস্তি: ০)" : ""}</td>
        <td style="padding:8px 10px;border-bottom:1px solid var(--line);font-weight:700">${Number(r.percentage) || 0}%</td>
        <td style="padding:8px 10px;border-bottom:1px solid var(--line)">${timeFormatted}</td>
        <td style="padding:8px 10px;border-bottom:1px solid var(--line);white-space:nowrap"></td>
      `;

      var actTd = tr.children[6];
      var editBtn = btn("✏️", "ghost", function() {
        var newScore = prompt("নতুন নম্বর লিখুন (মোট: " + (r.total || 0) + "):", r.score);
        if (newScore === null || newScore.trim() === "") return;
        var sNum = Number(newScore.trim());
        if (isNaN(sNum)) return toast("সঠিক সংখ্যা লিখুন!");
        var newPct = Math.round((sNum / (r.total || 1)) * 100);
        db.ref("exam_leaderboard/" + k).update({
          score: sNum,
          percentage: newPct
        }).then(function() {
          toast("ফলাফল আপডেট হয়েছে ✓");
          render();
        });
      });
      editBtn.style.cssText = "padding:3px 8px;font-size:12px;border-radius:6px;margin-right:4px";
      actTd.appendChild(editBtn);

      var delBtn = btn("🗑", "dn", function() {
        if (!confirm("আপনি কি নিশ্চিত যে " + (r.name || "এই শিক্ষার্থীর") + " রেজাল্টটি মুছে ফেলতে চান?")) return;
        db.ref("exam_leaderboard/" + k).remove().then(function() {
          toast("রেজাল্ট মুছে ফেলা হয়েছে ✓");
          render();
        });
      });
      delBtn.style.cssText = "padding:3px 8px;font-size:12px;border-radius:6px";
      actTd.appendChild(delBtn);

      tbody.appendChild(tr);
    });
  }).catch(function() {
    var cont = document.getElementById("admin_res_table");
    if (cont) cont.innerHTML = "<p class='mute'>এখনও কোনো পরীক্ষার ফলাফল জমা হয়নি অথবা ডেটাবেসের সংযোগ অপেক্ষমাণ।</p>";
  });
}

V.exams = function(m) {
  m.appendChild(el("h2", null, "📝 ডায়নামিক এক্সাম ম্যানেজমেন্ট ও কোশ্চেন কন্ট্রোল"));
  m.appendChild(el("p", "mute", "বিষয় ও অধ্যায়ভিত্তিক প্রশ্নব্যাংক আপলোড (JSON), লাইভ পরীক্ষা শিডিউলিং ও লিডারবোর্ড নিয়ন্ত্রণ করুন।"));

  // ৪টি ক্লাস ক্যাটাগরি বাটন
  var catRow = el("div", "row");
  catRow.style.margin = "12px 0 8px 0";
  [
    { id: "HSC", label: "🎓 HSC" },
    { id: "SSC", label: "📖 SSC" },
    { id: "Admission", label: "🎯 Admission" },
    { id: "BCS", label: "💼 BCS / Job" }
  ].forEach(function(c) {
    var isSel = activeExamCategory === c.id;
    var b = btn(c.label, isSel ? "btn-green-gradient" : "ghost", function() {
      activeExamCategory = c.id;
      selectedSubId = null;
      selectedChapId = null;
      render();
    });
    b.style.cssText = "padding:8px 18px;font-weight:700;font-size:14px;border-radius:10px;cursor:pointer";
    catRow.appendChild(b);
  });
  m.appendChild(catRow);

  var tabs = el("div", "row");
  tabs.style.margin = "10px 0 14px 0";
  [
    { id: "qbank", label: "📚 বিষয় ও প্রশ্নব্যাংক (JSON)" },
    { id: "schedule", label: "📅 পরীক্ষা শিডিউলিং ও অ্যাসাইন" },
    { id: "results", label: "🏆 এক্সাম ফলাফল ও লিডারবোর্ড" }
  ].forEach(function(tb) {
    var isTabSel = activeExamTab === tb.id;
    var b = btn(tb.label, isTabSel ? "btn-green-gradient" : "ghost", function() {
      activeExamTab = tb.id;
      render();
    });
    b.style.cssText = "padding:8px 18px;font-weight:700;font-size:13.5px;border-radius:10px;cursor:pointer";
    tabs.appendChild(b);
  });
  m.appendChild(tabs);

  if (activeExamTab === "qbank") {
    var qbankArea = el("div");
    qbankArea.id = "admin_qbank_area";
    m.appendChild(qbankArea);

    // ১. কোনো প্রকার নেটওয়ার্ক বিলম্ব ছাড়াই তৎক্ষণাৎ সব বিষয় ও অধ্যায় রেন্ডার হবে (Local Cache সহ)
    var localDeletedIds = [];
    try {
      localDeletedIds = JSON.parse(localStorage.getItem("sr_deleted_subjects") || "[]");
      if (!Array.isArray(localDeletedIds)) localDeletedIds = [];
    } catch(e) { localDeletedIds = []; }

    var initialSubs = getDefaultSubs()
      .filter(function(s){ return localDeletedIds.indexOf(s.id) === -1; })
      .map(function(s){ return Object.assign({}, s, { chapters: (s.chapters || []).slice() }); });
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var lk = localStorage.key(i);
        if (lk && lk.startsWith("sr_custom_subject_")) {
          var cSub = JSON.parse(localStorage.getItem(lk));
          if (cSub && cSub.id && localDeletedIds.indexOf(cSub.id) === -1) {
            var cIdx = initialSubs.findIndex(function(x){ return x.id === cSub.id; });
            if (cIdx > -1) {
              initialSubs[cIdx] = { ...initialSubs[cIdx], ...cSub };
              if (cSub.noChapters === true) initialSubs[cIdx].chapters = [];
            } else {
              if (cSub.noChapters === true) cSub.chapters = [];
              initialSubs.push(cSub);
            }
          }
        }
      }
    } catch(e) {}

    renderQBankView(qbankArea, initialSubs);

    // ২. ফায়ারবেস থেকে নতুন তৈরি বা এডিট করা বিষয় ও চ্যাপ্টার সিঙ্ক করা
    Promise.all([
      db.ref("exam_subjects").once("value").catch(function(){ return { val: function(){ return null; } }; }),
      db.ref("exam_deleted_subjects").once("value").catch(function(){ return { val: function(){ return null; } }; })
    ]).then(function(snaps) {
      var dbSubs = snaps[0].val();
      var dbDel = snaps[1].val() || {};
      var deletedSet = {};
      localDeletedIds.forEach(function(id){ deletedSet[id] = true; });
      if (dbDel && typeof dbDel === "object") {
        Object.keys(dbDel).forEach(function(dk){ if (dbDel[dk]) deletedSet[dk] = true; });
      }

      var subsList = [];
      if (dbSubs && typeof dbSubs === "object") {
        subsList = Object.keys(dbSubs).map(function(k) {
          return { id: k, ...dbSubs[k] };
        });
      }

      var mergedList = getDefaultSubs()
        .filter(function(s){ return !deletedSet[s.id]; })
        .map(function(s){ return Object.assign({}, s, { chapters: (s.chapters || []).slice() }); });

      subsList.forEach(function(s) {
        if (deletedSet[s.id]) return;
        var idx = mergedList.findIndex(function(mItem){ return mItem.id === s.id; });
        if (idx > -1) {
          mergedList[idx] = { ...mergedList[idx], ...s };
          if (s.noChapters === true) {
            mergedList[idx].chapters = [];
          } else if (s.chapters && Array.isArray(s.chapters) && s.chapters.length) {
            mergedList[idx].chapters = s.chapters;
          }
        } else {
          if (s.noChapters === true) s.chapters = [];
          mergedList.push(s);
        }
      });

      // Also merge any localStorage subjects
      try {
        for (var i = 0; i < localStorage.length; i++) {
          var lk = localStorage.key(i);
          if (lk && lk.startsWith("sr_custom_subject_")) {
            var cSub = JSON.parse(localStorage.getItem(lk));
            if (cSub && cSub.id && !deletedSet[cSub.id]) {
              var cIdx = mergedList.findIndex(function(x){ return x.id === cSub.id; });
              if (cIdx > -1) {
                mergedList[cIdx] = { ...mergedList[cIdx], ...cSub };
                if (cSub.noChapters === true) mergedList[cIdx].chapters = [];
              } else {
                if (cSub.noChapters === true) cSub.chapters = [];
                mergedList.push(cSub);
              }
            }
          }
        }
      } catch(e) {}

      var curQArea = document.getElementById("admin_qbank_area");
      if (curQArea) {
        renderQBankView(curQArea, mergedList);
      }
    }).catch(function() {
      // already rendered initialSubs!
    });
  } else if (activeExamTab === "schedule") {
    renderSchedulingUI(m);
  } else if (activeExamTab === "results") {
    renderAdminResultsUI(m);
  }
};

// ১০. এন্ট্রি পেজ ফুটার টেক্সট (লগইন কার্ডের নিচের লেখা নিয়ন্ত্রণ)
V.footer = function(m){
  var DEFAULT_TXT = "Created by MD Jarifur Rahman";
  var localDraft = null;
  try { localDraft = localStorage.getItem("sr_admin_footer_draft"); } catch(e){}

  if(FOOTER_DRAFT === null && localDraft !== null){
    FOOTER_DRAFT = localDraft;
    FOOTER_DIRTY = true;
  }

  var rawVal = (FOOTER_DRAFT !== null)
    ? FOOTER_DRAFT
    : ((ENTRY_FOOTER === null || ENTRY_FOOTER === undefined) ? DEFAULT_TXT : String(ENTRY_FOOTER));
  var initialHtml = sanitizeFooterHtml(rawVal);

  m.appendChild(el("h2", null, "✍️ হোম / এন্ট্রি পেজের নিচের লেখা"));
  m.appendChild(el("p", "mute", "প্রবেশ পেজের (গোপন পাসকোড কার্ডের) ঠিক নিচে যে লেখাটি দেখা যাবে, এখান থেকে যখন খুশি পরিবর্তন, বড়-ছোট-বাঁকানো ফরম্যাটিং বা লুকাতে পারবেন। লেখার সাথে সাথে অটো-সেভ হবে।"));

  var card = el("div", "card");
  card.id = "sr_footer_card";

  var headRow = el("div", "sw");
  headRow.appendChild(el("h3", null, "বর্তমান লেখা সম্পাদনা করুন"));
  var statusEl = el("span", "footer-save-status", FOOTER_DIRTY ? "⏳ অটো-সেভ হচ্ছে..." : "✓ সেভ করা আছে");
  statusEl.id = "sr_footer_status";
  if(FOOTER_DIRTY) statusEl.classList.add("pending");
  headRow.appendChild(statusEl);
  card.appendChild(headRow);

  // ফরম্যাটিং টুলবার (বড়, ছোট, বাঁকানো, মোটা, আন্ডারলাইন)
  var fmtBar = el("div", "footer-fmt-bar");
  var fmtButtons = [];

  function makeFmtBtn(label, title, onApply, trackCmd){
    var b = el("button", "footer-fmt-btn", label);
    b.type = "button";
    b.title = title;
    b.onmousedown = function(ev){ ev.preventDefault(); };
    b.onclick = function(ev){
      ev.preventDefault();
      editor.focus();
      onApply();
      handleEditorChange();
      updateToolbarState();
    };
    if(trackCmd) fmtButtons.push({ btn: b, cmd: trackCmd });
    fmtBar.appendChild(b);
    return b;
  }

  var bBold = makeFmtBtn("B মোটা", "লেখা মোটা করুন (Bold)", function(){
    document.execCommand("bold", false, null);
  }, "bold");
  bBold.style.fontWeight = "800";

  var bItalic = makeFmtBtn("I বাঁকানো", "লেখা বাঁকানো করুন (Italic)", function(){
    document.execCommand("italic", false, null);
  }, "italic");
  bItalic.style.fontStyle = "italic";

  var bUnder = makeFmtBtn("U নিচে দাগ", "নিচে দাগ দিন (Underline)", function(){
    document.execCommand("underline", false, null);
  }, "underline");
  bUnder.style.textDecoration = "underline";

  fmtBar.appendChild(el("span", "footer-fmt-sep"));

  var bSmall = makeFmtBtn("A- ছোট", "সিলেক্ট করা লেখা ছোট করুন", function(){
    document.execCommand("fontSize", false, "1");
  });
  bSmall.style.fontSize = "11.5px";

  makeFmtBtn("A স্বাভাবিক", "সিলেক্ট করা লেখা স্বাভাবিক সাইজ করুন", function(){
    document.execCommand("fontSize", false, "3");
  });

  var bLarge = makeFmtBtn("A+ বড়", "সিলেক্ট করা লেখা বড় করুন", function(){
    document.execCommand("fontSize", false, "5");
  });
  bLarge.style.fontSize = "14.5px";

  var bXL = makeFmtBtn("A++ অনেক বড়", "সিলেক্ট করা লেখা আরও বড় করুন", function(){
    document.execCommand("fontSize", false, "6");
  });
  bXL.style.fontSize = "15.5px";

  fmtBar.appendChild(el("span", "footer-fmt-sep"));

  makeFmtBtn("✕ ফরম্যাট মুছুন", "সিলেক্ট করা লেখার ফরম্যাট সরান", function(){
    document.execCommand("removeFormat", false, null);
    document.execCommand("fontSize", false, "3");
  });

  card.appendChild(fmtBar);

  var editor = el("div", "footer-rich-editor");
  editor.id = "sr_footer_editor";
  editor.contentEditable = "true";
  editor.setAttribute("role", "textbox");
  editor.setAttribute("aria-multiline", "true");
  editor.setAttribute("data-placeholder", "যেমন: Created by MD Jarifur Rahman (লেখা সিলেক্ট করে উপরের বাটন দিয়ে বড়, ছোট বা বাঁকানো করতে পারবেন)");
  if(initialHtml){
    editor.innerHTML = initialHtml;
  }
  card.appendChild(editor);

  var prevWrap = el("div");
  prevWrap.style.cssText = "margin-top:12px;padding:12px;border-radius:12px;border:1px dashed var(--line);text-align:center";
  prevWrap.appendChild(el("small", "mute", "প্রিভিউ (কার্ডের নিচে যেভাবে দেখাবে):"));
  var prevTxt = el("div", "mute");
  prevTxt.id = "sr_footer_preview";
  prevTxt.style.cssText = "margin-top:6px;font-size:13.5px;font-weight:500;line-height:1.55;white-space:normal;word-break:break-word";
  if(initialHtml){
    prevTxt.innerHTML = initialHtml;
  } else {
    prevTxt.textContent = "(কোনো লেখা নেই — লুকানো থাকবে)";
  }
  prevWrap.appendChild(prevTxt);
  card.appendChild(prevWrap);

  function setStatus(text, state){
    var st = $("sr_footer_status") || statusEl;
    if(!st) return;
    st.textContent = text;
    st.classList.remove("pending", "err");
    if(state) st.classList.add(state);
  }

  function updateToolbarState(){
    if(document.activeElement !== editor) return;
    fmtButtons.forEach(function(item){
      try {
        item.btn.classList.toggle("on", !!document.queryCommandState(item.cmd));
      } catch(e){}
    });
  }

  function updatePreviewFromHtml(sanitized){
    if(sanitized){
      prevTxt.innerHTML = sanitized;
    } else {
      prevTxt.textContent = "(কোনো লেখা নেই — লুকানো থাকবে)";
    }
  }

  function persistFooter(valToSave, isManual, onDone){
    FOOTER_SAVE_IN_FLIGHT = true;
    setStatus(isManual ? "⏳ সেভ হচ্ছে..." : "⏳ অটো-সেভ হচ্ছে...", "pending");
    var authProm = window.ensureAuth ? window.ensureAuth() : Promise.resolve();
    authProm.then(function(){
      return db.ref("admin_config/entry_footer_text").set(valToSave);
    }).then(function(){
      FOOTER_SAVE_IN_FLIGHT = false;
      ENTRY_FOOTER = valToSave;
      if(FOOTER_DRAFT === valToSave || FOOTER_DRAFT === null){
        FOOTER_DIRTY = false;
        FOOTER_DRAFT = null;
        try { localStorage.removeItem("sr_admin_footer_draft"); } catch(e){}
        setStatus(isManual ? "✓ সেভ হয়েছে" : "✓ অটো-সেভ হয়েছে", "");
      } else {
        // User typed more while request was in flight — schedule another save
        scheduleAutoSave();
      }
      if(onDone) onDone(null);
    }).catch(function(err){
      FOOTER_SAVE_IN_FLIGHT = false;
      setStatus("⚠️ সেভ হয়নি — খসড়া সংরক্ষিত আছে", "err");
      if(onDone) onDone(err);
    });
  }

  function scheduleAutoSave(){
    if(FOOTER_AUTOSAVE_TIMER) clearTimeout(FOOTER_AUTOSAVE_TIMER);
    FOOTER_AUTOSAVE_TIMER = setTimeout(function(){
      FOOTER_AUTOSAVE_TIMER = null;
      if(FOOTER_DRAFT === null) return;
      if(FOOTER_SAVE_IN_FLIGHT){
        scheduleAutoSave();
        return;
      }
      persistFooter(FOOTER_DRAFT, false);
    }, 750);
  }

  function handleEditorChange(){
    var plainLen = (editor.textContent || "").trim().length;
    if(plainLen > 600){
      toast("সর্বোচ্চ ৬০০ অক্ষর পর্যন্ত লেখা যাবে।");
    }
    var sanitized = sanitizeFooterHtml(editor.innerHTML);
    FOOTER_DRAFT = sanitized;
    FOOTER_DIRTY = true;
    try { localStorage.setItem("sr_admin_footer_draft", sanitized); } catch(e){}
    updatePreviewFromHtml(sanitized);
    setStatus("⏳ অটো-সেভ হচ্ছে...", "pending");
    scheduleAutoSave();
  }

  editor.addEventListener("input", handleEditorChange);
  editor.addEventListener("keyup", updateToolbarState);
  editor.addEventListener("mouseup", updateToolbarState);
  editor.addEventListener("paste", function(ev){
    ev.preventDefault();
    var txt = (ev.clipboardData || window.clipboardData).getData("text/plain") || "";
    document.execCommand("insertText", false, txt);
  });

  if(FOOTER_DIRTY && FOOTER_DRAFT !== null){
    scheduleAutoSave();
  }

  var row = el("div", "row");
  row.style.marginTop = "14px";

  var saveBtn = btn("💾 সেভ করুন", null, function(){
    if(FOOTER_AUTOSAVE_TIMER){
      clearTimeout(FOOTER_AUTOSAVE_TIMER);
      FOOTER_AUTOSAVE_TIMER = null;
    }
    var val = sanitizeFooterHtml(editor.innerHTML);
    FOOTER_DRAFT = val;
    FOOTER_DIRTY = true;
    saveBtn.disabled = true;
    persistFooter(val, true, function(err){
      saveBtn.disabled = false;
      if(!err){
        toast("লেখা সফলভাবে সেভ হয়েছে ✓");
      } else {
        toast("সেভ হয়নি: " + (err && err.message ? err.message : "ত্রুটি"));
      }
    });
  });

  var defBtn = btn("↩ ডিফল্ট বসান", "ghost", function(){
    var defHtml = sanitizeFooterHtml(DEFAULT_TXT);
    editor.innerHTML = defHtml;
    handleEditorChange();
  });

  var hideBtn = btn("🗑 লেখা লুকান (খালি করুন)", "dn", function(){
    if(!confirm("এন্ট্রি পেজের নিচের লেখাটি মুছে/লুকিয়ে রাখতে চান?")) return;
    if(FOOTER_AUTOSAVE_TIMER){
      clearTimeout(FOOTER_AUTOSAVE_TIMER);
      FOOTER_AUTOSAVE_TIMER = null;
    }
    editor.innerHTML = "";
    FOOTER_DRAFT = "";
    FOOTER_DIRTY = true;
    updatePreviewFromHtml("");
    hideBtn.disabled = true;
    persistFooter("", true, function(err){
      hideBtn.disabled = false;
      if(!err){
        setStatus("✓ লেখা লুকানো হয়েছে", "");
        toast("লেখাটি লুকানো হয়েছে ✓");
      } else {
        toast("ব্যর্থ: " + (err && err.message ? err.message : "ত্রুটি"));
      }
    });
  });

  row.appendChild(saveBtn);
  row.appendChild(defBtn);
  row.appendChild(hideBtn);
  card.appendChild(row);
  m.appendChild(card);
};

/* ---------- নেভিগেশন তালিকা ("অনুপ্রেরণা" ঠিক লগ এর নিচে) ---------- */
var NAV = [
  ["ov","📊 ওভারভিউ"],
  ["rooms","🏠 রুম"],
  ["users","👥 ইউজার"],
  ["chat","💬 চ্যাট"],
  ["broadcast","📢 ওয়ান-ওয়ে বার্তা"],
  ["approvals","📝 রুম অনুমোদন"],
  ["log","📜 লগ"],
  ["motivation","💬 অনুপ্রেরণা"],
  ["exams","📝 এক্সাম কন্ট্রোল"], // <--- নতুন ডায়নামিক এক্সাম ম্যানেজমেন্ট সিস্টেম
  ["footer","✍️ হোম পেজ টেক্সট"]
];

function dark(){
  var a = document.documentElement.getAttribute("data-theme");
  return a ? a==="dark" : matchMedia("(prefers-color-scheme: dark)").matches;
}

function render(){
  if(!live) return;
  var a = $("app"); a.textContent = "";

  var sh = el("div","shell"), sd = el("nav","side");
  sd.appendChild(el("h1", null, "অ্যাডমিন"));

  var pendingRoomsCount = Object.keys(R2).filter(function(r){
    var m = (R2[r] && R2[r].meta) || {};
    return m.status === "trial" || (m.expiresAt && Date.now() > m.expiresAt);
  }).length;
  var unreadFbNavCount = getFeedbackItems().filter(function(f){ return f.status === "unread"; }).length;

  NAV.forEach(function(n){
    var label = n[1];
    if(n[0] === "approvals" && pendingRoomsCount > 0){
      label += " (" + bn(pendingRoomsCount) + ")";
    }
    if(n[0] === "broadcast" && unreadFbNavCount > 0){
      label += " (" + bn(unreadFbNavCount) + ")";
    }
    var b = el("button","nv" + (view===n[0] ? " on" : ""), label);
    b.type = "button";
    b.onclick = function(){ view=n[0]; render(); };
    sd.appendChild(b);
  });

  sd.appendChild(el("div","sp"));
  sd.appendChild(btn("🔄 রিফ্রেশ", "ghost", function(){ load(); }));
  sd.appendChild(btn("পাসওয়ার্ড পরিবর্তন", "ghost", changeAdminPasswordModal));
  sd.appendChild(btn(dark() ? "☀️ লাইট মোড" : "🌙 ডার্ক মোড", "ghost", function(){
    var n = dark() ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", n);
    try{ localStorage.setItem("ad-theme", n); }catch(e){}
    render();
  }));
  var backLink = el("a", "btn ghost", "← মূল রুমে ফিরুন");
  backLink.href = "/index.html";
  backLink.style.cssText = "text-align:center;text-decoration:none;display:block";
  sd.appendChild(backLink);
  sd.appendChild(btn("লগআউট", "ghost", function(){
    try{ localStorage.removeItem("ad-ok"); }catch(e){}
    location.reload();
  }));
  var syncLabel = el("small","mute", "আপডেট: " + fd(at));
  syncLabel.id = "ad_sync_time";
  sd.appendChild(syncLabel);

  var mn = el("main","main");
  var hasSysWarn = !FB_STATUS.configOk || FB_STATUS.connected === false || (FB_STATUS.errors && FB_STATUS.errors.length > 0);
  if(hasSysWarn){
    var warnCard = el("div", "card");
    warnCard.style.cssText = "border-color:var(--danger);margin-top:0;margin-bottom:12px";
    var errDetails = [];
    if(!FB_STATUS.configOk) errDetails.push("Firebase Config / databaseURL ঠিক নেই");
    if(FB_STATUS.connected === false) errDetails.push("Firebase Realtime Database-এর সাথে সংযোগ পাওয়া যাচ্ছে না");
    if(FB_STATUS.errors && FB_STATUS.errors.length) errDetails.push("ডাটাবেস ত্রুটি: " + FB_STATUS.errors.join(", "));
    warnCard.innerHTML = `
      <div class="sw">
        <div>
          <b style="color:var(--danger)">⚠️ Firebase / সিস্টেম সতর্কতা</b>
          <div style="font-size:13.5px;margin-top:4px;color:var(--ink)">${escHtml(errDetails.join(" · "))}</div>
        </div>
      </div>
    `;
    var retryBtn = btn("🔄 সংযোগ পরীক্ষা করুন", "ghost", function(){
      toast("Firebase সংযোগ যাচাই করা হচ্ছে...");
      load();
    });
    retryBtn.style.cssText = "padding:5px 12px;font-size:12.5px";
    warnCard.querySelector(".sw").appendChild(retryBtn);
    mn.appendChild(warnCard);
  }
  if(V[view]) V[view](mn);
  sh.appendChild(sd);
  sh.appendChild(mn);
  a.appendChild(sh);
}

function changeAdminPasswordModal() {
  var oldPass = prompt("বর্তমান অ্যাডমিন পাসওয়ার্ড লিখুন:");
  if (!oldPass) return;
  sha(oldPass).then(function(oldHash) {
    db.ref("admin_config/password_hash").once("value").then(function(snap) {
      var currentHash = snap.val() || PH;
      if (oldHash !== currentHash) {
        return alert("বর্তমান পাসওয়ার্ড সঠিক নয়!");
      }
      var newPass = prompt("নতুন অ্যাডমিন পাসওয়ার্ড লিখুন (কমপক্ষে ৬ অক্ষর):");
      if (!newPass || newPass.trim().length < 6) {
        return alert("নতুন পাসওয়ার্ডটি অন্তত ৬ অক্ষরের হতে হবে!");
      }
      var confirmPass = prompt("নতুন পাসওয়ার্ডটি পুনরায় লিখুন:");
      if (newPass.trim() !== (confirmPass || "").trim()) {
        return alert("নতুন পাসওয়ার্ড মেলেনি!");
      }
      sha(newPass.trim()).then(function(newHash) {
        db.ref("admin_config/password_hash").set(newHash).then(function() {
          toast("অ্যাডমিন পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে ✓");
          alert("পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে! পরবর্তী লগইনে নতুন পাসওয়ার্ড ব্যবহার করুন।");
        }).catch(function(err) {
          alert("পাসওয়ার্ড আপডেট করা যায়নি: " + err.message);
        });
      });
    });
  });
}

function sha(t){
  return crypto.subtle.digest("SHA-256", new TextEncoder().encode(t)).then(function(b){
    return Array.prototype.map.call(new Uint8Array(b), function(x){
      return ("0" + x.toString(16)).slice(-2);
    }).join("");
  });
}

function loginView(msg){
  document.body.classList.add("admin-login-active");
  var a = $("app"); a.textContent = "";

  var wrap = el("div", "admin-glass-wrapper");
  var c = el("div", "admin-glass-card");

  c.innerHTML = `
    <div class="admin-glass-badge">🛡️</div>
    <h2 class="admin-glass-title">অ্যাডমিন লগইন</h2>
    <p class="admin-glass-sub">আমার অধ্যয়ন কক্ষ — সিকিউর অ্যাডমিন পোর্টাল</p>
    
    <div class="admin-input-group">
      <label class="admin-input-label" for="admin_uid_inp">User ID</label>
      <input type="text" id="admin_uid_inp" class="admin-glass-input" placeholder="User ID লিখুন" value="admin121" autocomplete="username" />
    </div>

    <div class="admin-input-group">
      <label class="admin-input-label" for="admin_pass_inp">পাসওয়ার্ড</label>
      <input type="password" id="admin_pass_inp" class="admin-glass-input" placeholder="পাসওয়ার্ড লিখুন" autocomplete="current-password" />
    </div>

    <div class="admin-glass-err" id="admin_err_msg">${escHtml(msg || "")}</div>

    <button type="button" class="admin-glass-btn" id="btn_admin_login">
      লগইন করুন ➔
    </button>
  `;

  wrap.appendChild(c);
  a.appendChild(wrap);

  var e = document.getElementById("admin_uid_inp");
  var p = document.getElementById("admin_pass_inp");
  var er = document.getElementById("admin_err_msg");
  var go = document.getElementById("btn_admin_login");

  setTimeout(function(){ if(p) p.focus(); }, 120);

  function handleLogin(){
    er.textContent = "";
    var inpUid = (e.value || "").trim().toLowerCase();
    var inpPass = (p.value || "").trim();

    var isUidValid = ALLOWED_ADMIN_IDS.indexOf(inpUid) > -1 || inpUid === ADMIN_ID.toLowerCase();
    if (!isUidValid) {
      er.textContent = "ID ভুল! সঠিক User ID দিন।";
      e.focus();
      return;
    }

    if (!inpPass) {
      er.textContent = "অনুগ্রহ করে পাসওয়ার্ড লিখুন।";
      p.focus();
      return;
    }

    go.disabled = true;
    go.style.opacity = "0.75";

    sha(inpPass).then(function(h){
      var hashPromise = window.FB_REST
        ? window.FB_REST.get("admin_config/password_hash")
        : db.ref("admin_config/password_hash").once("value").then(function(s){ return s.val(); });
      hashPromise.then(function(remoteHash){
        go.disabled = false;
        go.style.opacity = "1";
        var isPassValid = remoteHash
          ? (h === remoteHash)
          : (DEFAULT_HASHES.indexOf(h) > -1 || DEFAULT_PASSWORDS.indexOf(inpPass) > -1);

        if (isPassValid) {
          try { localStorage.setItem("ad-ok","1"); }catch(x){}
          document.body.classList.remove("admin-login-active");
          enter();
        } else {
          er.textContent = "পাসওয়ার্ড ভুল! সঠিক পাসওয়ার্ড দিন।";
          p.value = "";
          p.focus();
        }
      }).catch(function(){
        go.disabled = false;
        go.style.opacity = "1";
        var isPassValid = DEFAULT_HASHES.indexOf(h) > -1 || DEFAULT_PASSWORDS.indexOf(inpPass) > -1;
        if (isPassValid) {
          try { localStorage.setItem("ad-ok","1"); }catch(x){}
          document.body.classList.remove("admin-login-active");
          enter();
        } else {
          er.textContent = "পাসওয়ার্ড ভুল! সঠিক পাসওয়ার্ড দিন।";
          p.value = "";
          p.focus();
        }
      });
    }, function(){
      go.disabled = false;
      go.style.opacity = "1";
      er.textContent = "ব্রাউজারে ক্রিপ্টোগ্রাফি সাপোর্ট করছে না।";
    });
  }

  go.onclick = handleLogin;
  p.onkeydown = function(ev){ if(ev.key === "Enter") handleLogin(); };
  e.onkeydown = function(ev){ if(ev.key === "Enter") p.focus(); };
}

function enter(){
  document.body.classList.remove("admin-login-active");
  if(live) return;
  live = true;
  if(window.goOnlineDB) window.goOnlineDB(db);
  try {
    var connTimer = null;
    db.ref(".info/connected").on("value", function(sn){
      clearTimeout(connTimer);
      if(sn.val()){
        var wasDown = (FB_STATUS.connected === false);
        FB_STATUS.connected = true;
        if(wasDown && !isAdminEditing()) render();
      } else {
        connTimer = setTimeout(function(){
          FB_STATUS.connected = false;
          if(!isAdminEditing()) render();
        }, 4000);
      }
    });
  } catch(e){
    FB_STATUS.errors.push((e && e.message) || "CONN_LISTENER_ERROR");
  }
  load();
  setInterval(function(){
    if(document.visibilityState !== "visible" || isAdminEditing()) return;
    load();
  }, 20000);
}

try{
  var sv = localStorage.getItem("ad-theme");
  if(sv) document.documentElement.setAttribute("data-theme", sv);
}catch(e){}

try{
  if(localStorage.getItem("ad-ok") === "1") enter();
  else loginView();
}catch(e){
  loginView();
}
})();