var _userId = "";
var date = new Date();
var start_date = "" + (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + ":" + date.getMilliseconds();
var start_time = (date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds());
/*GETS UNIQUE ID FOR A PROFILE ON CHROME INSTALLATION*/
chrome.storage.local.get('userid', function(items) {
  var userid = items.userid;
  if (userid) {
      useToken(userid);
  } else {
      userid = getRandomToken();
      chrome.storage.sync.set({userid: userid}, function() {
          useToken(userid);
      });
  }
  function useToken(userid) {
      _userId = userid;
      //console.log(userid);
  }
});

var thisIP;
var lastTime = 0;
var req = new XMLHttpRequest();

    req.addEventListener('readystatechange', function (evt) {
      if (req.readyState === 4) {
        if (req.status === 200) {
          //alert('Saved !');
        } else {
          alert("Error pushing to backend. Status " + req.status);
        }
      }
    });

chrome.tabs.getAllInWindow( null, function( tabs ){
  console.log("Initial tab count: " + tabs.length);
  num_tabs = tabs.length;
});

chrome.tabs.onCreated.addListener(function(tab){
  num_tabs++;
  console.log("Tab created event caught. Open tabs #: " + num_tabs);
});

chrome.tabs.onRemoved.addListener(function(tabId){
  num_tabs--;
  console.log("Tab removed event caught. Open tabs #: " + num_tabs);
  if( num_tabs < 1 ) {
    var dat = new Date();
    var end_time = "" + (dat.getHours() * 3600 + dat.getMinutes() * 60 + dat.getSeconds());
    var end_date = "" + (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + ":" + date.getMilliseconds();
    console.log("start at " + start_date + ", end at " + end_date);

    console.log("start at " + start_time + ", end at " + end_time);
    // SESSION HAS ENDED
    req.open('POST', 'https://pwcancer.actionlabstudy.web.illinois.edu/script.php', true);
    req.setRequestHeader('Content-Type', 'application/json');
    req.send(JSON.stringify({
      special: 1,
      id: _userId,
      ip: thisIP,
      end: end_date,
      start: start_date,
    }));
    console.log("end");
  }
});

chrome.tabs.onUpdated.addListener(function
  (tabId, changeInfo, tab) {
    // read changeInfo data and do something with it (like read the url)
    if (changeInfo.url) {
      // do something here
      sendCurrentUrl(changeInfo.url);

    }
  }
);

/*
Extracts parameters of search queries
*/
function getUrlVars(href)
{
    var vars = [], hash;
    var hashes = href.slice(href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

getLocalIPs(function(ips) { // <!-- ips is an array of local IP addresses.
  const ipMessage = 'Local IP addresses:\n ' + ips.join('\n ');
  thisIP = ips[0];
  //console.log(thisIP);
});

function getLocalIPs(callback) {
  var ips = [];

  var RTCPeerConnection = window.RTCPeerConnection ||
      window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
  var pc = new RTCPeerConnection({
      // Don't specify any stun/turn servers, otherwise you will
      // also find your public IP addresses.
      iceServers: []
  });
  // Add a media line, this is needed to activate candidate gathering.
  pc.createDataChannel('');
  // onicecandidate is triggered whenever a candidate has been found.
  pc.onicecandidate = function(e) {
      if (!e.candidate) { // Candidate gathering completed.
          pc.close();
          callback(ips);
          return;
      }
      var ip = /^candidate:.+ (\S+) \d+ typ/.exec(e.candidate.candidate)[1];
      if (ips.indexOf(ip) == -1) // avoid duplicate entries (tcp/udp)
          ips.push(ip);
  };
  pc.createOffer(function(sdp) {
      pc.setLocalDescription(sdp);
  }, function onerror() {});
}

function getRandomToken() {
  // E.g. 8 * 32 = 256 bits token
  var randomPool = new Uint8Array(32);
  crypto.getRandomValues(randomPool);
  var hex = '';
  for (var i = 0; i < randomPool.length; ++i) {
      hex += randomPool[i].toString(16);
  }
  // E.g. db18458e2782b2b77e36769c569e263a53885a9944dd0a861e5064eac16f1a
  return hex;
}

function sendCurrentUrl(url) {
    var d = new Date();
    //console.log("here");
    var dateString = "";
    dateString += (d.getMonth() + 1) + "/" + d.getDate() + "/" + d.getFullYear() + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + ":" + d.getMilliseconds();
    var timeSpent; //SESSION TIME
    if (lastTime == 0) {
      timeSpent = 0;
    } else {
      timeSpent = (d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds()) - lastTime;
    }
    lastTime = d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds();
    //console.log(timeSpent);
    var req = new XMLHttpRequest();
    req.addEventListener('readystatechange', function (evt) {
      if (req.readyState === 4) {
        if (req.status === 200) {
          //alert('Saved !');
        } else {
          alert("ERROR: status " + req.status);
        }
      }
    });
    var urlparams = getUrlVars(url);
    var query = "" + urlparams["q"]; 
    //not too slow
    query = query.replaceAll("+", " ");
    query = query.replaceAll("%22", "\"");
    query = query.replaceAll("%3F", "?");
    query = query.replaceAll("%27", "'");
    query = query.replaceAll("%2C", ",");
    query = query.replaceAll("%21", "!");
    query = query.replaceAll("%40", "@");
    query = query.replaceAll("%23", "#");
    query = query.replaceAll("%24", "$");
    query = query.replaceAll("%25", "%");
    query = query.replaceAll("%5E", "^");
    query = query.replaceAll("%26", "&");
    query = query.replaceAll("%28", "(");
    query = query.replaceAll("%29", ")");
    var onSearch = query === "undefined" ? "False" : "True";

    req.open('POST', 'https://pwcancer.actionlabstudy.web.illinois.edu/script.php', true);
    req.setRequestHeader('Content-Type', 'application/json');
    req.send(JSON.stringify({
        special: "notSpecial",
        url: encodeURIComponent(url),
        id: _userId,
        ip: thisIP,
        date: dateString,
        query: query,
        unow: Date.now(),
        time: timeSpent,
        search: onSearch
    }));
    console.log("userid: " + _userId + "\n" + "ip: " + thisIP + "\n" + "date: " + dateString + "\n" +  "query: " + query + "\n" + "dateUNIX: " + Date.now() + "\n" + "time spent: " + timeSpent + "\n" + "isSearch: " + onSearch + "\n");
  }
  
