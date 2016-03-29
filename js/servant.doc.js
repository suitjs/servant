
/**
* Class that holds Time information.
* @class
* @type Time
*/
var Time = {};
(function(window,document,body) {

	"use strict";

	if (Date.now==null) { Date.now = function now() { return new Date().getTime(); } }; 		

	var m_hasPerfTime  = window.performance != null;

    /**
     * Flag that indicates if the `window.performance` method exists.
     * @type {Boolean}
     */
    Time.hasPerfTime = m_hasPerfTime;
    
    /**
     * Elapsed time in seconds since `Servant` started.
     * @type {Number}
     * @example
     * Servant.run(function(){ console.log(Time.elapsed); },3);
     */
    Time.elapsed = 0.0;
    
     /**
     * Time in seconds since the last frame.
     * @type {Number}
     * @example
     * var t=0.0;
     * Servant.run(function () {
     *    t += Time.delta;
     *    console.log(t);
     * },3);
     */
    Time.delta = 0.0;
    
    /**
     * Returns the current clock time.
     * @returns {Number} - The current time in seconds.
     * @example
     * Servant.run(function(){ console.log(Time.clock()); },3);
     */
    Time.clock = function timeClock() { return m_hasPerfTime ? window.performance.now() : Date.now(); };

})(window,document,document.body);

