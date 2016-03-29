[<img src="http://www.suitjs.com/img/logo-suitjs.svg?v=2" width="256" alt="SuitJS">](http://www.suitjs.com/)
# Servant

Optimize your heavy work with a Servant's help.
  
* Servant allows the creation of update loops
* Its uses the `requestAnimationFrame` API
  * Still, fallbacks to `setInterval` if needed
* It keeps working consistently when the window blurs
  * RAF runs at 1FPS while the window isn't focused
* Handle high number of operations by distributing them in more frames
* Can work as a mini game engine
* Can be used for tween and animation features
* Integrates with [SuitJS](http://www.suitjs.com) notifications

# Install
#### Download
* Download either the `servant.js` or `servant.min.js` sources.
* Add the tag `<script src="js/suitjs/servant.js"></script>`

#### Bower
* Servant is available as bower package.
* Run `bower install suitjs-servant`
* It will install all script versions.
* Add the tag `<script src="bower_components/suitjs-servant/js/servant.js"></script>`

#### CDN
* TBD

# Usage
After adding the script tag, the `Servant` global variable will be available.  
 
#### Hello World

Servant is really simple to use. Just follow the snippets bellow:

** Custom Update Callback **
* More about [ServantUpdateNode](http://www.suitjs.com/docs/servant/global.html#ServantUpdateNode)  

```js
//Will log 3 seconds of execution.
//Use the 'node' argument to get more information.
Servant.run(function(node) { 
    console.log(node.elapsed);
    if(node.elapsed>=3.0) console.log("finished!"); 
},3);

//Will trigger a 'update.game' SuitJS notification on all its Controllers
//The 'duration' will last 2^32 seconds :)
Servant.run("update.game",0xffffff);

//Will wait 3 seconds and trigger the function.
//Arguments can be passed in an array at the end.
Servant.delay(function(p0,p1) {
    console.log(p0+" "+p1);
},3.0,["Triggered","Now!"]);

//Target
var o = { count: 0 };
//Will wait 3s and set 'o.count = 10'
Servant.set(o,"count",10,3);
 
var list = [1,2,3,4,5,6];

//Will handle 1 element per frame.
//See the time stamp per iteration
Servant.iterate(function (it,i,len) {
    console.log(i+"> "+it+" @ "+Time.elapsed);
},list,1);

//Will handle 2 elements per frame.
//See the time stamp per iteration
Servant.iterate(function (it,i,len) {
    console.log(i+"> "+it+" @ "+Time.elapsed);
},list,2);

//Custom node
//Runs for 3s and stop.
var duration = 3.0;
var n=null;
n =  {
  update: function() {
      duration -= Time.delta; //Decrements the duration
      if(duration<=0) Servant.remove(n);
  }  
};

Servant.add(n);

```

# Documentation
For in depth information of the API, visit the **[documentation](http://www.suitjs.com/docs/lapel/)**. 

# Examples
Usage examples can be found at **[CodePen](http://codepen.io/collection/XOyEpq/)**.