(function () {
  function loadD3(callback) {
    var script = document.createElement('script');
    script.src = 'https://d3js.org/d3.v7.min.js';
    script.onload = callback;
    document.head.appendChild(script);
  }

  function drawViz(data) {
    document.body.innerHTML = '';

    var margin = { top: 40, right: 20, bottom: 90, left: 50 };
    var width = (window.innerWidth || 600) - margin.left - margin.right;
    var height = (window.innerHeight || 400) - margin.top - margin.bottom;

    var svg = d3.select('body')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    var rows = data.tables.DEFAULT.rows;
    var dates = Array.from(new Set(rows.map(function (r) { return r.dimension1[0]; })));
    var cities = Array.from(new Set(rows.map(function (r) { return r.dimension2[0]; })));

    var xDate = d3.scaleBand().domain(dates).range([0, width]).padding(0.2);
    var xCity = d3.scaleBand().domain(cities).range([0, xDate.bandwidth()]).padding(0.05);

    var yMax = d3.max(rows, function (r) { return +r.metric[0]; });
    var y = d3.scaleLinear().domain([0, yMax * 1.1]).range([height, 0]);

    var color = d3.scaleOrdinal(d3.schemeTableau10).domain(cities);

    dates.forEach(function (date) {
      var group = rows.filter(function (r) { return r.dimension1[0] === date; });
      var g = svg.append('g').attr('transform', 'translate(' + xDate(date) + ',0)');

      g.selectAll('rect')
        .data(group)
        .enter()
        .append('rect')
        .attr('x', function (d) { return xCity(d.dimension2[0]); })
        .attr('y', function (d) { return y(+d.metric[0]); })
        .attr('width', xCity.bandwidth())
        .attr('height', function (d) { return height - y(+d.metric[0]); })
        .attr('fill', function (d) { return color(d.dimension2[0]); });
    });

    svg.append('g')
      .attr('transform', 'translate(0,' + height + ')')
      .call(d3.axisBottom(xDate).tickSize(0))
      .selectAll('text')
      .attr('y', 45)
      .style('font-size', '13px')
      .style('font-weight', 'bold')
      .style('text-anchor', 'middle');

    dates.forEach(function (date) {
      var cityAxis = svg.append('g')
        .attr('transform', 'translate(' + xDate(date) + ',' + (height + 18) + ')')
        .call(d3.axisBottom(xCity).tickSize(0));
      cityAxis.selectAll('text').style('font-size', '10px').style('text-anchor', 'middle');
      cityAxis.select('.domain').remove();
    });

    svg.append('g').call(d3.axisLeft(y));

    var legend = svg.selectAll('.legend')
      .data(cities)
      .enter()
      .append('g')
      .attr('transform', function (d, i) { return 'translate(' + (i * 120) + ',-25)'; });

    legend.append('rect').attr('width', 12).attr('height', 12).attr('fill', function (d) { return color(d); });
    legend.append('text').attr('x', 16).attr('y', 10).style('font-size', '11px').text(function (d) { return d; });
  }

  loadD3(function () {
    dscc.subscribeToData(drawViz, { transform: dscc.objectTransform });
  });
})();
