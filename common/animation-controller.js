export class AnimationController {

	animationDuration = 1.0; // seconds
	animationDirection = 1.0; // positive is forward, negative is backward
	enableLoop = true;

	animationProgress = 0.0; // seconds

	/** @param {SpriteSequence} spriteSequence Configures animation duration/speed from the default values within the sprite sequence. */
	setDurationFromSpriteSeq(spriteSequence) {
		this.animationDuration = spriteSequence.frames.length / spriteSequence.animationSpeed;
		this.update(0);
	}

	/** @param {number} dt */
	update(dt) {
		if (this.animationDuration == 0) {
			return;
		}
		const direction = Math.sign(this.animationDirection);
		this.animationProgress += dt * direction;
		if (this.animationProgress >= this.animationDuration || this.animationProgress < 0) {
			// animation reached the end
			if (this.enableLoop) {
				this.animationProgress -= this.animationDuration * direction;
				if (this.onAnimationLoop) {
					this.onAnimationLoop();
				}
			} else {
				if (direction === +1) {
					// forward animation
					this.animationProgress = this.animationDuration - 0.001;
				} else if (direction === -1) {
					// backward animation
					this.animationProgress = 0;
				}
				this.animationDuration = 0; // stop the animation
				if (this.onAnimationFinished) {
					this.onAnimationFinished();
				}
			}
		}
	}

	/**
	 * @param {number} frameCount the total number of frames in the animation
	 * @param {number} fps number of frames per second for the animation
	 * @returns {number} an integer representing the current frame of animation
	 **/
	getCurrentFrame(frameCount) {
		if (this.animationDuration === 0) {
			return 0;
		}
		return Math.floor(this.animationProgress / this.animationDuration * frameCount) % frameCount;
	}

	/** @type {() => void} Set a callback to be invoked when the animation loops (if loop is enabled) */
	onAnimationLoop = null;

	/** @type {() => void} Set a callback to be invoked when the animation finishes (if loop is disabled) */
	onAnimationFinished = null;
}
