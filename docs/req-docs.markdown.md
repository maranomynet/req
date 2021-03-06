<!-- encoding: utf-8 -->

# Req.js - javascript lazy-loading and dependency managment made easy

_Version: 1.0_

Req.js is a simple, easy to use, full-featured library to handle lazy-loading and dependency management of Javascript.
It's a standalone javascript library (no dependencies) and defines only a single object `Req` in the global scope.

The concept is loosely based on [JSLoad][1] with some ideas from [Dojo.require][2] and early [YUI 3.0 alphas][3] thrown into the mix.

It's stable and thoroughly tested in production environment on over one hundred live websites since 2008.

  [1]: http://www.instructables.com/blog/B2OLM73F5LDFN2Z/
  [2]: http://docs.dojocampus.org/dojo/require
  [3]: http://www.yuiblog.com/blog/2009/09/29/yui-3-0-0/


### Key Features:

  * Loads scripts asynchronously, with callbacks ...
     * Ensuring all scripts execute in the correct order.
  * Resolves and loads script dependencies.
     * Handles circular dependencies gracefully.
  * Avoids loading the same script twice.
     * Supports custom checks for the pre-presence of each script asset.
  * Allows mixing of local and remotely-hosted scripts.
  * Supports nested calls.
  * Allows for joining multiple assets into one "combo" HTTP request. (if supported by your server)

Also:

  * Highly configurable.
  * Cross-browser and no external dependencies.
  * Fast (no evals)
  * Tiny! (less than 1 kB gzipped)

---------

## Documentation

For a crash course in using Req.js, visit the **[demo page](../demo/req-demo.html)** and inspect its source code.

### Using the `Req()` function;

The library's core function, `Req()`, accepts any number of parameters.

The parameters may be a combination of:

  * `String`   - Script URLs (either absolute or relative).
  * `Function` - Callback functions that run as soon as the preceding scripts have loaded.
  * `Object`   - "Asset objects" that contain a script URL, charset info, dependency list, etc. (see below for more info).
  * `String`   - "Asset object ID"s that refer to a previously defined "Asset object".

All parameters are processed (i.e. loaded or run) in the order they're passed.

`Req()` maintains a single processing queue, so nested and/or independently repeated calls to `Req()` add their list of requirements to the front of the master queue -- like so:

    Req(A, B, C, function(){ Req(D, E); }, F);
    Req(G, H, I);
    
    // Will be processed in this order:
    //   G, H, I,   A, B, C,   D, E,   F

However, an optional first parameter of `true` will instruct `Req()` to *append* those parameters to the master queue -- like so:

    Req(A, B, C);
    Req(D, E, F);
    Req(true, G, H, I);
    
    // Will be processed in this order:
    //   D, E, F,   A, B, C,   G, H, I  


### "Asset objects" and `Req.assets`

`Req()` keeps a database of "asset objects" to track which scripts have been loaded, what their dependencies are, etc.

Every URL you pass as a parameter is automatically turned into a simple asset object and stored in `Req.assets`.

    var myurl = 'http://code.jquery.com/jquery-latest.js';
    
    alert ( typeof Req.assets[myurl] );  // 'undefined'

    Req( myurl, mycallbackfn );

    var myAsset = Req.assets[myurl];
    alert ( typeof myAsset );      // "object"
    alert ( myAsset.toSource() );  // { src: 'http://code.jquery.com/jquery-latest.js' }
    
You can store asset objects under a friendly id/label in the `Req.assets` database, and then refer to the asset using that label...

    Req.assets['jQuery latest'] = {
        src: 'http://code.jquery.com/jquery-latest.js'
      };
    
    Req( 'jQuery latest', mycallbackfn );



### Asset object properties

Asset objects may contain the following properties:

**`src`**  (String)
:   The actual URL to the javascript file.<br />
    Relative URLs get normalized with `Req.fixUrl` and `Req.baseUrl` - while URLs starting with `http(s)://`, `/`, and `./` are left untouched.

