// Req.js v1.0 - MIT/GPL Licensed - More info: http://mar.anomynet/entries/2009/10/20/23.39.22/
(function(b,c,e,a){if(b[c]==null&&b[e]){b[c]="loading";b[e](a,e=function(){b[c]="complete";b.removeEventListener(a,e,!1)},!1)}})(document,"readyState","addEventListener","DOMContentLoaded");
(function(l,x){var k=[],t='onreadystatechange',j='onload',u=function(b){var c,e=g.assets,a=g.fixUrl,f=[];for(var q=0,w=b.length;q<w;q++){var d=b[q];if(typeof d=='function'){f.push(d)}else if(d&&d!==true){if(d.charAt){c=d;d=e[c]||(e[c]=(e[a(c)]||{src:c}))}else{c=d.id||d.src;e[c]=e[c]||d}if(!d._1&&!d._0){d._1=1;if(!d._3){d._3=1;if(d.src){d.src=a(d.src);e[d.src]=d}var n=d.req;if(n&&n.charAt){d.req=[n]}}n&&f.push.apply(f,u(d.req));f.push(d)}}}return f},h=[],o=function(){var b,c=h.length;if(c>=g.joinLim){var e=[];while(c--){if(h[c].src){e.unshift(g.getJoinStub(h[c]))}}b={src:p.replace(i,e.join(g.joint||'')),_4:h};h=[]}else{b=h.shift();b._2=1}return b},r=function(){if(v=!!(k.length||h.length)){var a=k.shift()||o();if(typeof a=='function'){if(h.length){k.unshift(a);a=o()}else{a();a=l}}if(a&&!a._0){if(a.check&&a.check()){if(h.length&&a[j]){k.unshift(o(),a)}else{a._0=1;if(a[j]){a[j]();a[j]=l}}}else{if((a.join===true||!a.src)&&!a._2){h.push(a)}else{if(h.length&&!a._2){k.unshift(a);a=o()}if(a.src){var f=document.createElement('script');f.charset=a.charset||g.charset||l;f.src=a.src;f[j]=f[t]=function(){if(!f.readyState||/^(loaded|complete)$/.test(f.readyState)){f[t]=f[j]=l;var b=a._4||[a];for(var c=0,e;(e=b[c]);c++){e._0=1;e[j]&&e[j]();e[j]=l}setTimeout(function(){r()},0)}};s.appendChild(f);return}a._0=1}}}r()}},v,s,m,p,i,g=Req=function(b){i=i||g.urlToken||'%{s}';m=g.baseUrl||i;m+=m.indexOf(i)>-1?'':i;p=g.joinUrl||i;p+=p.indexOf(i)>-1?'':i;s=s||document.getElementsByTagName('head')[0];var c=u([].slice.call(arguments,0)),e=c.length;while(e--){delete c[e]._1}k[b===true?'push':'unshift'].apply(k,c);setTimeout(function(){if(!v){r()}},0)};g.joinLim=1;g.fixUrl=function(b){return/^(\.?\/|https?:)/.test(b)?b:m.replace(i,b)};g.getJoinStub=function(b){return b.src.replace(m.split(i)[0],'')};g.assets={}})(null);
