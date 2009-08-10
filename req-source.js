/*
  **** Req ****
  Dependency handling and lazy script-loading library.
  Standalone (no depeneencies) - defines a single object `Req` in the global scope.
  
  Concept based on JSLoad: http://www.instructables.com/blog/B2OLM73F5LDFN2Z/ with some ideas from Dojo.require and YUI 3.0 thrown into the mix.

  Usage crash-course:

      Req.baseUrl = '/js/';

      // (See documentation for Req.assets objects, way deep below.)
      Req.assets['base library'] = {
        src: 'baselib.js',
        check: function(){ return !!window.baseLib; }
      };
      Req.assets['my script'] = {
        src: 'myscript.js',
        req: ['base library'],
        check: function(){ return !!window.myScript; }
      };

      var asset1 =  'my script',
          asset2 =  'http://other.server.com/js/script.js',
          asset3 = { 
              src: 'http://yet.another.server.com/js/otherscript.js',
              req: ['baselib.js']
              check: function(){ return !!window.otherScript; }
            },
          callback = function(){ alert('Do stuff with `my script` and `asset`'); },
          callback = function(){ alert('Do stuff with `my script` and `asset` and `asset2`); };

      Req(
          asset,
          asset2,
          callback,
          asset2,
          callback2
        );


  TODO:
    * Look into doing parallel downloading with DOM Node injection in normal browsers but using 'defer' in MSIE
      As per suggestions in this article: http://www.stevesouders.com/blog/2009/04/27/loading-scripts-without-blocking/
    * Look into making assets groupable - so that each group has its own baseUrl and joining rules/parameters.

*/
(function(){

// -------------------------------------------------------------------------------
// Private Methods/Properties:
// -------------------------------------------------------------------------------
  var _queue = [], // THE PROCESSING QUEUE!! Mother of all...
      _onreadystatechange = 'onreadystatechange', // string cache to cut down minified file-size
      _onload = 'onload',                         // string cache to cut down minified file-size

      // prep (normalize) the asset array (arguments) passed to the Req() function.
      // runs recursively to resolve `.req` dependency information, and fold those assets back into the returned queue-stub
      _prepQueue = function (queueStub)
      {
        var assetId,
            _allAssets = R.assets,
            _fixUrl = R.fixUrl,
            _fixedQueueStub = [];

        // loop through the queueStub
        for (var i=0,l=queueStub.length; i<l; i++)
        {
          var asset = queueStub[i];
         
          if (typeof asset == 'function')
          {
            // push functions onto the _fixedQueueStub and do nothing further. - Next please!
            _fixedQueueStub.push(asset);
          }
          else if (asset)
          {
            // if the asset is an humble String (i.e. a friendly id/handle or a URL)
            if (asset.charAt)
            {
              // ...let's call it assetId
              assetId = asset;
              // ...and then make asset into a real Asset Object.
              // first checking if it already exists in R.assets (_allAssets)
              // either under it's current name, or (in case assetId is a URL) under the name of a normalized URL (_fixUrl)
              // and if not, then create a simple {src:assetId} asset object, and immediately insert it into the database for future reference.
              asset = _allAssets[assetId] || ( _allAssets[assetId] = (_allAssets[_fixUrl(assetId)] || { src : assetId }) );
            }
            else
            {
              // assume `asset` is an Asset Object (since it's not a Function or a String)
              // derive assetId from the asset.
              assetId = asset.id || asset.src;
              // and insert it into the R.assets database (_allAssets) if it's not already there.
              _allAssets[assetId] = _allAssets[assetId] || asset;
            }

            // if this is the first we see of this asset, during this recursive run of _prepQueue.
            // (And if it's not already _loaded)
            if (!asset._encountered && !asset._loaded)
            {
              // then start normalizing it.
              // First off, raise the _encountered flag to avoiding infinite requirement loops.
              asset._encountered = 1;
              // check if it's already _processed (normalized) by _prepQueue in an earlier run.
              if (!asset._processed)
              {
                // mark it as _processed
                asset._processed = 1;
                // enforce that the asset has .id
                asset.id = assetId; 
                // NOTE: Some assets may have no URL themselves - only a list of requirements.
                // If there is a .src (URL), however, then...
                if (asset.src)
                {
                  // normalize the URL
                  asset.src = _fixUrl(asset.src);
                  // and store an extra reference to the asset under the name of .src
                  //  - to ensure that lookup by script URL works as well.
                  _allAssets[asset.src] = asset;
                }
                // Enforce that the dependency list must be Array
                var req = asset.req;
                if (req && req.charAt)
                {
                  asset.req = [req];
                }
              }
              // if there are any dependencies listed (req), then (recursively) run that Array through _prepQueue 
              // and append the normalized/_processed results to the _fixedQueueStub.
              req && _fixedQueueStub.push.apply( _fixedQueueStub, _prepQueue(asset.req) );
              // finally push the asset onto the _fixedQueueStub
              _fixedQueueStub.push(asset);
            }
          }
        }
        // return a neatly normalized Array of nice asset objects.
        return _fixedQueueStub;
      },


      // holds a list of assets that should be joined in one mega-URL for faster download (saving HTTP overhead).
      _joinBuffer = [],

      // flushes the _joinBuffer.
      // Guaranteed to return an asset object.
      _bufferFlush = function () {

        var asset,
            i = _joinBuffer.length;

        if (i>=R.joinLim)
        {
          // there are more than the minimum number of assets in the buffer, so we proceed to join them into one resource!
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
          // empty the _joinBuffer
          _joinBuffer = [];
        }
        else
        {
          // return only the first item off the _joinBuffer.
          // if the _joinBuffer contains multiple items (R.joinLim is larger than 1) we rely on
          // _processNext to run _bufferFlush again and thus slowly empty the _joinBuffer one asset at a time.
          asset = _joinBuffer.shift();
          // politely tell _processNext to not place this asset back in the _joinBuffer, but load it directly!
          asset._alreadyBeenInJoinBuffer = 1;
        }
        return asset;
      },


      _processNext = function () {

        // don't to anything if both the _queue and _joinBuffer are empty.
        // NOTE: how the _isRunning flag is set inline. (to save precious bytes :-)
        if (_isRunning = !!(_queue.length || _joinBuffer.length))
        {
          // if the _queue is empty, then use the (combined) contents of the _joinBuffer
          var asset = _queue.shift() || _bufferFlush();
          // check if it's a function that needs to be run.
          if (typeof asset == 'function')
          {
            // before running any functions, make sure to flush the _joinBuffer
            if (_joinBuffer.length)
            {
              // stash the function asset back into the _queue
              _queue.unshift(asset);
              // and replace the `asset` variable with the _bufferFlush output (and continue as if nothing happend!)
              asset = _bufferFlush();
            }
            else
            {
              // run the function
              asset();
              asset = null; // set asset to null to avoid entering the condition block below (and save bytes+cycles on a second `typeof` check)
            }
          }
          // make sure this asset isn't `null` and isn't already loaded
          if (asset  &&  !asset._loaded)
          {
            // check to see if the asset is already loaded (usually by other means, such as inline <script /> tag, etc.)
            if (asset.check && asset.check())
            {
              // We always need to flush the _joinBuffer before we run `.onload()`
              // otherwise bad things may happen.
              if (_joinBuffer.length && asset[_onload])
              {
                // reinsert asset into the _queue, and place the _bufferFlush output infront of that
                // so that it gets loaded first.  After that the current asset get's reprocessed and finally as its `.onload` run
                _queue.unshift(_bufferFlush(), asset);
              }
              else
              {
                asset._loaded = 1;
                if (asset[_onload])
                {
                  asset[_onload]();
                  asset[_onload] = null; // why? can't remember... sorry :-(  But probably to release memory, and make double-sure that .onload doesn't run twice.
                }
              }
            }
            else
            {
              // make sure the asset is joinable, and hasn't _alreadyBeenInJoinBuffer and then...
              // stash it away in the _joinBuffer for later processing - en masse.
              // NOTE: (we do this even if the asset doesn't have a .src - because it might be a group-asset 
              //       defining a bunch of `.req`s,  and even have an `.onload` event that needs to be run
              //       at the appropriate hour.
              if ((asset.join===true || !asset.src)  &&  !asset._alreadyBeenInJoinBuffer)
              {
                _joinBuffer.push(asset);
              }
              else
              {
                // ok, here we have an asset that needs to be loaded,
                // but we may not do that directly if there's stuff in the _joinBuffer
                if (_joinBuffer.length && !asset._alreadyBeenInJoinBuffer)
                {
                  // stash the asset back into the _queue
                  _queue.unshift(asset);
                  // and replace the `asset` variable with the _bufferFlush output (and continue as if nothing happend!)
                  asset = _bufferFlush();
                }
                // ...now with whatever asset the previous conditional-block left us with (might be a _bufferFlush)
                // ...check if it has .src and load it
                if (asset.src)
                {
                  var scriptElm = document.createElement('script');
                  //scriptElm.defer = !0; // <--- DEBUG/Development leftovers
                  if (asset.charset) { scriptElm.charset = asset.charset; }
                  scriptElm.src = asset.src;
                  scriptElm[_onload] = scriptElm[_onreadystatechange] = function()
                  {
                    if (!scriptElm.readyState || /^(loaded|complete)$/.test(scriptElm.readyState))
                    {
                      scriptElm[_onreadystatechange] = scriptElm[_onload] = null;
                      // define a list of what was just loaded (might be a bunch of assets, via a joined script url from the _joinBuffer)
                      var _loads = asset._loads || [asset];
                      for (var i=0, _loadAsset; (_loadAsset = _loads[i]); i++)
                      {
                        // loop through the list and mark each item as _loaded and run `.onload` callbacks as needed
                        _loadAsset._loaded = 1;
                        _loadAsset[_onload] && _loadAsset[_onload]();
                        _loadAsset[_onload] = null; // why? See comment a couple of screenfuls up...^^^^
                      }
                      // recurse!!
                      _processNext();
                    }
                  };
                  _headElm.appendChild(scriptElm);
                  // return without recursing ... because now we're playing The Waiting Game with the <script> we've just inserted
                  return;
                }
                // else - asset has no src URL - must be a simple requirement-package....
                asset._loaded = 1;
              }
            }
          }
          // recurse!!
          _processNext();
        }
      },


      _isRunning,  // flag to indicate that _processNext is indeed running - only waiting for a <script> to load.
      _headElm,    // cached reference to the <head> element
      _baseUrl,    // cached *normalized* value of Req.baseUrl
      _joinUrl,    // cached *normalized* value of Req.joinUrl
      s,           // cached value of Req.urlToken  



// -------------------------------------------------------------------------------
// Defining The Req Namespace:
// -------------------------------------------------------------------------------

  R = Req = function () {  // (also create a reference to Req from a minifiable local variable `R`)
    s = s || R.urlToken || '%{s}'; // default Req.urlToken to a value of '%{s}'
    // normalize the baseUrl
    _baseUrl = R.baseUrl || s;
    _baseUrl += _baseUrl.indexOf(s)>-1 ? '' : s; // enforce+append the mandatory %{s}

    // normalize the joinUrl
    _joinUrl = R.joinUrl || s;
    _joinUrl += _joinUrl.indexOf(s)>-1 ? '' : s; // enforce+append the mandatory %{s}

    // find + store/cache the <head> element
    _headElm = _headElm || document.getElementsByTagName('head')[0];
    // prep (normalize) the assets in the arguments array.
    var _queueStub = _prepQueue( [].slice.call(arguments, 0) ),
        i = _queueStub.length;
    // delete temporary "_encountered" markers inserted by _prepQueue (to avoid infinite `.req`uirement loops)
    // subsequent runs of Req() might want to jump the queue with some of the same assets,
    // and in that case we don't want _prepQueue to skip them.
    while(i--) { delete _queueStub[i]._encountered; }

    // always stack new _queueStubs at the beginning of the _queue, for immediate processing!
    _queue.unshift.apply(_queue, _queueStub);

    // if we're not waiting for a <script> to load, then start to _processNext item in the _queue
    if (!_isRunning) { _processNext(); }
  };


// -------------------------------------------------------------------------------
// Public (Overloadable) Methods/Properties:
// -------------------------------------------------------------------------------

  //R.urlToken = '%{s}';  // replacement pattern for inserting relative asset.src urls into _baseUrl and _joinUrl
  //R.baseUrl  = '';      // Example: 'http://www.server.com/scripts/%{s}.js';  <--  the first occurrence of Req.urlToken gets replaced by an `asset`'s `.src` value.
  //R.joinUrl  = '';      // Example: 'http://www.server.com/join/%{s}'              (if the urlToken is missing, it gets appended to the Url)
  //R.joint    = '';
  R.joinLim = 1;        // minimum number of items in the _joinBuffer for joining to occur


  // Req.fixUrl() is used by _prepQueue() to normalize assset.src values and add a default _baseUrl to relative paths.
  R.fixUrl = function (url)
  {
    return /^(\.?\/|https?:)/.test(url) ? url : _baseUrl.replace(s, url);
  };

  // Req.fixUrl() is used by _bufferFlush(), and returns the joinURL stub for the given asset.
  // Defaults to returning whatever comes after _baseUrl in a normalized asset.src
  R.getJoinUrl = function (asset)
  {
    return asset.src.replace(_baseUrl.split(s)[0], '');
  };


  // Req's asset database
  R.assets  = {
  /*
      'My Asset ID' : {  // Friendly id/name for this asset. Each resource is also indexed by it's URL (the `src` property)
        id      : 'My Asset ID',                                     // Optional friendly id/name for the assset. (Only ever used when passing asset objects as paramters to the Req() function)
        req     : ['Asset name', 'Asset name 2'],                    // List of assets this asset depends on, each of which may depend on other assets, etc. etc.
        check   : function () { return !!window.myScriptObject; },   // Function to determine wheather this resource has alreay been loaded (via other means, such as, direct <script> tags, etc.)
        src     : 'js/myscript.js',                                  // The actual URL to the javascript file (this value is autogenerated )
        charset : 'utf-8'                                            // charset -- if such nonsense if required for your scripts to run (common for mixed charset environments on old MSIE browsers).
      }
  */
  };



})();


