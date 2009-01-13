// Concept based on JSLoad: http://www.instructables.com/blog/B2OLM73F5LDFN2Z/
(function(){

  var _queue = [],
      _onreadystatechange = 'onreadystatechange',


      _prepQueue = function (queue)
      {
        var assetId,
            _allAssets = R.assets,
            _fixUrl = R.fixUrl,
            _fixedQueue = [];

        for (var i=0,l=queue.length; i<l; i++)
        {
          var asset = queue[i];
         
          if (typeof asset == 'function')
          {
            _fixedQueue.push(asset);
          }
          else if (asset)
          {
            if (asset.charAt)
            {
              // asset is a String 
              // ...let's rename it assetId and make asset into an Asset Object.
              assetId = asset;
              asset = _allAssets[assetId] || ( _allAssets[assetId] = (_allAssets[_fixUrl(assetId)] || { src : assetId }) );
            }
            else
            {
              // asset is an Asset Object
              assetId = asset.id || asset.src;
              _allAssets[assetId] = _allAssets[assetId] || asset;
            }

            if (!asset._queued && !asset._loaded)
            {
              asset._queued = 1; // this is a flag for avoiding infinite requirement loops.
              if (!asset._processed)
              {
                asset._processed = 1;
                asset.id = assetId; 
                if (asset.src) // Assets may have no URL themselves - only a list of requirements.
                {
                  asset.src = _fixUrl(asset.src || assetId);
                  _allAssets[asset.src] = asset; // ensure that lookup by script URL works as well.
                }
                if (asset.req)
                {
                  asset.req = asset.req.charAt ? [asset.req] : asset.req;
                }
              }
              asset.req && _fixedQueue.push.apply( _fixedQueue, _prepQueue(asset.req) );
              _fixedQueue.push(asset);
            }
          }
        }
        return _fixedQueue;
      },


      _joinBuffer = [],
      _bufferFlush = function ()
      {
        var asset,
            i = _joinBuffer.length;

        if (i>=R.joinLim)
        {
          var _concatUrls = [];
          while (i--)
          {
            if (_joinBuffer[i].src)
            {
              _concatUrls.unshift( R.getJoinUrl(_joinBuffer[i]) );
            }
          }
          asset = {
              src:    _joinUrl.replace(s, _concatUrls.join(R.joint||'')),
              _loads: _joinBuffer
            };
          _joinBuffer = [];
        }
        else
        {
          asset = _joinBuffer.shift();
          asset._forced = 1;
        }
        return asset;
      },


      _processNext = function ()
      {
        if (_isRunning = !!(_queue.length || _joinBuffer.length))
        {
          var asset = _queue.shift() || _bufferFlush();
          if (typeof asset == 'function')
          {
            if (_joinBuffer.length)
            {
              _queue.unshift(asset);
              asset = _bufferFlush();
            }
            else
            {
              asset();
              asset = null;
            }
          }
          if (asset && !asset._loaded)
          {
            if (asset.check && asset.check())
            {
              asset._loaded = 1;
            }
            else
            {
              if ((asset.join===true || !asset.src)  &&  !asset._forced)
              {
                _joinBuffer.push(asset);
              }
              else
              {
                if (_joinBuffer.length && !asset._forced)
                {
                  _queue.unshift(asset);
                  asset = _bufferFlush();
                }
                if (asset.src)
                {
                  var scriptElm = document.createElement('script');
                  if (asset.charset) { scriptElm.charset = asset.charset; }
                  scriptElm.src = asset.src;
                  scriptElm.onload = scriptElm[_onreadystatechange] = function()
                  {
                    if (!scriptElm.readyState || /^(loaded|complete)$/.test(scriptElm.readyState))
                    {
                      scriptElm[_onreadystatechange] = scriptElm.onload = null;
                      var _loads = asset._loads || [asset];
                      for (var i=0, _loadAsset; (_loadAsset = _loads[i]); i++)
                      {
                        _loadAsset._loaded = 1;
                        _loadAsset.onload && _loadAsset.onload();
                      }
                      _processNext();
                    }
                  };
                  _headElm.appendChild(scriptElm);
                  return;
                }
                // else - asset has no src URL - must be a simple requirement-package....
                asset._loaded = 1;
              }
            }
          }
          _processNext();
        }
      },


      _isRunning,
      _headElm,
      _baseUrl,
      _joinUrl,
      s = '%{s}',

      R = Req = function ()
      {
        // normalize the baseUrl
        _baseUrl = R.baseUrl || '';
        _baseUrl = _baseUrl + (_baseUrl.indexOf(s)==-1 && s || ''); // enforce+append the mandatory %{s}

        // normalize the joinUrl
        _joinUrl = R.joinUrl || '';
        _joinUrl = _joinUrl + (_joinUrl.indexOf(s)==-1 && s || ''); // enforce+append the mandatory %{s}

        _headElm = _headElm || document.getElementsByTagName('head')[0];
        var _queueStub = _prepQueue( [].slice.call(arguments, 0) ),
            i = _queueStub.length;
        while(i--) { delete _queueStub[i]._queued; }

        _queue.unshift.apply(_queue, _queueStub);

        if (!_isRunning) { _processNext(); }
      };


  R.fixUrl = function (url)
  {
    return /^(\.?\/|https?:)/.test(url) ? url : _baseUrl.replace(s, url);
  };

  R.getJoinUrl = function (asset)
  {
    return asset.src.replace(_baseUrl.split(s)[0], '');
  };

  //R.baseUrl = '';  // Example: 'http://www.server.com/scripts/%{s}.js';  <--  %{s} will be replaced by `asset.src`
  //R.joinUrl = '';  // Example: 'http://www.server.com/join/%{s}'
  //R.joint = '';
  R.joinLim = 1;  // minimum number of items in the _joinBuffer for joining to occur


  R.assets  = {
  /*
      'My Asset ID' : {  // Friendly id/name for this asset. Each resource is also indexed by it's URL (the `src` property)
        id      : 'My Asset ID',                                     // Optional friendly id/name for the assset. (Only ever used when passing asset objects as paramters to the Req() function)
        req     : ['Asset name', 'Asset name 2'],                    // List of assets this asset depends on, each of which may depend on other assets, etc. etc.
        check   : function () { return !!window.myScriptObject; },   // Function to determine wheather this resource has alreay been loaded (via other means, such as, direct <script> tags, etc.)
        src     : 'js/myscript.js',                                  // The actual URL to the javascript file (this value is autogenerated )
        charset : 'utf-8'                                            // charset -- if such nonsense if required for your scripts to run.
      }
  */
  };



})();


