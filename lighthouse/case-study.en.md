# THE LIGHTHOUSE case study — English

<!-- English text for case-study.md. Same section IDs and patterns. -->

## Concept <!-- case.section.concept -->

A humidifier and mood light: pour in water, the lighthouse lights up and gentle waves roll

- **Fabric humidifier** · Organic — An eco-friendly fabric humidifier that uses evaporation instead of a plastic disc
- **Mood light** · Healing — The light turns on the moment water is poured in, and its brightness follows the room's light
- **Waves** · Nature — A seaside scene with a lighthouse, like sitting on an island watching the waves

## References <!-- case.section.references -->

A system driven by Arduino water-level and light sensors

- **Water Lamp** · Witaya Junma — A lamp whose LED turns on as water rises past an ultrasonic sensor; the rippling water throws light onto the wall. // → Water as a switch: a water-level sensor
- **Night Light** · Egrobotics — A mood lamp that turns on as the room darkens and off as it brightens, using a light sensor. // → Beyond on and off: light readings set the brightness

## Form <!-- case.section.form -->

A humidifier shaped as an island, sea and lighthouse on a water tank

![Design sketch: 30 cm tank, lighthouse 15 cm tall and 6 cm wide, Arduino and light sensor below the fabric lighthouse](assets/case-study/00-sketch.jpg)

![An island and lighthouse that also work as an interior object](assets/case-study/01-before.jpg)

![The light turns on once water poured into the tank reaches the sand](assets/case-study/02-after.jpg)

## Specification <!-- case.section.specification -->

Two sensors drive the light and the pump.

- Part | Role | Behaviour
- Water-level sensor | Detects water | At 300 or more the light and pump turn on; when water evaporates below 300 they turn off, so the light going out signals an empty tank
- Light sensor | Measures ambient light | Maps readings of 200–600 to a light brightness of 1–255
- Lighthouse light | Mood light | A warm yellow bulb that turns on and dims in response to both sensors
- Submersible pump | Gentle waves | Hidden under the land model
- Toggle switch | Power on/off | Lets the user turn the mood light on and off
- Power | 12 V adapter | External power supply