**`check`**  (Function)
:   Function that returns true/false that determine whether this resource has already been loaded (via other means, such as, direct `<script>` tags, etc.)

**`req`**  (Array)
:   List of assets objects (or asset IDs or URLs) that this asset depends on -- each of which may depend on other assets, etc. etc.

**`onload`**  (Function)
:   Callback function (onload event handler) to run when the asset has loaded for the first time. (Useful for running inits methods.)

**`charset`**  (String)
:   Character encoding of the script file - e.g. `"utf-8"`. (Useful for mixed charset environments on old MSIE browsers - which ignore HTTP charset headers sent by server.)

**`join`**  (Boolean - default: `false`)
:   Can this asset be joined with others into a single HTTP request (see `Req.joinUrl` and `Req.getJoinUrl` properties below).

**`id`**  (String)
:   Friendly id/name for the asset. (Only used when passing asset objects as parameters to the Req() function)



### `Req` configuration properties

The following properties are available to configure the basic behaviour of Req.js.

**`Req.urlToken`**  (default: `'%{s}'`)
:   Replacement pattern for inserting relative asset.src urls into _baseUrl and _joinUrl

**`Req.baseUrl`**  (default: `''`)
:   URL string used for normalizing relative asset URLs<br />
    Example: `'http://www.server.com/scripts/%{s}.js'`  ... the first occurrence of `Req.urlToken` gets replaced by an `asset`'s `.src` value.  (If the urlToken is missing, it gets appended to the URL.)

**`Req.joinUrl`**  (default: `''`)
:   URL string used for constructing "combo" URLs for joining multiple assets into a single HTTP request.<br />
    Example: `'http://www.server.com/join/?%{s}'` (See notes for `Req.baseUrl` above.)

**`Req.joint`**  (default: `''`)
:   String token to separate the script URL-stubs/labels as they get inserted into the `joinUrl`.<br />
    Example: `'|'`   ... which might result in a combo URL similar to this: `'http://www.server.com/join/?script1|script2|script3|script4'`

**`Req.joinLim`**  (default: `1`)
:   Minimum number of consecutive join-able items needed for joining to occur. (Otherwise fall back to normal single-file loading.)

**`Req.fixUrl`**  (Function)
:   Function used internally to normalize asset `.src` values into real URLs.<br />
    Accepts a raw URL as a parameter, and returns a "fixed" (normalized) URL.<br />
    Default behavior: Relative paths are supplemented with the `baseUrl`. Other URLs are left untouched.

**`Req.getJoinUrl`**  (Function)
:   Function used to get the combo URL-stub/label for the given asset.<br />
    Accepts an asset object as a parameter, and returns a combo URL-stub/label, that gets inserted (along with others) into the `joinUrl`.<br />
    Default behavior: Returns whatever comes after `baseUrl` in a normalized asset URL.

**`Req.assets`**  (default: `{}`)
:   Container (Object) for Asset objects (see info in a previous chapter).

**`Req.charset`**  (default: `''`)
:   A default `charset=""` attribute value for the `<script />` elements when they're inserted into the page.




---------

## Downloads & Links

**Download:**

  * [Download the latest version](http://github.com/maranomynet/req/archives/master) (Zip)

**Documentation home:**

  * <http://mar.anomy.net/entry/2009/10/20/23.39.22/>

**Source updates:**

  * <http://github.com/maranomynet/req/>
  * [git://github.com/maranomynet/req.git](git://github.com/maranomynet/req.git)


---------

## Copyright & Licensing

Copyright (c) 2009 [Már Örlygsson][mar] and [Hugsmiðjan ehf][hsm].

Dual licensed under a [MIT license][mit] and [GPL 2.0][gpl] (or above).

  [mit]: http://en.wikipedia.org/wiki/MIT_License
  [gpl]: http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
  [hsm]: http://www.hugsmidjan.is
  [mar]: http://mar.anomy.net/

