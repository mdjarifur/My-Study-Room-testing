/* ===== Firebase কনফিগারেশন ===== */
const firebaseConfig = {
  apiKey: "AIzaSyDWH0huSIIWqYyProg30jatgd7fCXIDdl8",
  authDomain: "my-study-room-0710.firebaseapp.com",
  databaseURL: "https://my-study-room-0710-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "my-study-room-0710",
  storageBucket: "my-study-room-0710.firebasestorage.app",
  messagingSenderId: "501590476232",
  appId: "1:501590476232:web:3b8349e223b5ac13552cfd",
  measurementId: "G-NE17F08VCP"
};

// গ্লোবাল ভ্যারিয়েবল যেন পুরনো ও নতুন সব কোড পায়
var FB_CONFIG = firebaseConfig;

// ফায়ারবেস ইনিশিয়ালাইজ
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// ডাটাবেস ও অথ রেফারেন্স
const db = firebase.database();
window.db = db;

// Spark (Free) Plan Concurrent Connection অপ্টিমাইজেশন:
// পেজ লোড হওয়ার সাথে সাথে ডিফল্টভাবে ব্যাকগ্রাউন্ড সকেট বন্ধ রাখা হয়,
// শুধুমাত্র লাইভ স্টাডি রুম / অ্যাডমিন ড্যাশবোর্ডে ঢুকলে অন করা হবে।
window.__SR_DB_ONLINE__ = false;
window.goOfflineDB = function(targetDb) {
  var d = targetDb || window.db;
  window.__SR_DB_ONLINE__ = false;
  try {
    if (d && typeof d.goOffline === "function") d.goOffline();
  } catch (e) {}
};
window.goOnlineDB = function(targetDb) {
  var d = targetDb || window.db;
  window.__SR_DB_ONLINE__ = true;
  try {
    if (d && typeof d.goOnline === "function") d.goOnline();
  } catch (e) {}
};
window.goOfflineDB(db);

// ফায়ারবেস অথ সেশন নিশ্চিতকরণ (যাতে সিকিউরিটি রুলসে PERMISSION_DENIED না হয়)
if (firebase.auth) {
  try {
    const auth = firebase.auth();
    window.auth = auth;
    auth.onAuthStateChanged(function(user) {
      if (!user) {
        var token = localStorage.getItem("firebase_auth_token") || localStorage.getItem("admin_auth_token");
        if (token) {
          auth.signInWithCustomToken(token).catch(function() {
            auth.signInAnonymously().catch(function(){});
          });
        } else {
          auth.signInAnonymously().catch(function(){});
        }
      }
    });
  } catch (authErr) {
    console.warn("Auth initialization notice:", authErr);
  }
}

// প্রমিজ ভিত্তিক অথ নিশ্চয়তা ফাংশন (সেভ/রাইটের পূর্বে PERMISSION_DENIED প্রতিরোধে)
window.ensureAuth = function() {
  return new Promise(function(resolve) {
    if (!window.firebase || !firebase.auth) { resolve(null); return; }
    try {
      var auth = firebase.auth();
      if (auth.currentUser) {
        resolve(auth.currentUser);
        return;
      }
      var token = localStorage.getItem("firebase_auth_token") || localStorage.getItem("admin_auth_token");
      if (token) {
        auth.signInWithCustomToken(token).then(function(res){
          resolve(res.user);
        }).catch(function(){
          auth.signInAnonymously().then(function(res){
            resolve(res.user);
          }).catch(function(){ resolve(null); });
        });
      } else {
        auth.signInAnonymously().then(function(res){
          resolve(res.user);
        }).catch(function(){ resolve(null); });
      }
    } catch(e) {
      resolve(null);
    }
  });
};

// Firebase Auth ID Token সংগ্রহ (REST API অনুরোধের জন্য, ৩ সেকেন্ড টাইমআউট গার্ডসহ)
window.getFirebaseAuthToken = function(forceRefresh) {
  return new Promise(function(resolve) {
    if (!window.firebase || !firebase.auth) { resolve(null); return; }
    var done = false;
    var guard = setTimeout(function() {
      if (!done) { done = true; resolve(null); }
    }, 3000);
    function finish(tok) {
      if (!done) {
        done = true;
        clearTimeout(guard);
        resolve(tok || null);
      }
    }
    try {
      var auth = firebase.auth();
      var resolveUserToken = function(user) {
        if (!user || typeof user.getIdToken !== "function") { finish(null); return; }
        user.getIdToken(!!forceRefresh).then(finish).catch(function() { finish(null); });
      };
      if (auth.currentUser) {
        resolveUserToken(auth.currentUser);
      } else {
        window.ensureAuth().then(resolveUserToken).catch(function() { finish(null); });
      }
    } catch (e) {
      finish(null);
    }
  });
};

