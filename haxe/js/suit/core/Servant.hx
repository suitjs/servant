package js.suit.core;

/**
 * Class that implements 'requestAnimationFrame' based features to balance heavy workloads.
 * @author eduardo-costa
 */
extern class Servant
{
	/**
	 * Flag that indicates the page has requestAnimationFrame features.
	 */
	static public var hasReqAnimFrame : Bool;
	
	/**
	 * Flag that indicates the page has performance timer features.
	 */
	static public var hasPerfTime	  : Bool;
	
	/**
	 * List of active tasks.
	 */
	static public var list : Array<Task>;

	/**
	 * Starts the Servant execution.
	 */
	static public function start() : Void;

	/**
	 * Stops the Servant execution but keeps the Task list..
	 */
	static public function stop() :Void;
	
	/**
	 * Clears all Tasks.
	 */	
	static public function clear():Void;

	/**
	 * Adds a new Task
	 */		
	static public function add(p_task : Task, p_run_on_background : Bool = false):Void;
	
	/**
	 * Removes a Task.
	 */
	static public function remove(p_task:Task):Task;
	
	/**
	 * Adds a callback to the execution pool.
	 */
	static public function run(p_callback : Task->Void, p_duration:Float = 9999999999.0, p_delay : Float = 0.0, p_run_on_background:Bool = false):Task;
	
	/**
	 * Waits 'delay' seconds and execute the callback.
	 */
	static public function delay(p_callback : Dynamic,p_delay:Float=0.0,p_run_on_background:Bool = false,p_args : Array<Dynamic>=null):Task;
	
	/**
	 * Waits 'delay' seconds and sets the variable.
	 */
	static public function set(p_target : Dynamic, p_property:String, p_value : Dynamic, p_delay:Float = 0.0, p_run_on_background:Bool = false):Task;
	
	/**
	 * Iterates through a list one 'step' elements per frame.
	 * @return
	 */
	static public function iterate(p_callback : Dynamic->Int->Int->Void,p_list : Array<Dynamic>,p_step:Int=1,p_timeout:Float=99999999.0,p_run_on_background:Bool=false):Task;
	
	
}