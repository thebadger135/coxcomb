(function (global) {
  global.Coxcomb = function (chartRadius, sectionCount, levelCount, labels, values, colors){
    var paper = Raphael(0, 0, 2*(chartRadius+2), 2*(chartRadius+2)),
        sectionSize = 360/sectionCount,
        sections = [];

    function sector(cx, cy, r, startAngle, endAngle, fill) {
      var rad = Math.PI / 180,
          x1 = cx + r * Math.cos(-startAngle * rad),
          x2 = cx + r * Math.cos(-endAngle * rad),
          xm = cx + r / 2 * Math.cos(-(startAngle + (endAngle - startAngle) / 2) * rad),
          y1 = cy + r * Math.sin(-startAngle * rad),
          y2 = cy + r * Math.sin(-endAngle * rad),
          ym = cy + r / 2 * Math.sin(-(startAngle + (endAngle - startAngle) / 2) * rad),
          res = [
              "M", cx, cy,
              "L", x1, y1,
              "A", r, r, 0, +(Math.abs(endAngle - startAngle) > 180), +(Math.abs(endAngle - startAngle) > 180), x2, y2,
              "z"
          ];

      res.middle = { x: xm, y: ym };
      return res;
    }
    function getAngle(center, x, y) {
      var quadMod = 0;
      if(x < center) {
        quadMod = 180;
      }
      else if (y > center) {
        quadMod = 360;
      }
      return Raphael.deg((Math.atan((center - y) / (x - center)))) + quadMod;
    }

    function getLevel(center, x, y, angle) {
      var adjstX = center - x;
      var adjstY = center - y;
      return Math.ceil(Math.cos(Raphael.rad(angle - getAngle(center, x, y)))*Math.sqrt(adjstX*adjstX + adjstY*adjstY) * 5.0/center);
    }

    function getSectorRadius(level) {
      return (1.0 * chartRadius / levelCount) * level;
    }

    function getSectorLevel(radius) {
      return Math.ceil(radius / (1.0 * chartRadius / levelCount));
    }

    function onstart(x, y, e) {
      var center = (chartRadius+2);
      
      var section;
      if(typeof this.sectionId == 'number') { // If an outline was clicked
        section = sections[this.sectionId];
      } else {
        section = this;
      }
      var level = getLevel(center, x, y, section.angle) * center / 5.0;
      section.attr({path: sector(center, center, level, section.angle - (sectionSize/2), section.angle + (sectionSize/2))});
    }

    function onmove(dx, dy, x, y, e) {
      var center = (chartRadius+2);
      
      var section;
      if(typeof this.sectionId == 'number') { // If an outline was clicked
        section = sections[this.sectionId];
      } else {
        section = this;
      }
      var level = getLevel(center, x, y, section.angle) * center / 5.0;
      level = level <= 0 ? 0 : level;
      level = level >= center ? center : level;
      section.attr({path: sector(center, center, level, section.angle - (sectionSize/2), section.angle + (sectionSize/2))});
    }

    function onend(e) {
    }

    _.each(_.range(0, 360, sectionSize), function (n) {

      // Represents the background, and the click area for the chart
      var outline = paper.path(sector(chartRadius+2, chartRadius+2, chartRadius, n, n+sectionSize)).
                          attr({fill: "#fff", stroke: "#ddd", "stroke-width": 3}).
                          drag(onmove, onstart, onend);
      outline.sectionId = n/sectionSize;

      // Represents the filled sections
      sections.push(
        paper.path(sector(chartRadius+2, chartRadius+2, chartRadius/5.0, n, n+sectionSize)).
              attr({fill: "#000"}).
              drag(onmove, onstart, onend)
      );

      _.last(sections).coffeeScore = 1;
      _.last(sections).angle = n+(sectionSize/2);
    });

    // Moves the filled sections to the front to cover the background entirely
    _.each(sections, function(s) {s.toFront()});

    return paper;
  };
})(window);
