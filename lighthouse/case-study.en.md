# THE LIGHTHOUSE case study — English

<!-- English text for case-study.md. Same section IDs and patterns. -->

## Concept <!-- case.section.concept -->

Adding water switches on the lighthouse and creates gentle waves 

- **Fabric humidifier** · Organic — Uses evaporation from water absorbed by fabric rather than a conventional plastic disc
- **Mood light** · Healing — The lighthouse lights up when water is added, with brightness adjusted to the light in the room
- **Waves** · Nature — A seaside scene with a lighthouse, like sitting on an island watching the waves

## References <!-- case.section.references -->

Arduino controls using water-level and ambient-light sensors

@cards

- Water Lamp · Witaya Junma — An ultrasonic sensor detects rising water and switches on an LED. Ripples reflect the light onto the wall. // → Water as a switch: a water-level sensor
- Night Light · Egrobotics — An ambient-light sensor switches the lamp on as the room darkens and off as it brightens. // → Light sensing for brightness adjustment

## Specification <!-- case.section.specification -->

Conditions governing the light and pump through two sensors

- Part | Role | Behaviour
- Water-level sensor | Detects water | At readings of 300 or above, the light and pump switch on. Below 300, both switch off, signalling that water needs replenishing
- Light sensor | Measures ambient light | Maps readings of 200–600 to a light brightness of 1–255
- Lighthouse light | Mood light | Warm yellow lighting activated by water level and dimmed in response to both sensors
- Submersible pump | Gentle waves | Placed beneath the island model to create gentle waves
- Toggle switch | Power on/off | Manual power control
- Power | 12 V adapter | External power supply

## Drawings <!-- case.section.drawings -->

Production specifications documented through drawings

@stack

![Orthographic drawings — front, section and plan views; dimensions in mm](assets/case-study/drawing-01-orthographic.jpg)

![Wiring diagram — Arduino Uno R3, water-level sensor, light sensor, LED and submersible pump](assets/case-study/drawing-02-circuit.jpg)

![Exploded view and bill of materials — 12 component types and assembly sequence](assets/case-study/drawing-03-exploded.jpg)

## case.intro <!-- case.intro -->

Explored an alternative to plastic humidifier discs and how ambient lighting and gentle waves could create a relaxing everyday experience.
