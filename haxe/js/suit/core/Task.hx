package js.suit.core;

/**
 * Class that implements a Servant's executing task.
 * @author eduardo-costa
 */
extern class Task
{
	
	/**
	 * Progress of the execution.
	 */
	public var progress : Float;

	/**
	 * Duration of the Task.
	 */
	public var duration : Float;
	
	/**
	 * Current execution time (negative if it has delay).
	 */
	public var elapsed : Float;
	
	/**
	 * Update callback.
	 */
	public function update() : Void;
	
}