// ===== Firebase Realtime Database REST API Client =====
// কানেকশন স্লট বাঁচাতে Exam ও Static ডেটা লোড/সেভ REST API (.json) দিয়ে করা হয়;
// ডেটা আদান-প্রদান শেষ হওয়ার সাথে সাথেই HTTP কানেকশন বন্ধ হয়ে যায়।
window.FB_REST = (function() {
  var BASE = String(firebaseConfig.databaseURL || "").replace(/\/+$/, "");

  function encodePath(path) {
    var clean = String(path || "").replace(/^\/+|\/+$/g, "");
    if (!clean) return "";
    return clean.split("/").map(function(seg) { return encodeURIComponent(seg); }).join("/");
  }

  function buildUrl(path, queryObj, token) {
    var p = encodePath(path);
    var url = BASE + "/" + (p ? p : "") + ".json";
    var params = [];
    if (queryObj && typeof queryObj === "object") {
      Object.keys(queryObj).forEach(function(k) {
        var val = queryObj[k];
        if (val === undefined || val === null) return;
        if (k === "orderBy" || k === "startAt" || k === "endAt" || k === "equalTo") {
          params.push(encodeURIComponent(k) + "=" + encodeURIComponent(JSON.stringify(val)));
        } else {
          params.push(encodeURIComponent(k) + "=" + encodeURIComponent(String(val)));
        }
      });
    }
    if (token) {
      params.push("auth=" + encodeURIComponent(token));
    }
    if (params.length) {
      url += "?" + params.join("&");
    }
    return url;
  }

  function execFetch(method, path, bodyData, queryObj, opts, retriedAuth) {
    opts = opts || {};
    var timeoutMs = opts.timeoutMs || 10000;
    var needAuth = opts.auth !== false;

    var tokenPromise = needAuth
      ? window.getFirebaseAuthToken(!!retriedAuth)
      : Promise.resolve(null);

    return tokenPromise.then(function(token) {
      var url = buildUrl(path, queryObj, token);
      var controller = (typeof AbortController !== "undefined") ? new AbortController() : null;
      var timer = null;
      if (controller) {
        timer = setTimeout(function() {
          try { controller.abort(); } catch (e) {}
        }, timeoutMs);
      }

      var fetchOpts = {
        method: method,
        headers: {},
        cache: "no-store"
      };
      if (controller) fetchOpts.signal = controller.signal;
      if (opts.keepalive) fetchOpts.keepalive = true;
      if (bodyData !== undefined) {
        fetchOpts.headers["Content-Type"] = "application/json";
        fetchOpts.body = JSON.stringify(bodyData === undefined ? null : bodyData);
      }

      return fetch(url, fetchOpts).then(function(res) {
        if (timer) clearTimeout(timer);
        if (res.status === 401 && needAuth && !retriedAuth) {
          return execFetch(method, path, bodyData, queryObj, opts, true);
        }
        return res.text().then(function(txt) {
          var parsed = null;
          if (txt) {
            try { parsed = JSON.parse(txt); } catch (e) { parsed = txt; }
          }
          if (!res.ok) {
            var msg = (parsed && parsed.error) ? String(parsed.error) : ("HTTP " + res.status);
            var err = new Error(msg);
            err.status = res.status;
            throw err;
          }
          return parsed;
        });
      }).catch(function(err) {
        if (timer) clearTimeout(timer);
        if (err && err.name === "AbortError") {
          var tErr = new Error("ইন্টারনেট সংযোগে সময় বেশি লাগছে (Timeout)। অনুগ্রহ করে আবার চেষ্টা করুন।");
          tErr.code = "TIMEOUT";
          throw tErr;
        }
        throw err;
      });
    });
  }

  return {
    baseUrl: BASE,
    buildUrl: buildUrl,
    get: function(path, queryObj, opts) {
      return execFetch("GET", path, undefined, queryObj, opts, false);
    },
    set: function(path, data, opts) {
      return execFetch("PUT", path, data === undefined ? null : data, null, opts, false);
    },
    update: function(path, data, opts) {
      return execFetch("PATCH", path, data || {}, null, opts, false);
    },
    push: function(path, data, opts) {
      return execFetch("POST", path, data, null, opts, false);
    },
    remove: function(path, opts) {
      return execFetch("DELETE", path, undefined, null, opts, false);
    }
  };
})();
/* ================================= */