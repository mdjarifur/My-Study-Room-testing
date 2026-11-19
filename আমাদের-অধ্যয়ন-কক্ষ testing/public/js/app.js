// public/js/app.js - ১০০% সিকিউর ভিআইপি লক, নিখুঁত টাইমার ও টাস্ক ইঞ্জিন
(function(){
var $=function(i){return document.getElementById(i)};
function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}
function bn(n){return Number(n||0).toLocaleString("bn-BD")}
function key(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
var db=null,P={},me=null,ready=false,lastFin=0,dirty={},first=true,PEND=[],ref=null,CODE="";
var T = firebase.database.ServerValue.TIMESTAMP;
function escHtml(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}
function extractBaseClass(raw){var s=String(raw||"").toLowerCase();if(s.indexOf("bcs")>-1||s.indexOf("job")>-1||s.indexOf("graduate")>-1||s.indexOf("bachelor")>-1||s.indexOf("honours")>-1||s.indexOf("hons")>-1||s.indexOf("masters")>-1||s.indexOf("degree")>-1||s.indexOf("বিসিএস")>-1||s.indexOf("চাকরি")>-1||s.indexOf("চাকুরী")>-1||s.indexOf("অনার্স")>-1||s.indexOf("স্নাতক")>-1||s.indexOf("মাস্টার্স")>-1)return "BCS";if(s.indexOf("ssc")>-1)return "SSC";if(s.indexOf("admission")>-1)return "Admission";if(s.indexOf("hsc")>-1)return "HSC";return ""}
try{CODE=localStorage.getItem("sr-code")||""}catch(e){}
var MON=false;
try{me=localStorage.getItem("sr-me")}catch(e){}if(me==="mon"){MON=true;me=(CODE==="1432014310")?"p1":""}
window.P=P;window.me=me;window.CODE=CODE;

function getScopedUidKey(roomCode, id){
  if(id === "p1" || id === "p2") return "sr_uid_vip_" + id;
  return "sr_uid_" + String(roomCode || "room") + "_" + String(id || "guest");
}
function saveScopedUid(roomCode, id, uidVal){
  if(!uidVal || !/^\d{5,6}$/.test(String(uidVal))) return "";
  var u = String(uidVal);
  try {
    localStorage.setItem("sr_uid", u);
    if(id) localStorage.setItem(getScopedUidKey(roomCode, id), u);
  } catch(e){}
  return u;
}
var __uidSyncCache = {};
function syncUidToFirebase(roomCode, id, uidVal, displayName){
  if(!uidVal || !/^\d{5,6}$/.test(String(uidVal)) || !id || MON) return;
  var u = String(uidVal);
  var cacheKey = String(roomCode || "") + "|" + String(id) + "|" + u + "|" + String(displayName || "");
  if(__uidSyncCache[cacheKey]) return;
  __uidSyncCache[cacheKey] = true;

  var safeName = String(displayName || (P[id] && P[id].name) || (id === "p1" ? "Tasfia Hasan" : id === "p2" ? "Rahman" : "সদস্য"));
  var REST = window.FB_REST;
  if(!REST) return;

  REST.get("numeric_uids/" + u).then(function(existing){
    if(existing && typeof existing === "object" && existing.memberId && existing.memberId !== id && (!existing.roomId || existing.roomId !== roomCode)){
      // Existing local sr_uid actually belongs to another account — allocate a fresh unique UID for this user
      var fresh = String(Math.floor(10000 + Math.random() * 90000));
      if(P[id]) P[id].uid = fresh;
      if(id === me) saveScopedUid(roomCode, id, fresh);
      syncUidToFirebase(roomCode, id, fresh, safeName);
      return;
    }
    REST.update("numeric_uids/" + u, {
      roomId: roomCode || "1432014310",
      memberId: id,
      name: safeName,
      updatedAt: Date.now()
    }).catch(function(){});

    if(id === "p1" || id === "p2"){
      REST.update("vip_users/" + id, { uid: u }).catch(function(){});
      REST.update("rooms/1432014310/" + id, { uid: u }).catch(function(){});
    }
    if(roomCode && roomCode !== "1432014310"){
      REST.update("rooms_v2/" + roomCode + "/members/" + id, { uid: u }).catch(function(){});
      REST.update("rooms_v2/" + roomCode + "/" + id, { uid: u }).catch(function(){});
    }
  }).catch(function(){
    delete __uidSyncCache[cacheKey];
  });
}
function resolveMemberUid(id, roomCode, opts){
  opts = opts || {};
  var rc = roomCode || CODE || "1432014310";
  var fromRoom = (P && P[id] && P[id].uid) || (P && P.members && P.members[id] && P.members[id].uid) || "";
  var u = /^\d{5,6}$/.test(String(fromRoom)) ? String(fromRoom) : "";
  if(!u){
    try {
      var scoped = localStorage.getItem(getScopedUidKey(rc, id)) || "";
      if(/^\d{5,6}$/.test(scoped)) u = scoped;
    } catch(e){}
  }
  if(!u){
    try {
      var legacy = localStorage.getItem("sr_uid") || "";
      if(/^\d{5,6}$/.test(legacy)) u = legacy;
    } catch(e){}
  }
  if(!u){
    u = String(Math.floor(10000 + Math.random() * 90000));
  }
  if(P && P[id] && !P[id].uid) P[id].uid = u;
  if(id === me && !MON) saveScopedUid(rc, id, u);
  if(opts.persist !== false){
    syncUidToFirebase(rc, id, u, opts.name);
  }
  return u;
}

// টাইমার ও গ্লোবাল ভ্যারিয়েবল
var RW=0, SP=0, SK="", BT=0, CE=null;

var DEFAULT_APP_LOGO = "img/login_logo.png";
var LOGOS = {
  Medical: "img/dmc.png",
  "মেডিকেল": "img/dmc.png",
  Engineering: "img/eng.png",
  "ইঞ্জিনিয়ারিং": "img/eng.png",
  Varsity: "img/ver.png",
  "ভার্সিটি": "img/ver.png"
};
function getLogo(g){
  var k = String(g || "").trim();
  if(!k) return DEFAULT_APP_LOGO;
  if(LOGOS[k]) return LOGOS[k];
  var low = k.toLowerCase();
  if(low === "medical" || low.indexOf("medical") > -1 || k.indexOf("মেডিকেল") > -1) return "img/dmc.png";
  if(low === "engineering" || low.indexOf("engineering") > -1 || k.indexOf("ইঞ্জিনিয়ার") > -1) return "img/eng.png";
  if(low === "varsity" || low === "versity" || low === "versiti" || low.indexOf("varsity") > -1 || low.indexOf("versity") > -1 || k.indexOf("ভার্সিটি") > -1) return "img/ver.png";
  return DEFAULT_APP_LOGO;
}
(function(){
  try {
    var cachedGoal = localStorage.getItem("sr_goal");
    var initLogo = document.querySelector(".brand .logo");
    if(initLogo && cachedGoal){
      initLogo.src = getLogo(cachedGoal);
    }
  } catch(e){}
})();

// অনুপ্রেরণামূলক উক্তি ভাণ্ডার
var MS = [
  "দারুণ! ডাক্তার হওয়ার পথে আরেক ধাপ এগোলে।",
  "এক এক করে কাজ শেষ, এভাবেই মেডিকেলের সিট কাছে আসে।",
  "রোগীর পাশে দাঁড়ানোর দিনটা আরও কাছে এল।",
  "সাদা অ্যাপ্রনের স্বপ্নে আরেকটা ইট বসালে।",
  "প্রতিদিনের এই অভ্যাসই ভবিষ্যতের ডাক্তার বানায়।",
  "চমৎকার! ধারাবাহিকতাই মেডিকেলের চাবিকাঠি।",
  "এগিয়ে যাও, ভবিষ্যতের ডাক্তার! আরেকটা কাজ জমা হলো।",
  "আস-সালাতু খাইরুম মিনান নাওম। ঘুমের চেয়ে নামাজ উত্তম, আজকের প্রথম জয় ফজরে ওঠা।",
  "ঘুমের চেয়ে স্বপ্ন বড়। সময়মতো ঘুমাও, সময়মতো উঠো, স্বপ্নটাকে কাজে লাগাও।",
  "ফজরের ডাক আসে ঘুমের সবচেয়ে গভীর সময়ে, তাই ওঠার জয়টাও সবচেয়ে বড়।",
  "যে সকালে বিছানা ছাড়ে, সে দিনের অর্ধেক জিতে নেয়।",
  "অ্যালার্ম বাজলে ভাবো, সাদা অ্যাপ্রন তোমাকে ডাকছে। ওঠো।",
  "ঘুম প্রতি রাতেই আসবে, কিন্তু এই সময়টা আর ফিরবে না।",
  "রাতে ঠিকমতো ঘুমাও, ভোরে ওঠার শক্তি পাবে। ভালো ঘুম পড়াকেও মাথায় বসিয়ে দেয়।",
  "ফজর পড়ে পড়তে বসলে সকালটা তোমার, ফোনের নয়।",
  "ঘুম আরামের, কিন্তু স্বপ্ন তার চেয়েও মিষ্টি। উঠে পড়ো!",
  "কম্বলের ওম ভালো লাগে, কিন্তু ডাক্তারের চেম্বার আরও ভালো লাগবে।",
  "পাঁচ মিনিট আরও ঘুমানোর লোভ সামলাতে পারলে অনেক কিছুই সামলাতে পারবে।",
  "রাতে সময়মতো ঘুমানো মানে সকালের জন্য নিজেকে উপহার দেওয়া।",
  "ঘুম শরীরের ওষুধ। ঠিক সময়ে নাও, বাকি সময়টা স্বপ্নের জন্য রাখো।",
  "যে স্বপ্ন তোমাকে ভোরে জাগায়, সেই স্বপ্নই একদিন তোমাকে সাদা অ্যাপ্রন পরাবে।",
  "ফজরের পর ঘুমে না ফিরে বই খুলো। ভোরের শান্ত সময়টাই পড়ার সেরা সময়।",
  "একদিন কেউ তোমাকে বলবে, ডাক্তার সাহেব, আপনি আমার প্রাণ বাঁচিয়েছেন।",
  "আজকের পড়া একদিন কারও ব্যথা কমানোর শক্তি হয়ে ফিরবে।",
  "ডাক্তার হওয়া মানে মানুষের সবচেয়ে কঠিন সময়ে পাশে থাকা। তুমি সেই প্রস্তুতিই নিচ্ছো।",
  "এক পাতা পড়া মানে এক রোগীর কাছে আরেকটু যোগ্য হওয়া।",
  "মেডিকেলের সুযোগ মেধার ওপর নির্ভর করে, আর মেধা তৈরি হয় রোজকার পড়ায়।",
  "একশ নম্বরের পরীক্ষায় প্রতিটা নম্বর গোনা হয়। আজকের কাজ থেকেও একটা নম্বর জমলো।",
  "পরীক্ষার আগে নতুন কিছু নয়, পুরোনো পড়াই বারবার ঝালাও। সেটাই জেতার পথ।",
  "এমবিবিএস শুধু একটা ডিগ্রি নয়, মানুষের জন্য কাজ করার সুযোগ।",
  "তোমার স্টেথোস্কোপ এখন বইয়ের ভেতরে অপেক্ষা করছে। এগিয়ে যাও।",
  "সেই দিনটার কথা ভাবো, যেদিন মা বলবেন, আমার সন্তান ডাক্তার।",
  "আজ যে সময় দিচ্ছো, কাল সেটাই হবে তোমার পরিচয়।",
  "রোগীর হাত ধরার আগে আজ বইয়ের পাতা ধরো।",
  "হাজার মাইলের পথও এক পা দিয়েই শুরু হয়। আরেক পা এগোলে।",
  "আজকের মনোযোগই কালকের ফলাফল।",
  "ক্লান্ত লাগলে বিশ্রাম নাও, হাল ছেড়ো না।",
  "মেডিকেলের স্বপ্ন তোমার হাতের নাগালে, এগিয়ে চলো!"
];

var SQ = [
  "মেধাবী নয়, তোমাকে হতে হবে প্রচণ্ড পরিশ্রমী।",
  "আজকের পড়া একদিন স্টেজের হাততালিতে ফিরে আসবে।",
  "গরিব-দুঃখীরা তোমার অপেক্ষায় আছে। আল্লাহ কবে তোমাকে তাদের কাছে পাঠাবেন, যেন তুমি তাদের পাশে দাঁড়াতে পারো।",
  "বাবা-মায়ের ঘাম ঝরানো পরিশ্রম আর রক্ত পানি করা উপার্জনের মূল্য দাও।",
  "আমিই হবো আমার পরিবারের প্রথম DMCian।",
  "Motivation-এর অপেক্ষা করো না, Discipline দিয়ে নিজেকে চালাও।",
  "তোমার হাতের চিকিৎসায় একদিন কোনো মায়ের সন্তান সুস্থ হয়ে বাড়ি ফিরবে।",
  "মনে রেখো, তোমার জন্য দুজন মানুষ নিজেদের অনেক স্বপ্ন বিসর্জন দিয়েছেন।",
  "সাদা অ্যাপ্রন শুধু সম্মান নয়, এটা মানুষের প্রতি বিশাল দায়িত্ব।",
  "হাজারো প্রতিযোগীর ভিড়ে নিজের জায়গা তৈরি করতে হলে, হাজারো মানুষের চেয়ে বেশি ধারাবাহিক হতে হবে।",
  "DMC কোনো অসম্ভব স্বপ্ন নয়, যদি প্রতিদিনের পরিশ্রম সত্যি হয়।"
];

var ENG_QUOTES = [
  "ইঞ্জিনিয়ার হওয়ার স্বপ্ন দেখো, কারণ পৃথিবী বদলায় তাদের হাতেই যারা স্বপ্ন দেখে।",
  "আজকের পরিশ্রমই কালকের ইঞ্জিনিয়ারিং ডিগ্রির ভিত্তি।",
  "প্রতিটি সমীকরণ মেলানোর মতোই জীবনের সমস্যারও সমাধান আছে।",
  "কঠিন অংক ভয় পাওয়ার জিনিস নয়, জয় করার চ্যালেঞ্জ।",
  "অনুশীলনই মানুষকে নিখুঁত করে (Practice makes perfect)।",
  "আজ যে প্রশ্নটা কঠিন লাগছে, কাল সেটাই তোমার সবচেয়ে সহজ হবে।",
  "বুয়েট-কুয়েটের স্বপ্ন শুরু হয় একটি সিদ্ধান্ত থেকে, আজ থেকেই পড়া শুরু করো।",
  "ব্যর্থতা মানে শেষ নয়, এটা পরের চেষ্টার ডেটা।",
  "প্রতিদিন একটু একটু করে এগোলেই পাহাড়সমান লক্ষ্যও ছোট হয়ে যায়।",
  "ইঞ্জিনিয়ার মানে সমস্যা দেখে পালানো নয়, সমাধান বানানো।",
  "ফিজিক্সের সূত্র মুখস্থ নয়, বুঝে শেখো, বুঝলেই জয়।",
  "ম্যাথ তোমার বন্ধু হয়ে যাবে, যদি রোজ তার সাথে সময় কাটাও।",
  "কখনো হাল ছেড়ো না (Never give up)।",
  "ভর্তি পরীক্ষার প্রস্তুতি ম্যারাথন, স্প্রিন্ট নয়।",
  "রাত জেগে পড়ার কষ্ট একদিন গর্বের গল্প হবে।",
  "নিজের সাথে প্রতিযোগিতা করো, গতকালের তোমাকে হারাও।",
  "ধৈর্য ধরো, বড় সেতুও একটা একটা ইট দিয়েই তৈরি হয়।",
  "কনসেপ্ট ক্লিয়ার থাকলে কঠিন প্রশ্নও সহজ লাগে।",
  "আজকের ঘাম আগামীর সাফল্যের সার।",
  "ছোট ছোট লক্ষ্য ঠিক করো, প্রতিটি পূরণে বড় স্বপ্ন কাছে আসবে।",
  "কেমিস্ট্রির প্রতিটি বিক্রিয়ার মতো তোমার পরিশ্রমও ফল দেবে।",
  "ইঞ্জিনিয়ারিং মানে কল্পনাকে বাস্তবে রূপ দেওয়া।",
  "মডেল টেস্ট দাও, ভুল ধরো, আবার চেষ্টা করো।",
  "বাবা-মায়ের চোখের স্বপ্নটাই তোমার সবচেয়ে বড় অনুপ্রেরণা।",
  "ইঞ্জিনিয়াররাই বানায় আগামী দিনের পৃথিবী, সেই দলে তুমিও থাকবে।",
  "তোমার হাতের কলমই একদিন সেতু আর শহরের নকশা আঁকবে।",
  "তোমার প্রস্তুতিই তোমার আত্মবিশ্বাস।",
  "স্বপ্নের ক্যাম্পাসে নিজের নাম কল্পনা করো, তারপর পড়তে বসো।"
];

var VAR_QUOTES = [
  "স্বপ্নটা বড় হলে পরিশ্রমটাও বড় হতে হয়।",
  "আজকের কষ্টই আগামী দিনের সফলতার গল্প লিখবে।",
  "থেমে যেও না, তোমার স্বপ্ন তোমার অপেক্ষায়।",
  "একটা আসন, হাজারো প্রতিযোগী—নিজেকে সেরাদের একজন করে তোলো।",
  "সময় নষ্ট করলে স্বপ্ন একদিন তোমাকে ক্ষমা করবে না।",
  "নিজের সঙ্গে প্রতিদিন প্রতিযোগিতা করো, অন্যের সঙ্গে নয়।",
  "আজ একটু বেশি পড়ো, কাল একটু বেশি এগিয়ে থাকবে।",
  "সফলতা ভাগ্যে নয়, নিয়মিত পরিশ্রমে তৈরি হয়।",
  "তোমার স্বপ্নের বিশ্ববিদ্যালয় তোমার অপেক্ষায় আছে।",
  "একদিন তোমার পরিশ্রমই তোমার পরিচয় হবে।",
  "পড়ার টেবিলে কাটানো সময় কখনো বৃথা যায় না।",
  "আজকের ত্যাগ একদিন তোমার গর্ব হয়ে ফিরবে।",
  "একদিন তোমার নামের পাশে কাঙ্ক্ষিত বিশ্ববিদ্যালয়ের পরিচয় থাকবে।",
  "হাল ছেড়ো না, হয়তো সফলতা আর মাত্র এক ধাপ দূরে।",
  "প্রতিদিন একটু একটু করে এগিয়ে যাওয়াই বড় সফলতা।",
  "ক্যাম্পাসের লাল বাসে বসে স্বপ্ন ছোঁয়ার আনন্দ আজকের নিয়মিত পড়ার ওপরই নির্ভর করে।",
  "কার্জন হল আর সবুজ চত্বর তোমার পদচারণার অপেক্ষায় আছে।",
  "প্রতিটি মডেল টেস্ট তোমাকে আরও অভিজ্ঞ করে তুলছে।",
  "স্বপ্নের বিশ্ববিদ্যালয়ে নিজের নাম কল্পনা করো, তারপর পড়তে বসো।",
  "ইনশাআল্লাহ, একদিন তোমার পরিচয় হবে তোমার স্বপ্নের বিশ্ববিদ্যালয়ের একজন শিক্ষার্থী হিসেবে।"
];

var OTH_QUOTES = [
  "লক্ষ্য ছাড়া জীবন হালবিহীন নৌকার মতো, আগে লক্ষ্য ঠিক করো।",
  "আজ শুরু করো, কারণ কাল কখনো আসে না।",
  "স্বপ্ন দেখাটা শুরু মাত্র, পূরণ করতে হলে কাজ করতে হয়।",
  "ছোট ছোট পদক্ষেপই তোমাকে বড় গন্তব্যে পৌঁছে দেবে।",
  "ব্যর্থতা মানে হেরে যাওয়া নয়, শেখার আরেকটি সুযোগ।",
  "নিজের ওপর বিশ্বাস রাখো, অর্ধেক জয় সেখানেই।",
  "প্রতিদিন একটু একটু করে নিজেকে আগের চেয়ে ভালো করো।",
  "কষ্ট ছাড়া কেউ কখনো সোনা পায়নি।",
  "যে থেমে যায়, সে হেরে যায়; যে চলতে থাকে, সে জেতে।",
  "সময়কে কাজে লাগাও, সময়ই তোমার সবচেয়ে বড় সম্পদ।",
  "আজকের কষ্ট কালকের গর্ব হয়ে ফিরে আসবে।",
  "শৃঙ্খলা হলো স্বপ্ন আর সাফল্যের মধ্যকার সেতু।",
  "প্রতিটি সকাল একটি নতুন সুযোগ নিয়ে আসে।",
  "অনুশীলনই মানুষকে নিখুঁত করে।",
  "কঠিন সময়ই মানুষকে শক্ত করে গড়ে তোলে।",
  "সাফল্যের কোনো শর্টকাট নেই, আছে শুধু নিরলস পরিশ্রম।",
  "তোমার চেষ্টাই তোমার পরিচয় গড়ে দেবে।",
  "ধৈর্য আর অধ্যবসায়ের কাছে কোনো বাধাই টেকে না।"
];

var BCS_QUOTES = [
  "বিসিএস বা সরকারি চাকরি কোনো ভাগ্যের খেলা নয়, এটি প্রতিদিনের ধারাবাহিক পরিশ্রমের ফল।",
  "আজকের সংবিধান ও বাংলা সাহিত্যের প্রতিটি অধ্যায় আগামী দিনের ক্যাডার পরিচয়ের ভিত্তি।",
  "হাজারো প্রতিযোগীর ভিড়ে এগিয়ে থাকতে হলে প্রতিদিন একটু বেশি মনোযোগী হতে হয়।",
  "ধৈর্য, শৃঙ্খলা আর নিয়মিত মডেল টেস্টই তোমাকে চূড়ান্ত লক্ষ্যে পৌঁছে দেবে।",
  "আজকের নীরব পরিশ্রমই একদিন গেজেটে নাম হয়ে প্রকাশ পাবে, ইনশাআল্লাহ।",
  "অজুহাত নয়, প্রতিদিন অন্তত ছোট একটি লক্ষ্য শেষ করে তবেই ওঠো।",
  "প্রতিটি ভুল প্রশ্ন থেকে শেখো—চূড়ান্ত পরীক্ষায় সেই ভুলই তোমাকে জিতিয়ে দেবে।",
  "সময়কে সম্মান করলে সময়ই তোমাকে কাঙ্ক্ষিত কর্মক্ষেত্রে পৌঁছে দেবে।"
];

var MOT = {
  Medical: MS.concat(SQ),
  Engineering: ENG_QUOTES,
  Varsity: VAR_QUOTES,
  "BCS Cadre": BCS_QUOTES,
  "Bank Job": BCS_QUOTES,
  "Govt. Job": BCS_QUOTES,
  BCS: BCS_QUOTES,
  Other: OTH_QUOTES
};

var DEF_SUBJ = ["Bangla", "English", "ICT", "Physics", "Chemistry", "Biology", "Higher Math", "General Math"];
var BCS_DEF_SUBJ = ["Bangla", "English", "Bangladesh Affairs", "International Affairs", "Math & Mental Ability", "General Science", "Computer & ICT", "Ethics & Governance"];
function getActiveUserClass(){
  try {
    if(me && P && P[me]){
      var cb = extractBaseClass(P[me].classBase || P[me].cls);
      if(cb) return cb;
    }
    var cached = extractBaseClass(localStorage.getItem("sr_class"));
    if(cached) return cached;
  } catch(e){}
  return "HSC";
}
function getSubjects(){
  var baseList = (getActiveUserClass() === "BCS") ? BCS_DEF_SUBJ : DEF_SUBJ;
  var list = baseList.slice();
  try {
    var saved = JSON.parse(localStorage.getItem("sr_custom_subj") || "[]");
    saved.forEach(function(s){
      if(list.indexOf(s) < 0 && s.trim()) list.push(s.trim());
    });
    if(P && P.custom_subjects){
      var cObj = P.custom_subjects;
      Object.keys(cObj).forEach(function(k){
        var val = typeof cObj[k] === "string" ? cObj[k].trim() : (cObj[k] && cObj[k].name ? cObj[k].name.trim() : "");
        if(val && list.indexOf(val) < 0) list.push(val);
      });
    }
  } catch(e){}
  return list;
}
function saveSubject(name){
  name = String(name || "").trim().slice(0, 30);
  if(!name) return;
  var baseList = (getActiveUserClass() === "BCS") ? BCS_DEF_SUBJ : DEF_SUBJ;
  var list = [];
  try {
    list = JSON.parse(localStorage.getItem("sr_custom_subj") || "[]");
  } catch(e){}
  if(list.indexOf(name) < 0 && baseList.indexOf(name) < 0){
    list.push(name);
    localStorage.setItem("sr_custom_subj", JSON.stringify(list));
  }
  try {
    if(ref && CODE){
      ref.child("custom_subjects").push(name).catch(function(){});
    }
    if(CODE === "1432014310"){
      if(window.FB_REST){
        window.FB_REST.push("vip_custom_subjects", name).catch(function(){});
      } else {
        var dbx = window.db || firebase.database();
        dbx.ref("vip_custom_subjects").push(name).catch(function(){});
      }
    }
  } catch(e){}
}

var MEMBER_COLORS=["#3fcaa2","#a995ff","#f0cf6b","#38bdf8","#f472b6","#fb923c","#a3e635","#e879f9"];
var RANKS_BN=["১ম","২য়","৩য়","৪র্থ","৫ম","৬ষ্ঠ","৭ম","৮ম"];
var MEDALS=["🥇","🥈","🥉"];

function getMembers(){
  if(CODE === "1432014310"){
    return ["p1", "p2"];
  }
  var hasMembersMap = !!(P.members && typeof P.members === "object" && Object.keys(P.members).length > 0);
  var excluded = {meta:1,members:1,exam:1,chat:1,pres:1,bk:1,pass_request:1,custom_subjects:1,admin_alerts:1};
  var keys = Object.keys(P).filter(function(k){
    if(excluded[k]) return false;
    if(typeof P[k] !== "object" || P[k] === null || !P[k].name) return false;
    if(hasMembersMap && !P.members[k] && k !== me) return false;
    return true;
  });
  if(keys.length === 0) return [me || "m1"];
  return keys;
}

function getOrderedMembers(){
  var mems = getMembers();
  if(!me) return mems;
  var rest = mems.filter(function(x){ return x !== me; });
  return mems.indexOf(me) > -1 ? [me].concat(rest) : mems;
}

function nm(id){
  if(id === "p1") return pl(id).name || localStorage.getItem("vip_p1_name") || "Tasfia Hasan";
  if(id === "p2") return pl(id).name || localStorage.getItem("vip_p2_name") || "Rahman";
  return pl(id).name || "সাথী";
}

function pl(id){
  var p=P[id]||{};
  var defName = (id==="p1") ? (localStorage.getItem("vip_p1_name")||"Tasfia Hasan") : (id==="p2") ? (localStorage.getItem("vip_p2_name")||"Rahman") : "";
  var out = {
    name:p.name||defName,cls:p.cls||"",college:p.college||"",goal:p.goal||"Medical",mobile:p.mobile||"",
    days:p.days||{},mins:p.mins||{},study:p.study||null,sess:p.sess||[],
    pr:p.pr||{},brk:p.brk||null,sc:p.sc||[]
  };
  if(p.uid !== undefined) out.uid = p.uid;
  if(p.pin !== undefined) out.pin = p.pin;
  if(p.classBase !== undefined) out.classBase = p.classBase;
  if(p.passingYear !== undefined) out.passingYear = p.passingYear;
  if(p.joinedAt !== undefined) out.joinedAt = p.joinedAt;
  if(p.creator !== undefined) out.creator = p.creator;
  if(p.expiresAt !== undefined) out.expiresAt = p.expiresAt;
  return out;
}
function pct(p,k){var a=(p.days[k]||[]).filter(function(x){return !x.x});return a.length?Math.round(a.filter(function(x){return x.d}).length/a.length*100):null}
function cnt(p,k){var a=(p.days[k]||[]).filter(function(x){return !x.x});return[a.filter(function(x){return x.d}).length,a.length]}

// রুম ও ব্যক্তিগত মেয়াদ / স্থগিত অবস্থা যাচাই
function getRoomLockState(){
  if(!CODE || CODE === "1432014310") return null;
  if(me === "p1" || me === "p2") return null;
  var meta = P && P.meta;
  if(!meta || typeof meta !== "object") return null;
  var n = NOW();
  if(meta.status === "suspended" || meta.status === "blocked"){
    return {
      locked: true,
      title: "🚫 রুমটি সাময়িকভাবে বন্ধ আছে! ব্যবহারের জন্য অ্যাডমিনের অনুমতি প্রয়োজন।",
      sub: "নিচের Feedback অপশনে দিয়ে অ্যাডমিনের সাথে কথা বলুন।"
    };
  }
  if(!MON && me){
    var hasMemberRec = !!(P.members && P.members[me]);
    var memExp = hasMemberRec ? Number(P.members[me].expiresAt || 0) : Number((P[me] && P[me].expiresAt) || 0);
    if(memExp > 0){
      if(n > memExp){
        return {
          locked: true,
          title: meta.status === "approved"
            ? "🚫 আপনার এই রুম ব্যবহারের মেয়াদ শেষ! ব্যবহারের জন্য অ্যাডমিনের অনুমতি প্রয়োজন।"
            : "🚫 ৩ দিনের ফ্রি ট্রায়াল শেষ! ব্যবহারের জন্য অ্যাডমিনের অনুমতি প্রয়োজন।",
          sub: "নিচের Feedback অপশনে দিয়ে অ্যাডমিনের সাথে কথা বলুন।"
        };
      }
      return null;
    }
  }
  var curExp = meta.expiresAt || meta.trialEnds || 0;
  if(meta.status === "approved" && meta.expiresAt && n > meta.expiresAt){
    return {
      locked: true,
      title: "🚫 রুমের মেয়াদ শেষ! ব্যবহারের জন্য অ্যাডমিনের অনুমতি প্রয়োজন।",
      sub: "নিচের Feedback অপশনে দিয়ে অ্যাডমিনের সাথে কথা বলুন।"
    };
  }
  if(meta.status !== "approved" && curExp && n > curExp){
    return {
      locked: true,
      title: "🚫 ৩ দিনের ফ্রি ট্রায়াল শেষ! ব্যবহারের জন্য অ্যাডমিনের অনুমতি প্রয়োজন।",
      sub: "নিচের Feedback অপশনে দিয়ে অ্যাডমিনের সাথে কথা বলুন।"
    };
  }
  return null;
}

// ডাটাবেস সেভ ও সেন্ট্রাল ভিআইপি সিঙ্ক
function put(id,fn){
  if(MON)return;
  if(getRoomLockState()){toast("মেয়াদ শেষ — নিচের Feedback অপশনে অ্যাডমিনের সাথে কথা বলুন");return}
  if(first){PEND.push([id,fn]);toast("সংযোগ হচ্ছে, একটু অপেক্ষা করো…");return}
  var p=JSON.parse(JSON.stringify(pl(id)));
  fn(p);
  P[id]=p;
  dirty[id]=NOW();
  if(id === me && p.name){
    try { localStorage.setItem("sr-name", p.name); } catch(e){}
  }
  render();

  if(ref) {
    ref.child(id).set(p).catch(function(){toast("সেভ হয়নি, ইন্টারনেট আছে তো?")});
    
    if(CODE !== "1432014310"){
      var memSync = {
        name: p.name || "",
        college: p.college || "",
        cls: p.cls || "",
        goal: p.goal || "Medical",
        mobile: p.mobile || "",
        joinedAt: p.joinedAt || (P.members && P.members[id] && P.members[id].joinedAt) || Date.now()
      };
      if(p.uid !== undefined) memSync.uid = p.uid;
      if(p.pin !== undefined) memSync.pin = p.pin;
      if(p.classBase !== undefined) memSync.classBase = p.classBase;
      if(p.passingYear !== undefined) memSync.passingYear = p.passingYear;
      ref.child("members/" + id).update(memSync).catch(function(){});
    }
  }

  // ভিআইপি ইউজারদের টাস্ক সেন্ট্রাল ক্লাউডে সিঙ্ক
  if(id === "p1" || id === "p2"){
    var dbx = window.db || firebase.database();
    var vipSync = {
      name: p.name || "",
      college: p.college || "",
      cls: p.cls || "",
      goal: p.goal || "Medical",
      mobile: p.mobile || "",
      days: p.days || {},
      mins: p.mins || {},
      pr: p.pr || {},
      sc: p.sc || []
    };
    if(p.uid !== undefined) vipSync.uid = p.uid;
    if(p.classBase !== undefined) vipSync.classBase = p.classBase;
    if(p.passingYear !== undefined) vipSync.passingYear = p.passingYear;
    if(window.FB_REST){
      window.FB_REST.update("vip_users/" + id, vipSync).catch(function(){});
    } else {
      var dbx = window.db || firebase.database();
      dbx.ref("vip_users/" + id).update(vipSync).catch(function(){});
    }
  }
}
var tt;function toast(m,ms){var c=$("cheer");if(!c)return;c.textContent="";var msgSpan=el("div",null,m);c.appendChild(msgSpan);var clsBtn=el("button","cheer-close","✕");clsBtn.type="button";clsBtn.setAttribute("aria-label","বন্ধ করো");clsBtn.onclick=function(){clearTimeout(tt);c.classList.remove("show")};c.appendChild(clsBtn);c.scrollTop=0;c.classList.add("show");clearTimeout(tt);tt=setTimeout(function(){c.classList.remove("show")},ms||3600)}

// নিখুঁত টাইমার গণনা
function sRem(s){
  if(!s || !s.t) return 0;
  var elapsed = s.ps ? (s.ps - s.t - (s.pz||0)) : (NOW() - s.t - (s.pz||0));
  return Math.max(0, (s.d || 180) * 6e4 - elapsed);
}
function sEl(s){return (s.d||180)*6e4-sRem(s)}
function active(s){return !!(s && s.t && sRem(s) > 0)}
function brkOn(p){return !!(p.brk && p.brk.e > NOW())}
function resumeStudy(q,at){var x=q.study;if(x&&x.ps){x.pz=(x.pz||0)+Math.max(0,at-x.ps);delete x.ps}}
function liveMin(p,k){var m=p.mins[k]||0;if(active(p.study)&&!p.study.ps)m+=Math.floor(sEl(p.study)/6e4);return m}
function sumMin(p){var t=0;for(var k in p.mins)t+=p.mins[k]||0;return t}
function fmtClock(ms){var s=Math.max(0,Math.floor(ms/1000)),h=Math.floor(s/3600),m=Math.floor(s%3600/60);s%=60;var p=function(n){return String(n).padStart(2,"0")};return(h?h+":":"")+p(m)+":"+p(s)}
function fmtHM(m){var h=Math.floor(m/60);return(h?bn(h)+" ঘণ্টা ":"")+bn(m%60)+" মিনিট"}
function fmtHMs(m){return bn(Math.floor(m/60))+"ঘ "+bn(m%60)+"মি"}
function todayMin(p){return liveMin(p,key(new Date()))}

function sumBtn(){
  var b=$("sumBtn");if(!me)return;
  var mems = getOrderedMembers();
  var parts = mems.map(function(id){
    var isMe = (id === me && !MON);
    return (isMe?"তুমি":nm(id)) + " " + fmtHMs(todayMin(pl(id)));
  });
  var t = "⏳ আজকের পড়া: " + parts.join(" · ");
  if(b.dataset.s===t)return;b.dataset.s=t;b.textContent="";b.appendChild(el("span",null,t));b.appendChild(el("span","mute","বিস্তারিত ›"));
}

function detail(id){
  var m=$("modal"),b=$("mbox");b.dataset.lb="0";b.textContent="";b.style.maxWidth="560px";
  m.hidden=false;m.removeAttribute("hidden");m.style.setProperty("display","grid","important");
  var p=pl(id),tabs=el("div","row");tabs.style.marginTop="0";
  var mems = getOrderedMembers();
  mems.forEach(function(x){
    var t=el("button","btn"+(x===id?"":" ghost")+(x!==me?" alt":""),nm(x));
    t.type="button";t.onclick=function(){detail(x)};tabs.appendChild(t);
  });
  var cl=el("button","btn ghost","✕");cl.type="button";cl.setAttribute("aria-label","বন্ধ করো");
  cl.onclick=function(){m.hidden=true;m.setAttribute("hidden","");m.style.setProperty("display","none","important");};
  tabs.appendChild(cl);b.appendChild(tabs);
  var tk=key(new Date()),big=el("div","big",fmtHM(todayMin(p)));big.style.color="var(--a)";b.appendChild(big);b.appendChild(el("div","mute","আজকের পড়া"));
  var S=(p.sess||[]).filter(function(x){return key(new Date(x.a))===tk}).reverse(),by={},st=0;
  S.forEach(function(x){by[x.s]=(by[x.s]||0)+x.m;st+=x.m});
  var chips=el("div","now");Object.keys(by).sort(function(a,c){return by[c]-by[a]}).forEach(function(k){chips.appendChild(el("span",id===me?"":"o",k+": "+fmtHM(by[k])))});b.appendChild(chips);
  var rest=(p.mins[tk]||0)-st;if(rest>0)b.appendChild(el("p","mute","বিস্তারিত ছাড়া হিসাব: "+fmtHM(rest)));
  if(active(p.study))b.appendChild(el("p",null,"এখন চলছে: "+p.study.s+(p.study.tp?" — "+p.study.tp:"")));
  b.appendChild(el("h2",null,"সেশনের তালিকা"));
  if(!S.length)b.appendChild(el("p","mute","এখনো কোনো সেশন সেভ হয়নি।"));
  var tf={hour:"numeric",minute:"2-digit"};
  S.forEach(function(x){
    var r=el("div","ses"),l=el("div"),a=new Date(x.a),e=new Date(x.a+x.m*6e4);
    l.appendChild(el("b",null,x.s+(x.tp?" — "+x.tp:"")));
    l.appendChild(el("small",null,a.toLocaleDateString("bn-BD",{day:"numeric",month:"short"})+", "+a.toLocaleTimeString("bn-BD",tf)+" থেকে "+e.toLocaleTimeString("bn-BD",tf)));
    r.appendChild(l);r.appendChild(el("b",null,fmtHM(x.m)));b.appendChild(r);
  });
}

function finish(auto){
  var st=pl(me).study;if(!st||lastFin===st.t)return;lastFin=st.t;
  var m=Math.round(Math.min(sEl(st),(st.d||180)*6e4)/6e4),k=key(new Date()),nme=nm(me);
  put(me,function(q){q.study=null;q.brk=null;if(m>0){q.mins[k]=(q.mins[k]||0)+m;q.sess=q.sess||[];q.sess.push({a:st.t,s:st.s,tp:st.tp||"",m:m});if(q.sess.length>300)q.sess=q.sess.slice(-300)}});
  
  var myGoal = pl(me).goal || "Medical";
  var cat = MOT[myGoal] ? myGoal : "Other";
  var pool = MOT[cat];
  toast(m>0 ? pool[Math.floor(Math.random()*pool.length)] + " ("+bn(m)+" মিনিট জমা হলো)" : "সেশন থামানো হলো");
  if(auto===true){
    notifyBgCompletion("⏱️ পড়ার সময় সম্পন্ন!", (nme ? nme + ", " : "") + (m > 0 ? bn(m) + " মিনিটের স্টাডি সেশন সম্পন্ন হয়েছে।" : "স্টাডি সেশন সম্পন্ন হয়েছে।"));
    longBeep(function(){speakCompletionMessage(nme)});
  }
}

function sBox(id,p){var on=P.pres&&P.pres[id]===true,run=active(p.study)&&!p.study.ps&&!brkOn(p);
  if(!on&&!run)return null;return el("div","sbox"+(on?" dot":""),run?"এখন পড়ছে":"")}

function card(id,isMe){
  var p=pl(id),k=key(new Date()),pc=pct(p,k),c=cnt(p,k);
  var d=el("div","pc"+(isMe?"":" o"));
  d.setAttribute("role","button");d.tabIndex=0;d.setAttribute("aria-label",nm(id)+": ইতিহাস ও ব্যাকআপ");
  d.onclick=function(){hist(id)};
  d.appendChild(el("b","n",nm(id)+(isMe&&!MON?" (তুমি)":"")));
  var pr=el("div","prow");pr.appendChild(el("div","big",pc==null?"–":bn(pc)+"%"));var sb=sBox(id,p);if(sb)pr.appendChild(sb);d.appendChild(pr);
  var b=el("div","bar"),i=el("i");i.style.width=(pc||0)+"%";b.appendChild(i);d.appendChild(b);
  d.appendChild(el("div","mute",c[1]?bn(c[0])+"/"+bn(c[1])+" কাজ শেষ":"এখনো কাজ যোগ হয়নি"));
  d.appendChild(el("div","mute","আজ পড়া: "+bn(liveMin(p,k))+" মিনিট"));
  if(p.college){
    var mClsBase = extractBaseClass(p.classBase || p.cls) || "HSC";
    d.appendChild(el("div","mute", (mClsBase === "BCS" ? "প্রতিষ্ঠান: " : "কলেজ: ") + p.college));
  }
  return d;
}

function taskList(ul,id,editable){
  var k=key(new Date()),all=(pl(id).days[k]||[]).filter(function(x){return !x.x}),arr=all.filter(function(x){return !x.h});ul.textContent="";
  if(!arr.length){ul.appendChild(el("li","mute",all.length?"সব কাজ শেষ। ইতিহাসে দেখা যাবে।":editable?"উপরে লিখে প্রথম কাজটা যোগ করো।":"এখনো কোনো কাজ যোগ হয়নি।"));return}
  arr.forEach(function(t){
    var li=el("li",(t.d?"done":"")+(editable?"":" ro"));
    var c=el("button","chk",t.d?"✓":"");c.type="button";c.setAttribute("aria-label",t.t);
    if(editable)c.onclick=function(){
      put(me,function(p){p.days[k].forEach(function(x){if(x.i===t.i)x.d=t.d?0:1})});
      if(!t.d){
        var a=pl(me).days[k].filter(function(x){return !x.x});
        var myGoal = pl(me).goal || "Medical";
        var cat = MOT[myGoal] ? myGoal : "Other";
        var pool = MOT[cat];
        toast(a.every(function(x){return x.d})?"আজকের সব কাজ শেষ! দারুণ একটা দিন।" : pool[Math.floor(Math.random()*pool.length)], 8000);
      }
    };else c.disabled=true;
    li.appendChild(c);li.appendChild(el("span","txt",t.t));
    if(editable){var x=el("button","del","×");x.type="button";x.setAttribute("aria-label","মুছে ফেলো");x.onclick=function(){put(me,function(p){p.days[k].forEach(function(y){if(y.i===t.i){if(y.d)y.h=1;else y.x=1}})})};li.appendChild(x)}
    ul.appendChild(li);
  });
}

var TS={s:"Bangla",tp:"",d:45},CR=2*Math.PI*90,addingCustomSubject=false;
function timerBox(){
  var box=$("timer");box.textContent="";var st=pl(me).study;
  if(active(st)){
    if(brkOn(pl(me))){var bb=el("button","sumbtn","");bb.type="button";bb.appendChild(el("span",null,"☕ "+nm(me)+" ("+bn(pl(me).brk.m)+") মিনিটের Break নিচ্ছে।"));bb.appendChild(el("span","mute","ঘড়ি দেখো ›"));bb.onclick=function(){brkModal(me)};box.appendChild(bb);return}
    var rem0=sRem(st),tot=(st.d||180)*6e4,w=el("div","ringw");
    w.innerHTML='<svg class="ring" viewBox="0 0 220 220" aria-hidden="true"><defs><linearGradient id="rg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3fcaa2"/><stop offset="1" stop-color="#a995ff"/></linearGradient></defs><circle class="rt" cx="110" cy="110" r="90"/><circle class="rp" id="rp" cx="110" cy="110" r="90" stroke-dasharray="565.49" stroke-dashoffset="0"/></svg>';
    var rc=el("div","rc"),cd=el("b","cd");cd.dataset.own=me;cd.dataset.tot=tot;cd.dataset.ring="1";cd.textContent=fmtClock(rem0);
    rc.appendChild(cd);rc.appendChild(el("div",null,st.s));if(st.tp)rc.appendChild(el("div","mute",st.tp));w.appendChild(rc);box.appendChild(w);
    w.querySelector("#rp").style.strokeDashoffset=CR*(1-Math.max(0,rem0)/tot);
    var b=el("button","btn alt","থামাও ও সেভ করো");b.type="button";b.style.cssText="display:block;margin:12px auto 0";b.onclick=finish;box.appendChild(b);
  }else if(addingCustomSubject){
    var af=el("div","row");af.style.marginTop="0";
    var ni=el("input");ni.type="text";ni.placeholder="নতুন বিষয়ের নাম (যেমন: Physics, Biology)...";ni.style.cssText="flex:1;min-width:180px";
    var ab=el("button","btn","✓ যোগ করো");ab.type="button";
    ab.onclick=function(){
      var v=ni.value.trim();
      if(!v) return toast("বিষয়ের নাম লিখুন");
      saveSubject(v);
      TS.s=v;
      addingCustomSubject=false;
      timerBox();
    };
    var cb=el("button","btn ghost","বাতিল");cb.type="button";
    cb.onclick=function(){
      addingCustomSubject=false;
      timerBox();
    };
    af.appendChild(ni);af.appendChild(ab);af.appendChild(cb);box.appendChild(af);
    setTimeout(function(){ ni.focus(); }, 50);
  }else{
    var f=el("div","row");f.style.marginTop="0";
    var sel=el("select");sel.setAttribute("aria-label","বিষয়");
    var subjs = getSubjects();
    if(subjs.indexOf(TS.s) < 0) TS.s = subjs[0] || "Bangla";
    subjs.forEach(function(x){var o=el("option",null,x);o.value=x;sel.appendChild(o)});
    sel.value=TS.s;
    sel.onchange=function(){TS.s=sel.value};

    var addSubBtn = el("button","btn ghost","➕ বিষয় যোগ");
    addSubBtn.type = "button";
    addSubBtn.style.cssText = "padding:8px 12px;font-size:14px;white-space:nowrap";
    addSubBtn.onclick = function(){
      addingCustomSubject = true;
      timerBox();
    };

    var ds=el("select");ds.setAttribute("aria-label","সময়");[25,45,60,90,120].forEach(function(n){var o=el("option",null,bn(n)+" মিনিট");o.value=n;ds.appendChild(o)});ds.value=TS.d;ds.onchange=function(){TS.d=Number(ds.value)};
    var tp=el("input","tr");tp.type="text";tp.maxLength=60;tp.placeholder="টপিক (যেমন: কবিতা / ব্যাকরণ)";tp.value=TS.tp;tp.oninput=function(){TS.tp=tp.value};tp.setAttribute("aria-label","টপিক");
    var go=el("button","btn","পড়া শুরু ▶");go.type="button";
    go.onclick=function(){
      unlockAudio();
      requestStudyNotifPerm();
      put(me, function(q){
        q.study = { s: TS.s, tp: TS.tp.trim(), t: NOW(), d: TS.d, pz: 0 };
        delete q.study.ps;
        q.brk = null;
      });
    };
    f.appendChild(sel);f.appendChild(addSubBtn);f.appendChild(ds);f.appendChild(tp);f.appendChild(go);box.appendChild(f);
  }
}

function dm(p,k){return k===key(new Date())?liveMin(p,k):(p.mins[k]||0)}
function drow(n,m,c,f,hi,cl,accentColor){
  var r=el("div","dr "+cl+(hi?" hi":"")),t=el("div","dn");
  if(hi&&!cl&&accentColor){r.style.borderColor=accentColor;r.style.background="rgba(255,255,255,0.05)"}
  t.appendChild(el("b",null,n));var st=el("div","ds");st.appendChild(el("span",null,"⏱ "+fmtHMs(m)));st.appendChild(el("span",null,"✅ "+bn(c[0])+"/"+bn(c[1])+" কাজ"));t.appendChild(st);r.appendChild(t);
  var q=el("div","dsc");q.appendChild(el("b",null,bn(f)));q.appendChild(el("small",null,"স্কোর"));r.appendChild(q);var bar=el("div","dbar"),i=el("i");i.style.width=f+"%";if(!cl&&accentColor)i.style.background=accentColor;bar.appendChild(i);r.appendChild(bar);return r;
}

function board(){
  var w=$("board");if(!w)return;w.textContent="";
  var mems=getOrderedMembers(),wins={},wj=0,n=0;
  for(var i=0;i<7;i++){
    var d=new Date();d.setDate(d.getDate()-i);var k=key(d);
    var items=mems.map(function(id,idx){var p=pl(id);return{id:id,idx:idx,name:nm(id),c:cnt(p,k),m:dm(p,k),f:0,hi:false}});
    if(!items.some(function(it){return it.c[1]>0||it.m>0}))continue;
    n++;
    var tt=items.reduce(function(s,it){return s+it.m},0);
    items.forEach(function(it){
      var tpct=it.c[1]?it.c[0]/it.c[1]*100:0;
      it.f=Math.round((tt?it.m/tt*100:0)/2+tpct/2);
    });
    var win="সমান";
    if(items.length===1){
      var singleIt=items[0];
      if(singleIt.m>0||singleIt.c[0]>0){win="🏆 "+singleIt.name;wins[singleIt.id]=(wins[singleIt.id]||0)+1;singleIt.hi=true}
      else win="চলমান";
    }else if(items.length===2){
      var A0=items[0],B0=items[1];
      if(Math.abs(A0.m-B0.m)<=5){win="🤝 Joint Winner";wj++;A0.hi=B0.hi=true}
      else if(A0.f>B0.f){win="🏆 "+A0.name;wins[A0.id]=(wins[A0.id]||0)+1;A0.hi=true}
      else if(B0.f>A0.f){win="🏆 "+B0.name;wins[B0.id]=(wins[B0.id]||0)+1;B0.hi=true}
    }else{
      var maxF=Math.max.apply(null,items.map(function(it){return it.f}));
      var topItems=items.filter(function(it){return it.f===maxF&&(it.m>0||it.c[0]>0||maxF>0)});
      if(topItems.length>1){win="🤝 Joint Winner";wj++;topItems.forEach(function(it){it.hi=true})}
      else if(topItems.length===1){win="🏆 "+topItems[0].name;wins[topItems[0].id]=(wins[topItems[0].id]||0)+1;topItems[0].hi=true}
    }
    var card=el("div","dl"),hd=el("div","dh");hd.appendChild(el("b",null,d.toLocaleDateString("bn-BD",{day:"numeric",month:"short"})));hd.appendChild(el("span","dwn",win));card.appendChild(hd);
    items.forEach(function(it){
      var cl=it.idx===0?"g":(it.idx===1?"v":"");
      card.appendChild(drow(it.name,it.m,it.c,it.f,it.hi,cl,MEMBER_COLORS[it.idx%MEMBER_COLORS.length]));
    });
    w.appendChild(card);
  }
  if(!n){w.appendChild(el("p","mute","কাজ যোগ করলে বা পড়লে এখানে হিসাব আসবে।"));return}
  if(mems.length===1){
    w.appendChild(el("p",null,"সক্রিয় দিন: "+bn(n)+" দিন · অর্জিত দিন: "+bn(wins[mems[0]]||0)+" বার"));
  }else{
    w.appendChild(el("p",null,"জয়: "+mems.map(function(id){return nm(id)+" "+bn(wins[id]||0)+" বার"}).join(", ")+(wj?" · Joint "+bn(wj)+" বার":"")));
  }
}

var root=document.documentElement,mb=$("mode");
function dark(){var a=root.getAttribute("data-theme");return a?a==="dark":matchMedia("(prefers-color-scheme: dark)").matches}
var ICON_SUN='<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
var ICON_MOON='<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
function pm(){if(mb) mb.innerHTML=dark()?(ICON_SUN+'<span>লাইট</span>'):(ICON_MOON+'<span>ডার্ক</span>')}
try{var sv=localStorage.getItem("sr-theme");if(sv)root.setAttribute("data-theme",sv)}catch(e){}
if(mb){
  mb.onclick=function(){var n=dark()?"light":"dark";root.setAttribute("data-theme",n);try{localStorage.setItem("sr-theme",n)}catch(e){}pm()};
}

// রুম পাসকোড পরিবর্তনের লাইভ নোটিফিকেশন ব্যানার
function renderPassRequestBanner(){
  var pr = P.pass_request;
  var bannerId = "pass_req_banner";
  var existing = $(bannerId);
  if(existing) existing.remove();

  if(!pr || pr.resolved || pr.rejected || (NOW() - pr.at > 600000)) return;

  var b = el("div", "card");
  b.id = bannerId;
  b.style.cssText = "background:linear-gradient(90deg,var(--as),var(--bs));border:2px solid var(--b);margin-bottom:14px;padding:14px;border-radius:16px";

  if(pr.byId === me){
    b.innerHTML = `
      <div class="sw">
        <div><b>🔑 পাসকোড পরিবর্তন রিকোয়েস্ট:</b> তোমার দেওয়া নতুন পাসকোড: <b>"${escHtml(pr.newPass)}"</b> (অন্যান্য মেম্বারদের ভোটের অপেক্ষায়...)</div>
        <button class="btn dn" id="btn_cancel_pr" style="padding:4px 12px;font-size:13px">বাতিল করো</button>
      </div>
    `;
    b.querySelector("#btn_cancel_pr").onclick = function(){
      ref.child("pass_request/rejected").set(true);
    };
  } else {
    b.innerHTML = `
      <div class="sw">
        <div>📢 <b>${escHtml(pr.by)}</b> রুমের পাসকোড পরিবর্তন করতে চাচ্ছে। নতুন পাসকোড: <b>"${escHtml(pr.newPass)}"</b></div>
        <div class="row" style="margin:0">
          <button class="btn" id="btn_pr_yes" style="padding:6px 16px;font-size:13px">✅ হ্যাঁ</button>
          <button class="btn dn" id="btn_pr_no" style="padding:6px 16px;font-size:13px">❌ না</button>
        </div>
      </div>
    `;

    b.querySelector("#btn_pr_yes").onclick = function(){
      var btnYes = b.querySelector("#btn_pr_yes");
      var newCode = String(pr.newPass || "").trim().replace(/[.$#\[\]\/]/g, "_");
      var oldCode = CODE;
      var dbx = window.db || firebase.database();

      if(!newCode || newCode.length < 4 || newCode === "1432014310" || newCode === oldCode){
        ref.child("pass_request/rejected").set(true);
        toast("এই পাসকোড ব্যবহার করা যাবে না");
        return;
      }
      if(btnYes) btnYes.disabled = true;

      var REST = window.FB_REST;
      Promise.all([
        REST.get("rooms_v2/" + newCode, { shallow: true }),
        REST.get("rooms/" + newCode, { shallow: true })
      ]).then(function(checks){
        if(checks[0] !== null || checks[1] !== null){
          ref.child("pass_request/rejected").set(true);
          toast("এই পাসকোডটি আগেই অন্য রুম ব্যবহার করছে!");
          return;
        }
        return Promise.all([
          REST.get("rooms_v2/" + oldCode),
          REST.get("r2data/" + oldCode),
          REST.get("admin_alerts/" + oldCode)
        ]).then(function(vals){
          var rData = vals[0];
          if(!rData || typeof rData !== "object"){
            if(btnYes) btnYes.disabled = false;
            toast("পুরোনো রুমের ডেটা পাওয়া যায়নি");
            return;
          }
          rData.pass_request = { resolved: true };
          var u = {};
          u["rooms_v2/" + newCode] = rData;
          u["rooms_v2/" + oldCode] = null;
          u["room_meta/" + newCode] = {
            name: (rData.meta && rData.meta.name) || newCode,
            status: (rData.meta && rData.meta.status) || "approved",
            updatedAt: { ".sv": "timestamp" }
          };
          if(rData.meta && rData.meta.expiresAt) u["room_meta/" + newCode].expiresAt = rData.meta.expiresAt;
          if(rData.meta && rData.meta.max) u["room_meta/" + newCode].max = rData.meta.max;
          if(rData.meta && rData.meta.createdAt) u["room_meta/" + newCode].createdAt = rData.meta.createdAt;
          u["room_meta/" + oldCode] = null;

          if(vals[1] !== null && vals[1] !== undefined){
            u["r2data/" + newCode] = vals[1];
            u["r2data/" + oldCode] = null;
          }
          if(vals[2] !== null && vals[2] !== undefined){
            u["admin_alerts/" + newCode] = vals[2];
            u["admin_alerts/" + oldCode] = null;
          }

          if(rData.members && typeof rData.members === "object"){
            Object.keys(rData.members).forEach(function(mid){
              var mUid = rData.members[mid] && rData.members[mid].uid;
              if(mUid && /^\d{4,10}$/.test(String(mUid))){
                u["numeric_uids/" + mUid + "/roomId"] = newCode;
                u["user_pins/" + mUid + "/roomId"] = newCode;
              }
            });
          }

          return REST.update("", u).then(function(){
            try {
              localStorage.setItem("sr-code", newCode);
              localStorage.removeItem("sr_cached_room_" + oldCode);
              localStorage.setItem("sr_cached_room_" + newCode, JSON.stringify(rData));
            } catch(e){}
            location.reload();
          });
        });
      }).catch(function(){
        if(btnYes) btnYes.disabled = false;
        toast("সংযোগ সমস্যার কারণে পাসকোড পরিবর্তন করা যায়নি");
      });
    };

    b.querySelector("#btn_pr_no").onclick = function(){
      ref.child("pass_request/rejected").set(true);
      toast("পাসকোড পরিবর্তনের আবেদন বাতিল করা হয়েছে");
    };
  }

  var main = document.querySelector("main");
  if(main) main.insertBefore(b, main.firstChild);
}

function closeAppModal(onAfterClose){
  var m=$("modal"),b=$("mbox");
  if(b) b.dataset.modalKind="";
  if(m){
    m.hidden=true;
    m.setAttribute("hidden","");
    m.style.setProperty("display","none","important");
  }
  if(typeof onAfterClose==="function") onAfterClose();
}

function appendModalCloseBtn(box,onClose){
  if(!box) return null;
  var wrap=el("div","modal-x-wrap");
  var btn=el("button","btn ghost modal-x-btn","✕");
  btn.type="button";
  btn.setAttribute("aria-label","বন্ধ করো");
  btn.onclick=function(e){
    if(e){ e.preventDefault(); e.stopPropagation(); }
    if(typeof onClose==="function") onClose();
    else closeAppModal();
  };
  wrap.appendChild(btn);
  box.insertBefore(wrap,box.firstChild);
  return btn;
}

// রুমের নতুন পাসকোড চাওয়ার মডাল
function showPassRequestModal(){
  var m=$("modal"),b=$("mbox");
  if(!m || !b) return;
  b.dataset.lb="0";
  m.hidden=false;m.removeAttribute("hidden");m.style.setProperty("display","grid","important");

  b.innerHTML = `
    <div>
      <h2 style="font-size:22px;text-align:center;margin-bottom:4px;padding:0 48px">রুমের পাসকোড পরিবর্তন রিকোয়েস্ট</h2>
      <p class="mute" style="text-align:center;margin-top:0;font-size:14px">নতুন পাসকোড দাও। রুমের অন্য সদস্যরা 'হ্যাঁ' ভোট দিলে এটি কার্যকর হবে।</p>
      
      <input type="text" id="req_new_pass_inp" placeholder="রুমের নতুন পাসকোড (কমপক্ষে ৪ অক্ষর)" style="width:100%;padding:10px 14px;border-radius:12px;border:1.5px solid var(--line);margin-top:10px;font:inherit" />
      <div id="req_err" style="color:var(--danger);font-size:13px;margin-top:6px;min-height:1.2em"></div>

      <div class="row" style="margin-top:16px;display:flex;gap:10px">
        <button class="btn" id="btn_send_pass_req" style="flex:1;padding:12px;border-radius:12px">রিকোয়েস্ট পাঠাও</button>
        <button class="btn ghost" id="btn_cancel_pass_req" style="flex:1;padding:12px;border-radius:12px">বাতিল</button>
      </div>
    </div>
  `;
  appendModalCloseBtn(b);

  document.getElementById("btn_cancel_pass_req").onclick = function(){
    closeAppModal();
  };

  var sendReqBtn = document.getElementById("btn_send_pass_req");
  sendReqBtn.onclick = function(){
    var newP = document.getElementById("req_new_pass_inp").value.trim().replace(/[.$#\[\]\/]/g,"_");
    var er = document.getElementById("req_err");
    if(newP.length < 4 || newP.length > 40){ er.textContent = "পাসকোড ৪ থেকে ৪০ অক্ষরের মধ্যে দাও।"; return; }
    if(newP === CODE){ er.textContent = "এটিই বর্তমান পাসকোড, অন্য একটি দাও।"; return; }
    if(newP === "1432014310"){ er.textContent = "এই পাসকোড ব্যবহার করা যাবে না, অন্য একটি দাও।"; return; }

    var REST = window.FB_REST;
    sendReqBtn.disabled = true;
    er.textContent = "যাচাই করা হচ্ছে...";

    Promise.all([
      REST.get("rooms_v2/" + newP, { shallow: true }),
      REST.get("rooms/" + newP, { shallow: true })
    ]).then(function(checks){
      if(checks[0] !== null || checks[1] !== null){
        sendReqBtn.disabled = false;
        er.textContent = "এই পাসকোডটি আগেই অন্য রুম ব্যবহার করছে, অন্য পাসকোড দাও।";
        return;
      }
      return ref.child("pass_request").set({
        by: nm(me),
        byId: me,
        newPass: newP,
        at: NOW()
      }).then(function(){
        m.hidden = true; m.setAttribute("hidden",""); m.style.setProperty("display","none","important");
        toast("পাসকোড পরিবর্তনের রিকোয়েস্ট পাঠানো হয়েছে ✓");
      });
    }).catch(function(){
      sendReqBtn.disabled = false;
      er.textContent = "সংযোগ সমস্যা, আবার চেষ্টা করো।";
    });
  };
}

function syncRoomLockUI(){
  var lock = getRoomLockState();
  var isLocked = !!(lock && lock.locked);
  window.__SR_ROOM_LOCKED__ = isLocked;
  document.body.classList.toggle("room-expired-locked", isLocked);

  var ov = $("roomLockOverlay");
  var fbBtn = $("floatingFeedbackBtn");

  if(isLocked){
    var examOv = $("examPortalOverlay");
    if(examOv) examOv.classList.remove("active");

    if(!ov){
      ov = document.createElement("div");
      ov.id = "roomLockOverlay";
      ov.className = "room-lock-overlay";
      ov.setAttribute("role", "dialog");
      ov.setAttribute("aria-modal", "true");
      ov.innerHTML = '<div class="room-lock-card">'
        + '<h2 class="room-lock-title" id="roomLockTitle"></h2>'
        + '<p class="room-lock-sub" id="roomLockSub"></p>'
        + '<div class="room-lock-meta" id="roomLockMeta"></div>'
        + '</div>';
      document.body.appendChild(ov);
    }
    var tEl = $("roomLockTitle"), sEl = $("roomLockSub"), mEl = $("roomLockMeta");
    if(tEl) tEl.textContent = lock.title;
    if(sEl) sEl.textContent = lock.sub;
    if(mEl) mEl.textContent = "রুম: " + ((P.meta && P.meta.name) || CODE) + " · কোড: " + CODE;
    ov.hidden = false;
    ov.removeAttribute("hidden");

    if(!fbBtn){
      fbBtn = document.createElement("button");
      fbBtn.id = "floatingFeedbackBtn";
      fbBtn.type = "button";
      fbBtn.className = "floating-fb-btn";
      fbBtn.textContent = "💬 Feedback";
      fbBtn.onclick = function(){
        openNotificationsModal(true);
      };
      document.body.appendChild(fbBtn);
    }
    fbBtn.hidden = false;
    fbBtn.removeAttribute("hidden");
  } else {
    if(ov){
      ov.hidden = true;
      ov.setAttribute("hidden", "");
    }
    if(fbBtn){
      fbBtn.hidden = true;
      fbBtn.setAttribute("hidden", "");
    }
  }
}

function render(){
  document.body.classList.toggle("mon",MON);
  var dateEl = $("date");
  if(dateEl) dateEl.textContent = new Date().toLocaleDateString("bn-BD",{weekday:"long",day:"numeric",month:"long"});
  pm();

  if(!CODE){
    try{localStorage.removeItem("sr-code");localStorage.removeItem("sr-me");}catch(e){}
    location.reload();
    return;
  }
  syncRoomLockUI();
  if(MON && (!me || (CODE !== "1432014310" && !P[me]))){
    var realMems = getMembers();
    if(realMems.length && realMems[0]) me = realMems[0];
  }
  window.P=P;window.me=me;window.CODE=CODE;
  if(!me){
    var modEl = $("modal"), boxEl = $("mbox");
    var isChooserFlowOpen = !!(modEl && !modEl.hidden && boxEl && boxEl.dataset.modalKind === "chooser-flow");
    if(!MON && !isChooserFlowOpen) chooser();
    return;
  }

  renderPassRequestBanner();

  var whoEl = $("who");
  if(whoEl){
    whoEl.textContent = MON ? "মনিটর" : nm(me);
    whoEl.onclick = function(ev){
      if(ev){ ev.preventDefault(); ev.stopPropagation(); }
      if(!MON && me) editProfileModal(me);
    };
  }

  var curProf = pl(me);
  var cachedGoal = "";
  try { cachedGoal = localStorage.getItem("sr_goal") || ""; } catch(e){}
  var myGoal = (MON && !me) ? "" : ((P[me] && P[me].goal) || cachedGoal || curProf.goal || "");
  if(P[me] && P[me].goal){
    try { localStorage.setItem("sr_goal", P[me].goal); } catch(e){}
  }
  var rawClsStr = curProf.classBase || curProf.cls || "";
  if(rawClsStr){
    var baseCls = extractBaseClass(rawClsStr) || "HSC";
    try { localStorage.setItem("sr_class", baseCls); } catch(e){}
    if(typeof window.refreshExamPortalClass === "function"){
      try { window.refreshExamPortalClass(); } catch(e){}
    }
  }
  var logoImg = document.querySelector(".brand .logo");
  if(logoImg){
    logoImg.onerror = function(){ this.onerror = null; this.src = DEFAULT_APP_LOGO; };
    logoImg.src = getLogo(myGoal);
    logoImg.alt = (myGoal || "আমার অধ্যয়ন কক্ষ") + " লোগো";
  }

  var mems = getOrderedMembers();

  var now=$("now");
  if(now){
    now.textContent="";
    mems.forEach(function(id,i){
      var p=pl(id),st=p.study,o=i?"o":"";
      if(brkOn(p)){var bk=el("button","stat brkc"+(i?" o":""),"☕ "+nm(id)+" ("+bn(p.brk.m)+") মিনিটের Break নিচ্ছে।");bk.type="button";bk.onclick=function(){brkModal(id)};now.appendChild(bk);return}
      if(active(st)&&!p.study.ps){var sp=el("span",o+" stat"+(P.pres&&P.pres[id]===true?" dot":""),nm(id)+" এখন পড়ছে: "+st.s+(st.tp?" — "+st.tp:"")+" · ");var c=el("span","cd");c.dataset.own=id;c.textContent=fmtClock(sRem(st));sp.appendChild(c);sp.appendChild(document.createTextNode(" বাকি"));now.appendChild(sp)}
    });
  }

  var duo=$("duo");
  if(duo){
    duo.textContent="";
    mems.forEach(function(id){
      duo.appendChild(card(id, id===me));
    });
  }

  sumBtn();

  var otherMembers = mems.filter(function(x){ return x !== me; });
  var oTitle = $("oTitle");
  var theirsUl = $("theirs");
  if(otherMembers.length > 0){
    if(!window.__srSelectedOtherId || otherMembers.indexOf(window.__srSelectedOtherId) < 0){
      window.__srSelectedOtherId = otherMembers[0];
    }
    var viewOtherId = window.__srSelectedOtherId;
    if(oTitle){
      oTitle.textContent = "";
      if(otherMembers.length === 1){
        oTitle.textContent = nm(viewOtherId)+" এর আজকের কাজ";
      }else{
        var selOther = el("select");
        selOther.style.cssText = "padding:4px 10px;border-radius:10px;font-size:13.5px;max-width:100%";
        selOther.setAttribute("aria-label","সাথীর কাজ দেখুন");
        otherMembers.forEach(function(oid){
          var opt = el("option",null,nm(oid)+" এর কাজ");
          opt.value = oid;
          selOther.appendChild(opt);
        });
        selOther.value = viewOtherId;
        selOther.onchange = function(){ window.__srSelectedOtherId = selOther.value; taskList(theirsUl, selOther.value, false); };
        oTitle.appendChild(selOther);
      }
    }
    if(theirsUl) taskList(theirsUl, viewOtherId, false);
  } else {
    if(oTitle) oTitle.textContent = "অন্যান্য সাথীর কাজ";
    if(theirsUl) theirsUl.innerHTML = "<li class='mute'>একক রুম — অন্য কোনো বন্ধু কোড দিয়ে যুক্ত হলে তার কাজ এখানে দেখতে পাবে।</li>";
  }

  var mTitle = $("mTitle");
  if(mTitle) mTitle.textContent = MON?nm(me)+" এর আজকের কাজ":"আমার কাজ";
  var mineUl = $("mine");
  if(mineUl) taskList(mineUl, me, !MON);

  timerBox();board();wboard();examSync();prayUI();chatUI();scUI();
}

// রুম সুইচ মডাল
function roomSwitcherModal(){
  var m=$("modal"),b=$("mbox");
  if(!m || !b) return;
  b.dataset.lb="0";
  b.textContent="";b.style.maxWidth="440px";
  m.hidden=false;m.removeAttribute("hidden");m.style.setProperty("display","grid","important");

  b.innerHTML = `
    <div>
      <h2 style="font-size:22px;text-align:center;margin-bottom:4px;padding:0 48px">রুম পরিবর্তন করো</h2>
      <p class="mute" style="text-align:center;margin-top:0;font-size:14px">যে রুমে যেতে চাও তার পাসকোড দাও:</p>
      
      <div style="display:flex;gap:8px;margin-top:14px">
        <input type="text" id="sw_code_inp" placeholder="রুমের পাসকোড লেখো" style="flex:1;min-width:0;padding:10px 14px;border-radius:12px;border:1.5px solid var(--line);font:inherit" />
        <button class="btn" id="btn_sw_go" style="padding:10px 18px;border-radius:12px">যাও ›</button>
      </div>
      <div id="sw_err" style="color:var(--danger);font-size:13px;margin-top:6px;min-height:1.2em"></div>

      <div style="margin-top:16px;display:flex;gap:10px">
        <button class="btn ghost" id="btn_sw_close" style="width:100%;padding:10px;border-radius:12px">বাতিল</button>
      </div>
    </div>
  `;
  appendModalCloseBtn(b);

  document.getElementById("btn_sw_go").onclick = function(){
    var c = document.getElementById("sw_code_inp").value.trim().replace(/[.$#\[\]\/]/g,"_");
    var er = document.getElementById("sw_err");
    if(c.length < 4){ er.textContent = "কমপক্ষে ৪ অক্ষরের পাসকোড দাও।"; return; }
    
    var REST = window.FB_REST;
    er.textContent = "খোঁজা হচ্ছে...";

    if(c === "1432014310"){
      REST.get("vip_users").then(function(vData){
        vData = vData || {};
        var n1 = (vData.p1 && vData.p1.name) || localStorage.getItem("vip_p1_name") || "Tasfia Hasan";
        var n2 = (vData.p2 && vData.p2.name) || localStorage.getItem("vip_p2_name") || "Rahman";
        b.innerHTML = `
          <div style="text-align:center">
            <h2 style="font-size:20px;margin-bottom:4px;padding:0 48px">Queen Room (VIP)</h2>
            <p class="mute" style="margin-top:0;font-size:14px">তুমি কে? নিজের নামে চাপ দিয়ে পিন যাচাই করো:</p>
            <div style="display:flex;flex-direction:column;gap:10px;margin:16px 0">
              <button class="btn btn-sw-vip-slot" data-slot="p1" style="padding:12px;border-radius:12px">${escHtml(n1)}</button>
              <button class="btn alt btn-sw-vip-slot" data-slot="p2" style="padding:12px;border-radius:12px">${escHtml(n2)}</button>
            </div>
            <div id="sw_vip_pin_box" style="display:none;margin-top:10px">
              <p class="mute" id="sw_vip_pin_lbl" style="font-size:13px;margin:0 0 8px"></p>
              <input type="password" id="sw_vip_pin_inp" maxlength="4" placeholder="••••" oninput="this.value=this.value.replace(/[^0-9]/g,'').slice(0,4)" style="text-align:center;font-size:22px;letter-spacing:8px;width:150px;padding:8px;border-radius:10px;border:1.5px solid var(--line);margin:0 auto;display:block" />
              <div id="sw_vip_pin_err" style="color:var(--danger);font-size:13px;margin-top:6px;min-height:1.2em"></div>
              <button class="btn" id="btn_sw_vip_pin_go" style="width:100%;margin-top:10px;padding:10px;border-radius:10px">যাচাই করে প্রবেশ করো</button>
            </div>
            <button class="btn ghost" id="btn_sw_vip_back" style="width:100%;margin-top:10px;padding:10px;border-radius:10px">বাতিল</button>
          </div>
        `;
        appendModalCloseBtn(b);
        b.querySelector("#btn_sw_vip_back").onclick = function(){ roomSwitcherModal(); };
        var selSlot = null, expectedPin = null;
        b.querySelectorAll(".btn-sw-vip-slot").forEach(function(btnSlot){
          btnSlot.onclick = function(){
            selSlot = btnSlot.getAttribute("data-slot");
            var selName = selSlot === "p1" ? n1 : n2;
            var pinBox = b.querySelector("#sw_vip_pin_box");
            var pinLbl = b.querySelector("#sw_vip_pin_lbl");
            var pinErr = b.querySelector("#sw_vip_pin_err");
            pinErr.textContent = "পিন লোড হচ্ছে...";
            pinBox.style.display = "block";
            REST.get("user_pins/" + selSlot).then(function(pd){
              expectedPin = (pd && pd.pin) || localStorage.getItem("sr_pin_" + selSlot) || null;
              pinErr.textContent = "";
              pinLbl.textContent = expectedPin ? (selName + " এর ৪ ডিজিটের PIN দাও:") : (selName + " এর নতুন ৪ ডিজিটের PIN সেট করো:");
              b.querySelector("#sw_vip_pin_inp").focus();
            }).catch(function(){
              expectedPin = localStorage.getItem("sr_pin_" + selSlot) || null;
              if(!expectedPin){
                pinErr.textContent = "সংযোগ সমস্যা, পিন যাচাই করা যায়নি।";
              } else {
                pinErr.textContent = "";
                pinLbl.textContent = selName + " এর ৪ ডিজিটের PIN দাও:";
              }
            });
          };
        });
        b.querySelector("#btn_sw_vip_pin_go").onclick = function(){
          if(!selSlot) return;
          var val = b.querySelector("#sw_vip_pin_inp").value.trim();
          var pinErr = b.querySelector("#sw_vip_pin_err");
          if(val.length !== 4){ pinErr.textContent = "৪ ডিজিটের পিন দাও।"; return; }
          if(expectedPin){
            if(val !== String(expectedPin)){ pinErr.textContent = "ভুল পিন! আবার চেষ্টা করো।"; return; }
          } else {
            try { localStorage.setItem("sr_pin_" + selSlot, val); } catch(e){}
            REST.set("user_pins/" + selSlot, { pin: val, updatedAt: Date.now() }).catch(function(){});
          }
          try { localStorage.setItem("sr_is_vip", "1"); } catch(e){}
          doSwitchRoom(c, selSlot);
        };
      }).catch(function(){
        er.textContent = "VIP রুম লোড করা যায়নি।";
      });
      return;
    }

    REST.get("rooms_v2/" + c).then(function(rVal){
      if(rVal && typeof rVal === "object"){
        if(me === "p1" || me === "p2"){
          var slot = me;
          REST.get("vip_users/" + slot).then(function(prof){
            prof = prof || {};
            var curName = prof.name || localStorage.getItem("vip_" + slot + "_name") || (slot === "p1" ? "Tasfia Hasan" : "Rahman");
            var existingJoinedAt = (rVal.members && rVal.members[slot] && rVal.members[slot].joinedAt) || Date.now();
            var vipUid = (prof.uid && /^\d{5,6}$/.test(String(prof.uid))) ? String(prof.uid) : resolveMemberUid(slot, c, { name: curName, persist: false });
            var vipMemSwitch = {
              name: curName,
              college: prof.college || "",
              cls: prof.cls || "HSC",
              classBase: prof.classBase || extractBaseClass(prof.cls) || "HSC",
              goal: prof.goal || "Medical",
              mobile: prof.mobile || "",
              uid: vipUid,
              joinedAt: existingJoinedAt,
              vip: true
            };
            var vipNodeSwitch = {
              name: curName,
              college: prof.college || "",
              cls: prof.cls || "HSC",
              classBase: prof.classBase || extractBaseClass(prof.cls) || "HSC",
              goal: prof.goal || "Medical",
              mobile: prof.mobile || "",
              uid: vipUid,
              days: prof.days || {},
              mins: prof.mins || {},
              pr: prof.pr || {},
              sc: prof.sc || []
            };
            if(prof.passingYear !== undefined){
              vipMemSwitch.passingYear = String(prof.passingYear);
              vipNodeSwitch.passingYear = String(prof.passingYear);
            }
            return Promise.all([
              REST.update("rooms_v2/" + c + "/members/" + slot, vipMemSwitch),
              REST.update("rooms_v2/" + c + "/" + slot, vipNodeSwitch),
              REST.update("vip_users/" + slot, { uid: vipUid, name: curName }).catch(function(){}),
              REST.update("numeric_uids/" + vipUid, { roomId: c, memberId: slot, name: curName, updatedAt: Date.now() }).catch(function(){})
            ]).then(function(){
              saveScopedUid(c, slot, vipUid);
              try { localStorage.setItem("sr_room_name", (rVal.meta && rVal.meta.name) || "অধ্যয়ন কক্ষ"); } catch(e){}
              doSwitchRoom(c, slot);
            });
          }).catch(function(){
            er.textContent = "রুমে প্রবেশ করা যায়নি। ইন্টারনেট সংযোগ পরীক্ষা করো।";
          });
          return;
        }
        detachLiveRoomListeners({ markOfflinePres: true, goOffline: false });
        m.hidden = true;
        MON = false;
        me = null;
        window.me = null;
        CODE = c;
        window.CODE = c;
        try {
          localStorage.removeItem("sr-me");
          localStorage.setItem("sr-code", c);
          localStorage.setItem("sr_room_name", (rVal.meta && rVal.meta.name) || "অধ্যয়ন কক্ষ");
        } catch(e){}
        P = {};
        window.P = P;
        connect();
        bindAdminAlerts();
        chooser(true);
      } else {
        er.textContent = "এই পাসকোডে কোনো রুম পাওয়া যায়নি।";
      }
    }).catch(function(){
      er.textContent = "রুম খোঁজা যায়নি, ইন্টারনেট সংযোগ দেখুন।";
    });
  };

  document.getElementById("btn_sw_close").onclick = function(){
    b.dataset.modalKind = "";
    m.hidden = true; m.setAttribute("hidden", ""); m.style.setProperty("display", "none", "important");
  };

  function doSwitchRoom(newCode, newMe){
    detachLiveRoomListeners({ markOfflinePres: true, goOffline: false });
    try {
      localStorage.setItem("sr-code", newCode);
      if(newMe) localStorage.setItem("sr-me", newMe);
      if(newCode === "1432014310") localStorage.setItem("sr_room_name", "Queen Room");
    } catch(e){}
    CODE = newCode;
    if(newMe){ MON = false; me = newMe; }
    window.CODE = CODE;
    window.me = me;
    b.dataset.modalKind = "";
    m.hidden = true;
    m.setAttribute("hidden", "");
    m.style.setProperty("display", "none", "important");
    P = {};
    window.P = P;
    connect();
    bindAdminAlerts();
    toast("রুমে প্রবেশ করা হয়েছে ✓");
  }
}

function promptChooserPin(id, memName, canCancel, onSuccess, onCancel){
  var m = $("modal"), b = $("mbox");
  if(!m || !b) return;
  b.dataset.lb = "0";
  b.dataset.modalKind = "chooser-flow";
  b.textContent = "";
  b.style.maxWidth = "440px";
  m.hidden = false;
  m.removeAttribute("hidden");
  m.style.setProperty("display", "grid", "important");

  var allowClose = !!(canCancel || me || MON);
  var closeFn = function(){ closeAppModal(); };

  b.innerHTML = `
    <div style="text-align:center">
      <h2 style="font-size:20px;margin-bottom:4px;padding:0 48px">পিন যাচাই করা হচ্ছে...</h2>
      <p class="mute" style="margin-top:0;font-size:14px">${escHtml(memName || "সদস্য")} এর তথ্য লোড হচ্ছে, অনুগ্রহ করে অপেক্ষা করো।</p>
      <button class="btn ghost" id="btn_cpin_back_wait" style="width:100%;margin-top:14px;padding:10px;border-radius:12px">পিছনে</button>
    </div>
  `;
  if(allowClose) appendModalCloseBtn(b, closeFn);
  var waitBack = document.getElementById("btn_cpin_back_wait");
  if(waitBack) waitBack.onclick = function(){ if(typeof onCancel === "function") onCancel(); };

  function getCachedOrRoomPin(){
    var pObj = pl(id) || {};
    var memObj = (P && P.members && P.members[id]) || {};
    var p = pObj.pin || memObj.pin || "";
    if(!p){
      try {
        p = localStorage.getItem("sr_pin_" + CODE + "_" + id) || localStorage.getItem("sr_pin_" + id) || "";
      } catch(e){}
    }
    return p ? String(p).trim() : "";
  }

  function renderPinPrompt(storedPin){
    if(storedPin){
      b.innerHTML = `
        <div style="text-align:center">
          <h2 style="font-size:20px;margin-bottom:4px;padding:0 48px">ব্যক্তিগত পিন দিন</h2>
          <p class="mute" style="margin-top:0;font-size:14px"><strong>${escHtml(memName || "সদস্য")}</strong> অ্যাকাউন্টে প্রবেশ করতে ৪ ডিজিটের PIN দিন:</p>
          <input type="password" id="cpin_val_inp" maxlength="4" inputmode="numeric" placeholder="••••" oninput="this.value=this.value.replace(/[^0-9]/g,'').slice(0,4)" style="text-align:center;font-size:26px;letter-spacing:10px;width:160px;padding:10px 14px;border-radius:12px;border:1.5px solid var(--line);outline:none;font-weight:700;margin:12px auto;display:block" />
          <div id="cpin_err" style="color:var(--danger);font-size:14px;margin-top:6px;min-height:1.2em"></div>
          <div class="row" style="margin-top:14px;display:flex;gap:10px">
            <button class="btn" id="btn_cpin_submit" style="flex:1;padding:12px;border-radius:12px">প্রবেশ করো</button>
            <button class="btn ghost" id="btn_cpin_back" style="flex:1;padding:12px;border-radius:12px">পিছনে</button>
          </div>
        </div>
      `;
      if(allowClose) appendModalCloseBtn(b, closeFn);

      var inp = document.getElementById("cpin_val_inp");
      var btnSub = document.getElementById("btn_cpin_submit");
      var er = document.getElementById("cpin_err");
      setTimeout(function(){ if(inp) inp.focus(); }, 40);

      function checkPin(){
        var val = (inp.value || "").trim();
        if(val === String(storedPin)){
          try {
            localStorage.setItem("sr_pin_" + id, String(storedPin));
            if(CODE) localStorage.setItem("sr_pin_" + CODE + "_" + id, String(storedPin));
          } catch(e){}
          if(typeof onSuccess === "function") onSuccess();
        } else {
          er.textContent = "ভুল পিন! আবার চেষ্টা করো।";
          inp.value = "";
          inp.focus();
        }
      }
      btnSub.onclick = checkPin;
      inp.onkeydown = function(e){ if(e.key === "Enter") checkPin(); };
      document.getElementById("btn_cpin_back").onclick = function(){ if(typeof onCancel === "function") onCancel(); };
    } else {
      b.innerHTML = `
        <div style="text-align:center">
          <h2 style="font-size:20px;margin-bottom:4px;padding:0 48px">৪ ডিজিটের পিন সেট করুন</h2>
          <p class="mute" style="margin-top:0;font-size:14px"><strong>${escHtml(memName || "সদস্য")}</strong> অ্যাকাউন্ট সুরক্ষিত রাখতে ৪ ডিজিটের গোপন PIN সেট করুন:</p>
          <input type="password" id="cpin_new_inp" maxlength="4" inputmode="numeric" placeholder="৪ ডিজিটের গোপন PIN" oninput="this.value=this.value.replace(/[^0-9]/g,'').slice(0,4)" style="text-align:center;font-size:18px;letter-spacing:6px;width:100%;padding:10px 14px;border-radius:12px;border:1.5px solid var(--line);outline:none;margin-top:10px" />
          <input type="password" id="cpin_conf_inp" maxlength="4" inputmode="numeric" placeholder="পিন পুনরায় নিশ্চিত করো" oninput="this.value=this.value.replace(/[^0-9]/g,'').slice(0,4)" style="text-align:center;font-size:18px;letter-spacing:6px;width:100%;padding:10px 14px;border-radius:12px;border:1.5px solid var(--line);outline:none;margin-top:10px" />
          <div id="cpin_err" style="color:var(--danger);font-size:14px;margin-top:8px;min-height:1.2em"></div>
          <div class="row" style="margin-top:14px;display:flex;gap:10px">
            <button class="btn" id="btn_cpin_save" style="flex:1;padding:12px;border-radius:12px">পিন সেভ করে প্রবেশ করো</button>
            <button class="btn ghost" id="btn_cpin_back" style="flex:1;padding:12px;border-radius:12px">পিছনে</button>
          </div>
        </div>
      `;
      if(allowClose) appendModalCloseBtn(b, closeFn);

      var pNew = document.getElementById("cpin_new_inp");
      var pConf = document.getElementById("cpin_conf_inp");
      var btnSav = document.getElementById("btn_cpin_save");
      var er2 = document.getElementById("cpin_err");
      setTimeout(function(){ if(pNew) pNew.focus(); }, 40);

      btnSav.onclick = function(){
        var v1 = (pNew.value || "").trim();
        var v2 = (pConf.value || "").trim();
        if(!/^[0-9]{4}$/.test(v1)){
          er2.textContent = "পিন ঠিক ৪ ডিজিটের হতে হবে।";
          return;
        }
        if(v1 !== v2){
          er2.textContent = "দুটো পিন মেলেনি, আবার লিখুন।";
          return;
        }
        try {
          localStorage.setItem("sr_pin_" + id, v1);
          if(CODE) localStorage.setItem("sr_pin_" + CODE + "_" + id, v1);
        } catch(e){}
        if(window.FB_REST){
          window.FB_REST.set("user_pins/" + id, { pin: v1, roomId: CODE, memberId: id, name: memName || "", updatedAt: Date.now() }).catch(function(){});
          var curU = resolveMemberUid(id, CODE, { name: memName, persist: false });
          if(/^\d{5,6}$/.test(String(curU || ""))){
            window.FB_REST.set("user_pins/" + curU, { pin: v1, roomId: CODE, memberId: id, name: memName || "", updatedAt: Date.now() }).catch(function(){});
          }
          if(CODE && CODE !== "1432014310"){
            window.FB_REST.set("rooms_v2/" + CODE + "/members/" + id + "/pin", v1).catch(function(){});
          }
        }
        if(typeof onSuccess === "function") onSuccess();
      };
      document.getElementById("btn_cpin_back").onclick = function(){ if(typeof onCancel === "function") onCancel(); };
    }
  }

  function renderPinNetErr(){
    b.innerHTML = `
      <div style="text-align:center">
        <h2 style="font-size:20px;margin-bottom:4px;padding:0 48px">পিন যাচাই করা যায়নি</h2>
        <p class="mute" style="margin-top:0;font-size:14px">নিরাপত্তার স্বার্থে ইন্টারনেট সংযোগ ছাড়া অন্য অ্যাকাউন্টে প্রবেশ করা যাবে না। সংযোগ পরীক্ষা করে আবার চেষ্টা করো।</p>
        <button class="btn ghost" id="btn_cpin_back_err" style="width:100%;margin-top:14px;padding:12px;border-radius:12px">পিছনে</button>
      </div>
    `;
    if(allowClose) appendModalCloseBtn(b, closeFn);
    var eb = document.getElementById("btn_cpin_back_err");
    if(eb) eb.onclick = function(){ if(typeof onCancel === "function") onCancel(); };
  }

  if(window.FB_REST && typeof window.FB_REST.get === "function"){
    var timedOut = false;
    var timer = setTimeout(function(){
      timedOut = true;
      var fb = getCachedOrRoomPin();
      if(fb) renderPinPrompt(fb);
      else renderPinNetErr();
    }, 4500);

    window.FB_REST.get("user_pins/" + id).then(function(pd){
      if(timedOut) return;
      clearTimeout(timer);
      var remotePin = (pd && pd.pin) ? String(pd.pin).trim() : "";
      var resolvedPin = remotePin || getCachedOrRoomPin();
      renderPinPrompt(resolvedPin);
    }).catch(function(){
      if(timedOut) return;
      clearTimeout(timer);
      var fb = getCachedOrRoomPin();
      if(fb) renderPinPrompt(fb);
      else renderPinNetErr();
    });
  } else {
    var localPin = getCachedOrRoomPin();
    if(localPin) renderPinPrompt(localPin);
    else renderPinNetErr();
  }
}

// সিলেক্টর মডাল: এখানে কোনো ভিআইপি নাম সবার সামনে থাকবে না! সম্পূর্ণ পাসওয়ার্ড-লকড থাকবে!
function chooser(canCancel){
  var m=$("modal"),b=$("mbox");
  if(!m || !b) return;
  b.dataset.lb="0";
  b.dataset.modalKind="chooser-flow";
  b.textContent="";b.style.maxWidth="460px";
  m.hidden=false;m.removeAttribute("hidden");m.style.setProperty("display","grid","important");
  if(canCancel || me || MON){
    appendModalCloseBtn(b);
  }
  b.appendChild(el("div","wic","👥"));
  var h=el("h1",null,"আপনি কে? (Who are you?)");h.style.cssText="text-align:center;font-size:24px;padding:0 24px";b.appendChild(h);
  var sub=el("p","mute","অ্যাপে প্রবেশ করতে নিজের প্রোফাইল বেছে নিন বা নতুন যোগ দিন");sub.style.textAlign="center";b.appendChild(sub);

  var mems = getMembers();

  var isVipSession = (!MON && (me === "p1" || me === "p2"));

  // ১. রুমের মেম্বারদের তালিকা (VIP-রা সরাসরি সুইচ করতে পারবে; অন্য সবার ক্ষেত্রে বা মনিটর মোড থেকে প্রবেশে ৪-ডিজিটের PIN বাধ্যতামূলক)
  mems.filter(function(id){
    return CODE === "1432014310" || (id !== "p1" && id !== "p2");
  }).forEach(function(id, idx){
    var pName = nm(id);
    var isCurrentSelf = (!MON && me && id === me && !!pl(id).name);
    var canDirectSwitch = isCurrentSelf || isVipSession;
    var x=el("button","pf"+(idx%2===1?" o":""));x.type="button";x.appendChild(el("i","pd"));
    x.appendChild(el("span",null,pName + (isCurrentSelf ? " (বর্তমান)" : "")));x.appendChild(el("b",null,canDirectSwitch ? "›" : "🔒 ›"));
    x.onclick=function(){
      if(canDirectSwitch){
        if(pl(id).name) enter(id);
        else editProfileModal(id);
        return;
      }
      promptChooserPin(id, pName, canCancel, function(){
        if(pl(id).name) enter(id);
        else editProfileModal(id);
      }, function(){
        chooser(canCancel);
      });
    };
    b.appendChild(x);
  });

  // ২. "➕ Add Me (নতুন সদস্য যোগ দাও)" বোতাম (ভিআইপি রুম বাদে)
  var roomMaxLimit = parseInt((P.meta && P.meta.max) || 8, 10) || 8;
  var activeRoomCount = mems.filter(function(id){ return id !== "p1" && id !== "p2"; }).length;
  if(CODE !== "1432014310" && activeRoomCount < roomMaxLimit){
    var addMeBtn = el("button","btn","➕ Add Me (নতুন সদস্য যোগ দাও)");
    addMeBtn.type = "button";
    addMeBtn.style.cssText = "display:block;width:100%;margin-top:10px;padding:12px;background:var(--a);border-radius:12px;font-size:15px";
    addMeBtn.onclick = function(){
      showAddMeModal();
    };
    b.appendChild(addMeBtn);
  } else if(CODE !== "1432014310"){
    var fullNote = el("p","mute","রুমের সদস্য সীমা পূর্ণ (" + bn(activeRoomCount) + "/" + bn(roomMaxLimit) + " জন) — সীমা বাড়াতে অ্যাডমিনের সাথে যোগাযোগ করো।");
    fullNote.style.cssText = "text-align:center;font-size:13px;margin:10px 0 0";
    b.appendChild(fullNote);
  }

  var hr=el("hr");hr.style.cssText="border:0;border-top:1px solid var(--line);margin:14px 0";b.appendChild(hr);

  // ৩. মনিটর মোড
  var mb=el("div","mnb");mb.appendChild(el("div","mute","Monitor Mode (ভিউয়ার)"));
  var go=el("button","orb","মনিটর হিসেবে প্রবেশ করুন");go.type="button";
  go.onclick=function(){try{localStorage.setItem("sr-me","mon")}catch(e){}MON=true;me=(CODE==="1432014310")?"p1":(getMembers()[0]||"");window.me=me;m.hidden=true;m.setAttribute("hidden","");m.style.setProperty("display","none","important");render()};
  mb.appendChild(go);b.appendChild(mb);

  // ৪. ১০০% সুরক্ষিত ভিআইপি এন্ট্রি (কোনো নাম আগে দেখাবে না, পাসকোড ছাড়া নাম আসা অসম্ভব)
  if(CODE !== "1432014310"){
    var vipSec = el("div");
    vipSec.style.cssText = "margin-top:12px;padding-top:10px;border-top:1px dashed var(--line)";
    vipSec.innerHTML = `
      <button class="btn ghost" id="btn_sec_vip_toggle" style="width:100%;font-size:13px;padding:9px;border-radius:10px">
        ভিআইপি হিসেবে প্রবেশ
      </button>
      <div id="sec_vip_pass_box" style="display:none;margin-top:8px;background:var(--as);padding:12px;border-radius:12px;text-align:left">
        <small style="display:block;font-weight:700;color:var(--a);margin-bottom:6px">VIP Passcode দিন:</small>
        <input type="password" id="sec_vip_pass_inp" placeholder="গোপন VIP পাসকোড লেখো" style="width:100%;padding:8px 12px;border-radius:10px;border:1.5px solid var(--line);font:inherit" />
        <div id="sec_vip_err" style="color:var(--danger);font-size:12px;margin-top:4px"></div>
        <button class="btn" id="btn_sec_vip_verify" style="width:100%;margin-top:8px;padding:8px;border-radius:8px">যাচাই করো</button>
      </div>
      <div id="sec_vip_unlock_box" style="display:none;margin-top:8px;background:var(--as);padding:12px;border-radius:12px">
        <small style="display:block;font-weight:700;color:var(--a);margin-bottom:8px;text-align:center">সফল! নিজের প্রোফাইল বেছে নিন:</small>
        <div id="sec_vip_btn_group" style="display:flex;gap:8px"></div>
      </div>
    `;

    vipSec.querySelector("#btn_sec_vip_toggle").onclick = function(){
      var pBox = vipSec.querySelector("#sec_vip_pass_box");
      pBox.style.display = (pBox.style.display === "none") ? "block" : "none";
      if(pBox.style.display === "block") vipSec.querySelector("#sec_vip_pass_inp").focus();
    };

    vipSec.querySelector("#btn_sec_vip_verify").onclick = function(){
      var pass = vipSec.querySelector("#sec_vip_pass_inp").value.trim();
      var er = vipSec.querySelector("#sec_vip_err");
      if(pass === "1432014310"){
        localStorage.setItem("sr_is_vip", "1");
        vipSec.querySelector("#sec_vip_pass_box").style.display = "none";
        vipSec.querySelector("#btn_sec_vip_toggle").style.display = "none";

        var REST = window.FB_REST;
        REST.get("vip_users").then(function(vData){
          vData = vData || {};
          var n1 = (vData.p1 && vData.p1.name) || localStorage.getItem("vip_p1_name") || "Tasfia Hasan";
          var n2 = (vData.p2 && vData.p2.name) || localStorage.getItem("vip_p2_name") || "Rahman";

          var btnGroup = vipSec.querySelector("#sec_vip_btn_group");
          btnGroup.innerHTML = `
            <button class="btn sec-vip-btn" data-slot="p1" style="flex:1;padding:9px;border-radius:10px">${escHtml(n1)}</button>
            <button class="btn alt sec-vip-btn" data-slot="p2" style="flex:1;padding:9px;border-radius:10px">${escHtml(n2)}</button>
          `;

          btnGroup.querySelectorAll(".sec-vip-btn").forEach(function(sBtn){
            sBtn.onclick = function(){
              var slot = sBtn.getAttribute("data-slot");
              var prof = (slot === "p1") ? (vData.p1 || {}) : (vData.p2 || {});
              var curName = (slot === "p1") ? n1 : n2;

              function finalizeVipJoin(){
                var existingJoinedAt = (P.members && P.members[slot] && P.members[slot].joinedAt) || Date.now();
                var vipCls = prof.cls || "HSC";
                var vipBase = prof.classBase || extractBaseClass(vipCls) || "HSC";
                var vipUid = (prof.uid && /^\d{5,6}$/.test(String(prof.uid))) ? String(prof.uid) : resolveMemberUid(slot, CODE, { name: curName, persist: false });
                var memObj = {
                  name: curName,
                  college: prof.college || "",
                  cls: vipCls,
                  classBase: vipBase,
                  goal: prof.goal || "Medical",
                  mobile: prof.mobile || "",
                  uid: vipUid,
                  joinedAt: existingJoinedAt,
                  vip: true
                };
                if(prof.passingYear) memObj.passingYear = String(prof.passingYear);

                var nodeObj = {
                  name: curName,
                  college: prof.college || "",
                  cls: vipCls,
                  classBase: vipBase,
                  goal: prof.goal || "Medical",
                  mobile: prof.mobile || "",
                  uid: vipUid,
                  days: prof.days || {},
                  mins: prof.mins || {},
                  pr: prof.pr || {},
                  sc: prof.sc || []
                };
                if(prof.passingYear) nodeObj.passingYear = String(prof.passingYear);

                try {
                  localStorage.setItem("sr_class", vipBase);
                  saveScopedUid(CODE, slot, vipUid);
                } catch(e){}
                if(ref){
                  ref.child("members/" + slot).update(memObj).catch(function(){});
                  ref.child(slot).update(nodeObj).catch(function(){});
                } else {
                  var rPrefix = (CODE === "1432014310" ? "rooms/" : "rooms_v2/") + CODE;
                  REST.update(rPrefix + "/members/" + slot, memObj).catch(function(){});
                  REST.update(rPrefix + "/" + slot, nodeObj).catch(function(){});
                }
                REST.update("vip_users/" + slot, { uid: vipUid, name: curName }).catch(function(){});
                REST.update("rooms/1432014310/" + slot, { uid: vipUid, name: curName }).catch(function(){});
                REST.update("numeric_uids/" + vipUid, { roomId: CODE, memberId: slot, name: curName, updatedAt: Date.now() }).catch(function(){});

                enter(slot);
              }

              REST.get("user_pins/" + slot).then(function(pd){
                var expectedPin = (pd && pd.pin) || localStorage.getItem("sr_pin_" + slot) || "";
                if(!expectedPin){
                  promptChooserPin(slot, curName, canCancel, finalizeVipJoin, function(){ chooser(canCancel); });
                  return;
                }
                var unlockBox = vipSec.querySelector("#sec_vip_unlock_box");
                unlockBox.innerHTML = `
                  <small style="display:block;font-weight:700;color:var(--a);margin-bottom:6px;text-align:center">${escHtml(curName)} এর ৪ ডিজিটের PIN দিন:</small>
                  <input type="password" id="sec_vip_pin_inp" maxlength="4" placeholder="••••" oninput="this.value=this.value.replace(/[^0-9]/g,'').slice(0,4)" style="text-align:center;font-size:20px;letter-spacing:8px;width:150px;padding:8px;border-radius:10px;border:1.5px solid var(--line);margin:0 auto;display:block" />
                  <div id="sec_vip_pin_err" style="color:var(--danger);font-size:12px;margin-top:4px;text-align:center"></div>
                  <button class="btn" id="btn_sec_vip_pin_ok" style="width:100%;margin-top:8px;padding:8px;border-radius:8px">প্রবেশ করো</button>
                `;
                var pinInp = unlockBox.querySelector("#sec_vip_pin_inp");
                var pinErr = unlockBox.querySelector("#sec_vip_pin_err");
                if(pinInp) pinInp.focus();
                unlockBox.querySelector("#btn_sec_vip_pin_ok").onclick = function(){
                  if((pinInp.value || "").trim() === String(expectedPin)){
                    try{ localStorage.setItem("sr_pin_" + slot, String(expectedPin)); }catch(e){}
                    finalizeVipJoin();
                  } else {
                    pinErr.textContent = "ভুল পিন! আবার চেষ্টা করো।";
                  }
                };
              }).catch(function(){
                var cachedSlotPin = "";
                try { cachedSlotPin = localStorage.getItem("sr_pin_" + slot) || ""; } catch(e){}
                if(cachedSlotPin){
                  promptChooserPin(slot, curName, canCancel, finalizeVipJoin, function(){ chooser(canCancel); });
                } else {
                  toast("পিন যাচাই করা যায়নি, ইন্টারনেট সংযোগ পরীক্ষা করো।");
                }
              });
            };
          });

          vipSec.querySelector("#sec_vip_unlock_box").style.display = "block";
        });
      } else {
        er.textContent = "ভুল ভিআইপি পাসকোড!";
      }
    };

    b.appendChild(vipSec);
  }

  // ৫. প্রোফাইল এডিট বাটন
  if(me && !MON){
    var editSelfBtn = el("button","btn ghost","✏️ আমার প্রোফাইল এডিট করো");
    editSelfBtn.type = "button";
    editSelfBtn.style.cssText = "display:block;width:100%;margin-top:10px;padding:10px;border-radius:12px;border:1.5px solid var(--line)";
    editSelfBtn.onclick = function(){ editProfileModal(me); };
    b.appendChild(editSelfBtn);
  }

  // ৬. পাসকোড পরিবর্তনের রিকোয়েস্ট বোতাম
  if(CODE !== "1432014310" && me && !MON){
    var prBtn = el("button","btn ghost","রুমের পাসকোড বদলাও (রিকোয়েস্ট)");
    prBtn.type = "button";
    prBtn.style.cssText = "display:block;width:100%;margin-top:8px;padding:10px;border-radius:12px;border:1.5px solid var(--line)";
    prBtn.onclick = function(){ showPassRequestModal(); };
    b.appendChild(prBtn);
  }

  // ৭. রুম পরিবর্তন বাটন
  var switchBtn = el("button","btn ghost","🔄 রুম পরিবর্তন করুন (অন্য রুমে যাও)");
  switchBtn.type = "button";
  switchBtn.style.cssText = "display:block;width:100%;margin-top:8px;padding:10px;border-radius:12px;border:1.5px solid var(--line)";
  switchBtn.onclick = function(){
    roomSwitcherModal();
  };
  b.appendChild(switchBtn);

  // ৮. রুম ত্যাগ বাটন (ভিআইপি রুমে এটি থাকবে না!)
  if(CODE !== "1432014310"){
    var leaveBtn = el("button","btn dn","এই রুম পাকাপাকি ত্যাগ করুন (Leave Room)");
    leaveBtn.type = "button";
    leaveBtn.style.cssText = "display:block;width:100%;margin-top:8px;padding:10px;border-radius:12px;font-size:14px";
    leaveBtn.onclick = function(){
      if(!confirm("তুমি কি নিশ্চিত যে এই রুমের মেম্বারশিপ ছেড়ে দিতে চাও? এই রুমে তোমার সিট খালি হয়ে যাবে।")) return;
      leaveBtn.disabled = true;
      leaveBtn.textContent = "রুম ত্যাগ করা হচ্ছে...";
      var done = false;
      function finishLeave(){
        if(done) return;
        done = true;
        detachLiveRoomListeners({ markOfflinePres: false, goOffline: true });
        try{
          localStorage.removeItem("sr-code");
          localStorage.removeItem("sr-me");
          if(CODE) localStorage.removeItem("sr_cached_room_" + CODE);
        }catch(e){}
        location.reload();
      }
      var safety = setTimeout(finishLeave, 2500);
      if(ref && me && me !== "mon"){
        Promise.all([
          ref.child(me).remove().catch(function(){}),
          ref.child("members/" + me).remove().catch(function(){})
        ]).then(function(){
          clearTimeout(safety);
          finishLeave();
        });
      } else {
        clearTimeout(safety);
        finishLeave();
      }
    };
    b.appendChild(leaveBtn);
  }

  if(canCancel){
    var c=el("button","btn ghost","বাতিল");c.type="button";c.style.marginTop="8px";
    c.onclick=function(){m.hidden=true;m.setAttribute("hidden","");m.style.setProperty("display","none","important");};
    b.appendChild(c);
  }
}

// Add Me ফর্ম সরাসরি মডালে ওপেন হওয়া
function showAddMeModal(){
  var m=$("modal"),b=$("mbox");
  if(!m || !b) return;
  b.dataset.lb="0";
  b.dataset.modalKind="chooser-flow";

  b.innerHTML = `
    <div>
      <h2 style="font-size:20px;text-align:center;margin-bottom:4px;padding:0 48px">রুমে যোগ দাও (Add Me)</h2>
      <p class="mute" style="text-align:center;margin-top:0;font-size:14px">নিজের তথ্য পূরণ করে রুমে যোগ দাও</p>
      <input type="text" id="add_name" maxlength="60" placeholder="তোমার পুরো নাম" style="width:100%;padding:10px 14px;border-radius:12px;border:1.5px solid var(--line);margin-top:10px;font:inherit" />
      <input type="text" id="add_college" maxlength="100" placeholder="তোমার স্কুল / কলেজ / বিশ্ববিদ্যালয়" style="width:100%;padding:10px 14px;border-radius:12px;border:1.5px solid var(--line);margin-top:10px;font:inherit" />
      <input type="text" id="add_cls" maxlength="60" placeholder="ক্লাস (যেমন: HSC ২০২৭ / SSC / Admission / BCS)" style="width:100%;padding:10px 14px;border-radius:12px;border:1.5px solid var(--line);margin-top:10px;font:inherit" />
      
      <p class="mute" style="font-size:13px;font-weight:600;margin:12px 0 6px">তোমার টার্গেট</p>
      <div class="gl" id="modal_add_goal_list">
        <button type="button" class="on" data-g="Medical">🩺 Medical</button>
        <button type="button" data-g="Engineering">⚙️ Engineering</button>
        <button type="button" class="varsity-btn" data-g="Varsity">🏛️ Varsity</button>
        <button type="button" class="goal-custom" data-g="custom">🎯 + নিজের লক্ষ্য</button>
      </div>
      <input type="text" id="add_custom_goal" maxlength="60" placeholder="নিজের লক্ষ্য লেখো" style="width:100%;padding:10px 14px;border-radius:12px;border:1.5px solid var(--line);margin-top:8px;font:inherit;display:none" />
      
      <input type="tel" id="add_mob" maxlength="11" oninput="this.value = this.value.replace(/[^0-9০-৯]/g, '').slice(0, 11)" placeholder="মোবাইল (01XXXXXXXXX - ১১ ডিজিট, ঐচ্ছিক)" style="width:100%;padding:10px 14px;border-radius:12px;border:1.5px solid var(--line);margin-top:10px;font:inherit" />
      <input type="password" id="add_pin" maxlength="4" inputmode="numeric" placeholder="তোমার ৪-ডিজিট পার্সোনাল PIN সেট করো" style="width:100%;padding:10px 14px;border-radius:12px;border:1.5px solid var(--line);margin-top:10px;font:inherit" />
      
      <div id="add_err" style="color:var(--danger);font-size:14px;margin-top:8px;min-height:1.2em"></div>
      <div class="row" style="margin-top:14px;display:flex;gap:10px">
        <button class="btn" id="btn_add_submit" style="flex:1;padding:12px;border-radius:12px">যোগ দাও</button>
        <button class="btn ghost" id="btn_add_cancel" style="flex:1;padding:12px;border-radius:12px">পিছনে</button>
      </div>
    </div>
  `;
  appendModalCloseBtn(b, function(){ if(me || MON) closeAppModal(); else chooser(true); });

  var selGoal = "Medical";
  var customInp = document.getElementById("add_custom_goal");
  var modalGoalList = document.getElementById("modal_add_goal_list");
  var addClsInp = document.getElementById("add_cls");
  var addColInp = document.getElementById("add_college");

  function renderModalAddGoals(isBcs){
    if(!modalGoalList) return;
    var presets = isBcs
      ? [
          { g: "BCS Cadre", label: "💼 BCS Cadre" },
          { g: "Bank Job", label: "🏦 Bank Job" },
          { g: "Govt. Job", label: "📋 Govt. Job" }
        ]
      : [
          { g: "Medical", label: "🩺 Medical" },
          { g: "Engineering", label: "⚙️ Engineering" },
          { g: "Varsity", label: "🏛️ Varsity" }
        ];
    if(selGoal !== "custom" && !presets.some(function(p){ return p.g === selGoal; })){
      selGoal = presets[0].g;
    }
    modalGoalList.innerHTML = presets.map(function(p){
      return '<button type="button" class="' + (selGoal === p.g ? 'on' : '') + '" data-g="' + p.g + '">' + p.label + '</button>';
    }).join("") + '<button type="button" class="goal-custom ' + (selGoal === 'custom' ? 'on' : '') + '" data-g="custom">🎯 + নিজের লক্ষ্য</button>';
    customInp.style.display = (selGoal === "custom") ? "block" : "none";
    var gBtns = modalGoalList.querySelectorAll("button");
    gBtns.forEach(function(btnG){
      btnG.onclick = function(){
        gBtns.forEach(function(x){ x.classList.remove("on"); });
        btnG.classList.add("on");
        selGoal = btnG.getAttribute("data-g");
        customInp.style.display = (selGoal === "custom") ? "block" : "none";
        if(selGoal === "custom") customInp.focus();
      };
    });
  }

  renderModalAddGoals(false);
  if(addClsInp){
    addClsInp.oninput = function(){
      var isBcs = extractBaseClass(addClsInp.value) === "BCS";
      if(addColInp){
        addColInp.placeholder = isBcs ? "তোমার বিশ্ববিদ্যালয় / শিক্ষা প্রতিষ্ঠান" : "তোমার স্কুল / কলেজ / বিশ্ববিদ্যালয়";
      }
      renderModalAddGoals(isBcs);
    };
  }

  document.getElementById("btn_add_cancel").onclick = function(){
    chooser(true);
  };

  document.getElementById("btn_add_submit").onclick = function(){
    var name = document.getElementById("add_name").value.trim().slice(0, 60);
    var college = document.getElementById("add_college").value.trim().slice(0, 100);
    var cls = document.getElementById("add_cls").value.trim().slice(0, 60);
    var mobRaw = document.getElementById("add_mob").value.trim();
    var mob = mobRaw.replace(/[০-৯]/g, function(d){ return "০১২৩৪৫৬৭৮৯".indexOf(d); }).replace(/[^0-9]/g, "");
    var pinRaw = (document.getElementById("add_pin").value || "").trim();
    var pin = pinRaw.replace(/[০-৯]/g, function(d){ return "০১২৩৪৫৬৭৮৯".indexOf(d); }).replace(/[^0-9]/g, "");
    var goal = ((selGoal === "custom") ? customInp.value.trim() : selGoal).slice(0, 60);
    var er = document.getElementById("add_err");

    if(name.length < 2){
      er.textContent = "তোমার পুরো নাম লেখো (কমপক্ষে ২ অক্ষর)।";
      return;
    }
    if(!cls){
      er.textContent = "তোমার ক্লাস লেখো (যেমন: HSC, SSC, Admission বা BCS)।";
      return;
    }
    if(!goal){
      er.textContent = "নিজের লক্ষ্য নির্বাচন করো বা লেখো।";
      return;
    }
    if(!/^[0-9]{4}$/.test(pin)){
      er.textContent = "৪-ডিজিটের সঠিক সংখ্যা দিয়ে PIN সেট করো।";
      return;
    }
    if(mobRaw && !/^01[3-9][0-9]{8}$/.test(mob)){
      er.textContent = "সঠিক ১১ ডিজিটের মোবাইল নম্বর দাও (যেমন: 017XXXXXXXX)।";
      return;
    }

    var curMaxLim = parseInt((P.meta && P.meta.max) || 8, 10) || 8;
    var curActiveMems = getMembers().filter(function(id){ return id !== "p1" && id !== "p2"; }).length;
    if(curActiveMems >= curMaxLim){
      er.textContent = "দুঃখিত! রুমের সর্বোচ্চ " + bn(curMaxLim) + " জনের সীমা পূর্ণ হয়ে গেছে।";
      return;
    }

    var newId = "m" + Date.now().toString(36) + Math.floor(Math.random()*1e3).toString(36);
    var newUid = String(Math.floor(10000 + Math.random() * 90000));
    var classBase = extractBaseClass(cls) || "HSC";
    var newMem = {
      name: name,
      college: college,
      cls: cls,
      classBase: classBase,
      goal: goal,
      uid: newUid,
      pin: pin,
      joinedAt: T
    };
    if(mob) newMem.mobile = mob;

    ref.child("members/" + newId).set(newMem);
    ref.child(newId).set(newMem);
    if(window.FB_REST){
      window.FB_REST.set("user_pins/" + newId, { pin: pin, roomId: CODE, memberId: newId, updatedAt: Date.now() }).catch(function(){});
      window.FB_REST.set("user_pins/" + newUid, { pin: pin, roomId: CODE, memberId: newId, name: name, updatedAt: Date.now() }).catch(function(){});
      window.FB_REST.set("numeric_uids/" + newUid, { roomId: CODE, memberId: newId, name: name, createdAt: Date.now() }).catch(function(){});
    }
    try{
      localStorage.setItem("sr_pin_" + newId, pin);
      localStorage.setItem("sr_pin_" + CODE + "_" + newId, pin);
      saveScopedUid(CODE, newId, newUid);
      localStorage.setItem("sr-name", name);
      localStorage.setItem("sr_class", classBase);
      if(P && P.meta && P.meta.name) localStorage.setItem("sr_room_name", P.meta.name);
    }catch(e){}
    enter(newId);
    toast("স্বাগতম! তোমার UID: " + escHtml(newUid));
  };
}

// প্রোফাইল এডিটর
function editProfileModal(id){
  var m = $("modal"), b = $("mbox");
  if(!m || !b) return;

  m.hidden = false;
  m.removeAttribute("hidden");
  m.style.setProperty("display", "grid", "important");
  b.dataset.lb = "0";
  b.dataset.modalKind = "profile";
  b.textContent = "";
  b.style.maxWidth = "460px";

  var cur = pl(id);
  var curUid = resolveMemberUid(id, CODE, { name: cur.name, persist: true });

  var isVipUser = (id === "p1" || id === "p2");
  var curBaseCls = extractBaseClass(cur.classBase || cur.cls) || "HSC";
  var curYearMatch = (cur.cls && cur.cls.match(/[0-9]{4}/)) ? cur.cls.match(/[0-9]{4}/)[0] : (cur.passingYear || "");

  b.innerHTML = `
    <div>
      <h2 style="font-size:22px;text-align:center;margin-bottom:4px;padding:0 48px">প্রোফাইল সেটিংস</h2>
      <p class="mute" style="text-align:center;margin-top:0;font-size:13.5px;padding:0 36px">তোমার ব্যক্তিগত তথ্য ও লক্ষ্য আপডেট করো</p>
      
      <!-- Auto UID Card -->
      <div style="background:var(--as);padding:10px 14px;border-radius:12px;display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <div>
          <small style="color:var(--mute);font-size:11.5px;display:block">তোমার পার্সোনাল আইডি (UID):</small>
          <strong style="color:var(--a);font-size:14px;letter-spacing:1px">${escHtml(curUid)}</strong>
        </div>
        <button type="button" class="btn ghost" id="btn_copy_uid" style="padding:4px 10px;font-size:12px;border-radius:8px">📋 কপি</button>
      </div>

      <input type="text" id="prof_name" placeholder="তোমার পুরো নাম" value="${escHtml(cur.name||'')}" style="width:100%;padding:10px 14px;border-radius:12px;border:1.5px solid var(--line);margin-top:4px;font:inherit" />
      <input type="text" id="prof_college" placeholder="${curBaseCls === 'BCS' ? 'তোমার বিশ্ববিদ্যালয় / শিক্ষা প্রতিষ্ঠান' : 'তোমার স্কুল / কলেজ'}" value="${escHtml(cur.college||'')}" style="width:100%;padding:10px 14px;border-radius:12px;border:1.5px solid var(--line);margin-top:10px;font:inherit" />
      
      <p class="mute" style="font-size:13px;font-weight:600;margin:12px 0 6px">তোমার ক্লাস:</p>
      <div class="row" id="prof_cls_buttons" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
        <button type="button" class="btn prof-cls-btn ${curBaseCls==='HSC'?'on':'ghost'}" data-c="HSC" style="padding:8px 6px;font-size:13.5px;border-radius:10px">🎓 HSC</button>
        <button type="button" class="btn prof-cls-btn ${curBaseCls==='SSC'?'on':'ghost'}" data-c="SSC" style="padding:8px 6px;font-size:13.5px;border-radius:10px">📖 SSC</button>
        <button type="button" class="btn prof-cls-btn ${curBaseCls==='Admission'?'on':'ghost'}" data-c="Admission" style="padding:8px 6px;font-size:13.5px;border-radius:10px">🎯 Admission</button>
        <button type="button" class="btn prof-cls-btn ${curBaseCls==='BCS'?'on':'ghost'}" data-c="BCS" style="padding:8px 6px;font-size:13.5px;border-radius:10px">💼 BCS / Job</button>
      </div>

      <input type="tel" id="prof_year" maxlength="4" placeholder="${curBaseCls === 'BCS' ? 'স্নাতক পাসের বছর / ব্যাচ (যেমন: 2024)' : 'পাসের বছর (শুধুই সংখ্যা, যেমন: 2026)'}" value="${escHtml(curYearMatch)}" oninput="this.value=this.value.replace(/[^0-9]/g,'').slice(0,4)" style="width:100%;padding:10px 14px;border-radius:12px;border:1.5px solid var(--line);font:inherit" />
      <small style="color:${isVipUser ? '#10b981' : 'var(--mute)'};font-size:11.5px;display:block;margin-top:4px;font-weight:${isVipUser ? '600' : '400'}">${isVipUser ? '* VIP ইউজার: ক্লাস পরিবর্তন করলে অ্যাডমিন অনুমোদন ছাড়াই সাথে সাথে সক্রিয় হবে।' : '* ক্লাস পরিবর্তন করলে তা অ্যাডমিন অনুমোদনের পর সক্রিয় হবে।'}</small>

      <p class="mute" style="font-size:13px;font-weight:600;margin:12px 0 6px">তোমার টার্গেট:</p>
      <div class="gl" id="prof_goal_list"></div>
      <input type="text" id="prof_custom_goal" placeholder="নিজের লক্ষ্য লেখো" value="${['Medical','Engineering','Varsity','BCS Cadre','Bank Job','Govt. Job'].indexOf(cur.goal)<0?escHtml(cur.goal):''}" style="width:100%;padding:10px 14px;border-radius:12px;border:1.5px solid var(--line);margin-top:8px;font:inherit;display:none" />
      
      <input type="tel" id="prof_mob" maxlength="11" oninput="this.value = this.value.replace(/[^0-9০-৯]/g, '').slice(0, 11)" placeholder="মোবাইল (01XXXXXXXXX - ১১ ডিজিট)" value="${escHtml(cur.mobile||'')}" style="width:100%;padding:10px 14px;border-radius:12px;border:1.5px solid var(--line);margin-top:10px;font:inherit" />
      
      <!-- PIN Change Section -->
      <div style="margin-top:14px;border-top:1px dashed var(--line);padding-top:10px;text-align:left">
        <small style="font-weight:700;color:var(--ink);display:block;margin-bottom:6px">🔐 ৪ ডিজিটের ব্যক্তিগত পিন (PIN) পরিবর্তন:</small>
        <div style="display:flex;gap:8px">
          <input type="password" id="prof_cur_pin" maxlength="4" placeholder="বর্তমান PIN" oninput="this.value=this.value.replace(/[^0-9]/g,'').slice(0,4)" style="flex:1;min-width:0;width:100%;padding:8px 10px;border-radius:10px;border:1.5px solid var(--line);font:inherit;text-align:center" />
          <input type="password" id="prof_new_pin" maxlength="4" placeholder="নতুন ৪-ডিজিট PIN" oninput="this.value=this.value.replace(/[^0-9]/g,'').slice(0,4)" style="flex:1;min-width:0;width:100%;padding:8px 10px;border-radius:10px;border:1.5px solid var(--line);font:inherit;text-align:center" />
        </div>
      </div>

      <div id="prof_err" style="color:var(--danger);font-size:14px;margin-top:8px;min-height:1.2em"></div>
      
      <div class="row" style="margin-top:16px;display:flex;gap:10px">
        <button class="btn" id="btn_prof_save" style="flex:1;padding:12px;border-radius:12px">সেভ করো</button>
        <button class="btn ghost" id="btn_prof_close" style="flex:1;padding:12px;border-radius:12px">বাতিল</button>
      </div>
    </div>
  `;
  appendModalCloseBtn(b);

  var allKnownPresets = ['Medical', 'Engineering', 'Varsity', 'BCS Cadre', 'Bank Job', 'Govt. Job'];
  var selClass = curBaseCls;
  var curGoalRaw = cur.goal || (curBaseCls === "BCS" ? "BCS Cadre" : "Medical");
  var selGoal = (allKnownPresets.indexOf(curGoalRaw) < 0) ? "custom" : curGoalRaw;
  var customInp = document.getElementById("prof_custom_goal");
  var profGoalList = document.getElementById("prof_goal_list");
  var profColInp = document.getElementById("prof_college");
  var profYearInp = document.getElementById("prof_year");
  var clsBtns = b.querySelectorAll(".prof-cls-btn");

  document.getElementById("btn_copy_uid").onclick = function(){
    navigator.clipboard.writeText(curUid).then(function(){
      toast("UID কপি হয়েছে ✓");
    }).catch(function(){});
  };

  function syncProfClassFields(clsVal){
    var isBcs = (clsVal === "BCS");
    if(profColInp){
      profColInp.placeholder = isBcs ? "তোমার বিশ্ববিদ্যালয় / শিক্ষা প্রতিষ্ঠান" : "তোমার স্কুল / কলেজ";
    }
    if(profYearInp){
      profYearInp.placeholder = isBcs ? "স্নাতক পাসের বছর / ব্যাচ (যেমন: 2024)" : "পাসের বছর (শুধুই সংখ্যা, যেমন: 2026)";
    }
    if(!profGoalList) return;
    var presets = isBcs
      ? [
          { g: "BCS Cadre", label: "💼 BCS Cadre" },
          { g: "Bank Job", label: "🏦 Bank Job" },
          { g: "Govt. Job", label: "📋 Govt. Job" }
        ]
      : [
          { g: "Medical", label: "🩺 Medical" },
          { g: "Engineering", label: "⚙️ Engineering" },
          { g: "Varsity", label: "🏛️ Varsity" }
        ];
    if(selGoal !== "custom" && !presets.some(function(p){ return p.g === selGoal; })){
      selGoal = presets[0].g;
    }
    profGoalList.innerHTML = presets.map(function(p){
      return '<button type="button" class="' + (selGoal === p.g ? 'on' : '') + '" data-g="' + p.g + '">' + p.label + '</button>';
    }).join("") + '<button type="button" class="goal-custom ' + (selGoal === 'custom' ? 'on' : '') + '" data-g="custom">🎯 + নিজের লক্ষ্য</button>';
    customInp.style.display = (selGoal === "custom") ? "block" : "none";
    var gBtns = profGoalList.querySelectorAll("button");
    gBtns.forEach(function(btnEl){
      btnEl.onclick = function(){
        gBtns.forEach(function(x){ x.classList.remove("on"); });
        btnEl.classList.add("on");
        selGoal = btnEl.getAttribute("data-g");
        customInp.style.display = (selGoal === "custom") ? "block" : "none";
        if(selGoal === "custom") customInp.focus();
      };
    });
  }

  syncProfClassFields(selClass);

  clsBtns.forEach(function(cb){
    cb.onclick = function(){
      clsBtns.forEach(function(x){ x.className = "btn prof-cls-btn ghost"; });
      cb.className = "btn prof-cls-btn on";
      selClass = cb.getAttribute("data-c");
      syncProfClassFields(selClass);
    };
  });

  document.getElementById("btn_prof_close").onclick = function(){
    closeAppModal();
  };

  document.getElementById("btn_prof_save").onclick = function(){
    var nameVal = document.getElementById("prof_name").value.trim();
    var collegeVal = document.getElementById("prof_college").value.trim();
    var yearVal = document.getElementById("prof_year").value.trim();
    var mobRaw = document.getElementById("prof_mob").value.trim();
    var mobVal = mobRaw.replace(/[০-৯]/g, function(d){ return "০১২৩৪৫৬৭৮৯".indexOf(d); }).replace(/[^0-9]/g, "");
    var goalVal = (selGoal === "custom") ? customInp.value.trim() : selGoal;
    var er = document.getElementById("prof_err");

    if(!nameVal){
      er.textContent = "নাম লিখুন।";
      return;
    }
    if(!goalVal){
      er.textContent = "নিজের লক্ষ্য নির্বাচন করো বা লেখো।";
      return;
    }

    if(mobRaw && !/^01[3-9][0-9]{8}$/.test(mobVal)){
      er.textContent = "সঠিক ১১ ডিজিটের মোবাইল নম্বর দাও (যেমন: 017XXXXXXXX)।";
      return;
    }

    // PIN Change Check (verify remote user_pins/{id} too so new browser cannot bypass old PIN)
    var curPinInput = document.getElementById("prof_cur_pin").value.trim();
    var newPinInput = document.getElementById("prof_new_pin").value.trim();
    var localSavedPin = localStorage.getItem("sr_pin_" + id) || localStorage.getItem("sr_pin_" + CODE + "_" + id) || (cur && cur.pin);

    var pinCheckPromise;
    if(newPinInput){
      if(newPinInput.length !== 4){
        er.textContent = "নতুন পিন অবশ্যই ঠিক ৪ ডিজিটের হতে হবে।";
        return;
      }
      if(localSavedPin){
        if(curPinInput !== String(localSavedPin)){
          er.textContent = "বর্তমান পিনটি সঠিক নয়!";
          return;
        }
        pinCheckPromise = Promise.resolve(true);
      } else if(window.FB_REST){
        pinCheckPromise = window.FB_REST.get("user_pins/" + id).then(function(pd){
          var remotePin = pd && pd.pin ? String(pd.pin) : "";
          if(remotePin && curPinInput !== remotePin){
            er.textContent = "বর্তমান পিনটি সঠিক নয়!";
            return false;
          }
          return true;
        }).catch(function(){ return true; });
      } else {
        pinCheckPromise = Promise.resolve(true);
      }
    } else {
      pinCheckPromise = Promise.resolve(true);
    }

    pinCheckPromise.then(function(pinOk){
      if(!pinOk) return;
      if(newPinInput){
        try {
          localStorage.setItem("sr_pin_" + id, newPinInput);
          localStorage.setItem("sr_pin_" + CODE + "_" + id, newPinInput);
        } catch(e){}
        if(window.FB_REST){
          window.FB_REST.set("user_pins/" + id, { pin: newPinInput, roomId: CODE, memberId: id, updatedAt: Date.now() }).catch(function(){});
          if(curUid) window.FB_REST.set("user_pins/" + curUid, { pin: newPinInput, roomId: CODE, memberId: id, name: nameVal, updatedAt: Date.now() }).catch(function(){});
          if(CODE !== "1432014310"){
            window.FB_REST.set("rooms_v2/" + CODE + "/members/" + id + "/pin", newPinInput).catch(function(){});
          }
        }
      }

      // Class Change Request Handling (VIP users switch immediately without admin approval)
      var fullRequestedCls = selClass + (yearVal ? " (" + yearVal + ")" : "");
      var isClassChanged = (selClass !== curBaseCls);
      var requiresApproval = isClassChanged && !isVipUser;

      if(requiresApproval){
        var changeReq = {
          uid: curUid,
          memberId: id,
          room: CODE,
          roomName: (P.meta && P.meta.name) || (CODE === "1432014310" ? "Queen Room" : "স্টাডি রুম"),
          name: nameVal,
          oldClass: cur.cls || curBaseCls,
          requestedClass: fullRequestedCls,
          passingYear: yearVal,
          requestedAt: Date.now(),
          status: "pending"
        };
        if(window.FB_REST) window.FB_REST.push("class_change_requests", changeReq).catch(function(){});
        toast("আপনার Class পরিবর্তনের আবেদনটি অ্যাডমিন প্যানেলে পাঠানো হয়েছে।", 5000);
      }

      if(!requiresApproval){
        try { localStorage.setItem("sr_class", selClass); } catch(e){}
        if(typeof window.refreshExamPortalClass === "function"){
          try { window.refreshExamPortalClass(); } catch(e){}
        }
      }

      enter(id);
      put(id, function(p){
        p.name = nameVal;
        p.college = collegeVal;
        p.goal = goalVal;
        p.mobile = mobVal;
        p.uid = curUid;
        if(newPinInput) p.pin = newPinInput;
        if(!requiresApproval){
          p.cls = fullRequestedCls;
          p.classBase = selClass;
          p.passingYear = yearVal;
        }
      });

      saveScopedUid(CODE, id, curUid);
      if(curUid && window.FB_REST){
        window.FB_REST.update("numeric_uids/" + curUid, {
          name: nameVal,
          roomId: CODE || "1432014310",
          memberId: id,
          updatedAt: Date.now()
        }).catch(function(){});
      }
      if(CODE && CODE !== "1432014310" && window.FB_REST){
        var v2Patch = { name: nameVal, college: collegeVal, goal: goalVal, mobile: mobVal, uid: curUid };
        if(newPinInput) v2Patch.pin = newPinInput;
        if(!requiresApproval){
          v2Patch.cls = fullRequestedCls;
          v2Patch.classBase = selClass;
          v2Patch.passingYear = yearVal;
        }
        window.FB_REST.update("rooms_v2/" + CODE + "/members/" + id, v2Patch).catch(function(){});
        window.FB_REST.update("rooms_v2/" + CODE + "/" + id, v2Patch).catch(function(){});
      }

      if(isVipUser){
        try {
          localStorage.setItem("vip_" + id + "_name", nameVal);
        } catch(e){}
        var vipPatch = {
          name: nameVal,
          college: collegeVal,
          goal: goalVal,
          mobile: mobVal,
          uid: curUid
        };
        if(!requiresApproval){
          vipPatch.cls = fullRequestedCls;
          vipPatch.classBase = selClass;
          vipPatch.passingYear = yearVal;
        }
        if(window.FB_REST){
          window.FB_REST.update("vip_users/" + id, vipPatch).catch(function(){});
          window.FB_REST.update("rooms/1432014310/" + id, vipPatch).catch(function(){});
        }
      }

      try { localStorage.setItem("sr_goal", goalVal); } catch(e){}
      var logoImg = document.querySelector(".brand .logo");
      if(logoImg) logoImg.src = getLogo(goalVal);
      var whoEl = $("who");
      if(whoEl) whoEl.textContent = nameVal;

      QB = {};
      setQ($("qt"));

      if(!requiresApproval && isClassChanged){
        exB = "init";
        examSync();
        try { timerBox(); } catch(e){}
      }

      b.dataset.modalKind = "";
      m.hidden = true;
      m.setAttribute("hidden", "");
      m.style.setProperty("display", "none", "important");
      if(!requiresApproval){
        toast(isClassChanged && isVipUser ? ("প্রোফাইল ও ক্লাস (" + selClass + ") আপডেট হয়েছে ✓") : "প্রোফাইল আপডেট হয়েছে ✓");
      }
    });
  };
}

var whoTop = $("who");
if(whoTop){
  whoTop.onclick = function(e){
    if(e){ e.preventDefault(); e.stopPropagation(); }
    if(!MON && me) editProfileModal(me);
  };
}

var QB = {};
function nextQ(){
  var myGoal = (me && pl(me).goal) || "Medical";
  var cat = MOT[myGoal] ? myGoal : "Other";
  if(!QB[cat] || !QB[cat].length){
    QB[cat] = MOT[cat].slice().sort(function(){ return Math.random() - 0.5; });
  }
  return QB[cat].pop() || MOT[cat][0];
}

function setQ(q){
  if(!q) return;
  var t = nextQ();
  q.textContent = t;
  var myGoal = (me && pl(me).goal) || "Medical";
  q.classList.toggle("sp", myGoal === "Medical" && SQ.indexOf(t) > -1);
}

function qInit(){
  var q=$("qt");
  setQ(q);
  setInterval(function(){
    if(!q) return;
    q.classList.add("f");
    setTimeout(function(){
      setQ(q);
      q.classList.remove("f");
    }, 400);
  }, 30000);
}

function examSync(){
  var b=$("exam");if(!b)return;
  var x=P.exam||{},t=x.t,k=t+"|"+(x.n||"");if(exB===k)return;exB=k;b.textContent="";
  b.appendChild(el("h2",null,"🎯 "+(x.n||"পরীক্ষার")+" কাউন্টডাউন"));var c=el("div","exc");c.id="exn";b.appendChild(c);
  var r=el("div","row");r.style.marginTop="8px";
  var curUserCls = getActiveUserClass();
  var exPh = curUserCls === "BCS" ? "পরীক্ষার নাম (যেমন: BCS প্রিলি, মডেল টেস্ট)"
           : curUserCls === "Admission" ? "পরীক্ষার নাম (যেমন: ভর্তি পরীক্ষা, মডেল টেস্ট)"
           : curUserCls === "SSC" ? "পরীক্ষার নাম (যেমন: SSC, মডেল টেস্ট)"
           : "পরীক্ষার নাম (যেমন: HSC, মডেল টেস্ট)";
  var n=el("input","tr");n.type="text";n.maxLength=40;n.placeholder=exPh;n.value=x.n||"";n.setAttribute("aria-label","পরীক্ষার নাম");
  var i=el("input");i.type="datetime-local";i.setAttribute("aria-label","পরীক্ষার তারিখ");
  if(t)i.value=new Date(t-new Date().getTimezoneOffset()*6e4).toISOString().slice(0,16);
  var s=el("button","btn ghost",t?"সেভ করো":"সেট করো");s.type="button";
  s.onclick=function(){var v=new Date(i.value).getTime();if(!v||!ref){toast("আগে একটা তারিখ বেছে নাও");return}ref.child("exam").set({t:v,n:n.value.trim()})};
  if(!MON){r.appendChild(n);r.appendChild(i);r.appendChild(s);b.appendChild(r)}examTick()
}

function examTick(){var c=$("exn");if(!c)return;var t=P.exam&&P.exam.t;if(!t){c.textContent="তারিখ সেট করা হয়নি";return}
  var ms=t-NOW();if(ms<=0){c.textContent="পরীক্ষার সময় হয়ে গেছে। সবার জন্য দোয়া, আল্লাহ ভরসা!";return}
  var s=Math.floor(ms/1000),d=Math.floor(s/86400),h=Math.floor(s%86400/3600),m=Math.floor(s%3600/60);s%=60;
  c.textContent=bn(d)+" দিন "+bn(h)+" ঘণ্টা "+bn(m)+" মিনিট "+bn(s)+" সেকেন্ড"}

function chatUI(){var l=$("cl");if(!l)return;var c=P.chat||{},ks=Object.keys(c).sort().slice(-100),near=l.scrollHeight-l.scrollTop-l.clientHeight<80;l.textContent="";
  if(!ks.length)l.appendChild(el("p","mute","এখনো কোনো মেসেজ নেই। প্রথম মেসেজটা তুমিই পাঠাও।"));
  ks.forEach(function(k){var m=c[k],d=el("div","msg"+(m.u===me?" me":""));if(m.u!==me)d.appendChild(el("small",null,m.n||nm(m.u)));
    d.appendChild(el("span",null,m.x||""));if(m.e)d.appendChild(el("small","ed","*"));var ts=el("small","mt",m.t?new Date(m.t).toLocaleTimeString("bn-BD",{hour:"numeric",minute:"2-digit"}):"");
    if(m.u===me){var ed=el("button","del","✎");ed.type="button";ed.setAttribute("aria-label","মেসেজ এডিট");ed.onclick=function(){chatEditStart(k,m.x)};ts.appendChild(ed);var x=el("button","del","×");x.type="button";x.setAttribute("aria-label","মেসেজ মুছো");x.onclick=function(){ask("এই মেসেজটা মুছতে চাও?",function(){ref.child("chat/"+k).remove()})};ts.appendChild(x)}
    d.appendChild(ts);l.appendChild(d)});
  if(near)l.scrollTop=l.scrollHeight}

function chatEditStart(k,t){CE=k;var i=$("ci");i.value=t||"";i.focus();$("cx").hidden=false;$("csb").textContent="সেভ ✓"}
function chatEditEnd(){CE=null;$("ci").value="";$("cx").hidden=true;$("csb").textContent="পাঠাও ➤"}
var cxBtn = $("cx"); if(cxBtn) cxBtn.onclick = chatEditEnd;

function chatSend(){if(getRoomLockState()){toast("মেয়াদ শেষ — নিচের Feedback অপশনে অ্যাডমিনের সাথে কথা বলুন");return}var i=$("ci"),v=i.value.trim();if(!v||!me||!ref||MON)return;
  if(CE){var o=P.chat&&P.chat[CE];if(!o||o.u!==me){toast("মেসেজটা আর নেই");chatEditEnd();return}
    if(v!==o.x){ref.child("chat/"+CE+"/x").set(v.slice(0,500));ref.child("chat/"+CE+"/e").set(1).catch(function(){toast("এডিট হয়নি, ইন্টারনেট দেখো")})}chatEditEnd();return}ref.child("chat").push({u:me,n:nm(me),x:v.slice(0,500),t:firebase.database.ServerValue.TIMESTAMP}).catch(function(){toast("মেসেজ যায়নি, ইন্টারনেট দেখো")});i.value=""}

function delDay(k){var p=pl(me),f=function(x){return key(new Date(x.a))===k},d={days:p.days[k]||null,mins:p.mins[k]||0,pr:p.pr[k]||null,sess:p.sess.filter(f)};
  ref.child("bk/"+me+"_"+Date.now()).set({o:me,k:k,t:Date.now(),d:d}).then(function(){put(me,function(q){delete q.days[k];delete q.mins[k];delete q.pr[k];q.sess=q.sess.filter(function(x){return !f(x)})});toast("ব্যাকআপ রেখে মুছে ফেলা হয়েছে");hist(me,k)}).catch(function(){toast("ব্যাকআপ হয়নি, তাই কিছু মোছা হয়নি")})}
function restore(v){var d=v.d||{};put(me,function(q){if(d.days)q.days[v.k]=d.days;if(d.mins)q.mins[v.k]=d.mins;if(d.pr)q.pr[v.k]=d.pr;q.sess=q.sess.filter(function(x){return key(new Date(x.a))!==v.k}).concat(d.sess||[])});toast("ফিরিয়ে আনা হয়েছে");hist(me,v.k)}

function hist(id,k){
  k = k || key(new Date());
  var m=$("modal"),b=$("mbox");b.dataset.lb="0";b.textContent="";b.style.maxWidth="560px";
  m.hidden=false;m.removeAttribute("hidden");m.style.setProperty("display","grid","important");
  var p=pl(id),tabs=el("div","row");tabs.style.marginTop="0";
  var mems = getOrderedMembers();
  mems.forEach(function(x){
    var t=el("button","btn"+(x===id?"":" ghost")+(x!==me?" alt":""),nm(x));
    t.type="button";t.onclick=function(){hist(x,k)};tabs.appendChild(t);
  });
  var cl=el("button","btn ghost","✕");cl.type="button";cl.setAttribute("aria-label","বন্ধ করো");
  cl.onclick=function(){m.hidden=true;m.setAttribute("hidden","");m.style.setProperty("display","none","important");};
  var wbn=el("button","btn ghost","📊 সাপ্তাহিক");wbn.type="button";wbn.onclick=function(){weeklyHist()};tabs.appendChild(wbn);tabs.appendChild(cl);b.appendChild(tabs);
  var di=el("input");di.type="date";di.value=k;di.style.cssText="width:100%;margin-top:10px";di.onchange=function(){if(di.value)hist(id,di.value)};b.appendChild(di);
  var a=p.days[k]||[],c=cnt(p,k),ss=(p.sess||[]).filter(function(x){return key(new Date(x.a))===k}),pr=p.pr[k]||"00000";
  b.appendChild(el("h2",null,"কাজ "+bn(c[0])+"/"+bn(c[1])+" শেষ · পড়া "+fmtHM(p.mins[k]||0)));
  a.forEach(function(t){var r=el("div","ses"),tx=el("span",t.d||t.x?"mute":"",(t.x?"✕ ":t.d?"✓ ":"○ ")+t.t+(t.x?" (মোছা)":""));if(t.x)tx.style.textDecoration="line-through";r.appendChild(tx);
    if(id===me&&!MON){var dl=el("button","del","🗑");dl.type="button";dl.setAttribute("aria-label","কাজটা পাকাপাকি মুছো");dl.onclick=function(){ask("আপনি কি নিশ্চিত যে এই কাজটা ইতিহাস থেকে পাকাপাকি মুছতে চান? এটা আর ফেরানো যাবে না।",function(){delTask(k,t.i)},function(){hist(id,k)})};r.appendChild(dl)}
    b.appendChild(r)});
  b.appendChild(el("p",null,"নামাজ: "+PR.map(function(n,i){return n+(pr[i]==="1"?" ✓":" ✗")}).join(" · ")));
  ss.forEach(function(x){var r=el("div","ses");r.appendChild(el("span",null,x.s+(x.tp?" — "+x.tp:"")));r.appendChild(el("b",null,fmtHM(x.m)));b.appendChild(r)});
  if(!a.length&&!ss.length&&!p.mins[k])b.appendChild(el("p","mute","এই দিনের কোনো হিসাব নেই।"));
  if(id!==me||MON)return;
  var bt=el("button","btn ghost","🗑 এই দিনের হিসাব মুছো");bt.type="button";bt.style.marginTop="12px";
  bt.onclick=function(){b.textContent="";b.appendChild(el("h2",null,"আপনি কি নিশ্চিত যে এই দিনের ("+k+") History-টি ডিলিট করতে চান?"));b.appendChild(el("p","mute","ডিলিটের আগে ব্যাকআপ তৈরি হবে।"));
    var r=el("div","row"),y=el("button","btn alt","Confirm Delete"),n=el("button","btn ghost","Cancel");y.type=n.type="button";y.onclick=function(){delDay(k)};n.onclick=function(){hist(me,k)};r.appendChild(y);r.appendChild(n);b.appendChild(r)};
  b.appendChild(bt);
  var bk=P.bk||{},bl=Object.keys(bk).filter(function(x){return bk[x].o===me}).sort().reverse();
  b.appendChild(el("h2",null,"ব্যাকআপ ("+bn(bl.length)+")"));
  bl.forEach(function(x){var v=bk[x],r=el("div","ses"),rb=el("button","btn ghost","ফিরিয়ে আনো");rb.type="button";rb.onclick=function(){restore(v)};r.appendChild(el("span",null,v.k+" · মোছা: "+new Date(v.t).toLocaleDateString("bn-BD",{day:"numeric",month:"short"})));r.appendChild(rb);b.appendChild(r)})}

// আজকের কাজ সাবমিট লজিক
var addForm = $("addForm");
if(addForm){
  addForm.onsubmit = function(e){
    if(e) { e.preventDefault(); e.stopPropagation(); }
    var inp = $("newTask");
    var v = inp ? inp.value.trim() : "";
    if(!v || !me || MON) return false;

    var dt = new Date(), late = dt.getHours() >= 22;
    if(late) dt.setDate(dt.getDate() + 1);
    var k = key(dt);

    put(me, function(p){
      p.days = p.days || {};
      p.days[k] = p.days[k] || [];
      p.days[k].push({ i: NOW() + "" + Math.floor(Math.random()*1e3), t: v, d: 0 });
    });

    if(inp) inp.value = "";
    if(late) toast("রাত ১০টার পর যোগ করা কাজ আগামীকালের তালিকায় গেছে", 6000);
    return false;
  };
}

var cfForm = $("cf"); if(cfForm) cfForm.addEventListener("submit",function(e){e.preventDefault();chatSend()});
var emCont = $("em"); if(emCont) { emCont.innerHTML = ""; ["😊","👍","🔥","💪","🤲","❤️"].forEach(function(e){var x=el("button","pill",e);x.type="button";x.onclick=function(){$("ci").value+=e;$("ci").focus()};emCont.appendChild(x)}); }

function speakBreak(){
  var S=window.speechSynthesis;
  if(!S||!window.SpeechSynthesisUtterance)return;
  try{
    S.cancel();
    var N=(nm(me)||"").trim();
    var v=bestVoice();
    var text=(N?N+". ":"")+"Your break time is over. Now go to your table and study again to achieve your goal.";
    var u=new SpeechSynthesisUtterance(text);
    u.lang=v?v.lang:"en-US";
    if(v)u.voice=v;
    u.rate=.94;
    u.pitch=1;
    u.volume=1;
    S.speak(u);
  }catch(e){}
}

function prayUI(){
  var c=$("pray");if(!c)return;var k=key(new Date());c.textContent="";
  c.appendChild(el("h2",null,"🕌 প্রতিদিনের সালাত/নামাজ ট্র্যাকার"));

  var mems = getOrderedMembers();
  mems.forEach(function(id,j){
    var isMe = (id===me && !MON),s=pl(id).pr[k]||"00000",n=s.split("").filter(function(x){return x==="1"}).length;
    c.appendChild(el("div","mute",nm(id)+(isMe?" (তুমি)":"")+" · "+bn(n)+"/"+bn(5)));
    var g=el("div","pg"+(isMe?"":" o"));
    PR.forEach(function(z,i){var on=s[i]==="1",b=el("button","pbx"+(on?" on":""));b.type="button";b.setAttribute("aria-pressed",on);b.appendChild(el("b",null,z));b.appendChild(el("span",null,on?"✓ আদায় হয়েছে":"বাকি আছে"));
      if(isMe)b.onclick=function(){put(me,function(q){var a=(q.pr[k]||"00000").split("");a[i]=a[i]==="1"?"0":"1";q.pr[k]=a.join("")})};else b.disabled=true;g.appendChild(b)});c.appendChild(g)
  });
}

var swbBtn = $("swb"); if(swbBtn) swbBtn.onclick=function(){chooser(true)};

function ask(t,ok,bk){
  var m=$("modal"),b=$("mbox");b.dataset.lb="0";b.textContent="";b.style.maxWidth="";
  m.hidden=false;m.removeAttribute("hidden");m.style.setProperty("display","grid","important");
  appendModalCloseBtn(b,function(){closeAppModal(bk);});
  var hd=el("h2",null,t);hd.style.paddingRight="48px";b.appendChild(hd);
  var r=el("div","row"),y=el("button","btn alt","হ্যাঁ, মুছো"),n=el("button","btn ghost","বাতিল");
  y.type=n.type="button";
  y.onclick=function(){closeAppModal(ok);};
  n.onclick=function(){closeAppModal(bk);};
  r.appendChild(y);r.appendChild(n);b.appendChild(r);
}

var cclrBtn = $("cclr"); if(cclrBtn) cclrBtn.onclick=function(){if(!ref)return;ask("চ্যাটের সব মেসেজ মুছে যাবে সবার। আর ফেরানো যাবে না। মুছবে?",function(){ref.child("chat").remove()})};

function brkModal(id){
  var p=pl(id);if(!brkOn(p))return;var m=$("modal"),b=$("mbox"),tot=(p.brk.m||1)*6e4;b.dataset.lb="0";b.textContent="";b.style.maxWidth="380px";
  m.hidden=false;m.removeAttribute("hidden");m.style.setProperty("display","grid","important");
  b.classList.add("pop");setTimeout(function(){b.classList.remove("pop")},600);
  appendModalCloseBtn(b);
  var h=el("h2",null,"☕ "+nm(id)+" ("+bn(p.brk.m)+") মিনিটের Break নিচ্ছে।");h.style.cssText="text-align:center;padding:0 48px";b.appendChild(h);
  var w=el("div","ringw");w.innerHTML='<svg class="ring" viewBox="0 0 220 220" aria-hidden="true"><defs><linearGradient id="brg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3fcaa2"/><stop offset="1" stop-color="#a995ff"/></linearGradient></defs><circle class="rt" cx="110" cy="110" r="90"/><circle class="rp" id="brp" style="stroke:url(#brg)" cx="110" cy="110" r="90" stroke-dasharray="565.49" stroke-dashoffset="0"/></svg>';
  var rc=el("div","rc"),cd=el("b","bd");cd.dataset.own=id;cd.dataset.tot=tot;var rem=Math.max(0,p.brk.e-NOW());cd.textContent=fmtClock(rem);rc.appendChild(cd);rc.appendChild(el("div","mute","বিরতি শেষ হতে বাকি"));w.appendChild(rc);b.appendChild(w);
  w.querySelector("#brp").style.strokeDashoffset=CR*(1-rem/tot);
  var r=el("div","row");r.style.justifyContent="center";var cl=el("button","btn ghost","বন্ধ করো");cl.type="button";
  cl.onclick=function(){closeAppModal();};
  r.appendChild(cl);b.appendChild(r);
}

var DN=["শনি","রবি","সোম","মঙ্গল","বুধ","বৃহ","শুক্র"];
function dfmt(d){return d.toLocaleDateString("bn-BD",{day:"numeric",month:"short"})}
function wkStart(d){var x=new Date(d.getTime());x.setHours(0,0,0,0);x.setDate(x.getDate()-(x.getDay()+1)%7);return x}
function wkKeys(st){var a=[];for(var i=0;i<7;i++){var d=new Date(st.getTime());d.setDate(d.getDate()+i);a.push(key(d))}return a}
function wkStat(p,ks){var c=0,t=0,m=0;ks.forEach(function(k){var a=(p.days[k]||[]).filter(function(x){return !x.x});t+=a.length;c+=a.filter(function(x){return x.d}).length;m+=dm(p,k)});return{c:c,t:t,m:m}}
function wkCalc(st){
  var ks=wkKeys(st),mems=getOrderedMembers();
  var list=mems.map(function(id,idx){return{id:id,idx:idx,s:wkStat(pl(id),ks),f:0}});
  var tc=list.reduce(function(a,x){return a+x.s.c},0),tm=list.reduce(function(a,x){return a+x.s.m},0);
  list.forEach(function(x){x.f=Math.round((tm?x.s.m/tm*100:0)/2+(tc?x.s.c/tc*100:0)/2)});
  var has=list.some(function(x){return x.s.t>0||x.s.m>0});
  var ranked=list.slice().sort(function(a,b){return(b.f-a.f)||(b.s.m-a.s.m)||(b.s.c-a.s.c)});
  var topF=ranked.length?ranked[0].f:0;
  var topTieCount=ranked.filter(function(x){return x.f===topF}).length;
  return{ks:ks,list:list,ranked:ranked,has:has,topF:topF,topTieCount:topTieCount,memCount:mems.length};
}

function wboard(){
  var c=$("wk");if(!c)return;
  var st=wkStart(new Date()),w=wkCalc(st),fri=new Date().getDay()===5,en=new Date(st.getTime());en.setDate(en.getDate()+6);c.textContent="";
  var h=el("div","wkh");h.appendChild(el("div","wkt","সাপ্তাহিক লিডারবোর্ড"));h.appendChild(el("span","wkb"+(fri?" fr":""),fri?"সপ্তাহের ফলাফল":"চলমান সপ্তাহ"));c.appendChild(h);
  c.appendChild(el("div","wks",dfmt(st)+" – "+dfmt(en)+" · শনিবার থেকে শুক্রবার"));
  if(!w.has){c.appendChild(el("p","wks","এই সপ্তাহে এখনো কোনো হিসাব নেই। কাজ যোগ করো আর পড়া শুরু করো!"));return}

  if(w.memCount===1){
    var only=w.ranked[0];
    if(fri){
      var f1=el("div","wkf");f1.appendChild(el("b",null,"🏆 এই সপ্তাহের অর্জন: "+nm(only.id)));
      f1.appendChild(el("div","wks","পুরো সপ্তাহে "+bn(only.s.c)+"টা কাজ শেষ আর "+fmtHM(only.s.m)+" পড়া। এই ধারাবাহিকতাই স্বপ্নের পথ।"));c.appendChild(f1);
    }else{
      c.appendChild(el("div","wks","এই সপ্তাহে এখন পর্যন্ত: "+nm(only.id)+"। শুক্রবারে চূড়ান্ত ফল।"));
    }
  }else{
    var isTopTie=w.topTieCount>1;
    var topNames=w.ranked.slice(0,w.topTieCount).map(function(x){return nm(x.id)}).join(w.topTieCount===2?" ও ":", ");
    if(fri){
      var f2=el("div","wkf");
      f2.appendChild(el("b",null,isTopTie?(w.topTieCount===w.memCount?"🤝 এই সপ্তাহে সবাই সমান বিজয়ী":"🤝 এই সপ্তাহে যৌথ বিজয়ী: "+topNames):"🏆 এই সপ্তাহের বিজয়ী: "+nm(w.ranked[0].id)));
      f2.appendChild(el("div","wks",isTopTie?"সমান তালে দারুণ লড়াই হয়েছে। এভাবেই একে অপরকে এগিয়ে নাও।":"পুরো সপ্তাহে "+bn(w.ranked[0].s.c)+"টা কাজ শেষ আর "+fmtHM(w.ranked[0].s.m)+" পড়া। এই ধারাবাহিকতাই স্বপ্নের পথ।"));
      c.appendChild(f2);
    }else{
      c.appendChild(el("div","wks",isTopTie?"এখন শীর্ষে সমান ("+topNames+")। শুক্রবারে চূড়ান্ত ফল।":"এখন এগিয়ে: "+nm(w.ranked[0].id)+"। শুক্রবারে চূড়ান্ত ফল।"));
    }
  }

  var g=el("div","wkp");
  if(w.memCount===1)g.style.gridTemplateColumns="1fr";
  else if(w.memCount>2)g.style.gridTemplateColumns="repeat(auto-fit,minmax(210px,1fr))";

  w.ranked.forEach(function(r,i){
    var isLead=(r.f===w.topF);
    var colorClass=r.idx===0?" g":(r.idx===1?" v":"");
    var d=el("div","wkr"+(isLead?" lead":"")+colorClass);
    var isJointTop=(w.memCount>1&&isLead&&w.topTieCount>1);
    var rankLbl=isJointTop?"🥇 Joint":((MEDALS[i]||"🏅")+" "+(RANKS_BN[i]||(bn(i+1)+"ম")));
    d.appendChild(el("div","wkm",rankLbl));
    d.appendChild(el("b",null,nm(r.id)));
    var n=el("div","wkn");n.appendChild(el("span",null,bn(r.s.c)));n.appendChild(el("small",null,"টা কাজ শেষ"));d.appendChild(n);
    d.appendChild(el("div","wkx","⏱ "+fmtHM(r.s.m)+" · স্কোর "+bn(r.f)));
    var bar=el("div","wbar"),fi=el("i");fi.style.width=r.f+"%";
    if(r.idx>=2)fi.style.background=MEMBER_COLORS[r.idx%MEMBER_COLORS.length];
    bar.appendChild(fi);d.appendChild(bar);g.appendChild(d);
  });
  c.appendChild(g);

  var mx=1,cs=w.ks.map(function(k){
    return w.list.map(function(mItem){
      var cntDone=(pl(mItem.id).days[k]||[]).filter(function(y){return y.d&&!y.x}).length;
      if(cntDone>mx)mx=cntDone;
      return cntDone;
    });
  });
  c.appendChild(el("div","wks","দিন অনুযায়ী শেষ করা কাজ"));
  var ch=el("div","wch");
  cs.forEach(function(v,i){
    var col=el("div","wcc"),bs=el("div","wcb");
    v.forEach(function(n,j){
      var mIdx=w.list[j].idx;
      var b=el("i",mIdx===0?"g":(mIdx===1?"v":""));
      if(mIdx>=2)b.style.background=MEMBER_COLORS[mIdx%MEMBER_COLORS.length];
      b.style.height=Math.max(3,n/mx*100)+"%";
      b.title=nm(w.list[j].id)+": "+bn(n);
      bs.appendChild(b);
    });
    col.appendChild(bs);col.appendChild(el("small",null,DN[i]));ch.appendChild(col);
  });
  c.appendChild(ch);
  if(w.memCount>2){
    var leg=el("div","wk-legend");
    w.list.forEach(function(mItem){
      var li=el("span","wk-legend-item"),dot=el("i","wk-legend-dot");
      dot.style.background=MEMBER_COLORS[mItem.idx%MEMBER_COLORS.length];
      li.appendChild(dot);li.appendChild(document.createTextNode(nm(mItem.id)));leg.appendChild(li);
    });
    c.appendChild(leg);
  }
}

function weeklyHist(){
  var m=$("modal"),b=$("mbox");b.dataset.lb="0";b.textContent="";b.style.maxWidth="560px";
  m.hidden=false;m.removeAttribute("hidden");m.style.setProperty("display","grid","important");
  var tabs=el("div","row");tabs.style.marginTop="0";
  var mems=getOrderedMembers();
  mems.forEach(function(x){var t=el("button","btn ghost"+(x!==me?" alt":""),nm(x));t.type="button";t.onclick=function(){hist(x)};tabs.appendChild(t)});
  var wbn=el("button","btn","সাপ্তাহিক");wbn.type="button";tabs.appendChild(wbn);
  var cl=el("button","btn ghost","✕");cl.type="button";cl.setAttribute("aria-label","বন্ধ করো");
  cl.onclick=function(){m.hidden=true;m.setAttribute("hidden","");m.style.setProperty("display","none","important");};
  tabs.appendChild(cl);b.appendChild(tabs);
  b.appendChild(el("h2",null,"আগের সপ্তাহগুলোর ফলাফল"));
  var cur=key(wkStart(new Date())),set={};
  mems.map(pl).forEach(function(p){Object.keys(p.days).concat(Object.keys(p.mins)).forEach(function(k){set[key(wkStart(new Date(k+"T00:00:00")))]=1})});
  var ws=Object.keys(set).filter(function(k){return k<cur}).sort().reverse(),shown=0;
  ws.forEach(function(k){
    var st=new Date(k+"T00:00:00"),w=wkCalc(st),en=new Date(st.getTime());en.setDate(en.getDate()+6);if(!w.has)return;shown++;
    var winTxt;
    if(w.memCount===1)winTxt="🏆 "+nm(w.ranked[0].id);
    else if(w.topTieCount>1)winTxt="🤝 Joint Winner";
    else winTxt="🏆 "+nm(w.ranked[0].id);
    var r=el("div","dl"),hd=el("div","dh");hd.appendChild(el("b",null,dfmt(st)+" – "+dfmt(en)));hd.appendChild(el("span","dwn",winTxt));r.appendChild(hd);
    w.ranked.forEach(function(it){
      var cl=it.idx===0?"g":(it.idx===1?"v":"");
      r.appendChild(drow(nm(it.id),it.s.m,[it.s.c,it.s.t],it.f,it.f===w.topF,cl,MEMBER_COLORS[it.idx%MEMBER_COLORS.length]));
    });
    b.appendChild(r);
  });
  if(!shown)b.appendChild(el("p","mute","এখনো কোনো পুরনো সপ্তাহের হিসাব নেই।"));
}

function normUrl(u){u=(u||"").trim();if(!u)return"";if(!/^[a-z][a-z0-9+.-]*:/i.test(u))u="https://"+u;try{var x=new URL(u);return x.protocol==="https:"||x.protocol==="http:"?x.href:""}catch(e){return""}}
function closeMenus(){document.querySelectorAll(".scp").forEach(function(x){x.remove()})}
document.addEventListener("click",closeMenus);

function scMenu(t,s){closeMenus();var m=el("div","scp");
  [["✏️ এডিট",function(){scForm(s)}],["🗑 ডিলিট",function(){ask("আপনি কি নিশ্চিত যে «"+s.n+"» শর্টকাটটা মুছতে চান?",function(){put(me,function(q){q.sc=(q.sc||[]).filter(function(x){return x.i!==s.i})})})}]].forEach(function(o){var b=el("button",null,o[0]);b.type="button";b.onclick=function(e){e.stopPropagation();closeMenus();o[1]()};m.appendChild(b)});t.appendChild(m)}

function scForm(s){var m=$("modal"),b=$("mbox");b.dataset.lb="0";b.textContent="";b.style.maxWidth="";
  m.hidden=false;m.removeAttribute("hidden");m.style.setProperty("display","grid","important");
  appendModalCloseBtn(b);
  var sh=el("h1",null,s?"শর্টকাট এডিট":"নতুন শর্টকাট");sh.style.paddingRight="48px";b.appendChild(sh);
  var n=el("input");n.type="text";n.maxLength=20;n.placeholder="নাম (যেমন: Khan Academy)";n.value=s?s.n:"";n.style.cssText="width:100%;margin-top:12px";n.setAttribute("aria-label","শর্টকাটের নাম");b.appendChild(n);
  var u=el("input");u.type="text";u.maxLength=300;u.placeholder="ওয়েবসাইটের লিংক (https://...)";u.value=s?s.u:"";u.style.cssText="width:100%;margin-top:10px";u.setAttribute("aria-label","ওয়েবসাইটের লিংক");b.appendChild(u);
  var er=el("p","mute","");b.appendChild(er);var r=el("div","row"),ok=el("button","btn",s?"সেভ":"যোগ করো"),cn=el("button","btn ghost","বাতিল");ok.type=cn.type="button";
  cn.onclick=function(){closeAppModal();};
  ok.onclick=function(){var nv=n.value.trim(),url=normUrl(u.value);if(!nv){er.textContent="নাম লেখো।";return}if(!url){er.textContent="সঠিক ওয়েবসাইটের লিংক দাও (https://...)।";return}
    if(!s&&pl(me).sc.length>=30){er.textContent="সর্বোচ্চ ৩০টা শর্টকাট রাখা যায়।";return}
    put(me,function(q){q.sc=q.sc||[];if(s)q.sc.forEach(function(x){if(x.i===s.i){x.n=nv;x.u=url}});else q.sc.push({i:NOW()+""+Math.floor(Math.random()*1e3),n:nv,u:url})});
    closeAppModal();};
  r.appendChild(ok);r.appendChild(cn);b.appendChild(r);setTimeout(function(){n.focus()},0)}

function scUI(){var c=$("scard");if(!c||MON)return;var L=pl(me).sc,k=JSON.stringify(L);if(c.dataset.k===k)return;c.dataset.k=k;c.textContent="";c.appendChild(el("h2",null,"🔗 পড়ার শর্টকাট"));var g=el("div","sct");
  L.forEach(function(s){var t=el("div","sc"),a=el("a","sca");if(/^https?:\/\//i.test(s.u)){a.href=s.u;a.target="_blank";a.rel="noopener noreferrer"}a.setAttribute("aria-label",s.n);
    a.appendChild(el("i","sci",(s.n||"?").trim().charAt(0).toUpperCase()));a.appendChild(el("span",null,s.n));t.appendChild(a);
    var mb=el("button","scm","⋮");mb.type="button";mb.setAttribute("aria-label",s.n+" মেনু");mb.onclick=function(e){e.stopPropagation();scMenu(t,s)};t.appendChild(mb);g.appendChild(t)});
  var ad=el("button","sc scadd");ad.type="button";ad.appendChild(el("i","sci","+"));ad.appendChild(el("span",null,"যোগ করো"));ad.onclick=function(){scForm()};g.appendChild(ad);c.appendChild(g)}

function delTask(k,i){put(me,function(q){q.days[k]=(q.days[k]||[]).filter(function(x){return x.i!==i})});toast("কাজটা পাকাপাকি মুছে গেছে");hist(me,k)}

function carryUI(){var m=$("modal"),b=$("mbox"),p=pl(me),td=key(new Date()),taken={},list=[];
  m.hidden=false;m.removeAttribute("hidden");m.style.setProperty("display","grid","important");
  b.dataset.lb="0";b.textContent="";b.style.maxWidth="520px";
  appendModalCloseBtn(b);
  Object.keys(p.days).forEach(function(k){(p.days[k]||[]).forEach(function(x){if(x.f)taken[x.f]=1})});
  Object.keys(p.days).sort().reverse().forEach(function(k){if(k>=td)return;(p.days[k]||[]).forEach(function(x){if(!x.d&&!x.x&&!taken[k+"|"+x.i])list.push({k:k,x:x})})});
  var ch=el("h2",null,"আগের অসম্পূর্ণ কাজ");ch.style.paddingRight="48px";b.appendChild(ch);
  var row=el("div","row"),cn=el("button","btn ghost",list.length?"বাতিল":"বন্ধ করো");cn.type="button";
  cn.onclick=function(){closeAppModal();};
  if(!list.length){b.appendChild(el("p","mute","আগের দিনের কোনো অসম্পূর্ণ কাজ নেই।"));row.appendChild(cn);b.appendChild(row);return}
  var ck=[];list.forEach(function(it){var r=el("label","ses"),l=el("span");l.appendChild(el("b",null,it.x.t));l.appendChild(el("small",null,new Date(it.k+"T00:00:00").toLocaleDateString("bn-BD",{day:"numeric",month:"short"})));
    var c=el("input");c.type="checkbox";c.style.cssText="width:20px;height:20px;accent-color:var(--a);flex:none";c.setAttribute("aria-label",it.x.t);ck.push(c);r.appendChild(l);r.appendChild(c);b.appendChild(r)});
  var go=el("button","btn","আজকের তালিকায় যোগ করো");go.type="button";
  go.onclick=function(){var sel=list.filter(function(it,j){return ck[j].checked});if(!sel.length){toast("আগে কাজ বেছে নাও");return}
    put(me,function(q){sel.forEach(function(it,j){(q.days[td]=q.days[td]||[]).push({i:NOW()+""+j+Math.floor(Math.random()*1e3),t:it.x.t,d:0,f:it.k+"|"+it.x.i})})});
    m.hidden=true;m.setAttribute("hidden","");m.style.setProperty("display","none","important");
    toast(bn(sel.length)+"টা কাজ আজকের তালিকায় যোগ হয়েছে")};
  row.appendChild(go);row.appendChild(cn);b.appendChild(row)}
var carryBtn = $("carry"); if(carryBtn) carryBtn.onclick=function(){if(!MON)carryUI()};

function visOn(){return document.visibilityState==="visible"&&document.hasFocus()}
function setPres(on){if(MON||!me||!ref)return;ref.child("pres/"+me).set(on).catch(function(){})}
function goOnline(){if(MON||!me||!ref)return;var r=ref.child("pres/"+me);r.onDisconnect().set(false).then(function(){r.set(visOn())}).catch(function(){})}
var pt;function visSync(){if(MON||!me||!ref)return;clearTimeout(pt);if(visOn())setPres(true);else pt=setTimeout(function(){if(!visOn())setPres(false)},1500)}
document.addEventListener("visibilitychange",visSync);window.addEventListener("focus",visSync);window.addEventListener("blur",visSync);
window.addEventListener("pagehide",function(){
  if(CODE&&!MON&&me){
    try{
      if(window.FB_REST){
        var rp=(CODE==="1432014310"?"rooms/":"rooms_v2/")+CODE+"/pres/"+me;
        window.FB_REST.set(rp,false,{keepalive:true,timeoutMs:2500}).catch(function(){});
      } else if(ref){
        ref.child("pres/"+me).set(false);
      }
    }catch(e){}
  }
  detachLiveRoomListeners({markOfflinePres:false,goOffline:true});
});

function enter(id){try{localStorage.setItem("sr-me",id)}catch(e){}MON=false;me=id;window.me=id;
  if(id) resolveMemberUid(id, CODE, { persist: true });
  var m=$("modal"), b=$("mbox"); if(b) b.dataset.modalKind=""; if(m){ m.hidden=true; m.setAttribute("hidden",""); m.style.setProperty("display","none","important"); }
  if(typeof bindAdminAlerts==="function")bindAdminAlerts();
  if(window.ExamPortal && typeof window.ExamPortal.syncWrongBank==="function"){ window.ExamPortal.syncWrongBank().catch(function(){}); }
  goOnline();render();
}

function clrBrk(){put(me,function(q){q.brk=null;resumeStudy(q,NOW())})}
function brkSync(){
  if(!me)return;
  var p=pl(me),s=p.study;
  if(brkOn(p)&&!BR.run){
    BR.run=true;BR.end=p.brk.e;BR.m=p.brk.m||BR.m;BR.rem=Math.round((BR.end-NOW())/1000);
  } else if(s&&s.ps&&!BR.run&&!brkOn(p)&&NOW()>RW){
    RW=NOW()+2000;
    put(me,function(q){resumeStudy(q,NOW())});
  }
}

function unlockAudio(){try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();if(AC.state==="suspended")AC.resume()}catch(e){}
  try{var S=window.speechSynthesis;if(S&&window.SpeechSynthesisUtterance){var u=new SpeechSynthesisUtterance(" ");u.volume=0;S.speak(u)}}catch(e){}}
function bestVoice(){var S=window.speechSynthesis;if(!S)return null;var b=null,bs=-1;
  S.getVoices().filter(function(v){return /^en/i.test(v.lang)}).forEach(function(v){var c=(/natural|neural/i.test(v.name)?4:0)+(/online/i.test(v.name)?3:0)+(/google/i.test(v.name)?2:0)+(/en[-_](us|gb)/i.test(v.lang)?1:0);if(c>bs){bs=c;b=v}});return b}
function longBeep(cb){var done=false;function fin(){if(done)return;done=true;if(cb)cb()}
  try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();if(AC.state==="suspended")AC.resume();
    var o=AC.createOscillator(),g=AC.createGain(),t=AC.currentTime+.05;o.type="sine";o.frequency.value=880;o.connect(g);g.connect(AC.destination);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.3,t+.03);g.gain.setValueAtTime(.3,t+1.47);g.gain.linearRampToValueAtTime(0,t+1.5);
    o.onended=fin;o.start(t);o.stop(t+1.5)}catch(e){fin();return}
  setTimeout(fin,2000)}
function speakCompletionMessage(userName){var S=window.speechSynthesis;if(!S||!window.SpeechSynthesisUtterance||NOW()-SP<8000)return;SP=NOW();
  try{S.cancel();var n=nm(me),u=new SpeechSynthesisUtterance("Well done"+(n?", "+n:"")+"! You have completed your task perfectly. You can take a short break."),v=bestVoice();
    u.lang=v?v.lang:"en-US";if(v)u.voice=v;u.rate=.95;u.pitch=1;u.volume=1;u.onerror=function(e){console.warn("speech error",e&&e.error)};S.speak(u)}catch(e){console.warn(e)}}

// লাইভ স্টাডি রুম সকেট লাইফসাইকেল নিয়ন্ত্রণ (শুধুমাত্র স্টাডি রুমের লাইভ ফিচারে কানেকশন থাকবে)
var liveDbx = null, liveRoomHandler = null, liveOffsetHandler = null, liveConnHandler = null;
function detachLiveRoomListeners(opts){
  opts = opts || {};
  clearTimeout(connect.wt);
  if(opts.markOfflinePres && CODE && !MON && me){
    try {
      if(window.FB_REST){
        var rp = (CODE === "1432014310" ? "rooms/" : "rooms_v2/") + CODE + "/pres/" + me;
        window.FB_REST.set(rp, false, { keepalive: true, timeoutMs: 2500 }).catch(function(){});
      } else if(ref){
        ref.child("pres/" + me).set(false).catch(function(){});
      }
    } catch(e){}
  }
  try {
    if(ref && liveRoomHandler) ref.off("value", liveRoomHandler);
    else if(ref) ref.off();
  } catch(e){}
  try {
    if(liveDbx && liveOffsetHandler) liveDbx.ref(".info/serverTimeOffset").off("value", liveOffsetHandler);
    if(liveDbx && liveConnHandler) liveDbx.ref(".info/connected").off("value", liveConnHandler);
  } catch(e){}
  liveRoomHandler = null;
  liveOffsetHandler = null;
  liveConnHandler = null;
  if(window.SRSControl && typeof window.SRSControl.pause === "function"){
    try { window.SRSControl.pause(); } catch(e){}
  }
  if(window.SRPointsControl && typeof window.SRPointsControl.pause === "function"){
    try { window.SRPointsControl.pause(); } catch(e){}
  }
  if(opts.goOffline !== false && window.goOfflineDB){
    window.goOfflineDB(liveDbx || window.db);
  }
}

window.enterExamOfflineMode = function(){
  window.__srExamPortalOpen = true;
  detachLiveRoomListeners({ markOfflinePres: true, goOffline: true });
};
window.exitExamOfflineMode = function(){
  window.__srExamPortalOpen = false;
  if(CODE){
    if(window.goOnlineDB) window.goOnlineDB();
    connect();
    if(window.SRSControl && typeof window.SRSControl.resume === "function"){
      try { window.SRSControl.resume(); } catch(e){}
    }
    if(window.SRPointsControl && typeof window.SRPointsControl.resume === "function"){
      try { window.SRPointsControl.resume(); } catch(e){}
    }
  }
};

// ডাটাবেস সংযোগ ও সেন্ট্রাল সিঙ্ক
function connect(){
  var warnEl = $("warn");
  if(!window.firebase || (!window.db && (typeof FB_CONFIG==="undefined" || !FB_CONFIG.databaseURL))){
    if(warnEl) {
      warnEl.textContent = "সংযোগ পাওয়া যাচ্ছে না। অনুগ্রহ করে আপনার ইন্টারনেট সংযোগ ঠিক করে পেজটি রিফ্রেশ দিন।";
      warnEl.hidden = false;
    }
    return;
  }
  detachLiveRoomListeners({ goOffline: false });
  if(window.__srExamPortalOpen) return;

  var dbx = window.db || (firebase.apps.length ? firebase.database() : firebase.initializeApp(FB_CONFIG).database());
  liveDbx = dbx;
  if(window.goOnlineDB) window.goOnlineDB(dbx);
  if(window.SRPointsControl && typeof window.SRPointsControl.resume === "function"){
    try { window.SRPointsControl.resume(); } catch(e){}
  }
  if(window.SRSControl && typeof window.SRSControl.resume === "function"){
    try { window.SRSControl.resume(); } catch(e){}
  }

  var roomPath = (CODE === "1432014310") ? ("rooms/" + CODE) : ("rooms_v2/" + CODE);
  ref = dbx.ref(roomPath);

  // ভিআইপি ইউজারদের টাস্ক ও পড়ার সময় সব রুমে একই রাখা (REST দিয়ে একবার লোড)
  if((me === "p1" || me === "p2") && window.FB_REST){
    window.FB_REST.get("vip_users/" + me).then(function(vData){
      if(vData && typeof vData === "object"){
        var vName = vData.name || (me==="p1"?"Tasfia Hasan":"Rahman");
        var vUid = (vData.uid && /^\d{5,6}$/.test(String(vData.uid))) ? String(vData.uid) : resolveMemberUid(me, CODE, { name: vName, persist: true });
        var vipUpdate = {
          name: vName,
          college: vData.college || "",
          goal: vData.goal || "Medical",
          mobile: vData.mobile || "",
          uid: vUid,
          days: vData.days || {},
          mins: vData.mins || {},
          pr: vData.pr || {},
          sc: vData.sc || []
        };
        if(vData.cls) vipUpdate.cls = vData.cls;
        if(vData.classBase) vipUpdate.classBase = vData.classBase;
        else if(vData.cls) vipUpdate.classBase = extractBaseClass(vData.cls) || "HSC";
        if(vData.passingYear !== undefined) vipUpdate.passingYear = vData.passingYear;
        ref.child(me).update(vipUpdate).catch(function(){});
        if(CODE !== "1432014310"){
          var memVipSync = {
            name: vName,
            college: vData.college || "",
            goal: vData.goal || "Medical",
            mobile: vData.mobile || "",
            uid: vUid,
            cls: vData.cls || vData.classBase || "HSC",
            classBase: vipUpdate.classBase || "HSC"
          };
          if(vData.passingYear !== undefined) memVipSync.passingYear = vData.passingYear;
          ref.child("members/" + me).update(memVipSync).catch(function(){});
        }
        saveScopedUid(CODE, me, vUid);
        syncUidToFirebase(CODE, me, vUid, vName);
        var vipBase = extractBaseClass(vData.classBase || vData.cls);
        if(vipBase){
          try { localStorage.setItem("sr_class", vipBase); } catch(e){}
        }
      }
    }).catch(function(){});
  }

  liveOffsetHandler = function(o){OFF=o.val()||0};
  dbx.ref(".info/serverTimeOffset").on("value", liveOffsetHandler);

  liveRoomHandler = function(sn){
    var d=sn.val()||{},ch=first;first=false;
    if(sn.exists() && d.meta && CODE !== "1432014310" && !MON && me && me !== "p1" && me !== "p2" && NOW()-(dirty[me]||0) > 6000){
      var stillInMembers = !!(d.members && d.members[me]);
      var stillInNode = !!(d[me] && typeof d[me] === "object");
      if(!stillInMembers && !stillInNode && !window.__srRemovedReloading){
        window.__srRemovedReloading = true;
        detachLiveRoomListeners({ goOffline: true });
        try {
          localStorage.removeItem("sr-code");
          localStorage.removeItem("sr-me");
          localStorage.removeItem("sr_cached_room_" + CODE);
        } catch(e){}
        toast("অ্যাডমিন আপনাকে এই রুম থেকে সরিয়ে দিয়েছেন।");
        setTimeout(function(){ location.reload(); }, 1200);
        return;
      }
    }
    if(d.members){
      Object.keys(d.members).forEach(function(mid){
        d[mid] = d[mid] || {};
        if(!d[mid].name) d[mid].name = d.members[mid].name;
        if(!d[mid].college) d[mid].college = d.members[mid].college;
        if(d.members[mid].cls) d[mid].cls = d.members[mid].cls;
        if(d.members[mid].classBase) d[mid].classBase = d.members[mid].classBase;
        if(d.members[mid].passingYear !== undefined) d[mid].passingYear = d.members[mid].passingYear;
        if(!d[mid].goal) d[mid].goal = d.members[mid].goal;
        if(!d[mid].mobile) d[mid].mobile = d.members[mid].mobile;
        if(!d[mid].uid && d.members[mid].uid) d[mid].uid = d.members[mid].uid;
        if(!d[mid].pin && d.members[mid].pin) d[mid].pin = d.members[mid].pin;
        if(d.members[mid].expiresAt !== undefined) d[mid].expiresAt = d.members[mid].expiresAt;
        else if(d[mid].expiresAt !== undefined) delete d[mid].expiresAt;
      });
    }
    for(var id in d){if(id===me&&NOW()-(dirty[id]||0)<4000)continue;if(JSON.stringify(P[id])!==JSON.stringify(d[id])){P[id]=d[id];ch=true}}
    for(var k in P){if(!(k in d)&&!(k===me&&NOW()-(dirty[k]||0)<4000)){delete P[k];ch=true}}
    if(P.meta && P.meta.name){
      try { localStorage.setItem("sr_room_name", P.meta.name); } catch(e){}
    } else if(CODE === "1432014310"){
      try { localStorage.setItem("sr_room_name", "Queen Room"); } catch(e){}
    }
    if(me && !MON && P[me]){
      if(P[me].name){
        try { localStorage.setItem("sr-name", P[me].name); } catch(e){}
      }
      resolveMemberUid(me, CODE, { name: P[me].name, persist: true });
    }
    window.P = P;
    window.me = me;
    window.CODE = CODE;
    if(ch)render();
    var q=PEND;PEND=[];q.forEach(function(x){put(x[0],x[1])});
  };
  ref.on("value", liveRoomHandler, function(e){
    if(warnEl) {
      warnEl.textContent = "সংযোগ পাওয়া যাচ্ছে না। অনুগ্রহ করে আপনার ইন্টারনেট সংযোগ ঠিক করে পেজটি রিফ্রেশ দিন।";
      warnEl.hidden = false;
    }
  });

  liveConnHandler = function(sn){
    clearTimeout(connect.wt);
    if(sn.val()){
      if(warnEl) warnEl.hidden = true;
      goOnline();
    } else {
      connect.wt = setTimeout(function(){
        if(warnEl) {
          warnEl.textContent = "সংযোগ পাওয়া যাচ্ছে না। অনুগ্রহ করে আপনার ইন্টারনেট সংযোগ ঠিক করে পেজটি রিফ্রেশ দিন।";
          warnEl.hidden = false;
        }
      }, 4000);
    }
  };
  dbx.ref(".info/connected").on("value", liveConnHandler);
}

var OFF=0;function NOW(){return Date.now()+OFF}
var PR=["ফজর","যোহর","আসর","মাগরিব","এশা"],exB="init",BR={m:5,rem:300,end:0,run:false,snd:true},AC=null,BR_NOTIFIED_END=0;

function requestStudyNotifPerm(){
  try{
    if("Notification" in window && Notification.permission==="default" && typeof Notification.requestPermission==="function"){
      Notification.requestPermission().catch(function(){});
    }
  }catch(e){}
}
function notifyBgCompletion(title,body){
  try{
    if(!("Notification" in window) || Notification.permission!=="granted")return;
    var n=new Notification(title||"আমার অধ্যয়ন কক্ষ",{
      body:body||"",
      icon:"/img/icon-192.png",
      badge:"/img/icon-192.png",
      tag:"sr-timer-"+Date.now()
    });
    setTimeout(function(){try{n.close()}catch(e){}},8000);
  }catch(e){}
}

function beep(){try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();if(AC.state==="suspended")AC.resume();[0,.3,.6].forEach(function(d){var o=AC.createOscillator(),g=AC.createGain();o.frequency.value=880;o.connect(g);g.connect(AC.destination);g.gain.setValueAtTime(.0001,AC.currentTime+d);g.gain.linearRampToValueAtTime(.2,AC.currentTime+d+.02);g.gain.exponentialRampToValueAtTime(.001,AC.currentTime+d+.25);o.start(AC.currentTime+d);o.stop(AC.currentTime+d+.26)})}catch(e){}}

function brInit(){var b=$("brk");if(!b)return;if(window.speechSynthesis)speechSynthesis.getVoices();b.textContent="";b.appendChild(el("h2",null,"☕ ব্রেক টাইমার"));
  var t=el("div","clk","05:00");t.id="bt";t.style.cssText="font-size:34px;text-align:center";b.appendChild(t);
  var r=el("div","row");r.style.justifyContent="center";
  var mi=el("input");mi.type="text";mi.setAttribute("inputmode","numeric");mi.maxLength=20;mi.placeholder="Break for ....";mi.style.cssText="width:150px;flex:none";mi.setAttribute("aria-label","Break for");
  function applyBreak(){var v=mi.value.trim();if(!v)return true;mi.value="";var n=parseInt(v.replace(/[০-৯]/g,function(d){return "০১২৩৪৫৬৭৮৯".indexOf(d)}).replace(/[^0-9]/g,""),10);
    if(!n||n<1){toast("মিনিট লেখো (যেমন 10)");return false}if(BR.run){toast("ব্রেক চলছে, শেষ হলে সময় বদলাও");return false}
    BR.m=Math.max(1,Math.min(120,n));BR.rem=BR.m*60;brTick();toast("ব্রেক "+bn(BR.m)+" মিনিট সেট হয়েছে");return true}
  mi.onkeydown=function(e){if(e.key==="Enter"){e.preventDefault();applyBreak()}};r.appendChild(mi);
  function B(l,f,c){var x=el("button","btn"+c,l);x.type="button";x.onclick=f;r.appendChild(x);return x}
  B("শুরু",function(){if(BR.run)return;if(!applyBreak())return;if(BR.rem<=0)BR.rem=BR.m*60;BR.end=NOW()+BR.rem*1000;BR.run=true;BR_NOTIFIED_END=0;unlockAudio();requestStudyNotifPerm();put(me,function(q){q.brk={e:BR.end,m:BR.m};if(q.study&&active(q.study)&&!q.study.ps)q.study.ps=NOW()})},"");
  B("পজ",function(){if(BR.run){BR.rem=Math.max(0,Math.round((BR.end-NOW())/1000));BR.run=false;clrBrk()}brTick()}," alt");
  B("রিসেট",function(){var w=BR.run;BR.run=false;BR.rem=BR.m*60;if(w)clrBrk();brTick()}," ghost");
  var sn=B("🔔 সাউন্ড চালু",function(){BR.snd=!BR.snd;sn.textContent=BR.snd?"🔔 সাউন্ড চালু":"🔕 সাউন্ড বন্ধ"}," ghost");B("🔊 টেস্ট",function(){beep();setTimeout(speakBreak,900)}," ghost");b.appendChild(r)}

function brTick(){
  var t=$("bt");
  if(BR.run){
    var diffMs=BR.end-NOW();
    BR.rem=Math.max(0,Math.round(diffMs/1000));
    if(diffMs<=0){
      BR.run=false;
      BR.rem=0;
      if(BR_NOTIFIED_END!==BR.end){
        BR_NOTIFIED_END=BR.end;
        var elapsedPastEnd=Math.max(0,NOW()-BR.end);
        RW=NOW()+Math.max(500,8500-elapsedPastEnd);
        if(BR.snd){beep();setTimeout(speakBreak,900)}
        toast("☕ বিরতি শেষ! আবার পড়তে বসো।",8000);
        notifyBgCompletion("☕ বিরতির সময় শেষ!","এবার আবার নিজের টেবিলে গিয়ে পড়া শুরু করো।");
        put(me,function(q){q.brk=null});
        var resumeDelay=Math.max(0,8000-elapsedPastEnd);
        setTimeout(function(){put(me,function(q){resumeStudy(q,NOW())})},resumeDelay);
      }
    }
  }
  if(t)t.textContent=fmtClock(BR.rem*1000);
}

function syncAllTimersNow(){
  brTick();examTick();
  document.querySelectorAll(".bd[data-own]").forEach(function(c){var pb=pl(c.dataset.own).brk,rem=pb&&pb.e>NOW()?pb.e-NOW():0;c.textContent=fmtClock(rem);var rp=$("brp");if(rp)rp.style.strokeDashoffset=CR*(1-rem/Number(c.dataset.tot))});
  document.querySelectorAll(".cd[data-own]").forEach(function(c){var sx=pl(c.dataset.own).study;if(!sx)return;var rem=sRem(sx);c.textContent=fmtClock(rem);var rp=c.dataset.ring&&$("rp");if(rp)rp.style.strokeDashoffset=CR*(1-Math.max(0,rem)/Number(c.dataset.tot))});
  var st=me&&!MON&&!getRoomLockState()&&pl(me).study;if(st&&st.t&&!st.ps&&sRem(st)<=0)finish(true);
  if(!MON&&!getRoomLockState())brkSync();
}

document.addEventListener("visibilitychange",function(){if(!document.hidden)syncAllTimersNow();});
window.addEventListener("focus",syncAllTimersNow);
window.addEventListener("pageshow",syncAllTimersNow);

// প্রতি ১ সেকেন্ডে টাইমারের মসৃণ গণনা
setInterval(function(){
  syncAllTimersNow();
  sumBtn();if(++BT%15===0){board();wboard()}
  if(BT%5===0)syncRoomLockUI();
},1000);

// অ্যাডমিন অ্যালার্ট ও ১-দিনের নোটিফিকেশন ব্যবস্থাপনা
var ONE_DAY_MS = 86400000;
var alertCleanups = [];
var ACTIVE_NOTICES = [];
var noticeChannelData = { notices: {}, global: null, room: null, user: null };

function getNotifStorageKey(prefix){
  return prefix + "_" + (CODE || "room") + "_" + (MON ? "mon" : (me || "user"));
}
function loadNotifMap(prefix){
  try { return JSON.parse(localStorage.getItem(getNotifStorageKey(prefix)) || "{}") || {}; } catch(e){ return {}; }
}
function saveNotifMap(prefix, mapObj){
  try {
    var now = Date.now();
    var cleaned = {};
    Object.keys(mapObj).forEach(function(k){
      if(now - Number(mapObj[k] || 0) < ONE_DAY_MS * 2) cleaned[k] = mapObj[k];
    });
    localStorage.setItem(getNotifStorageKey(prefix), JSON.stringify(cleaned));
  } catch(e){}
}
function fmtRemain24h(ts){
  var rem = Math.max(0, (Number(ts) + ONE_DAY_MS) - Date.now());
  var hrs = Math.floor(rem / 3600000);
  var mins = Math.floor((rem % 3600000) / 60000);
  if(hrs > 0) return bn(hrs) + " ঘণ্টা " + bn(mins) + " মিনিট পর মুছে যাবে";
  return bn(Math.max(1, mins)) + " মিনিট পর মুছে যাবে";
}
function updateNotifBadgeUI(){
  var btn = $("notifBtn"), badge = $("notifBadge");
  if(!btn || !badge) return;
  var readMap = loadNotifMap("sr_read_notifs");
  var unread = ACTIVE_NOTICES.filter(function(n){ return !readMap[n.key]; }).length;
  if(unread > 0){
    badge.textContent = bn(unread);
    badge.hidden = false;
    btn.classList.add("has-unread");
  } else {
    badge.hidden = true;
    btn.classList.remove("has-unread");
  }
}
function openNotificationsModal(openFeedbackDirect){
  var m = $("modal"), b = $("mbox");
  if(!m || !b) return;
  pruneAndProcessNotices(false);
  if(typeof fetchAdminAlertsREST === "function"){
    fetchAdminAlertsREST(false);
  }
  var readMap = loadNotifMap("sr_read_notifs");
  var seenMap = loadNotifMap("sr_seen_alert_popups");
  var now = Date.now();
  ACTIVE_NOTICES.forEach(function(n){
    readMap[n.key] = now;
    if(!seenMap[n.key]) seenMap[n.key] = now;
  });
  saveNotifMap("sr_read_notifs", readMap);
  saveNotifMap("sr_seen_alert_popups", seenMap);
  updateNotifBadgeUI();

  b.dataset.lb = "0";
  b.textContent = "";
  b.style.maxWidth = "520px";
  m.hidden = false;
  m.removeAttribute("hidden");
  m.style.setProperty("display", "grid", "important");

  var head = el("div", "sw");
  head.style.cssText = "display:flex;justify-content:space-between;align-items:center;gap:10px";
  head.appendChild(el("h2", null, "🔔 নোটিফিকেশন (" + bn(ACTIVE_NOTICES.length) + ")"));
  var cl = el("button", "btn ghost", "✕");
  cl.type = "button";
  cl.setAttribute("aria-label", "বন্ধ করো");
  cl.onclick = function(){ m.hidden = true; m.setAttribute("hidden", ""); m.style.setProperty("display", "none", "important"); };
  head.appendChild(cl);
  b.appendChild(head);

  var info = el("p", "mute", "অ্যাডমিনের পাঠানো বার্তাগুলো এখানে ১ দিন (২৪ ঘণ্টা) পর্যন্ত সংরক্ষিত থাকে এবং ২৪ ঘণ্টা পর স্বয়ংক্রিয়ভাবে মুছে যায়।");
  info.style.cssText = "font-size:13px;margin:4px 0 0";
  b.appendChild(info);

  if(!ACTIVE_NOTICES.length){
    var empty = el("p", "mute", "গত ২৪ ঘণ্টায় কোনো নতুন নোটিফিকেশন নেই।");
    empty.style.cssText = "text-align:center;padding:24px 8px";
    b.appendChild(empty);
  } else {
    var list = el("div", "notif-list");
    ACTIVE_NOTICES.forEach(function(n){
      var item = el("div", "notif-item");
      var ih = el("div", "notif-item-head");
      ih.appendChild(el("span", "notif-item-sender", "অ্যাডমিন নোটিশ" + (n.updatedAt ? " (সম্পাদিত)" : "")));
      ih.appendChild(el("span", null, new Date(n.time).toLocaleString("bn-BD", { day:"numeric", month:"short", hour:"numeric", minute:"2-digit" })));
      item.appendChild(ih);

      item.appendChild(el("div", "notif-item-body", n.text));

      var ft = el("div", "notif-item-foot");
      ft.appendChild(el("span", null, n.scopeLabel || "নোটিশ"));
      ft.appendChild(el("span", null, fmtRemain24h(n.time)));
      item.appendChild(ft);
      list.appendChild(item);
    });
    b.appendChild(list);
  }

  // বটম ফুটার + 💬 Feedback বাটন ও ইনলাইন কম্পোজার
  var footer = el("div", "notif-modal-footer");
  var fbStatusNote = el("small", "mute", "অ্যাডমিনের কাছে কোনো মতামত বা সমস্যা জানাতে চান?");
  var fbToggleBtn = el("button", "btn notif-fb-toggle-btn", "💬 Feedback");
  fbToggleBtn.id = "btnNotifFeedbackToggle";
  fbToggleBtn.type = "button";
  footer.appendChild(fbStatusNote);
  footer.appendChild(fbToggleBtn);
  b.appendChild(footer);

  var fbBox = el("div", "notif-fb-box");
  fbBox.id = "notifFeedbackBox";
  fbBox.hidden = true;

  fbBox.appendChild(el("div", "notif-fb-title", "অ্যাডমিনকে ফিডব্যাক লিখুন"));
  var fbArea = el("textarea", "notif-fb-textarea");
  fbArea.id = "notifFeedbackText";
  fbArea.rows = 3;
  fbArea.maxLength = 1000;
  fbArea.placeholder = "আপনার মতামত, পরামর্শ বা কোনো সমস্যার কথা লিখুন...";
  fbBox.appendChild(fbArea);

  var fbMsg = el("div", "notif-fb-msg");
  fbMsg.id = "notifFeedbackMsg";
  fbBox.appendChild(fbMsg);

  var fbActRow = el("div", "row");
  fbActRow.style.cssText = "margin-top:8px;justify-content:flex-end";
  var fbCancelBtn = el("button", "btn ghost", "বাতিল");
  fbCancelBtn.type = "button";
  fbCancelBtn.onclick = function(){
    fbBox.hidden = true;
    fbMsg.textContent = "";
    fbMsg.className = "notif-fb-msg";
  };

  var fbSendBtn = el("button", "btn", "ফিডব্যাক পাঠাও");
  fbSendBtn.type = "button";
  fbSendBtn.onclick = function(){
    var txt = (fbArea.value || "").trim();
    if(!txt){
      fbMsg.className = "notif-fb-msg";
      fbMsg.textContent = "আগে আপনার ফিডব্যাক লিখুন!";
      fbArea.focus();
      return;
    }
    var dbx = window.db || (window.firebase && firebase.apps.length ? firebase.database() : null);
    if(!dbx){
      fbMsg.className = "notif-fb-msg";
      fbMsg.textContent = "সংযোগ পাওয়া যাচ্ছে না। অনুগ্রহ করে আপনার ইন্টারনেট সংযোগ পরীক্ষা করে পেজ রিফ্রেশ দিন।";
      return;
    }
    fbSendBtn.disabled = true;
    fbSendBtn.textContent = "পাঠানো হচ্ছে...";
    fbMsg.className = "notif-fb-msg";
    fbMsg.textContent = "";

    var curProf = (!MON && me) ? pl(me) : {};
    var lsName = "";
    var lsUid = "";
    try {
      lsName = localStorage.getItem("sr-name") || "";
      lsUid = localStorage.getItem("sr_uid") || "";
    } catch(e){}
    var senderName = MON ? "মনিটর" : (nm(me) || lsName || "ব্যবহারকারী");
    var senderUid = (curProf && curProf.uid) || lsUid || (MON ? "monitor" : (me || "guest"));
    var roomLabel = (P.meta && P.meta.name) || (CODE === "1432014310" ? "Queen Room" : (CODE || "স্টাডি রুম"));

    var fbId = "fb_" + Date.now().toString(36) + Math.floor(Math.random()*1e3);
    var payload = {
      id: fbId,
      text: txt.slice(0, 1000),
      roomId: CODE || "",
      roomName: String(roomLabel).slice(0, 60),
      userId: MON ? "mon" : (me || ""),
      userName: String(senderName).slice(0, 60),
      userUid: String(senderUid).slice(0, 40),
      time: Date.now(),
      status: "unread"
    };

    var writePromise = window.FB_REST
      ? window.FB_REST.set("admin_alerts/feedbacks/" + fbId, payload)
      : (window.ensureAuth ? window.ensureAuth() : Promise.resolve())
          .catch(function(){})
          .then(function(){
            return dbx.ref("admin_alerts/feedbacks/" + fbId).set(payload);
          });

    writePromise
      .then(function(){
        fbSendBtn.disabled = false;
        fbSendBtn.textContent = "📤 ফিডব্যাক পাঠাও";
        fbArea.value = "";
        fbMsg.className = "notif-fb-msg ok";
        fbMsg.textContent = "✓ ফিডব্যাক সফলভাবে অ্যাডমিনের কাছে জমা হয়েছে!";
        toast("আপনার ফিডব্যাক অ্যাডমিনের কাছে পাঠানো হয়েছে ✓", 4000);
        setTimeout(function(){
          if(fbBox && !fbBox.hidden && !fbArea.value.trim()){
            fbBox.hidden = true;
          }
        }, 1800);
      })
      .catch(function(){
        fbSendBtn.disabled = false;
        fbSendBtn.textContent = "📤 ফিডব্যাক পাঠাও";
        fbMsg.className = "notif-fb-msg";
        fbMsg.textContent = "পাঠানো যায়নি, ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।";
      });
  };

  fbActRow.appendChild(fbCancelBtn);
  fbActRow.appendChild(fbSendBtn);
  fbBox.appendChild(fbActRow);
  b.appendChild(fbBox);

  fbToggleBtn.onclick = function(){
    fbBox.hidden = !fbBox.hidden;
    if(!fbBox.hidden){
      fbMsg.textContent = "";
      fbMsg.className = "notif-fb-msg";
      setTimeout(function(){
        fbArea.focus();
        try { fbBox.scrollIntoView({ behavior: "smooth", block: "nearest" }); } catch(e){}
      }, 30);
    }
  };

  if(openFeedbackDirect === true){
    fbBox.hidden = false;
    setTimeout(function(){
      fbArea.focus();
      try { fbBox.scrollIntoView({ behavior: "smooth", block: "nearest" }); } catch(e){}
    }, 50);
  }
}
var notifBtnEl = $("notifBtn");
if(notifBtnEl){
  notifBtnEl.onclick = function(){ openNotificationsModal(false); };
}

function pruneAndProcessNotices(triggerPopupForNew){
  var REST = window.FB_REST;
  var now = Date.now();
  var mapById = {};

  function addCandidate(raw, scopeLabel, legacyPath){
    if(!raw || !raw.time || !raw.text) return;
    if(now - Number(raw.time) >= ONE_DAY_MS){
      if(REST && legacyPath){
        REST.remove(legacyPath).catch(function(){});
      }
      return;
    }
    var idKey = raw.id || (legacyPath + "_" + raw.time);
    mapById[idKey] = {
      key: idKey,
      id: raw.id || "",
      text: String(raw.text),
      time: Number(raw.time),
      updatedAt: raw.updatedAt || null,
      scopeLabel: scopeLabel
    };
  }

  var noticesObj = noticeChannelData.notices || {};
  Object.keys(noticesObj).forEach(function(nk){
    var item = noticesObj[nk];
    if(!item || typeof item !== "object" || !item.time || !item.text) return;
    if(now - Number(item.time) >= ONE_DAY_MS){
      if(REST) REST.remove("admin_alerts/notices/" + nk).catch(function(){});
      return;
    }
    var matches = false;
    var scopeLbl = "সবার জন্য";
    if(item.targetType === "all"){
      matches = true;
      scopeLbl = "সবার জন্য";
    } else if(item.targetType === "room" && item.roomId === CODE){
      matches = true;
      scopeLbl = "এই রুমের জন্য";
    } else if(item.targetType === "user" && item.roomId === CODE && !MON && item.userId === me){
      matches = true;
      scopeLbl = "ব্যক্তিগত নোটিশ";
    }
    if(matches){
      var idKey = item.id || nk;
      mapById[idKey] = {
        key: idKey,
        id: idKey,
        text: String(item.text),
        time: Number(item.time),
        updatedAt: item.updatedAt || null,
        scopeLabel: scopeLbl
      };
    }
  });

  if(noticeChannelData.global) addCandidate(noticeChannelData.global, "সবার জন্য", "admin_alerts/global");
  if(noticeChannelData.room && CODE) addCandidate(noticeChannelData.room, "এই রুমের জন্য", "admin_alerts/" + CODE + "/all");
  if(noticeChannelData.user && CODE && me && !MON) addCandidate(noticeChannelData.user, "ব্যক্তিগত নোটিশ", "admin_alerts/" + CODE + "/" + me);

  ACTIVE_NOTICES = Object.keys(mapById).map(function(k){ return mapById[k]; }).sort(function(a, b){ return b.time - a.time; });
  updateNotifBadgeUI();

  if(triggerPopupForNew && ACTIVE_NOTICES.length){
    var seenMap = loadNotifMap("sr_seen_alert_popups");
    var unseen = ACTIVE_NOTICES.filter(function(n){ return !seenMap[n.key]; });
    if(unseen.length){
      unseen.forEach(function(n){ seenMap[n.key] = now; });
      saveNotifMap("sr_seen_alert_popups", seenMap);
      toast("📢 " + unseen[0].text, 15000);
    }
  }
}

function fetchAdminAlertsREST(triggerPopup){
  if(!CODE || !window.FB_REST) return Promise.resolve();
  var reqs = [
    window.FB_REST.get("admin_alerts/notices").catch(function(){ return {}; }),
    window.FB_REST.get("admin_alerts/global").catch(function(){ return null; }),
    window.FB_REST.get("admin_alerts/" + CODE + "/all").catch(function(){ return null; }),
    (me && !MON) ? window.FB_REST.get("admin_alerts/" + CODE + "/" + me).catch(function(){ return null; }) : Promise.resolve(null)
  ];
  return Promise.all(reqs).then(function(vals){
    noticeChannelData.notices = vals[0] || {};
    noticeChannelData.global = vals[1] || null;
    noticeChannelData.room = vals[2] || null;
    noticeChannelData.user = vals[3] || null;
    pruneAndProcessNotices(triggerPopup !== false);
  }).catch(function(){});
}

function bindAdminAlerts(){
  alertCleanups.forEach(function(fn){ try{ fn(); }catch(e){} });
  alertCleanups = [];
  noticeChannelData = { notices: {}, global: null, room: null, user: null };
  ACTIVE_NOTICES = [];
  updateNotifBadgeUI();
  if(!CODE || !window.FB_REST) return;
  fetchAdminAlertsREST(true);
}

setInterval(function(){
  if(document.visibilityState === "visible" && !window.__srExamPortalOpen){
    fetchAdminAlertsREST(true);
  } else {
    pruneAndProcessNotices(false);
  }
}, 120000);

// ইনিশিয়ালাইজেশন
brInit();
qInit();
render();

if(CODE) {
  connect();
  bindAdminAlerts();

  function updateQuotesFromData(remote){
    if(remote && typeof remote === "object"){
      ["Medical","Engineering","Varsity","BCS Cadre","Bank Job","Govt. Job","BCS","Other"].forEach(function(cat){
        if(remote[cat]){
          var list = Array.isArray(remote[cat]) ? remote[cat] : Object.values(remote[cat]);
          if(list && list.length){
            MOT[cat] = list.filter(function(q){ return typeof q === "string" && q.trim(); });
          }
        }
      });
      QB = {};
      var qtEl = $("qt");
      if(qtEl) setQ(qtEl);
    }
  }
  if(window.FB_REST){
    window.FB_REST.get("motivational_quotes").then(updateQuotesFromData).catch(function(){});
    window.FB_REST.get("quotes").then(updateQuotesFromData).catch(function(){});
  }
}

})();