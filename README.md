# Coxcomb.js

Coxcomb.js produces a user editable coxcomb chart using underscore.js and raphael.js

## Requirements

* underscore.js
* raphael.js

## Usage
For a usage example see index.html.

`Coxcomb(chartRadius, sectionCount, levelCount, labels);`

* `chartRadius` is an integer representing the radius of the entire chart in pixels.
* `sectionCount` is an integer indicating the number of sections in the chart.
* `levelCount` is an integer represeting the maximum number of steps in a section.
* `label` is an array of length `sectionCount` containing labels for each section.

Returns a Raphael Page object.
