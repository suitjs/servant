package js.suit.core;

/**
 * Class that holds timing information.
 * @author eduardo-costa
 */
extern class Time
{
	/**
	 * Elapsed time in seconds.
	 */
	static public var elapsed:Float;
	
	/**
	 * Delta time in seconds.
	 */
	static public var delta:Float;	
	
	/**
	 * Flag that indicates the page has performance timer features.
	 */
	static public var hasPerfTime	  : Bool;
		
	/**
	 * Returns the global time tick.
	 */
	static public function clock():Float;
	
	
}