/**
* Class that implements `requestAnimationFrame` based features to balance heavy workloads or handle time/frame based operations.
* @class
* @type Servant
*/
var Servant = {};
(function(window,document,body) {

	"use strict";

	console.log("Servant> Init v1.0.0");
    
    /**
     * Servant node. Base object that runs on Servant's update pool.
     * @typedef {Object} ServantNode
     * @property {?Boolean} runOnBackground - Flag that indicates this node will keep running when the tab isn't focused.
     * @property {Function} update() - Execution method.     
     */

    /**
     * Flag that indicates the `requestAnimationFrame` method exists.
     * @type {Boolean}
     */
	Servant.hasReqAnimFrame = window.requestAnimationFrame != null;
	
	var RAFId = -1;
	var itvId = -1;
	
	
	var m_stepClock	       = -1.0;
	var m_rafOffset 	   = 0.0;
	var m_itvOffsetClock   = 0.0;
	var m_rafOffsetClock   = 0.0;
	var m_itvOffset 	   = 0.0;
	var m_list 			   = [];
	var m_perfOffset 	   = 0.0;
    
     /**
     * List of executing nodes.
     * @type {ServantNode[]}
     */
	Servant.list = m_list;

	//Time last tick.
	var m_timeLast = -1.0;

	//Updates the Time information.
	var m_timeUpdate = 
	function timeUpdate(t) {

		t *= 0.001;		
		if(m_timeLast < 0.0) m_timeLast = t;
		Time.delta  = Math.max(0.01,t - m_timeLast);
		m_timeLast = t;
		Time.elapsed += Time.delta;
	};

	//Main execution loop.
	var m_step =
	function step(p_time,p_visible) {			

		var a = Servant;		
		
		if (m_stepClock < 0) m_stepClock = p_time;

		var t    		 = p_time;		
		var dt   		 = Math.max(1.0,t - m_stepClock); //in ms
		
		m_stepClock 	 = t;				
		
		var steps        = p_visible ? 1 : Math.min(62,Math.max(1,Math.floor(dt / 16)));		

		for (var i=0; i<steps;i++) {
 			
			m_timeUpdate(t);
			
			//Update all stuff.
			for(var j=0; j<m_list.length;j++) {				

				var enabled = p_visible ? true : (m_list[j].runOnBackground==true);
				if(enabled) m_list[j].update();

			}
			
			if(!Time.hasPerfTime) t += 1000.0/60.0;
		}
		
		//Stops when execution list is empty.
		//if(a.m_list.length <= 0) a.stop();
	};

	//RequestAnimationFrame execution loop.
	var m_rafLoop = 
	function rafLoop(p_time)	{	

		var a = Servant;
		RAFId = window.requestAnimationFrame(m_rafLoop);		
		var t  = Time.hasPerfTime ? window.performance.now() : p_time;
		m_step(t - m_rafOffsetClock,true);		
		return true;
	};
	
    //SetIntervalLoop
	var m_itvLoop =
	function itvLoop()	{	

		var a = Servant;		
		var v = document.visibilityState != null ? (document.visibilityState != "hidden") : true;
		if(a.hasReqAnimFrame) if(v) return;				
		var t = Time.clock();
		a.step(t - m_itvOffsetClock, v);
	};
	
	//Cancels the RequestAnimationFrame loop.
	var m_cancelRAF = function cancelRAF() { if (RAFId >= 0) window.cancelAnimationFrame(RAFId); RAFId = -1; };
	
	//Cancels the setIntervalLoop.
	var m_cancelItv = function cancelItv() { if (itvId >= 0) window.clearInterval(itvId); itvId = -1; };
	
	/**
	* Start all loops.
	*/
	Servant.start =	
	function start() {  

		var a = Servant;
		a.stop();				
		
		m_stepClock = -1.0;		
		
		m_itvOffsetClock = Time.clock();
		itvId = window.setInterval(a.itvLoop, 16);		
		
		m_rafOffsetClock = Time.hasPerfTime ? window.performance.now() : 0.0;
		if (a.hasReqAnimFrame) a.RAFId = window.requestAnimationFrame(m_rafLoop);
	};

	/**
	* Stop all loops. Call `Servant.start()` to activate them again.
	*/
	Servant.stop = function stop() { var a = Servant; m_cancelItv(); if (a.hasReqAnimFrame) m_cancelRAF(); };
	
	/**
	* Clears the execution list.
	*/
	Servant.clear = function clear() { var a = Servant; a.list = m_list = []; };
    
	/**
     * Adds a Node to the execution pool.
	 * @param  {ServantNode} p_node - Reference to a execution node.
	 * @param  {?Boolean} p_run_on_background - Flag that indicates the loop will keep running when the tab isn't focused.
     * @example
     * var duration = 3.0;
     * var n = null;
     * n =  {
     *  update: function() {
     *      duration -= Time.delta; //Decrements the duration
     *      if(duration<=0) Servant.remove(n);
     *   }  
     * };
     * Servant.add(n);
	 */
	Servant.add =
	function add(p_node,p_run_on_background) {

		var a = Servant;
		if(a.list.indexOf(p_node)>=0) return;
		p_node.runOnBackground = p_run_on_background==true;
		a.list.push(p_node);
		//Starts when first element is inserted
		//if(a.m_list.length == 1) a.start();
	};
	
	/**
     * Removes a Node of the execution pool.    
	 * @param  {ServantNode} p_node - Reference to a execution node.
     * @see Servant.add	 
	 */
	Servant.remove =
	function remove(p_node)	{

		var a   = Servant;
		var idx = a.list.indexOf(p_node);		
		if(idx < 0) return null;
		var n = a.list.splice(idx,1);		
		return n;
	};

	var m_invokeCallback = 
	function invokeCallback(p_callback,p_is_str,p_complete,p_task) {

		if(p_is_str) {

			var type = p_complete ? "complete" : "update";
			window.Suit.controller.dispatch(p_callback+"@"+type,p_task);

		}
		else {
			p_callback(p_task);
		}
	};
    
    /**
     * Update node. Node used for more complex update operations. It holds more time information.
     * @typedef {Object} ServantUpdateNode
     * @property {Number} progress - Execution progress, in the range [0;1]
     * @property {Number} duration - Duration in seconds of the execution.
     * @property {Number} elapsed - Current running time in seconds. If the chosen 'delay' is positive, 'elapsed' starts negative.
     * @property {?Boolean} runOnBackground - Flag that indicates this node will keep running when the tab isn't focused.
     * @property {Function} update() - Execution method.
     */    
    
    /**
     * Callback called when the ServantNode is updated.
     * @callback ServantUpdateCallback
     * @param {ServantNode|ServantUpdateNode} p_node - Executing node.
     */ 

	/**
     * Continuously Executes a `callback` waiting `delay` and during `duration` in seconds.
	 * @param  {String|ServantUpdateCallback} p_callback - Reference to a function that will handle each update or String path compatible with `Suit` notifications.
	 * @param  {?Number} p_duration - Duration in seconds. Defaults to `0xffffff` (infinite).
	 * @param  {?Number} p_delay - Delay in seconds. Defaults to `0.0`.
	 * @param  {?Boolean} p_run_on_background - Flag that indicates the loop will keep running when the tab isn't focused.
     * @returns {ServantUpdateNode} - The created execution node.
     * @example
     * //Using 'function'.
     * Servant.run(function(node){
     *  if(node.elapsed >= 3.0) console.log("Time Out!");
     * }3);
     * 
     * //Using SuitJS (don't forget to add 'suitjs.js' on your page)
     * 
     * var c = {
     *  on: function(n) {
     *      switch(n.path) {
     *          case "servant-callback@update": console.log(n.data.elapsed); break;
     *      }
     *  }
     * };
     * 
     * SuitJS.controller.add(c);
     * 
     * Servant.run("servant-callback",3);
     * 
	 */    
	Servant.run =
	function run(p_callback,p_duration,p_delay,p_run_on_background)	{
		
		var isString = typeof(p_callback)=="string";
		if(window.Suit==null) if(isString) { console.error("Servant> Suit framework not found!"); return null; }

		var n = {};		
		n.progress = 0.0;
		n.duration = p_duration != null ? p_duration : 0xffffff;
		n.elapsed  = p_delay != null ? -p_delay : 0.0;
		n.update = 
		function() {	

			if(n.elapsed >= 0.0) m_invokeCallback(p_callback,isString,false,n);
			n.elapsed  = Math.min(n.duration,n.elapsed + Time.delta);			
			n.progress = Math.min(1.0,n.duration <= 0.0 ? 1.0 : (n.elapsed / n.duration));
			if(n.elapsed >= n.duration) { m_invokeCallback(p_callback,isString,true,n); Servant.remove(n); return;	}
		};
		Servant.add(n,p_run_on_background);
		return n;
	};

	/**
     * Waits `delay` seconds and then Executes the `callback`.
	 * @param  {String|ServantUpdateCallback} p_callback - Reference to a function that will handle each update or String path compatible with `Suit` notifications.	 
	 * @param  {?Number} p_delay - Delay in seconds. Defaults to `0.0`.
	 * @param  {?Boolean} p_run_on_background - Flag that indicates the loop will keep running when the tab isn't focused.
     * @returns {ServantUpdateNode} - The created execution node.
     * @example
     * //Using 'function'
     * //Waits 3s and calls the function with the argument list.
     * Servant.delay(function(a,b){
     *  console.log(a+" "+b); 
     * },3,["Hello","world"]);
     * 
     * //Using SuitJS
     * 
     * var c = {
     *  on: function(n) {
     *      switch(n.path) {
     *          case "servant-callback@complete": console.log(n.data[0]+" "+n.data[1]); break;
     *      }
     *  }
     * };
     * 
     * SuitJS.controller.add(c);
     * 
     * Servant.delay("servant-callback",3,["Hello","world"]);
	 */ 
	Servant.delay =
	function delay(p_callback,p_delay,p_args,p_run_on_background) {		

		var isString = typeof(p_callback)=="string";
		if(window.Suit==null) if(isString) { console.error("Servant> Suit framework not found!"); return ; }

		var al = p_args==null ? [] : p_args;
		//for(var i=3;i<arguments.length;i++) al.push(arguments[i]);		
		return Servant.run(function(n) {			

			if(isString) {				
				window.Suit.controller.dispatch(p_callback+"@complete",p_args);
			}
			else {
				p_callback.apply(window,al);
			}			

		},0.0,p_delay ? p_delay : 0.0,p_run_on_background);	
	};

	/**
     * Waits `delay` seconds and then sets the `target` `property` with `value`.
     * @param  {Object} p_target - Object to be modified.	 	 
     * @param  {String} p_property - Property of the target.
	 * @param  {Object} p_value - Value to be set.
     * @param  {?Number} p_delay - Delay in seconds. Defaults to `0.0`.
	 * @param  {?Boolean} p_run_on_background - Flag that indicates the loop will keep running when the tab isn't focused.
     * @returns {ServantUpdateNode} - The created execution node.
     * @example
     * var o = {count: 0};
     * Servant.set(o,"count",10,3); //Sets 'o.count' to 10 after 3s
	 */    
	Servant.set = 
	function set(p_target,p_property,p_value,p_delay,p_run_on_background) {

		return Servant.run(function(n) {

			p_target[p_property] = p_value;

		},0.0,p_delay==null ? 0.0 : p_delay,p_run_on_background);	
	};
    
    /**
     * Callback called when the view module is traversing its target.
     * @callback ServantIterationCallback
     * @param {Object} p_item - Current item.
     * @param {Number} p_index - Current index.
     * @param {Number} p_length - List length.     
     */        

	/**
     * Iterates a list in a thread-like routine.
	 * @param {ServantIterationCallback} p_callback - Reference to a function that will handle each update or String path compatible with `Suit` notifications.
     * @param {Object[]} p_list - List of objects.
     * @param {?Number} p_step - Iterations per frame. Defaults to `1`. 
	 * @param {?Number} p_timeout - Timeout in seconds. Stops the execution after some time. Defaults to `0xffffff`(infinite).
	 * @param {?Boolean} p_run_on_background - Flag that indicates the loop will keep running when the tab isn't focused.
     * @returns {ServantUpdateNode} - The created execution node.
     * @example
     * var list = [1,2,3,4,5,6];
     * //Will handle 1 element per frame.
     * //See the time stamp per iteration
     * Servant.iterate(function (it,i,len) {
     *  console.log(i+"> "+it+" @ "+Time.elapsed);
     * },list,1);
	 */    
	Servant.iterate = 
	function iterate(p_callback,p_list,p_step,p_timeout,p_run_on_background) {

		var k   = 0;
		var stp = p_step==null ? 1 : p_step;
		var d   = p_timeout != null ? p_timeout : 0xffffff;
		return Servant.run(function(n) {

			for(var i=0;i<stp;i++) {

				if(k>=p_list.length) { Servant.remove(n); break; }
				p_callback(p_list[k],k,p_list.length);
				k++;
			}			
		},d,0.0,p_run_on_background);
	};


})(window,document,document.body);

Servant.start();