(function(){var d=[],_13='onreadystatechange',_12=function(a){var b,_2=R.assets,_15=R.fixUrl,_4=[];for(var c,i=0;(c=a[i]);i++){if(typeof c=='function'){_4.push(c)}else{if(c.charAt){b=c;c=_2[b]||(_2[b]=(_2[_15(b)]||{src:b}))}else{b=c.id||c.src;_2[b]=_2[b]||c}if(!c._11&&!c._5){c._11=1;if(!c._17){c._17=1;c.id=b;if(c.src){c.src=_15(c.src||b);_2[c.src]=c}if(c.req){c.req=c.req.charAt?[c.req]:c.req}}c.req&&_4.push.apply(_4,_12(c.req));_4.push(c)}}}return _4},_0=[],_9=function(){var a,i=_0.length;if(i>=R.joinLim){var b=[];while(i--){if(_0[i].src){b.unshift(R.getJoinUrl(_0[i]))}}a={src:_3.replace(s,b.join(R.joint||'')),_16:_0};_0=[]}else{a=_0.shift();a._14=1}return a},_7=function(){if(_10=!!(d.length||_0.length)){var b=d.shift()||_9();if(typeof b=='function'){if(_0.length){d.unshift(b);b=_9()}else{b();b=null}}if(b&&!b._5){if(b.check&&b.check()){b._5=1}else{if((b.join===true||!b.src)&&!b._14){_0.push(b)}else{if(_0.length&&!b._14){d.unshift(b);b=_9()}if(b.src){var c=document.createElement('script');if(b.charset){c.charset=b.charset}c.src=b.src;c.onload=c[_13]=function(){if(!c.readyState||/^(loaded|complete)$/.test(c.readyState)){c[_13]=c.onload=null;var a=b._16||[b];for(var i=0,_6;(_6=a[i]);i++){_6._5=1;_6.onload&&_6.onload()}_7()}};_8.appendChild(c);return}b._5=1}}}_7()}},_10,_8,_1,_3,s='%{s}',R=Req=function(){_1=R.baseUrl||'';_1=_1+(_1.indexOf(s)==-1&&s||'');_3=R.joinUrl||'';_3=_3+(_3.indexOf(s)==-1&&s||'');_8=_8||document.getElementsByTagName('head')[0];var a=_12([].slice.call(arguments,0)),i=a.length;while(i--){delete a[i]._11}d.unshift.apply(d,a);if(!_10){_7()}};R.fixUrl=function(a){return/^(\.?\/|https?:)/.test(a)?a:_1.replace(s,a)};R.getJoinUrl=function(a){return a.src.replace(_1.split(s)[0],'')};R.joinLim=1;R.assets={}})();
