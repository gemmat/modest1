var nsXHTMLIm = new Namespace("http://jabber.org/protocol/xhtml-im");
var nsXHTML   = new Namespace("http://www.w3.org/1999/xhtml");

var comments = [];
var nicospeed = 10;
var nicointrvl = 50;

function appendHistory(aElement) {
  aElement.addClassName("niconico");
  aElement.setStyle({left: "1000px",
                     top: (comments.length * 1.5) + "em"});
  document.body.appendChild(aElement);
  comments.push({elt: aElement,
                 t: 1000 / nicospeed});
}

function replaceLink(aString) {
  var re = /\s(ftp|http|https|xmpp):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/g;
  function converter(str) {
    var dest = str.slice(1);
    return ' <a href="' + dest + '">' + dest + '</a>';
  }
  return aString.replace(re, converter);
}

function appendMessage(aFrom, aMessage) {
  var div = new Element("div");
  div.appendChild(document.createTextNode(replaceLink(aMessage)));
  appendHistory(div);
}

function appendXHTMLMessage(aFrom, aMessage) {
  if (aMessage.indexOf("Gemmat") == -1 &&
      aMessage.indexOf("gemmat") == -1 &&
      aMessage.indexOf("modest") == -1) return;
  var div = new Element("div");
  div.innerHTML = replaceLink(aMessage);
  appendHistory(div);
}

function recv(xml) {
  if (xml.name().localName != "message") return;
  if (xml.nsXHTMLIm::html.nsXHTML::body.length()) {
    appendXHTMLMessage(xml.@from.toString(), xml.nsXHTMLIm::html.nsXHTML::body.toString());
  } else if (xml.body.length()) {
    appendMessage(xml.@from.toString(), xml.body.toString());
  }
}

function niconico(e) {
  var flag = false;
  comments.each(function(x) {
                  if (x.t < -40) {
                    flag = true;
                    return;
                  }
                  x.elt.setStyle({left: (x.t * nicospeed) + "px"});
                  x.t--;
                });
  if (flag) {
    var arr = [];
    comments.each(function (x) {
                    if (x.t < -40) {
                      Element.remove(x.elt);
                    } else {
                      arr.push(x);
                    }
                  });
    comments = arr;
  }
}

function main(e) {
  Musubi.init(recv);
  setInterval(niconico, nicointrvl);
  test();
}

function test() {
  recv(<message from="hogehoge@localhost">
         <body>グーグルトーク</body>
       </message>);
  recv(<message
         from="Gemmat@twitter.tweet.im"
         to="teruakigemma@gmail.com/Musubi83AA2D18"
         type="chat">
         <body>test (test): なう @Gemmat </body>
         <html xmlns="http://jabber.org/protocol/xhtml-im">
           <body xmlns="http://www.w3.org/1999/xhtml">
             <span>
               <img src="http://a3.twimg.com/profile_images/73702551/profile.gif"/>
                  <a href="http://twitter.com/test">test</a>(test): なう @Gemmat</span>
           </body>
         </html>
       </message>);
  recv(<message
         from="Gemmat@twitter.tweet.im"
         to="teruakigemma@gmail.com/Musubi83AA2D18"
         type="chat">
         <body>test (test): なう #modest </body>
         <html xmlns="http://jabber.org/protocol/xhtml-im">
           <body xmlns="http://www.w3.org/1999/xhtml">
             <span>
               <img src="http://a3.twimg.com/profile_images/73702551/profile.gif"/>
                  <a href="http://twitter.com/test">test</a>(test): なう #modest</span>
           </body>
         </html>
       </message>);

}

Event.observe(window, "load", main);
