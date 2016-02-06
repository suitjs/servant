
/**
Class that holds timing information.
//*/
var Time =
function(window,document,body) {

	"use strict";

	return {
		elapsed: 0.0,
		delta:   0.0,
	};

}(window,document,document.body);

/**
Class that implements 'requestAnimationFrame' based features to balance heavy workloads.
//*/
var Servant =
function(window,document,body) {

	"use strict";

	console.log("Servant> Init v1.0.0");

	if (!Date.now) { Date.now = function now() { return new Date().getTime(); } }; 		

	
	var m_hasReqAnimFrame = window.requestAnimationFrame != null;
	var m_hasPerfTime 	  = window.performance != null;
	
	var RAFId = -1;
	var itvId = -1;
	
	
	var m_step_clock	   = -1.0;
	var m_raf_offset 	   = 0.0;
	var m_itv_offset_clock = 0.0;
	var m_raf_offset_clock = 0.0;
	var m_itv_offset 	   = 0.0;
	var m_list 			   = [];
	var m_perf_offset 	   = 0.0;

	//Time last tick.
	var m_timeLast = -1.0;

	/**
	Updates the Time information.
	//*/
	var m_timeUpdate = 
	function timeUpdate(t) {

		t *= 0.001;		
		if(m_timeLast < 0.0) m_timeLast = t;
		Time.delta  = Math.max(0.01,t - m_timeLast);
		m_timeLast = t;
		Time.elapsed += Time.delta;

	};

	/**
	Main execution loop.
	//*/
	var m_step =
	function step(p_time,p_visible) {			

		var a = Servant;		
		
		if (m_step_clock < 0) m_step_clock = p_time;

		var t    		 = p_time;		
		var dt   		 = Math.max(1.0,t - m_step_clock); //in ms
		
		m_step_clock 	 = t;				
		
		var steps        = p_visible ? 1 : Math.min(62,Math.max(1,Math.floor(dt / 16)));		

		for (var i=0; i<steps;i++) {
 			
			m_timeUpdate(t);
			
			//Update all stuff.
			for(var j=0; j<m_list.length;j++) {				

				var enabled = p_visible ? true : (m_list[j].runOnBackground==true);
				if(enabled) m_list[j].update();

			}
			
			if(!a.hasPerfTime) t += 1000.0/60.0;
		}
		
		//Stops when execution list is empty.
		//if(a.m_list.length <= 0) a.stop();
	};

	/**
	RequestAnimationFrame execution loop.
	//*/
	var m_rafLoop = 
	function rafLoop(p_time)	{	

		var a = Servant;
		RAFId = window.requestAnimationFrame(m_rafLoop);		
		var t  = a.hasPerfTime ? window.performance.now() : p_time;								
		m_step(t - m_raf_offset_clock,true);		
		return true;
	};
	
	/**
	SetIntervalLoop
	//*/
	var m_itvLoop =
	function itvLoop()	{	

		var a = Servant;		
		var v = document.visibilityState != null ? (document.visibilityState != "hidden") : true;
		if(a.hasReqAnimFrame) if(v) return;				
		var t = a.hasPerfTime ? window.performance.now() : Date.now();
		a.step(t - m_itv_offset_clock, v);
	};
	
	/**
	Cancels the RequestAnimationFrame loop.
	//*/
	var m_cancelRAF = function cancelRAF() { if (RAFId >= 0) window.cancelAnimationFrame(RAFId); RAFId = -1; };
	
	/**
	Cancels the setIntervalLoop.
	//*/
	var m_cancelItv = function cancelItv() { if (itvId >= 0) window.clearInterval(itvId); itvId = -1; };

	/**
	Starts the execution loops.
	//*/
	var m_start =
	function start() {  

		var a = Servant;
		a.stop();				
		
		m_step_clock = -1.0;		
		
		m_itv_offset_clock = a.hasPerfTime ? window.performance.now() : Date.now();
		itvId = window.setInterval(a.itvLoop, 16);		
		
		m_raf_offset_clock = a.hasPerfTime ? window.performance.now() : 0.0;				
		if (a.hasReqAnimFrame) a.RAFId = window.requestAnimationFrame(m_rafLoop);
	};

	/**
	Stops all loops.
	//*/
	var m_stop = function stop() { var a = Servant; m_cancelItv(); if (a.hasReqAnimFrame) m_cancelRAF(); };
	
	/**
	Clears the execution list.
	//*/
	var m_clear = function clear() { var a = Servant; a.list = m_list = []; };

	/**
	Adds a Node to the execution pool.
	//*/
	var m_add = 
	function add(p_node,p_run_on_background) {

		var a = Servant;
		if(a.list.indexOf(p_node)>=0) return;
		p_node.runOnBackground = p_run_on_background==true;
		a.list.push(p_node);
		//Starts when first element is inserted
		//if(a.m_list.length == 1) a.start();
	};
	
	/**
	Removes a Node of the execution pool.
	//*/
	var m_remove = 
	function remove(p_node)	{

		var a   = Servant;
		var idx = a.list.indexOf(p_node);		
		if(idx < 0) return null;
		var n = a.list.splice(idx,1);		
		return n;
	};

	/**
	Executes a callback waiting 'delay' and during 'duration' in seconds.
	//*/
	var m_run = 
	function run(p_callback,p_duration,p_delay,p_run_on_background)	{
		
		var n = {};		
		n.progress = 0.0;
		n.duration = p_duration != null ? p_duration : 0xffffff;
		n.elapsed  = p_delay != null ? -p_delay : 0.0;
		n.update = 
		function() {	

			if(n.elapsed >= 0.0) p_callback(n);
			n.elapsed  = Math.min(n.duration,n.elapsed + Time.delta);			
			n.progress = Math.min(1.0,n.duration <= 0.0 ? 1.0 : (n.elapsed / n.duration));
			if(n.elapsed >= n.duration) { p_callback(n); Servant.remove(n); return;	}

		};
		Servant.add(n,p_run_on_background);
		return n;
	};

	/**
	Waits 'delay' seconds and then Executes the callback.
	//*/
	var m_delay =
	function delay(p_callback,p_delay,p_run_on_background,p_args) {		

		var al = p_args==null ? [] : p_args;
		//for(var i=3;i<arguments.length;i++) al.push(arguments[i]);		
		return Servant.run(function(n) {			

			p_callback.apply(window,al);

		},0.0,p_delay ? p_delay : 0.0,p_run_on_background);	
	};

	/**
	Waits 'delay' seconds and then sets the 'property' to the specified value.
	//*/
	var m_set =
	function set(p_target,p_property,p_value,p_delay,p_run_on_background) {

		return Servant.run(function(n) {

			p_target[p_property] = p_value;

		},0.0,p_delay==null ? 0.0 : p_delay,p_run_on_background);	
	};

	/**
	Iterates a list in a thread-like routine.
	//*/
	var m_iterate =
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

	return {

		hasReqAnimFrame: m_hasReqAnimFrame,
		hasPerfTime:     m_hasPerfTime,
		list:            m_list, 

		start:   m_start,
		stop:    m_stop,
		clear:   m_clear,
		add:     m_add,
		remove:  m_remove,
		run:     m_run, 
		delay:   m_delay,
		set:     m_set,
		iterate: m_iterate,
				
	};

}(window,document,document.body);

Servant.start();