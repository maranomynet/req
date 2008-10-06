// Concept based on JSLoad: http://www.instructables.com/blog/B2OLM73F5LDFN2Z/
(function(){

  var _queue = [],
      _onreadystatechange = 'onreadystatechange',

      _prepQueue = function (queue)
      {
        var assetId,
            _assets = R.assets,
            _fixedQueue = [];

        for (var item, i=0; (item = queue[i]); i++)
        {
          if (typeof item == 'function')
          {
            _fixedQueue.push(item);
          }
          else 
          {
            if (item.charAt)
            {
              // item is a String 
              // ...let's rename it assetId and make item into an Asset Object.
              assetId = item;
              item = _assets[assetId] || ( _assets[assetId] = (_assets[_fixUrl(assetId)] || { src : assetId }) );
            }
            else
            {
              // item is an Asset Object
              assetId = item.name || item.src;
              _assets[assetId] = _assets[assetId] || item;
            }

            if (!item._loaded)
            {
              if (!item._processed)
              {
                item._processed = 1;
                //item.name = assetId; // unneccessary, but uniformity is nice?
                item.src = _fixUrl(item.src || assetId);
                item.req && (item.req = _prepQueue(item.req));
                _assets[item.src] = item; // ensure that lookup by script URL works as well.
              }
              _fixedQueue.push(item);
            }

          }
        }
        return _fixedQueue;
      },


      _fixUrl = function (url)
      {
        return /^(\/|https?:)/.test(url) ? url : (R.baseUrl||'%s').replace(/%s/, url);
      },


      _processNext = function ()
      {
        if (R._isRunning = !!_queue.length)
        {
          var asset = _queue.shift();
          if (typeof asset == 'function')
          {
            asset();
          }
          else
          {
            if (!asset._loaded)
            {
              if (asset.check && asset.check())
              {
                asset._loaded = 1;
              }
              else
              {
                if (asset.req && asset._processed < 2)
                {
                  // Crude way of avoiding repeats && circles.
                  asset._processed = 2;
                  _queue.unshift(asset);
                  _queue.unshift.apply(_queue, asset.req);
                }
                else
                {
                  var scriptElm = document.createElement('script');
                  if (asset.charset) { scriptElm.charset = asset.charset; }
                  scriptElm.onload = scriptElm[_onreadystatechange] = function()
                  {
                    if (!scriptElm.readyState || /^(loaded|complete)$/.test(scriptElm.readyState))
                    {
                      scriptElm[_onreadystatechange] = scriptElm.onload = null;
                      asset._loaded = 1;
                      _processNext();
                    }
                  };
                  scriptElm.src = asset.src;
                  _headElm.appendChild(scriptElm);
                  return;
                }
              }
            }
          }
          _processNext();
        }
      },
      
      _headElm,

      R = Req = function ()
      {
        _headElm = _headElm || document.getElementsByTagName('head')[0];
        _queue.unshift.apply(_queue,  _prepQueue( [].slice.call(arguments, 0) ) );
        if (!R._isRunning) { _processNext(); }
      };


  //R.baseUrl = '';
  R.assets  = {
  /*
      'My Asset ID' : {
        name    : 'My Asset ID',
        req     : ['Asset name', 'Asset name 2'],
        check   : function () { return !!window.myScriptObject; },
        src     : 'js/myscript.js',
        charset : 'utf-8'
      }
  */
  };



})();


