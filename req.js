(function(){var d=[],_14='onreadystatechange',_13=function(a){var b,_2=R.assets,_16=R.fixUrl,_4=[];for(var c,i=0;(c=a[i]);i++){if(typeof c=='function'){_4.push(c)}else{if(c.charAt){b=c;c=_2[b]||(_2[b]=(_2[_16(b)]||{src:b}))}else{b=c.id||c.src;_2[b]=_2[b]||c}if(!c._12&&!c._5){c._12=1;if(!c._18){c._18=1;c.id=b;if(c.src){c.src=_16(c.src||b);_2[c.src]=c}}c.req&&_4.push.apply(_4,_13(c.req));_4.push(c)}}}return _4},_0=[],_10=function(){var a,i=_0.length;if(i>=R.joinLim){var b=[];while(i--){b.unshift(R.getJoinUrl(_0[i]))}a={src:_3.replace(s,b.join(R.joint||'')),_17:_0};_0=[]}else{a=_0.shift();a._15=1}return a},_7=function(){if(_11=!!(d.length||_0.length)){var b=d.shift()||_10();if(typeof b=='function'){if(_0.length){d.unshift(b);b=_10()}else{_8=1;b();_8=b=0}}if(b&&!b._5){if(b.check&&b.check()){b._5=1}else{if(b.join===true&&!b._15){_0.push(b)}else{if(_0.length&&!b._15){d.unshift(b);b=_10()}if(b.src){var c=document.createElement('script');if(b.charset){c.charset=b.charset}c.src=b.src;c.onload=c[_14]=function(){if(!c.readyState||/^(loaded|complete)$/.test(c.readyState)){c[_14]=c.onload=null;var a=b._17||[b];for(var i=0,_6;(_6=a[i]);i++){_6._5=1;_6.onload&&_6.onload()}_7()}};_9.appendChild(c);return}b._5=1}}}_7()}},_8,_11,_9,_1,_3,s='%{s}',R=Req=function(){_1=R.baseUrl||'';_1=_1+(_1.indexOf(s)==-1&&s||'');_3=R.joinUrl||'';_3=_3+(_3.indexOf(s)==-1&&s||'');_9=_9||document.getElementsByTagName('head')[0];var a=_13([].slice.call(arguments,0)),i=a.lengthM;while(i--){a[i]._12=0}d[_8?'unshift':'push'].apply(d,a);if(!_11){_7()}};R.fixUrl=function(a){return/^(\/|https?:)/.test(a)?a:(_1).replace(s,a)};R.getJoinUrl=function(a){return a.src.replace(_1.split(s)[0],'')};R.joinLim=1;R.join;R.assets={}})();
