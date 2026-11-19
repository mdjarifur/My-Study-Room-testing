// public/js/entry.js - ১০০% নির্ভুল রুম তৈরি ও সেভ ইঞ্জিন
(function(){
  function LS(k,v){
    try{
      if(v===undefined) return localStorage.getItem(k);
      if(v===null) localStorage.removeItem(k);
      else localStorage.setItem(k,v);
    }catch(e){}
    return null;
  }

  function escHtml(s){
    return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
  }

  var APP_DEFAULT_LOGO = "img/login_logo.png";

  function extractEntryBaseClass(raw){
    var s = String(raw || "").toLowerCase();
    if(s.indexOf("bcs") > -1 || s.indexOf("job") > -1 || s.indexOf("graduate") > -1 || s.indexOf("bachelor") > -1 || s.indexOf("honours") > -1 || s.indexOf("hons") > -1 || s.indexOf("masters") > -1 || s.indexOf("degree") > -1 || s.indexOf("বিসিএস") > -1 || s.indexOf("চাকরি") > -1 || s.indexOf("চাকুরী") > -1 || s.indexOf("অনার্স") > -1 || s.indexOf("স্নাতক") > -1 || s.indexOf("মাস্টার্স") > -1) return "BCS";
    if(s.indexOf("ssc") > -1) return "SSC";
    if(s.indexOf("admission") > -1) return "Admission";
    if(s.indexOf("hsc") > -1) return "HSC";
    return "";
  }

  function launchApp(){
    if(window.__SR_APP_LAUNCHED__) return;
    window.__SR_APP_LAUNCHED__ = true;
    var s = document.createElement("script");
    s.src = "js/app.js?v=98.0";
    document.body.appendChild(s);
  }

  // রুম কোড থাকলে সরাসরি অ্যাপ চালু
  if(LS("sr-code") && LS("sr-me")){
    launchApp();
    return;
  }

  // এন্ট্রি গেটে ব্যাকগ্রাউন্ড সকেট বন্ধ রাখা (Spark কানেকশন বাঁচাতে)
  if(window.goOfflineDB) window.goOfflineDB();
  var REST = window.FB_REST;
  var DB = window.db || firebase.database();

  var gate = document.createElement("div");
  gate.className = "modal";
  gate.style.cssText = "z-index:50;background:var(--bg);overflow-y:auto";
  var gateWrap = document.createElement("div");
  gateWrap.style.cssText = "width:100%;max-width:440px;display:flex;flex-direction:column;align-items:center;gap:14px";
  var box = document.createElement("div");
  box.className = "mbox";
  box.style.maxWidth = "440px";
  var entryFooter = document.createElement("div");
  entryFooter.id = "sr_entry_footer";
  entryFooter.style.cssText = "text-align:center;font-size:13.5px;font-weight:500;color:var(--mute);line-height:1.55;padding:0 10px;white-space:normal;word-break:break-word";
  var DEFAULT_ENTRY_FOOTER = "Created by MD Jarifur Rahman";

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

  function applyEntryFooter(val){
    if(val === null || val === undefined){
      entryFooter.style.display = "block";
      entryFooter.textContent = DEFAULT_ENTRY_FOOTER;
      return;
    }
    var sanitized = sanitizeFooterHtml(val);
    if(!sanitized){
      entryFooter.style.display = "none";
      entryFooter.innerHTML = "";
    } else {
      entryFooter.style.display = "block";
      entryFooter.innerHTML = sanitized;
    }
  }
  applyEntryFooter(LS("sr_entry_footer_text"));
  try {
    if(REST){
      REST.get("admin_config/entry_footer_text").then(function(v){
        if(v !== null && v !== undefined){
          var s = String(v);
          LS("sr_entry_footer_text", s);
          applyEntryFooter(s);
        } else {
          LS("sr_entry_footer_text", null);
          applyEntryFooter(DEFAULT_ENTRY_FOOTER);
        }
      }).catch(function(){});
    }
  } catch(e){}
  var entryLegalFooter = document.createElement("div");
  entryLegalFooter.id = "sr_entry_legal_footer";
  entryLegalFooter.style.cssText = "text-align:center;font-size:11px;line-height:1.55;color:var(--mute);opacity:0.88;padding:2px 10px 14px;max-width:440px";
  entryLegalFooter.innerHTML = '<div style="font-weight:600;margin-bottom:5px">© 2026 আমার অধ্যয়ন কক্ষ (My Study Room) | Powered by Robo Creators. All Rights Reserved.</div>' +
    '<div><strong>Disclaimer:</strong> এই অ্যাপে ব্যবহৃত সকল প্রশ্ন, পাঠ্যবইয়ের তথ্য এবং স্টাডি ম্যাটেরিয়াল শুধুমাত্র শিক্ষার্থীদের শিক্ষামূলক অনুশীলন ও পরীক্ষার প্রস্তুতির (Educational &amp; Non-Commercial Fair Use) উদ্দেশ্যে সংকলিত। সংশ্লিষ্ট সকল মূল বই ও প্রশ্নব্যাংকের কপিরাইট স্বত্বাধিকারীদের প্রতি পূর্ণ সম্মান প্রদর্শন করা হচ্ছে। কোনো কপিরাইট সংক্রান্ত অভিযোগ থাকলে আমাদের সাথে যোগাযোগ করুন।</div>';
  gateWrap.appendChild(box);
  gateWrap.appendChild(entryFooter);
  gateWrap.appendChild(entryLegalFooter);
  gate.appendChild(gateWrap);
  document.body.appendChild(gate);

  function clean(v){
    v = String(v||"").trim().replace(/[.$#\[\]\/]/g,"_");
    return v.length>=4 && v.length<=40 ? v : "";
  }
  function normMob(v){
    v = String(v||"").replace(/[০-৯]/g,function(d){ return "০১২৩৪৫৬৭৮৯".indexOf(d); }).replace(/[^0-9]/g,"");
    if(v.startsWith("880")) v = v.slice(2);
    else if(v.startsWith("88")) v = v.slice(2);
    return /^01[3-9][0-9]{8}$/.test(v) ? v : "";
  }
  function rid(){
    return "m" + Date.now().toString(36) + Math.floor(Math.random()*1e4).toString(36);
  }
  function withTimeout(p, ms){
    return new Promise(function(resolve, reject){
      var done = false;
      var t = setTimeout(function(){
        if(!done){ done = true; reject(new Error("ইন্টারনেট সংযোগ ধীর বা বিচ্ছিন্ন। অনুগ্রহ করে সংযোগ ঠিক করে আবার চেষ্টা করুন।")); }
      }, ms || 5000);
      Promise.resolve(p).then(function(v){
        if(!done){ done = true; clearTimeout(t); resolve(v); }
      }, function(e){
        if(!done){ done = true; clearTimeout(t); reject(e); }
      });
    });
  }

  // ১. মূল এন্ট্রি স্ক্রিন
  function showEntryScreen(msg){
    box.innerHTML = `
      <div style="text-align:center">
        <img src="${APP_DEFAULT_LOGO}" class="logo" loading="lazy" decoding="async" style="margin:0 auto 10px;display:block;object-fit:cover" alt="Logo">
        <h1 style="font-size:24px;margin-bottom:6px">আমার অধ্যয়ন কক্ষ</h1>
        <p class="mute" style="margin-top:0">রুমের পাসকোড দিয়ে প্রবেশ করো</p>
        <input type="text" id="sr_passcode_input" placeholder="গোপন পাসকোড লেখো" style="width:100%;padding:12px 14px;border-radius:14px;border:1.5px solid var(--line);font:inherit;outline:none" autocomplete="off" />
        <div id="sr_err" style="color:var(--danger);margin-top:8px;font-size:14px;min-height:1.2em">${escHtml(msg||"")}</div>
        <div class="row" style="margin-top:14px;display:flex;gap:10px">
          <button class="btn" id="btn_enter" style="flex:1;padding:12px;border-radius:12px">প্রবেশ করো</button>
          <button class="btn ghost" id="btn_create_room" style="flex:1;padding:12px;border-radius:12px">নতুন রুম তৈরি করো</button>
        </div>
        <div id="gate_pwa_install_wrap" style="margin-top:16px;padding-top:14px;border-top:1px dashed var(--line);text-align:center">
          <button type="button" id="btn_gate_install" class="btn" style="width:100%;padding:12px 14px;border-radius:12px;background:linear-gradient(135deg, #10b981 0%, #059669 100%);color:#ffffff;border:none;font-weight:700;font-size:14px;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 4px 14px rgba(16,185,129,0.35);cursor:pointer">
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            <span>ফোনে অ্যাপ ইনস্টল করুন</span>
          </button>
          <p class="mute" style="font-size:12px;margin:6px 0 0;color:var(--mute)">হোম স্ক্রিনে সেভ করুন, ব্রাউজার ফ্রেম ছাড়া স্বাধীন অ্যাপ হিসেবে চলবে</p>
        </div>
      </div>
    `;

    var inp = document.getElementById("sr_passcode_input");
    var btnEnter = document.getElementById("btn_enter");
    var btnCreate = document.getElementById("btn_create_room");
    var er = document.getElementById("sr_err");
    var btnGateInstall = document.getElementById("btn_gate_install");

    var isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    if(isStandalone) {
      var wrap = document.getElementById("gate_pwa_install_wrap");
      if(wrap) wrap.style.display = "none";
    } else if(btnGateInstall) {
      btnGateInstall.onclick = function(){
        if(window.triggerPWAInstall) window.triggerPWAInstall();
      };
    }

    btnCreate.onclick = function(){ showCreateRoomForm(); };

    function handleEnter(){
      var c = clean(inp.value);
      if(!c){ er.textContent = "সঠিক পাসকোড দাও (কমপক্ষে ৪ অক্ষর)।"; return; }
      er.textContent = "খোঁজা হচ্ছে...";
      btnEnter.disabled = true;

      // কুইন রুম (VIP রুম 1432014310)
      if(c === "1432014310"){
        showQueenRoomPicker(c);
        return;
      }

      withTimeout(REST.get("rooms_v2/"+c), 6000).then(function(rVal){
        btnEnter.disabled = false;
        if(rVal && typeof rVal === "object"){
          showMemberPicker(c, rVal);
        } else {
          return withTimeout(REST.get("rooms/"+c), 6000).then(function(r1){
            if(r1 && typeof r1 === "object"){
              var convertedMembers = {
                p1: { name: r1.n1 || "সাথী ১", cls: "HSC", goal: "মেডিকেল", uid: r1.p1Uid || "143201" },
                p2: { name: r1.n2 || "সাথী ২", cls: "HSC", goal: "মেডিকেল", uid: r1.p2Uid || "143202" }
              };
              var convertedData = {
                meta: { name: r1.name || "স্টাডি রুম", max: 2, status: "approved" },
                members: convertedMembers
              };
              showMemberPicker(c, convertedData);
            } else {
              var cachedStr = localStorage.getItem("sr_cached_room_" + c);
              if (cachedStr) {
                try {
                  var cObj = JSON.parse(cachedStr);
                  showMemberPicker(c, cObj);
                  return;
                } catch(e) {}
              }
              er.textContent = "এই পাসকোডে কোনো রুম নেই। 'নতুন রুম তৈরি করো' চাপো।";
            }
          });
        }
      }).catch(function(err){
        btnEnter.disabled = false;
        var cachedStr = localStorage.getItem("sr_cached_room_" + c);
        if (cachedStr) {
          try {
            var cObj = JSON.parse(cachedStr);
            showMemberPicker(c, cObj);
            return;
          } catch(e) {}
        }
        er.textContent = "সংযোগ সমস্যা: " + err.message;
      });
    }

    btnEnter.onclick = handleEnter;
    inp.onkeydown = function(e){ if(e.key === "Enter") handleEnter(); };
  }

  function getScopedUidKey(roomCode, mid){
    if(mid === "p1" || mid === "p2") return "sr_uid_vip_" + mid;
    return "sr_uid_" + String(roomCode || "room") + "_" + String(mid || "guest");
  }
  function saveScopedUid(roomCode, mid, uidVal){
    if(!uidVal || !/^\d{5,6}$/.test(String(uidVal))) return;
    var u = String(uidVal);
    LS("sr_uid", u);
    if(mid) LS(getScopedUidKey(roomCode, mid), u);
  }
  function genFreshNumericUid(){
    return String(Math.floor(10000 + Math.random() * 90000));
  }
  function ensureUniqueFreshUid(candidate){
    var u = /^\d{5,6}$/.test(String(candidate || "")) ? String(candidate) : genFreshNumericUid();
    if(!REST || !REST.get) return Promise.resolve(u);
    return withTimeout(REST.get("numeric_uids/" + u), 2500).then(function(existing){
      if(existing && typeof existing === "object" && (existing.memberId || existing.roomId)){
        return genFreshNumericUid();
      }
      return u;
    }).catch(function(){ return u; });
  }
  function pickEntryVipUid(prof, slot){
    var cand = (prof && prof.uid && /^\d{5,6}$/.test(String(prof.uid)))
      ? String(prof.uid)
      : LS(getScopedUidKey("1432014310", slot));
    if(cand && /^\d{5,6}$/.test(String(cand))) return String(cand);
    // Preserve legacy single-browser sr_uid if no numeric conflict exists on same browser for p2/p1
    var legacy = LS("sr_uid");
    if(legacy && /^\d{5,6}$/.test(String(legacy)) && (!LS("sr-me") || LS("sr-me") === slot)){
      return String(legacy);
    }
    return genFreshNumericUid();
  }

  // ৪ ডিজিটের পার্সোনাল পিন যাচাই বা সেট
  function promptPersonalPin(c, mid, memName, onSuccess, onCancel){
    function renderPinUI(storedPin){
      if(storedPin){
        // Existing PIN - Verify
        box.innerHTML = `
          <div style="text-align:center">
            <h2 style="font-size:20px;margin-bottom:4px">ব্যক্তিগত পিন দিন</h2>
            <p class="mute" style="margin-top:0;font-size:14px">হ্যালো <strong>${escHtml(memName)}</strong>! রুমে প্রবেশের জন্য তোমার ৪ ডিজিটের PIN দাও:</p>
            <input type="password" id="pin_val_inp" maxlength="4" placeholder="••••" style="text-align:center;font-size:26px;letter-spacing:10px;width:160px;padding:10px 14px;border-radius:12px;border:1.5px solid var(--line);outline:none;font-weight:700;margin:12px auto;display:block" oninput="this.value=this.value.replace(/[^0-9]/g,'').slice(0,4)" />
            <div id="pin_err" style="color:var(--danger);font-size:14px;margin-top:6px;min-height:1.2em"></div>
            <div class="row" style="margin-top:16px;display:flex;gap:10px">
              <button class="btn" id="btn_pin_submit" style="flex:1;padding:12px;border-radius:12px">প্রবেশ করো</button>
              <button class="btn ghost" id="btn_pin_back" style="flex:1;padding:12px;border-radius:12px">পিছনে</button>
            </div>
          </div>
        `;

        var inp = document.getElementById("pin_val_inp");
        var btnSub = document.getElementById("btn_pin_submit");
        var er = document.getElementById("pin_err");
        setTimeout(function(){ inp.focus(); }, 50);

        function checkPin(){
          var val = inp.value.trim();
          if(val === String(storedPin)){
            LS("sr_pin_" + mid, String(storedPin));
            onSuccess();
          } else {
            er.textContent = "ভুল পিন! আবার চেষ্টা করো।";
            inp.value = "";
            inp.focus();
          }
        }

        btnSub.onclick = checkPin;
        inp.onkeydown = function(e){ if(e.key === "Enter") checkPin(); };
        document.getElementById("btn_pin_back").onclick = onCancel;
      } else {
        // First Time - Set 4-digit PIN
        box.innerHTML = `
          <div style="text-align:center">
            <h2 style="font-size:20px;margin-bottom:4px">৪ ডিজিটের পিন সেট করুন</h2>
            <p class="mute" style="margin-top:0;font-size:14px">হ্যালো <strong>${escHtml(memName)}</strong>! পরবর্তীতে রুমে প্রবেশের জন্য ৪ ডিজিটের গোপন PIN সেট করো:</p>
            <input type="password" id="pin_new_inp" maxlength="4" placeholder="৪ ডিজিটের গোপন PIN" style="text-align:center;font-size:18px;letter-spacing:6px;width:100%;padding:10px 14px;border-radius:12px;border:1.5px solid var(--line);outline:none;margin-top:10px" oninput="this.value=this.value.replace(/[^0-9]/g,'').slice(0,4)" />
            <input type="password" id="pin_conf_inp" maxlength="4" placeholder="পিন পুনরায় নিশ্চিত করো" style="text-align:center;font-size:18px;letter-spacing:6px;width:100%;padding:10px 14px;border-radius:12px;border:1.5px solid var(--line);outline:none;margin-top:10px" oninput="this.value=this.value.replace(/[^0-9]/g,'').slice(0,4)" />
            <div id="pin_err" style="color:var(--danger);font-size:14px;margin-top:8px;min-height:1.2em"></div>
            <div class="row" style="margin-top:16px;display:flex;gap:10px">
              <button class="btn" id="btn_pin_save" style="flex:1;padding:12px;border-radius:12px">পিন সেভ করে প্রবেশ করো</button>
              <button class="btn ghost" id="btn_pin_back" style="flex:1;padding:12px;border-radius:12px">পিছনে</button>
            </div>
          </div>
        `;

        var pNew = document.getElementById("pin_new_inp");
        var pConf = document.getElementById("pin_conf_inp");
        var btnSav = document.getElementById("btn_pin_save");
        var er2 = document.getElementById("pin_err");
        setTimeout(function(){ pNew.focus(); }, 50);

        btnSav.onclick = function(){
          var v1 = pNew.value.trim();
          var v2 = pConf.value.trim();
          if(v1.length !== 4){
            er2.textContent = "পিন ঠিক ৪ ডিজিটের হতে হবে।";
            return;
          }
          if(v1 !== v2){
            er2.textContent = "দুটো পিন মেলেনি, আবার লিখুন।";
            return;
          }

          LS("sr_pin_" + mid, v1);
          REST.set("user_pins/" + mid, { pin: v1, updatedAt: Date.now() }).catch(function(){});
          REST.set("rooms_v2/" + c + "/members/" + mid + "/pin", v1).catch(function(){});
          onSuccess();
        };

        document.getElementById("btn_pin_back").onclick = onCancel;
      }
    }

    withTimeout(REST.get("user_pins/" + mid), 4000).then(function(pinData){
      var storedPin = (pinData && pinData.pin) || LS("sr_pin_" + mid);
      renderPinUI(storedPin);
    }).catch(function(err){
      var localPin = LS("sr_pin_" + mid);
      if(localPin){
        renderPinUI(localPin);
      } else {
        showEntryScreen("পিন যাচাই করা যায়নি। অনুগ্রহ করে আপনার ইন্টারনেট সংযোগ ঠিক করে আবার চেষ্টা করুন।");
      }
    });
  }

  // কুইন রুম (VIP 1432014310) মেম্বার পিকার
  function showQueenRoomPicker(c){
    function renderQueenUI(p1Obj, p2Obj){
      p1Obj = p1Obj || {};
      p2Obj = p2Obj || {};
      var name1 = p1Obj.name || LS("vip_p1_name") || "Tasfia Hasan";
      var name2 = p2Obj.name || LS("vip_p2_name") || "Rahman";
      box.innerHTML = `
        <div style="text-align:center">
          <img src="${APP_DEFAULT_LOGO}" class="logo" loading="lazy" decoding="async" style="margin:0 auto 10px;display:block;object-fit:cover" alt="Logo">
          <h2 style="font-size:20px;margin-bottom:4px">Queen Room (VIP)</h2>
          <p class="mute" style="margin-top:0;font-size:14px">তুমি কে? নিজের নামে চাপ দিয়ে প্রবেশ করো:</p>
          <div style="display:flex;flex-direction:column;gap:10px;margin:18px 0">
            <button class="btn btn-queen-pick" data-slot="p1" style="padding:13px 16px;border-radius:12px;font-size:16px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:8px">
              ${escHtml(name1)}
            </button>
            <button class="btn alt btn-queen-pick" data-slot="p2" style="padding:13px 16px;border-radius:12px;font-size:16px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:8px">
              ${escHtml(name2)}
            </button>
          </div>
          <button class="btn ghost" id="btn_queen_back" style="width:100%;margin-top:6px;border-radius:12px">পিছনে</button>
        </div>
      `;

      box.querySelectorAll(".btn-queen-pick").forEach(function(b){
        b.onclick = function(){
          var slot = b.getAttribute("data-slot");
          var prof = (slot === "p1") ? p1Obj : p2Obj;
          var curName = (slot === "p1") ? name1 : name2;
          promptPersonalPin(c, slot, curName, function(){
            var vipUid = pickEntryVipUid(prof, slot);
            var vipCls = extractEntryBaseClass(prof.classBase || prof.cls) || "HSC";
            LS("sr-code", c);
            LS("sr-me", slot);
            LS("sr-name", curName);
            LS("sr_room_name", "Queen Room");
            LS("sr_is_vip", "1");
            LS("sr_goal", prof.goal || "Medical");
            LS("sr_class", vipCls);
            saveScopedUid(c, slot, vipUid);
            Promise.all([
              REST.update("vip_users/" + slot, { uid: vipUid, name: curName }).catch(function(){}),
              REST.update("rooms/" + c + "/" + slot, { uid: vipUid, name: curName }).catch(function(){}),
              REST.update("numeric_uids/" + vipUid, { roomId: c, memberId: slot, name: curName, updatedAt: Date.now() }).catch(function(){})
            ]).then(function(){
              gate.remove();
              launchApp();
            });
          }, function(){
            showQueenRoomPicker(c);
          });
        };
      });

      document.getElementById("btn_queen_back").onclick = function(){
        showEntryScreen();
      };
    }

    withTimeout(REST.get("vip_users"), 3500).then(function(vData){
      vData = vData || {};
      renderQueenUI(vData.p1 || {}, vData.p2 || {});
    }).catch(function(){
      renderQueenUI({}, {});
    });
  }

  // ২. মেম্বার পিকার
  function showMemberPicker(c, rData, opts){
    opts = opts || {};
    var mems = rData.members || {};
    var meta = rData.meta || {};
    var ids = Object.keys(mems).filter(function(id){ return id !== "p1" && id !== "p2"; });
    var max = parseInt(meta.max, 10) || 8;
    var isFull = (ids.length >= max);

    var curExp = meta.expiresAt || meta.trialEnds || 0;
    var isOff = (meta.status === "suspended" || meta.status === "blocked");
    var isApprovedExp = (meta.status === "approved" && meta.expiresAt && Date.now() > meta.expiresAt);
    var isTrialExp = (meta.status !== "approved" && curExp && Date.now() > curExp);
    var isLockedRoom = isOff || isApprovedExp || isTrialExp;

    var dupBanner = opts.duplicateMob ? `
      <div style="background:var(--bs);border:1.5px solid var(--b);border-radius:12px;padding:10px 12px;margin:10px 0;font-size:13px;color:var(--ink);text-align:left;line-height:1.5">
        <b>${escHtml(opts.duplicateMob)}</b> নম্বর দিয়ে আগে থেকেই <b>${escHtml(meta.name || c)}</b> (পাসকোড: <b>${escHtml(c)}</b>) রুম খোলা আছে। তাই আপনাকে আপনার আগের রুমে নিয়ে আসা হয়েছে।
      </div>
    ` : "";

    var lockBanner = isLockedRoom ? `
      <div style="background:rgba(239,68,68,0.12);border:1.5px solid var(--danger);border-radius:12px;padding:10px 12px;margin:10px 0;font-size:13px;color:var(--danger);text-align:left;line-height:1.5">
        <b>${isOff ? "🚫 রুমটি সাময়িকভাবে বন্ধ আছে! ব্যবহারের জন্য অ্যাডমিনের অনুমতি প্রয়োজন।" : isApprovedExp ? "🚫 রুমের মেয়াদ শেষ! ব্যবহারের জন্য অ্যাডমিনের অনুমতি প্রয়োজন।" : "🚫 ৩ দিনের ফ্রি ট্রায়াল শেষ! ব্যবহারের জন্য অ্যাডমিনের অনুমতি প্রয়োজন।"}</b>
        <div style="color:var(--ink);font-weight:500;margin-top:4px">নিজের নামের প্রোফাইলে প্রবেশ করে নিচের Feedback অপশনে দিয়ে অ্যাডমিনের সাথে কথা বলুন।</div>
      </div>
    ` : "";

    var memButtons = ids.map(function(id){
      var m = mems[id] || {};
      var init = (m.name || "?").trim().charAt(0).toUpperCase();
      var sub = (m.cls ? m.cls : "") + (m.goal ? (m.cls ? " · " : "") + m.goal : "");
      var mExp = Number(m.expiresAt || 0);
      var mExpExpired = (mExp > 0 && Date.now() > mExp);
      var isHighlight = (opts.highlightMid && opts.highlightMid === id);
      var btnStyle = isHighlight
        ? "display:flex;align-items:center;justify-content:space-between;width:100%;margin-top:8px;padding:12px 14px;border-radius:12px;border:2px solid var(--a);box-shadow:0 0 0 2px var(--as);text-align:left;background:var(--card)"
        : "display:flex;align-items:center;justify-content:space-between;width:100%;margin-top:8px;padding:12px 14px;border-radius:12px;border:1.5px solid var(--line);text-align:left;background:var(--card)";
      return `
        <button class="btn ghost btn-pick" data-id="${escHtml(id)}" style="${btnStyle}">
          <div style="display:flex;align-items:center;gap:12px">
            <div style="width:36px;height:36px;border-radius:10px;background:var(--as);color:var(--a);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:16px">${escHtml(init)}</div>
            <div>
              <strong style="display:block;font-size:15px;color:var(--ink)">${escHtml(m.name || "সদস্য")}${isHighlight ? " (তোমার অ্যাকাউন্ট)" : ""}</strong>
              ${(sub || mExpExpired) ? `<small class="mute" style="font-size:12px">${escHtml(sub)}${mExpExpired ? `<span style="color:var(--danger);font-weight:600">${sub ? " · " : ""}মেয়াদ শেষ</span>` : ""}</small>` : ''}
            </div>
          </div>
          <span style="font-size:13px;color:var(--a);font-weight:600">প্রবেশ ›</span>
        </button>
      `;
    }).join("");

    box.innerHTML = `
      <div style="text-align:center">
        <h2 style="font-size:20px;margin-bottom:4px">${escHtml(meta.name || "স্টাডি রুম")}</h2>
        <p class="mute" style="margin-top:0;font-size:14px">
          ${isFull ? `রুমের সদস্য পূর্ণ (${ids.length}/${max} জন)` : `তুমি কে? নিজের প্রোফাইলে ক্লিক করো এবং ৪-ডিজিটের পিন দিয়ে লগইন করো:`}
        </p>

        ${dupBanner}
        ${lockBanner}

        <div style="max-height:220px;overflow-y:auto;margin:10px 0;padding-right:2px">
          ${ids.length > 0 ? memButtons : '<p class="mute" style="font-size:13px;padding:14px 0">এই রুমে এখনো কোনো সদস্য যোগ হয়নি।</p>'}
        </div>
        
        ${isLockedRoom ? "" : (!isFull ? `
          <button class="btn" id="btn_add_me" style="width:100%;margin-top:8px;padding:12px;background:var(--a);border-radius:12px">➕ Add Me (নতুন সদস্য যোগ দাও)</button>
        ` : `
          <div style="background:var(--bs);padding:10px;border-radius:12px;margin-top:8px">
            <small style="display:block;margin-bottom:6px;color:var(--ink)">সাধারণ সিট পূর্ণ। ভিউয়ার হিসেবে দেখতে পারো:</small>
            <button class="btn alt" id="btn_monitor_join" style="width:100%;padding:9px;border-radius:10px">মনিটর হিসেবে প্রবেশ করো</button>
          </div>
        `)}

        <div style="margin-top:12px;padding-top:10px;border-top:1px dashed var(--line)">
          <button type="button" class="btn ghost" id="btn_entry_vip_toggle" style="width:100%;font-size:13px;padding:9px;border-radius:10px">
            ভিআইপি হিসেবে প্রবেশ
          </button>
          <div id="entry_vip_pass_box" style="display:none;margin-top:8px;background:var(--as);padding:12px;border-radius:12px;text-align:left">
            <small style="display:block;font-weight:700;color:var(--a);margin-bottom:6px">VIP Passcode দিন:</small>
            <input type="password" id="entry_vip_pass_inp" placeholder="গোপন VIP পাসকোড লেখো" style="width:100%;padding:8px 12px;border-radius:10px;border:1.5px solid var(--line);font:inherit" />
            <div id="entry_vip_err" style="color:var(--danger);font-size:12px;margin-top:4px"></div>
            <button type="button" class="btn" id="btn_entry_vip_verify" style="width:100%;margin-top:8px;padding:8px;border-radius:8px">যাচাই করো</button>
          </div>
          <div id="entry_vip_unlock_box" style="display:none;margin-top:8px;background:var(--as);padding:12px;border-radius:12px">
            <small style="display:block;font-weight:700;color:var(--a);margin-bottom:8px;text-align:center">সফল! নিজের VIP প্রোফাইল বেছে নিন:</small>
            <div id="entry_vip_btn_group" style="display:flex;gap:8px"></div>
          </div>
        </div>
        
        <button class="btn ghost" id="btn_picker_back" style="width:100%;margin-top:10px;border-radius:12px">পিছনে</button>
      </div>
    `;

    box.querySelectorAll(".btn-pick").forEach(function(b){
      b.onclick = function(){
        var mid = b.getAttribute("data-id");
        var mObj = mems[mid] || {};
        var mNode = (rData && rData[mid] && typeof rData[mid] === "object") ? rData[mid] : {};
        var mName = mObj.name || mNode.name || "সদস্য";
        promptPersonalPin(c, mid, mName, function(){
          LS("sr-code", c);
          LS("sr-me", mid);
          LS("sr-name", mName);
          LS("sr_room_name", meta.name || (c === "1432014310" ? "Queen Room" : "অধ্যয়ন কক্ষ"));
          var knownUid = mObj.uid || mNode.uid || LS(getScopedUidKey(c, mid));
          var uidPromise = (knownUid && /^\d{5,6}$/.test(String(knownUid)))
            ? Promise.resolve(String(knownUid))
            : withTimeout(REST.get("user_profiles/" + mid), 2500).then(function(up){
                if(up && up.uid && /^\d{5,6}$/.test(String(up.uid))) return String(up.uid);
                return genFreshNumericUid();
              }).catch(function(){ return genFreshNumericUid(); });

          uidPromise.then(function(u){
            saveScopedUid(c, mid, u);
            REST.update("rooms_v2/" + c + "/members/" + mid, { uid: u }).catch(function(){});
            REST.update("rooms_v2/" + c + "/" + mid, { uid: u }).catch(function(){});
            REST.update("numeric_uids/" + u, { roomId: c, memberId: mid, name: mName, updatedAt: Date.now() }).catch(function(){});
            LS("sr_goal", mObj.goal || mNode.goal || "");
            var rawLoginCls = String(mObj.classBase || mObj.cls || mNode.classBase || mNode.cls || "");
            if(rawLoginCls){
              var cb = extractEntryBaseClass(rawLoginCls) || "HSC";
              LS("sr_class", cb);
            }
            gate.remove();
            launchApp();
          });
        }, function(){
          showMemberPicker(c, rData, opts);
        });
      };
    });

    if(document.getElementById("btn_add_me")){
      document.getElementById("btn_add_me").onclick = function(){
        showAddMeForm(c, rData);
      };
    }

    if(document.getElementById("btn_monitor_join")){
      document.getElementById("btn_monitor_join").onclick = function(){
        LS("sr-code", c);
        LS("sr-me", "mon");
        LS("sr_room_name", meta.name || (c === "1432014310" ? "Queen Room" : "অধ্যয়ন কক্ষ"));
        gate.remove();
        launchApp();
      };
    }

    var vipToggle = document.getElementById("btn_entry_vip_toggle");
    var vipPassBox = document.getElementById("entry_vip_pass_box");
    var vipVerifyBtn = document.getElementById("btn_entry_vip_verify");
    if(vipToggle && vipPassBox){
      vipToggle.onclick = function(){
        vipPassBox.style.display = (vipPassBox.style.display === "none") ? "block" : "none";
        if(vipPassBox.style.display === "block"){
          var vi = document.getElementById("entry_vip_pass_inp");
          if(vi) vi.focus();
        }
      };
    }
    if(vipVerifyBtn){
      vipVerifyBtn.onclick = function(){
        var vPass = (document.getElementById("entry_vip_pass_inp").value || "").trim();
        var vErr = document.getElementById("entry_vip_err");
        if(vPass !== "1432014310"){
          vErr.textContent = "ভুল ভিআইপি পাসকোড!";
          return;
        }
        vErr.textContent = "লোড হচ্ছে...";
        vipVerifyBtn.disabled = true;
        withTimeout(REST.get("vip_users"), 4000).then(function(vData){
          vData = vData || {};
          var n1 = (vData.p1 && vData.p1.name) || LS("vip_p1_name") || "Tasfia Hasan";
          var n2 = (vData.p2 && vData.p2.name) || LS("vip_p2_name") || "Rahman";
          vipPassBox.style.display = "none";
          vipToggle.style.display = "none";
          var grp = document.getElementById("entry_vip_btn_group");
          grp.innerHTML = `
            <button type="button" class="btn entry-vip-slot" data-slot="p1" style="flex:1;padding:10px;border-radius:10px">${escHtml(n1)}</button>
            <button type="button" class="btn alt entry-vip-slot" data-slot="p2" style="flex:1;padding:10px;border-radius:10px">${escHtml(n2)}</button>
          `;
          grp.querySelectorAll(".entry-vip-slot").forEach(function(sBtn){
            sBtn.onclick = function(){
              var slot = sBtn.getAttribute("data-slot");
              var prof = (slot === "p1") ? (vData.p1 || {}) : (vData.p2 || {});
              var curName = (slot === "p1") ? n1 : n2;
              promptPersonalPin(c, slot, curName, function(){
                var existingJoinedAt = (mems[slot] && mems[slot].joinedAt) || Date.now();
                var vipRawCls = String(prof.classBase || prof.cls || "HSC");
                var vipBase = extractEntryBaseClass(vipRawCls) || "HSC";
                var vipUid = pickEntryVipUid(prof, slot);
                var vipMemPatch = {
                  name: curName,
                  college: prof.college || "",
                  cls: prof.cls || vipBase,
                  classBase: vipBase,
                  goal: prof.goal || "Medical",
                  mobile: prof.mobile || "",
                  uid: vipUid,
                  joinedAt: existingJoinedAt,
                  vip: true
                };
                var vipNodePatch = {
                  name: curName,
                  college: prof.college || "",
                  cls: prof.cls || vipBase,
                  classBase: vipBase,
                  goal: prof.goal || "Medical",
                  mobile: prof.mobile || "",
                  uid: vipUid,
                  days: prof.days || {},
                  mins: prof.mins || {},
                  pr: prof.pr || {},
                  sc: prof.sc || []
                };
                if (prof.passingYear !== undefined) {
                  vipMemPatch.passingYear = prof.passingYear;
                  vipNodePatch.passingYear = prof.passingYear;
                }
                Promise.all([
                  REST.update("rooms_v2/" + c + "/members/" + slot, vipMemPatch).catch(function(){}),
                  REST.update("rooms_v2/" + c + "/" + slot, vipNodePatch).catch(function(){}),
                  REST.update("vip_users/" + slot, { uid: vipUid, name: curName }).catch(function(){}),
                  REST.update("rooms/1432014310/" + slot, { uid: vipUid, name: curName }).catch(function(){}),
                  REST.update("numeric_uids/" + vipUid, { roomId: c, memberId: slot, name: curName, updatedAt: Date.now() }).catch(function(){})
                ]).then(function(){
                  LS("sr-code", c);
                  LS("sr-me", slot);
                  LS("sr-name", curName);
                  LS("sr_room_name", meta.name || "অধ্যয়ন কক্ষ");
                  LS("sr_is_vip", "1");
                  LS("sr_goal", prof.goal || "Medical");
                  LS("sr_class", vipBase);
                  saveScopedUid(c, slot, vipUid);
                  gate.remove();
                  launchApp();
                });
              }, function(){
                showMemberPicker(c, rData, opts);
              });
            };
          });
          document.getElementById("entry_vip_unlock_box").style.display = "block";
        }).catch(function(){
          vipVerifyBtn.disabled = false;
          vErr.textContent = "সংযোগ সমস্যা! আবার চেষ্টা করো।";
        });
      };
    }

    document.getElementById("btn_picker_back").onclick = function(){
      showEntryScreen();
    };
  }

  // ৩. নতুন মেম্বার ফর্ম (Add Me)
  function showAddMeForm(c, rData){
    var autoUID = genFreshNumericUid();
    box.innerHTML = `
      <div>
        <h2 style="font-size:20px;text-align:center;margin-bottom:4px">রুমে যোগ দাও (Add Me)</h2>
        <div style="text-align:center;margin-bottom:8px">
          <span style="font-size:12px;background:var(--as);color:var(--a);padding:3px 10px;border-radius:20px;font-weight:700">অটো আইডি: ${autoUID}</span>
        </div>
        
        <input type="text" id="add_name" placeholder="তোমার পুরো নাম" style="width:100%;padding:10px 14px;border-radius:12px;border:1.5px solid var(--line);margin-top:6px;font:inherit" />
        <input type="text" id="add_college" placeholder="তোমার স্কুল / কলেজ" style="width:100%;padding:10px 14px;border-radius:12px;border:1.5px solid var(--line);margin-top:10px;font:inherit" />
        
        <p class="mute" style="font-size:13px;font-weight:600;margin:12px 0 6px">তোমার ক্লাস নির্বাচন করো:</p>
        <div class="row" id="add_cls_buttons" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
          <button type="button" class="btn cls-btn on" data-c="HSC" style="padding:8px 6px;font-size:13.5px;border-radius:10px">🎓 HSC</button>
          <button type="button" class="btn ghost cls-btn" data-c="SSC" style="padding:8px 6px;font-size:13.5px;border-radius:10px">📖 SSC</button>
          <button type="button" class="btn ghost cls-btn" data-c="Admission" style="padding:8px 6px;font-size:13.5px;border-radius:10px">🎯 Admission</button>
          <button type="button" class="btn ghost cls-btn" data-c="BCS" style="padding:8px 6px;font-size:13.5px;border-radius:10px">💼 BCS / Job</button>
        </div>
        
        <input type="tel" id="add_year" maxlength="4" placeholder="পাসের বছর (শুধুই সংখ্যা, যেমন: 2026)" oninput="this.value=this.value.replace(/[^0-9]/g,'').slice(0,4)" style="width:100%;padding:10px 14px;border-radius:12px;border:1.5px solid var(--line);font:inherit" />
        
        <p class="mute" style="font-size:13px;font-weight:600;margin:12px 0 6px">তোমার টার্গেট:</p>
        <div class="gl" id="add_goal_list" style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <button type="button" class="on" data-g="Medical" style="padding:10px 6px;border-radius:10px">🩺 Medical</button>
          <button type="button" data-g="Engineering" style="padding:10px 6px;border-radius:10px">⚙️ Engineering</button>
          <button type="button" data-g="Varsity" style="padding:10px 6px;border-radius:10px">🏛️ Varsity</button>
          <button type="button" class="goal-custom" data-g="custom" style="padding:10px 6px;border-radius:10px">🎯 + Add your Goal</button>
        </div>
        <input type="text" id="add_custom_goal" placeholder="নিজের লক্ষ্য লেখো" style="width:100%;padding:10px 14px;border-radius:12px;border:1.5px solid var(--line);margin-top:8px;font:inherit;display:none" />
        
        <input type="tel" id="add_mob" maxlength="11" oninput="this.value = this.value.replace(/[^0-9০-৯]/g, '').slice(0, 11)" placeholder="মোবাইল (01XXXXXXXXX - ১১ ডিজিট)" style="width:100%;padding:10px 14px;border-radius:12px;border:1.5px solid var(--line);margin-top:10px;font:inherit" />
        
        <p class="mute" style="font-size:13px;font-weight:600;margin:12px 0 4px">৪ ডিজিটের গোপন পিন (Personal PIN সেট করুন):</p>
        <input type="password" id="add_pin" maxlength="4" placeholder="৪ ডিজিটের গোপন PIN" oninput="this.value=this.value.replace(/[^0-9]/g,'').slice(0,4)" style="width:100%;padding:10px 14px;border-radius:12px;border:1.5px solid var(--line);font:inherit;text-align:center;letter-spacing:4px" />

        <div id="add_err" style="color:var(--danger);font-size:14px;margin-top:8px;min-height:1.2em"></div>
        <div class="row" style="margin-top:14px;display:flex;gap:10px">
          <button class="btn" id="btn_add_submit" style="flex:1;padding:12px;border-radius:12px">যোগ দাও</button>
          <button class="btn ghost" id="btn_add_back" style="flex:1;padding:12px;border-radius:12px">পিছনে</button>
        </div>
      </div>
    `;

    var selClass = "HSC";
    var selGoal = "Medical";
    var customInp = document.getElementById("add_custom_goal");
    var goalListEl = document.getElementById("add_goal_list");
    var addCollegeInp = document.getElementById("add_college");
    var addYearInp = document.getElementById("add_year");
    var cBtns = box.querySelectorAll(".cls-btn");

    function renderAddGoals(isBcs){
      if(!goalListEl) return;
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
      goalListEl.innerHTML = presets.map(function(p){
        return '<button type="button" class="' + (selGoal === p.g ? 'on' : '') + '" data-g="' + p.g + '" style="padding:10px 6px;border-radius:10px">' + p.label + '</button>';
      }).join("") + '<button type="button" class="goal-custom ' + (selGoal === 'custom' ? 'on' : '') + '" data-g="custom" style="padding:10px 6px;border-radius:10px">🎯 + Add your Goal</button>';
      customInp.style.display = (selGoal === "custom") ? "block" : "none";
      var gBtns = goalListEl.querySelectorAll("button");
      gBtns.forEach(function(b){
        b.onclick = function(){
          gBtns.forEach(function(x){ x.classList.remove("on"); });
          b.classList.add("on");
          selGoal = b.getAttribute("data-g");
          customInp.style.display = (selGoal === "custom") ? "block" : "none";
          if(selGoal === "custom") customInp.focus();
        };
      });
    }

    function syncAddClassUI(clsVal){
      var isBcs = (clsVal === "BCS");
      if(addCollegeInp){
        addCollegeInp.placeholder = isBcs ? "তোমার বিশ্ববিদ্যালয় / শিক্ষা প্রতিষ্ঠান" : "তোমার স্কুল / কলেজ";
      }
      if(addYearInp){
        addYearInp.placeholder = isBcs ? "স্নাতক পাসের বছর / ব্যাচ (যেমন: 2024)" : "পাসের বছর (শুধুই সংখ্যা, যেমন: 2026)";
      }
      renderAddGoals(isBcs);
    }

    syncAddClassUI(selClass);

    cBtns.forEach(function(b){
      b.onclick = function(){
        cBtns.forEach(function(x){ x.className = "btn ghost cls-btn"; });
        b.className = "btn cls-btn on";
        selClass = b.getAttribute("data-c");
        syncAddClassUI(selClass);
      };
    });

    document.getElementById("btn_add_back").onclick = function(){
      showMemberPicker(c, rData);
    };

    document.getElementById("btn_add_submit").onclick = function(){
      var name = document.getElementById("add_name").value.trim();
      var college = document.getElementById("add_college").value.trim();
      var year = document.getElementById("add_year").value.trim();
      var pin = document.getElementById("add_pin").value.trim();
      var mobRaw = document.getElementById("add_mob").value.trim();
      var mob = normMob(mobRaw);
      var goal = (selGoal === "custom") ? customInp.value.trim() : selGoal;
      var er = document.getElementById("add_err");
      var btnSub = document.getElementById("btn_add_submit");

      if(name.length < 2){ er.textContent = "নাম লেখো।"; return; }
      if(year.length !== 4){ er.textContent = selClass === "BCS" ? "স্নাতক পাসের সাল ৪ সংখ্যার হতে হবে (যেমন: 2024)।" : "পাসের সাল ৪ সংখ্যার হতে হবে (যেমন: 2026)।"; return; }
      if(!goal){ er.textContent = "তোমার লক্ষ্য বা টার্গেট লেখো।"; return; }
      if(pin.length !== 4){ er.textContent = "৪ ডিজিটের গোপন PIN লেখো।"; return; }
      if(mobRaw && !mob){ er.textContent = "সঠিক ১১ ডিজিটের মোবাইল নম্বর দাও (যেমন: 017XXXXXXXX)।"; return; }

      btnSub.disabled = true;
      er.textContent = "যোগ করা হচ্ছে...";

      (window.ensureAuth ? window.ensureAuth() : Promise.resolve()).then(function(){
        return REST.get("rooms_v2/"+c);
      }).then(function(rValNow){
        var curMems = (rValNow && rValNow.members) || {};
        var maxM = (rValNow && rValNow.meta && rValNow.meta.max) || 8;
        var activeCount = Object.keys(curMems).filter(function(k){ return k !== "p1" && k !== "p2"; }).length;
        if(activeCount >= maxM){
          btnSub.disabled = false;
          er.textContent = "রুমটি এইমাত্র পূর্ণ হয়ে গেছে।";
          return;
        }

        var newId = rid();
        ensureUniqueFreshUid(autoUID).then(function(uniqueUID){
          autoUID = uniqueUID;
          var fullClassStr = selClass + (year ? " (" + year + ")" : "");
          var newMem = {
            name: name,
            cls: fullClassStr,
            goal: goal,
            joinedAt: Date.now()
          };
          if (mob) newMem.mobile = mob;
          if (college) newMem.college = college;
          if (selClass) newMem.classBase = selClass;
          if (year) newMem.passingYear = year;
          if (autoUID) newMem.uid = autoUID;
          if (pin) newMem.pin = pin;

          function onMemberJoinSuccess() {
            LS("sr_pin_" + newId, pin);
            LS("sr_pin_" + c + "_" + newId, pin);
            LS("sr_class", selClass);
            saveScopedUid(c, newId, autoUID);
            LS("sr-name", name);
            LS("sr_room_name", (rData && rData.meta && rData.meta.name) || "অধ্যয়ন কক্ষ");
            if (college) LS("sr_college_" + newId, college);
            REST.set("user_pins/" + newId, { pin: pin, roomId: c, memberId: newId, updatedAt: Date.now() }).catch(function(){});
            REST.set("user_pins/" + autoUID, { pin: pin, roomId: c, memberId: newId, name: name, updatedAt: Date.now() }).catch(function(){});
            REST.set("numeric_uids/" + autoUID, { roomId: c, memberId: newId, name: name, createdAt: Date.now() }).catch(function(){});
            LS("sr-code", c);
            LS("sr-me", newId);
            LS("sr_goal", goal);
            gate.remove();
            launchApp();
          }

          REST.set("rooms_v2/"+c+"/members/"+newId, newMem).then(function(){
            REST.update("rooms_v2/"+c+"/"+newId, newMem).catch(function(){});
            onMemberJoinSuccess();
          }).catch(function(err){
            var errMsg = String((err && err.message) || "").toLowerCase();
            if (err && (err.status === 401 || err.status === 403 || errMsg.indexOf("permission") > -1)) {
              var minMem = {
                name: name,
                cls: fullClassStr.slice(0, 30),
                goal: goal.slice(0, 30),
                joinedAt: Date.now()
              };
              if (mob && /^01[3-9][0-9]{8}$/.test(mob)) {
                minMem.mobile = mob;
              }
              REST.set("rooms_v2/"+c+"/members/"+newId, minMem).then(function(){
                REST.set("user_profiles/" + newId, {
                  college: college,
                  uid: autoUID,
                  pin: pin,
                  passingYear: year,
                  classBase: selClass,
                  mobile: mob || ""
                }).catch(function(){});
                onMemberJoinSuccess();
              }).catch(function(err2){
                btnSub.disabled = false;
                er.textContent = "সেভ হয়নি: " + err2.message;
              });
            } else {
              btnSub.disabled = false;
              er.textContent = "সেভ হয়নি: " + err.message;
            }
          });
        });
      }).catch(function(err){
        btnSub.disabled = false;
        er.textContent = "এরর: " + err.message;
      });
    };
  }

  // ৪. নতুন রুম তৈরি (সরাসরি সেভ ও সম্পূর্ণ এরর হ্যান্ডলার সহ)
  function showCreateRoomForm(){
    var autoUID = genFreshNumericUid();
    box.innerHTML = `
      <div>
        <h2 style="font-size:20px;text-align:center;margin-bottom:4px">নতুন স্টাডি রুম তৈরি</h2>
        <p class="mute" style="text-align:center;margin-top:0;font-size:13px">প্রথম ৩ দিন সম্পূর্ণ ফ্রি ট্রায়াল পাবে</p>
        <p class="mute" style="font-size:12.5px;font-weight:600;margin:8px 0 3px">রুমের নাম:</p>
        <input type="text" id="cr_rname" placeholder="যেমন: মিশন মেডিকেল" style="width:100%;padding:10px 14px;border-radius:12px;border:1.5px solid var(--line);font:inherit" />

        <p class="mute" style="font-size:12.5px;font-weight:600;margin:10px 0 3px">রুমের পাসকোড (ইউনিক হতে হবে — বন্ধুরা এটি দিয়ে রুমে ঢুকবে):</p>
        <input type="text" id="cr_code" placeholder="কমপক্ষে ৪ অক্ষর" style="width:100%;padding:10px 14px;border-radius:12px;border:1.5px solid var(--line);font:inherit" autocomplete="off" />
        <div id="cr_code_status" style="font-size:12.5px;margin-top:4px;min-height:1.1em"></div>
        
        <p class="mute" style="font-size:13px;font-weight:600;margin:10px 0 4px">রুমের সর্বোচ্চ সদস্য সংখ্যা নির্ধারণ করো:</p>
        <select id="cr_max_members" style="width:100%;padding:10px 14px;border-radius:12px;border:1.5px solid var(--line);font:inherit">
          <option value="1">১ জন (একক রুম - শুধু আমি পড়ব)</option>
          <option value="2">২ জন (পার্টনার রুম)</option>
          <option value="3">৩ জন</option>
          <option value="4">৪ জন</option>
          <option value="5">৫ জন</option>
          <option value="6">৬ জন</option>
          <option value="7">৭ জন</option>
          <option value="8" selected>৮ জন (সর্বোচ্চ)</option>
        </select>

        <input type="text" id="cr_name" placeholder="তোমার নাম" style="width:100%;padding:10px 14px;border-radius:12px;border:1.5px solid var(--line);margin-top:8px;font:inherit" />
        <input type="text" id="cr_college" placeholder="তোমার স্কুল / কলেজ" style="width:100%;padding:10px 14px;border-radius:12px;border:1.5px solid var(--line);margin-top:8px;font:inherit" />
        
        <p class="mute" style="font-size:13px;font-weight:600;margin:10px 0 4px">তোমার ক্লাস নির্বাচন করো:</p>
        <div class="row" id="cr_cls_buttons" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
          <button type="button" class="btn cr-cls-btn on" data-c="HSC" style="padding:8px 6px;font-size:13.5px;border-radius:10px">🎓 HSC</button>
          <button type="button" class="btn ghost cr-cls-btn" data-c="SSC" style="padding:8px 6px;font-size:13.5px;border-radius:10px">📖 SSC</button>
          <button type="button" class="btn ghost cr-cls-btn" data-c="Admission" style="padding:8px 6px;font-size:13.5px;border-radius:10px">🎯 Admission</button>
          <button type="button" class="btn ghost cr-cls-btn" data-c="BCS" style="padding:8px 6px;font-size:13.5px;border-radius:10px">💼 BCS / Job</button>
        </div>

        <input type="tel" id="cr_year" maxlength="4" placeholder="পাসের বছর (শুধুই সংখ্যা, যেমন: 2026)" oninput="this.value=this.value.replace(/[^0-9]/g,'').slice(0,4)" style="width:100%;padding:10px 14px;border-radius:12px;border:1.5px solid var(--line);font:inherit" />
        
        <p class="mute" style="font-size:13px;font-weight:600;margin:10px 0 4px">তোমার টার্গেট:</p>
        <div class="gl" id="cr_goal_list" style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <button type="button" class="on" data-g="Medical" style="padding:10px 6px;border-radius:10px">🩺 Medical</button>
          <button type="button" data-g="Engineering" style="padding:10px 6px;border-radius:10px">⚙️ Engineering</button>
          <button type="button" data-g="Varsity" style="padding:10px 6px;border-radius:10px">🏛️ Varsity</button>
          <button type="button" class="goal-custom" data-g="custom" style="padding:10px 6px;border-radius:10px">🎯 + Add your Goal</button>
        </div>
        <input type="text" id="cr_custom_goal" placeholder="নিজের লক্ষ্য লেখো" style="width:100%;padding:10px 14px;border-radius:12px;border:1.5px solid var(--line);margin-top:6px;font:inherit;display:none" />
        
        <input type="tel" id="cr_mob" maxlength="11" oninput="this.value = this.value.replace(/[^0-9০-৯]/g, '').slice(0, 11)" placeholder="মোবাইল নম্বর (অবশ্যই ১১ ডিজিট, যেমন: 017XXXXXXXX)" style="width:100%;padding:10px 14px;border-radius:12px;border:1.5px solid var(--line);margin-top:8px;font:inherit" />
        
        <p class="mute" style="font-size:13px;font-weight:600;margin:10px 0 4px">৪ ডিজিটের গোপন পিন (Personal PIN — শুধু আপনার প্রোফাইল লকের জন্য):</p>
        <input type="password" id="cr_pin" maxlength="4" placeholder="৪ ডিজিটের গোপন PIN" oninput="this.value=this.value.replace(/[^0-9]/g,'').slice(0,4)" style="width:100%;padding:10px 14px;border-radius:12px;border:1.5px solid var(--line);font:inherit;text-align:center;letter-spacing:4px" />

        <div id="cr_err" style="color:var(--danger);font-size:14px;margin-top:8px;min-height:1.2em"></div>
        <div class="row" style="margin-top:14px;display:flex;gap:10px">
          <button class="btn" id="btn_cr_submit" style="flex:1;padding:12px;border-radius:12px">রুম বানাও</button>
          <button class="btn ghost" id="btn_cr_back" style="flex:1;padding:12px;border-radius:12px">পিছনে</button>
        </div>
      </div>
    `;

    var selClass = "HSC";
    var selGoal = "Medical";
    var customInp = document.getElementById("cr_custom_goal");
    var crGoalListEl = document.getElementById("cr_goal_list");
    var crRnameInp = document.getElementById("cr_rname");
    var crCollegeInp = document.getElementById("cr_college");
    var crYearInp = document.getElementById("cr_year");
    var cBtns = box.querySelectorAll(".cr-cls-btn");

    function renderCrGoals(isBcs){
      if(!crGoalListEl) return;
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
      crGoalListEl.innerHTML = presets.map(function(p){
        return '<button type="button" class="' + (selGoal === p.g ? 'on' : '') + '" data-g="' + p.g + '" style="padding:10px 6px;border-radius:10px">' + p.label + '</button>';
      }).join("") + '<button type="button" class="goal-custom ' + (selGoal === 'custom' ? 'on' : '') + '" data-g="custom" style="padding:10px 6px;border-radius:10px">🎯 + Add your Goal</button>';
      customInp.style.display = (selGoal === "custom") ? "block" : "none";
      var gBtns = crGoalListEl.querySelectorAll("button");
      gBtns.forEach(function(b){
        b.onclick = function(){
          gBtns.forEach(function(x){ x.classList.remove("on"); });
          b.classList.add("on");
          selGoal = b.getAttribute("data-g");
          customInp.style.display = (selGoal === "custom") ? "block" : "none";
          if(selGoal === "custom") customInp.focus();
        };
      });
    }

    function syncCrClassUI(clsVal){
      var isBcs = (clsVal === "BCS");
      if(crRnameInp){
        crRnameInp.placeholder = isBcs ? "যেমন: মিশন বিসিএস / জব" : "যেমন: মিশন মেডিকেল";
      }
      if(crCollegeInp){
        crCollegeInp.placeholder = isBcs ? "তোমার বিশ্ববিদ্যালয় / শিক্ষা প্রতিষ্ঠান" : "তোমার স্কুল / কলেজ";
      }
      if(crYearInp){
        crYearInp.placeholder = isBcs ? "স্নাতক পাসের বছর / ব্যাচ (যেমন: 2024)" : "পাসের বছর (শুধুই সংখ্যা, যেমন: 2026)";
      }
      renderCrGoals(isBcs);
    }

    syncCrClassUI(selClass);

    cBtns.forEach(function(b){
      b.onclick = function(){
        cBtns.forEach(function(x){ x.className = "btn ghost cr-cls-btn"; });
        b.className = "btn cr-cls-btn on";
        selClass = b.getAttribute("data-c");
        syncCrClassUI(selClass);
      };
    });

    var codeInpEl = document.getElementById("cr_code");
    var codeStatusEl = document.getElementById("cr_code_status");
    var codeCheckTimer = null;
    var codeCheckSeq = 0;

    function focusField(id){
      var elInp = document.getElementById(id);
      if(!elInp) return;
      try { elInp.scrollIntoView({ behavior: "smooth", block: "center" }); } catch(e){}
      setTimeout(function(){ try { elInp.focus(); } catch(e){} }, 120);
    }

    if(codeInpEl && codeStatusEl){
      codeInpEl.oninput = function(){
        clearTimeout(codeCheckTimer);
        codeInpEl.style.borderColor = "var(--line)";
        var raw = codeInpEl.value || "";
        var cleaned = clean(raw);
        if(!raw.trim()){
          codeStatusEl.textContent = "";
          return;
        }
        if(!cleaned){
          codeStatusEl.style.color = "var(--mute)";
          codeStatusEl.textContent = "পাসকোড ৪ থেকে ৪০ অক্ষরের মধ্যে হতে হবে।";
          return;
        }
        if(cleaned === "1432014310"){
          codeInpEl.style.borderColor = "var(--danger)";
          codeStatusEl.style.color = "var(--danger)";
          codeStatusEl.textContent = "✕ '" + cleaned + "' পাসকোডটি আগেই ব্যবহার হয়েছে, অন্য রুম পাসকোড দিন।";
          return;
        }
        codeStatusEl.style.color = "var(--mute)";
        codeStatusEl.textContent = "যাচাই করা হচ্ছে...";
        var mySeq = ++codeCheckSeq;
        codeCheckTimer = setTimeout(function(){
          Promise.all([
            REST.get("rooms_v2/" + cleaned, { shallow: true }),
            REST.get("rooms/" + cleaned, { shallow: true })
          ]).then(function(vals){
            if(mySeq !== codeCheckSeq) return;
            if(vals[0] !== null || vals[1] !== null){
              codeInpEl.style.borderColor = "var(--danger)";
              codeStatusEl.style.color = "var(--danger)";
              codeStatusEl.textContent = "✕ '" + cleaned + "' রুমের পাসকোডটি আগেই ব্যবহার হয়েছে, অন্য পাসকোড দিন।";
            } else {
              codeInpEl.style.borderColor = "var(--a)";
              codeStatusEl.style.color = "var(--a)";
              codeStatusEl.textContent = "✓ '" + cleaned + "' রুমের পাসকোডটি ব্যবহারযোগ্য";
            }
          }).catch(function(){
            if(mySeq === codeCheckSeq) codeStatusEl.textContent = "";
          });
        }, 350);
      };
    }

    document.getElementById("btn_cr_back").onclick = function(){
      showEntryScreen();
    };

    document.getElementById("btn_cr_submit").onclick = function(){
      var rname = document.getElementById("cr_rname").value.trim();
      var code = clean(document.getElementById("cr_code").value);
      var maxLimit = parseInt(document.getElementById("cr_max_members").value, 10) || 8;
      var name = document.getElementById("cr_name").value.trim();
      var college = (document.getElementById("cr_college") ? document.getElementById("cr_college").value.trim() : "");
      var year = document.getElementById("cr_year").value.trim();
      var pin = document.getElementById("cr_pin").value.trim();
      var mobRaw = document.getElementById("cr_mob").value.trim();
      var mob = normMob(mobRaw);
      var goal = (selGoal === "custom") ? customInp.value.trim() : selGoal;
      var er = document.getElementById("cr_err");
      var btnCr = document.getElementById("btn_cr_submit");

      if(!rname){ er.textContent = "উপরে 'রুমের নাম' লেখো।"; focusField("cr_rname"); return; }
      if(!code){ er.textContent = "উপরে 'রুমের পাসকোড' কমপক্ষে ৪ অক্ষরের দাও।"; focusField("cr_code"); return; }
      if(name.length < 2){ er.textContent = "তোমার নাম লেখো।"; focusField("cr_name"); return; }
      if(year.length !== 4){ er.textContent = selClass === "BCS" ? "স্নাতক পাসের সাল ৪ সংখ্যার হতে হবে (যেমন: 2024)।" : "পাসের সাল ৪ সংখ্যার হতে হবে (যেমন: 2026)।"; focusField("cr_year"); return; }
      if(!goal){ er.textContent = "তোমার লক্ষ্য বা টার্গেট লেখো।"; return; }
      if(!mob){ er.textContent = "সঠিক ১১ ডিজিটের মোবাইল নম্বর দাও (যেমন: 017XXXXXXXX)।"; focusField("cr_mob"); return; }
      if(pin.length !== 4){ er.textContent = "৪ ডিজিটের গোপন PIN লেখো।"; focusField("cr_pin"); return; }

      btnCr.disabled = true;
      er.textContent = "যাচাই ও রুম তৈরি করা হচ্ছে...";

      (window.ensureAuth ? window.ensureAuth() : Promise.resolve()).then(function(){
        // একই মোবাইল নম্বর দিয়ে আগে রুম খোলা আছে কি না + রুম পাসকোড আগেই আছে কি না যাচাই
        return Promise.all([
          REST.get("rooms_v2"),
          REST.get("rooms/" + code, { shallow: true })
        ]);
      }).then(function(vals){
        var allV2 = (vals && vals[0]) || {};

        // ১. একই মোবাইল নম্বর দিয়ে আগে থেকেই কোনো রুম থাকলে সেখানে পাঠিয়ে দেওয়া হবে
        var creatorMatch = null;
        var memberMatch = null;
        Object.keys(allV2).forEach(function(rKey){
          var rm = allV2[rKey];
          if(!rm || typeof rm !== "object") return;
          var mems = rm.members || {};
          Object.keys(mems).forEach(function(mKey){
            var mObj = mems[mKey] || {};
            if(normMob(mObj.mobile) === mob){
              var hit = { roomCode: rKey, roomData: rm, memberId: mKey };
              if(mObj.creator && !creatorMatch) creatorMatch = hit;
              else if(!memberMatch) memberMatch = hit;
            }
          });
        });
        var existingByMob = creatorMatch || memberMatch;
        if(existingByMob){
          btnCr.disabled = false;
          showMemberPicker(existingByMob.roomCode, existingByMob.roomData, {
            duplicateMob: mob,
            highlightMid: existingByMob.memberId
          });
          return;
        }

        // ২. রুমের পাসকোড আগে থেকেই ব্যবহৃত কি না যাচাই
        if(allV2[code] || (vals && vals[1] !== null) || code === "1432014310"){
          btnCr.disabled = false;
          er.textContent = "উপরের 'রুমের পাসকোড' (" + code + ") আগেই ব্যবহার হয়েছে! উপরে গিয়ে অন্য একটি পাসকোড দাও (নিচের ৪-ডিজিট PIN নয়)।";
          if(codeInpEl) codeInpEl.style.borderColor = "var(--danger)";
          if(codeStatusEl){
            codeStatusEl.style.color = "var(--danger)";
            codeStatusEl.textContent = "✕ '" + code + "' রুমের পাসকোডটি আগেই ব্যবহার হয়েছে, অন্য পাসকোড দিন।";
          }
          focusField("cr_code");
          return;
        }

        var trialEnd = Date.now() + (3 * 864e5);
        var creatorId = rid();
        var fullClassStr = selClass + (year ? " (" + year + ")" : "");

        var memberObj = {
          name: name,
          cls: fullClassStr,
          goal: goal,
          joinedAt: Date.now(),
          creator: true
        };
        if (mob) memberObj.mobile = mob;
        if (college) memberObj.college = college;
        if (selClass) memberObj.classBase = selClass;
        if (year) memberObj.passingYear = year;
        if (autoUID) memberObj.uid = autoUID;
        if (pin) memberObj.pin = pin;

        // সরাসরি rooms_v2 তে সেভ
        var newRoomData = {
          meta: {
            name: rname,
            createdAt: Date.now(),
            trialEnds: trialEnd,
            status: "trial",
            max: maxLimit
          },
          members: {
            [creatorId]: memberObj
          }
        };

        var isRoomSaved = false;
        function onRoomSavedSuccess() {
          if(isRoomSaved) return;
          isRoomSaved = true;
          try {
            localStorage.setItem("sr_cached_room_" + code, JSON.stringify(newRoomData));
          } catch(e) {}
          LS("sr_pin_" + creatorId, pin);
          LS("sr_pin_" + code + "_" + creatorId, pin);
          LS("sr_class", selClass);
          saveScopedUid(code, creatorId, autoUID);
          LS("sr-name", name);
          LS("sr_room_name", rname);
          if (college) LS("sr_college_" + creatorId, college);
          REST.set("user_pins/" + creatorId, { pin: pin, roomId: code, memberId: creatorId, updatedAt: Date.now() }).catch(function(){});
          REST.set("user_pins/" + autoUID, { pin: pin, roomId: code, memberId: creatorId, name: name, updatedAt: Date.now() }).catch(function(){});
          REST.set("numeric_uids/" + autoUID, { roomId: code, memberId: creatorId, name: name, createdAt: Date.now() }).catch(function(){});
          REST.set("room_meta/" + code, {
            name: rname,
            status: "trial",
            expiresAt: trialEnd,
            updatedAt: Date.now()
          }).catch(function(){});

          LS("sr-code", code);
          LS("sr-me", creatorId);
          LS("sr_goal", goal);
          gate.remove();
          launchApp();
        }

        // Save locally immediately to prevent lock-out
        try {
          localStorage.setItem("sr_cached_room_" + code, JSON.stringify(newRoomData));
        } catch(e) {}

        // Timeout fallback: if Firebase write hangs on very slow connection, proceed with local room after 6s
        var saveSafetyTimer = setTimeout(function() {
          onRoomSavedSuccess();
        }, 6000);

        REST.set("rooms_v2/" + code, newRoomData).then(function(){
          clearTimeout(saveSafetyTimer);
          onRoomSavedSuccess();
        }).catch(function(err){
          clearTimeout(saveSafetyTimer);
          // Fallback: If strict Firebase rules rejected extra fields, save clean compliant payload
          var minimalRoomData = {
            meta: {
              name: rname,
              createdAt: Date.now(),
              trialEnds: trialEnd,
              status: "trial",
              max: maxLimit
            },
            members: {
              [creatorId]: {
                name: name,
                cls: fullClassStr.slice(0, 30),
                goal: goal.slice(0, 30),
                joinedAt: Date.now(),
                creator: true
              }
            }
          };
          if (mob && /^01[3-9][0-9]{8}$/.test(mob)) {
            minimalRoomData.members[creatorId].mobile = mob;
          }
          REST.set("rooms_v2/" + code, minimalRoomData).then(function(){
            REST.set("user_profiles/" + creatorId, {
              college: college,
              uid: autoUID,
              pin: pin,
              passingYear: year,
              classBase: selClass,
              mobile: mob || ""
            }).catch(function(){});
            onRoomSavedSuccess();
          }).catch(function(err2){
            console.warn("Firebase save warning, proceeding with local cached room:", err2);
            onRoomSavedSuccess();
          });
        });
      }).catch(function(err){
        btnCr.disabled = false;
        er.textContent = "সংযোগ এরর: " + err.message;
      });
    };
  }

  showEntryScreen();
})();