// Req.js v1.0 - MIT/GPL Licensed - More info: http://mar.anomynet/entries/2009/10/20/23.39.22/
(function(v){var k=[],s='onreadystatechange',j='onload',t=function(e){var c,d=g.assets,a=g.fixUrl,f=[];for(var p=0,w=e.length;p<w;p++){var b=e[p];if(typeof b=='function'){f.push(b)}else if(b&&b!==true){if(b.charAt){c=b;b=d[c]||(d[c]=(d[a(c)]||{src:c}))}else{c=b.id||b.src;d[c]=d[c]||b}if(!b._1&&!b._0){b._1=1;if(!b._3){b._3=1;if(b.src){b.src=a(b.src);d[b.src]=b}var m=b.req;if(m&&m.charAt){b.req=[m]}}m&&f.push.apply(f,t(b.req));f.push(b)}}}return f},h=[],n=function(){var e,c=h.length;if(c>=g.joinLim){var d=[];while(c--){if(h[c].src){d.unshift(g.getJoinStub(h[c]))}}e={src:o.replace(i,d.join(g.joint||'')),_4:h};h=[]}else{e=h.shift();e._2=1}return e},q=function(){if(u=!!(k.length||h.length)){var a=k.shift()||n();if(typeof a=='function'){if(h.length){k.unshift(a);a=n()}else{a();a=null}}if(a&&!a._0){if(a.check&&a.check()){if(h.length&&a[j]){k.unshift(n(),a)}else{a._0=1;if(a[j]){a[j]();a[j]=null}}}else{if((a.join===true||!a.src)&&!a._2){h.push(a)}else{if(h.length&&!a._2){k.unshift(a);a=n()}if(a.src){var f=document.createElement('script');f.charset=a.charset||g.charset||v;f.src=a.src;f[j]=f[s]=function(){if(!f.readyState||/^(loaded|complete)$/.test(f.readyState)){f[s]=f[j]=null;var e=a._4||[a];for(var c=0,d;(d=e[c]);c++){d._0=1;d[j]&&d[j]();d[j]=null}setTimeout(function(){q()},0)}};r.appendChild(f);return}a._0=1}}}q()}},u,r,l,o,i,g=Req=function(e){i=i||g.urlToken||'%{s}';l=g.baseUrl||i;l+=l.indexOf(i)>-1?'':i;o=g.joinUrl||i;o+=o.indexOf(i)>-1?'':i;r=r||document.getElementsByTagName('head')[0];var c=t([].slice.call(arguments,0)),d=c.length;while(d--){delete c[d]._1}k[e===true?'push':'unshift'].apply(k,c);if(!u){q()}};g.joinLim=1;g.fixUrl=function(e){return/^(\.?\/|https?:)/.test(e)?e:l.replace(i,e)};g.getJoinStub=function(e){return e.src.replace(l.split(i)[0],'')};g.assets={}})();
