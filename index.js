document.addEventListener('DOMContentLoaded', () => {
  d3.select('#container')
    .append('h1')
    .text('United States Educational Attainment')
    .attr('id', 'title');
  d3.select('#container')
    .append('p')
    .text(
      "Percentage of adults age 25 and older with a bachelor's degree or higher (2010-2014)"
    )
    .attr('id', 'sub-title');

  d3.select('#container').append('svg');

  const w = 960;
  const h = 600;

  const svg = d3
    .select('svg')
    .attr('width', w)
    .attr('height', h);

  const path = d3.geoPath();

  const edu = d3.map();

  const color = d3
    .scaleThreshold()
    .domain([3, 12, 21, 30, 39, 48, 57, 66])
    .range(d3.schemeGreens[9]);

  const x = d3
    .scaleLinear()
    .domain([1, 75])
    .rangeRound([600, 860]);

  const g = svg
    .append('g')
    .attr('class', 'key')
    .attr('transform', 'translate(0,40)');

  g.selectAll('rect')
    .data(
      color.range().map(d => {
        d = color.invertExtent(d);
        if (d[0] == null) d[0] = x.domain()[0];
        if (d[1] == null) d[1] = x.domain()[1];
        return d;
      })
    )
    .enter()
    .append('rect')
    .attr('height', 8)
    .attr('x', d => x(d[0]))
    .attr('width', d => x(d[1]) - x(d[0]))
    .attr('fill', d => color(d[0]));

  g.call(
    d3
      .axisBottom(x)
      .tickSize(13)
      .tickFormat(x => `${x}%`)
      .tickValues(color.domain())
  )
    .select('.domain')
    .remove();

  const promises = [
    d3.json(
      'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json'
    ),
    d3.json(
      'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json'
    ),
  ];

  Promise.all(promises).then(ready);

  function ready(us) {
    us[1].forEach(d => {
      edu.set(d.fips, [+d.bachelorsOrHigher, d.area_name, d.state]);
    });
    svg
      .append('g')
      .attr('class', 'counties')
      .selectAll('path')
      .data(topojson.feature(us[0], us[0].objects.counties).features)
      .enter()
      .append('path')
      .attr('fill', d => color(edu.get(d.id)[0]))
      .attr('d', path)
      .append('title')
      .text(
        d => `${edu.get(d.id)[1]}, ${edu.get(d.id)[2]}: ${edu.get(d.id)[0]}%`
      )

    svg
      .append('path')
      .datum(topojson.mesh(us[0], us[0].objects.states, (a, b) => a !== b))
      .attr('class', 'states')
      .attr('d', path);
  }
});
