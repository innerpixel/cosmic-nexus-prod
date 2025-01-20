# Planet Logo Sound System

The interactive planet logo includes a complete sound system for an immersive experience. To enable sounds, you'll need to add the following audio files to the `/public/sounds/` directory:

## Required Sound Files

1. `engine-hum.mp3` - Continuous low frequency engine sound
   - Suggested: Low, pulsing synthesizer tone
   - Duration: 2-3 seconds (loops)
   - Volume: Moderate (0.3)

2. `ambient.mp3` - Background space ambience
   - Suggested: Ethereal space atmosphere
   - Duration: 5-10 seconds (loops)
   - Volume: Low (0.2)

3. `scanner-beep.mp3` - Scanner activation sound
   - Suggested: High-pitched electronic beep
   - Duration: 0.5 seconds
   - Volume: Moderate (0.4)

4. `warning.mp3` - Defense system warning
   - Suggested: Alert klaxon sound
   - Duration: 1 second
   - Volume: High (0.5)

5. `shield.mp3` - Shield activation/impact
   - Suggested: Energy barrier sound
   - Duration: 0.7 seconds
   - Volume: Moderate (0.4)

6. `transmission.mp3` - Communication beacon
   - Suggested: Digital transmission beep
   - Duration: 0.3 seconds
   - Volume: Low (0.3)

7. `defense-active.mp3` - Defense system activation
   - Suggested: Power-up sequence
   - Duration: 1.5 seconds
   - Volume: Moderate (0.4)

## Sound System Features

The planet logo includes several interactive sound features:

1. **Ambient Engine Sound**
   - Continuous engine hum
   - Pitch varies with cursor proximity
   - Volume increases in defense mode

2. **Scanning Sounds**
   - Random pitched scanner beeps
   - Transmission beacons in morse code
   - Warning sounds when threats detected

3. **Defense System**
   - Shield activation/deactivation effects
   - Impact sounds when shield is hit
   - Defense system power-up sequence
   - Warning klaxons for threats

4. **Interactive Elements**
   - Sound effects follow cursor movement
   - Volume and pitch vary with distance
   - Multiple layers of ambient sound

## Usage

The sound system activates on first user interaction (click) to comply with browser autoplay policies. All sounds are managed through the `PlanetSoundSystem` class, which handles:

- Sound initialization and loading
- Volume management
- Sound effects and timing
- Pitch shifting for variety
- Loop management
- Defense system audio states

## Customization

You can customize the sound system by:

1. Replacing the sound files with your own
2. Adjusting volumes in `PlanetSoundSystem.js`
3. Modifying playback rates and timing
4. Adding new sound effects

## Browser Support

The sound system uses the HTML5 Audio API and should work in all modern browsers. For best experience:
- Use Chrome, Firefox, or Safari
- Ensure audio is enabled
- Allow autoplay for the site
