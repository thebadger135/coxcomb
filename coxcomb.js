(function (global) {
  global.Coxcomb = function (chartRadius, sectionCount, levelCount, labels, values, colors){
    var paper = Raphael("coxcomb", 2*(chartRadius+50), 2*(chartRadius+50)),
        sectionSize = 360/sectionCount,
        sections = [],
        labelPos = [];

    //labels were reverse of their sections because the labels were drawn clockwise
    //and the sections were being drawn counterclockwise. it's kind of an ugly hack.    
    labels.reverse();

    paper.getValues = function() {
      return _.map(sections, function(section){
        return section.value;
      });
    }

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
      return getSectorLevel(
        Math.cos(Raphael.rad(angle - getAngle(center, x, y)))*
        Math.sqrt(adjstX*adjstX + adjstY*adjstY));
    }

    function getSectorRadius(level) {
      return (1.0 * chartRadius / levelCount) * level;
    }

    function getSectorLevel(radius) {
      return Math.ceil(radius / (1.0 * chartRadius / levelCount));
    }

    function onstart(x, y, e) {
      return onmove.call(this,0,0,x,y,e);
    }

    function onmove(dx, dy, x, y, e) {
      var center = (chartRadius+50);
      x -= paper.canvas.getBoundingClientRect().left+window.scrollX;
      y -= paper.canvas.getBoundingClientRect().top+window.scrollY;
      var section;
      if(typeof this.sectionId == 'number') { // If an outline was clicked
        section = sections[this.sectionId];
      } else {
        section = this;
      }
      var val = getLevel(center, x, y, section.angle)
      var level = getSectorRadius(val);
      level = level <= 0 ? 0 : level;
      level = level >= center ? center : level;
      section.value = val;
      section.attr({path: sector(center, center, level, section.angle - (sectionSize/2), section.angle + (sectionSize/2))});
    }

    function onend(e) {
    }

    function getLabel(n) {
      var newRadius = chartRadius + 25;
      var x = chartRadius+50 + newRadius * Math.cos(Raphael.rad(n+(sectionSize/2)));
      var y = chartRadius+50 + newRadius * Math.sin(Raphael.rad(n+(sectionSize/2)));

      return paper.text(x, y, labels[n/sectionSize]);
    }
   
    _.each(_.range(0, 360, sectionSize), function (n) {

      // Represents the background, and the click area for the chart
      var outline = paper.path(sector(chartRadius+50, chartRadius+50, chartRadius, n, n+sectionSize)).
                          attr({fill: "#fff", stroke: "#ddd", "stroke-width": 3}).
                          drag(onmove, onstart, onend);
      outline.sectionId = n/sectionSize;

      // Represents the filled sections
      // TODO initialize sections at correct levels
      sections.push(
        paper.path(sector(chartRadius+50, chartRadius+50, getSectorRadius(values[n/sectionSize]), n, n+sectionSize)).
              attr({fill: colors[n/sectionSize], stroke: colors[n/sectionSize]}).
              drag(onmove, onstart, onend)
      );

      //put labels on graph
      labelPos.push(
        getLabel(n)
      );

      _.last(sections).value = values[n/sectionSize];
      _.last(sections).label = labels[n/sectionSize];
      _.last(sections).angle = n+(sectionSize/2);
      
      

    });

    // Moves the filled sections to the front to cover the background entirely
    _.each(sections, function(s) {s.toFront()});
    _.each(labelPos, function(l) {l.toFront()});
    return paper;
  };
})(window);
