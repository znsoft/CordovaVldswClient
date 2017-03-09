var ref;
vldcookie = null;
nzchatobj = $;
nzlastid = 0;
nztime2 = 0;
nztouid = 0;


function sortObject(a) {
    var b = {},
    c, d = [];
    for (c in a) {
        if (a.hasOwnProperty(c)) {
            d.push(c);
        }
    }
    d.sort();
    for (c = 0; c < d.length; c++) {
        b[d[c]] = a[d[c]]
    }
    return b;
}


function nzLoadText() {
    nzchatobj.post("http://vldsw.ru/plugin.php?id=th_chat:new", { 'lastid': nzlastid }, function (data) {
        if (data != 'not') {
            data = nzchatobj.parseJSON(data);
            var listmess = sortObject(data.chat_row);
            nzchatobj.each(listmess, function (k, v) {
                k = parseInt(k);
                if (k > nzlastid) {
                    nzlastid = k;
                    v = parsehtmlmsg(v);
                    nzchatobj("#afterme").after(v);
                    setnewBackground(v);
                }
                
                //if (cordova.plugins.backgroundMode.isActive()) console.log('back');
            });
            //nzchatobj("#nzchatolcontent").html(data.chat_online);
            //nzchatobj("#nzoltotal").html(data.chat_online_total);
        }
    });
    setTimeout(nzLoadText, 5000);
}

function nzSend() {
    var data = nzchatobj.trim(nzchatobj("#nzchatmessage").val());
    if (data === '') {
        return false;
    }
    nztime1 = new Date().getTime();
    if (nztime2 == null || nztime1 > nztime2) {
        nzchatobj("#nzchatmessage").val('');
        //        nzcolor = nzchatobj('#nzchatskin').val();
        nztime2 = nztime1 + 1000;
        nzchatobj.post("http://vldsw.ru/plugin.php?id=th_chat:post", { 'text': data, 'lastid': nzlastid, 'touid': nztouid }, function (data) {
            data = nzchatobj.parseJSON(data);
            // alert(data);
            if (data.type == 1) {
                alert(data.error);
                if (data.script_add == 1) {
                    alert(data.script);
                }
            } else {
                var listmess = sortObject(data);
                nzchatobj.each(listmess, function (k, v) {
                    k = parseInt(k);
                    if (k > nzlastid) {
                        nzlastid = k;
                        v = parsehtmlmsg(v);
                        nzchatobj("#afterme").after(v);
                    }


                });
            }
        });
    } else {
        alert('Send it to.');
    }
    return;
}

function setnewBackground(str) {
    
    cordova.plugins.backgroundMode.configure({
        title: "Vldsw",
        text: str,
        icon: 'icon', // this will look for icon.png in platforms/android/res/drawable|mipmap
        color: 'F14F4D',
        resume: true,
        hidden: false,
        bigText: false
    });
/*    cordova.plugins.backgroundMode.setDefaults({
        title: "Vldsw",
        text: str,
        icon: 'icon', // this will look for icon.png in platforms/android/res/drawable|mipmap
        color: 'F14F4D',
        resume: true,
        hidden: false,
        bigText: false
    });
*/

}


function parsehtmlmsg(str) {

    var regex = /span class="nzuname_[^>]+>([^<]+)[.|\s|\S]+?nzchatcontent[^>]+>(.+)<\/span>/gmi;//.exec(data.datahtml);
    let m;
    var result = "";
    while ((m = regex.exec(str)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regex.lastIndex) {
            regex.lastIndex++;
        }

        result = result + '<tr><td>' + m[1] + ":\t  " + m[2].replace(/src\s?=\s?(["'])(.+)(\1)/gmi, "src=$1http://vldsw.ru/$2$1" ) + "<hr></td></tr>";
    }
    return result;
}


function nzLoadTextInit() {
    nzchatobj.post("http://vldsw.ru/plugin.php?id=th_chat:newinit", function (data) {
        data = nzchatobj.parseJSON(data);
        nzlastid = data.lastid;
        var str = data.datahtml;
        result = parsehtmlmsg(str);

        nzchatobj("#nzchatcontent").html('<table class="nzcallrow"><tr id="afterme" style="height:0px;"><td class="nzavatart"></td><td class="nzcontentt"></td></tr>' + result + '</table>');
        //nzchatobj("#nzchatolcontent").html(data.datachatonline);
        //nzchatobj("#nzoltotal").html(data.chat_online_total);
        setTimeout(nzLoadText, 5000);
    });
}

function IsWeLogin(htmlText) {
    var re3 = /title\s?=\s?"Выход"/g.exec(htmlText);
    if (re3 == null) re3 = /<p>Добро пожаловать/g.exec(htmlText);
    return re3 != null;
}


function SetNewRef(url, callback) {
    ref = cordova.InAppBrowser.open(url, '_blank', 'hidden=yes, location=no, toolbar=no');
    ref.addEventListener('loadstop', callback);

}


function checkChat(event) {
    if (ref == null) return;
    ref.executeScript(
{ code: "document.body.innerHTML" },
function (values) {
    console.log(values[0]);
    ref.show();
}
);
}


function checkLogin(event) {
    if (ref == null) return;
    ref.executeScript(
{ code: "[document.body.innerHTML, document.cookie]" },
function (values) {
    var isLoggined = IsWeLogin(values[0][0]);
    console.log(isLoggined);
    if (isLoggined) {
        vldcookie = values[0][1];
        ref.hide();
        document.cookie = vldcookie;
        nzLoadTextInit();
    } else {
        ref.show();
        setTimeout(checkLogin, 5000);
    }
}
);
}

function readUrl(url) {
    SetNewRef(url, checkLogin);

}