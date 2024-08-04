import { Component, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import * as d3 from 'd3';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  imports: [CommonModule, MatFormFieldModule, MatSelectModule]
})
export class DashboardComponent implements AfterViewInit {
  private data: any[] = [];
  private filteredData: any[] = [];

  // Define all selected properties
  public selectedCountry: string = '';
  public selectedYear: number | null = null;
  public selectedTopic: string = '';
  public selectedSector: string = '';
  public selectedRegion: string = '';

  public years: number[] = [];
  public countries: string[] = [];
  public sectors: string[] = [];
  public topics: string[] = [];
  public regions: string[] = [];
  public cities: string[] = [];
  public pestles: string[] = [];
  public sources: string[] = [];
  public swots: string[] = [];

  public chartWidth = 600;
  public chartHeight = 500;
  public margin = { top: 20, right: 30, bottom: 40, left: 50 };

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.http.get<any[]>('http://localhost:3000/api/data').subscribe(data => {
        this.data = data;
        this.filteredData = data;
        this.extractFilters();
        this.createCharts();
      });
    }
  }

  extractFilters(): void {
    this.years = Array.from(new Set(this.data.map(item => item.end_year))).sort();
    this.countries = Array.from(new Set(this.data.map(item => item.country))).sort();
    this.sectors = Array.from(new Set(this.data.map(item => item.sector))).sort();
    this.topics = Array.from(new Set(this.data.map(item => item.topic))).sort();
    this.regions = Array.from(new Set(this.data.map(item => item.region))).sort();
    this.cities = Array.from(new Set(this.data.map(item => item.city))).sort();
    this.pestles = Array.from(new Set(this.data.map(item => item.pestle))).sort();
    this.sources = Array.from(new Set(this.data.map(item => item.source))).sort();
    this.swots = Array.from(new Set(this.data.map(item => item.swot))).sort();
  }

  createCharts(): void {
    this.createPieChart();
    this.createLineChart();
    this.createScatterPlot();
    this.createBubbleChart();
    this.createHeatmap();
  }

  // Pie Chart
  onPieChartFilterChange(): void {
    this.createPieChart();
  }

  createPieChart(): void {
    d3.select('#pieChart').selectAll('*').remove();

    const width = this.chartWidth;
    const height = this.chartHeight;
    const radius = Math.min(width, height) / 2;

    // Filter data based on selected filters
    const filteredData = this.data.filter(item => {
      return (!this.selectedYear || item.end_year === this.selectedYear) &&
             (!this.selectedCountry || item.country === this.selectedCountry) &&
             (!this.selectedRegion || item.region === this.selectedRegion) &&
             (!this.selectedTopic || item.topic === this.selectedTopic);
    });

    const svg = d3.select('#pieChart')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const sectorData = filteredData.reduce((acc, curr) => {
      acc[curr.sector] = (acc[curr.sector] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const data = Object.entries(sectorData)
      .map(([key, value]) => ({ sector: key, count: value }));

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const pie = d3.pie<any>().value(d => d.count);

    const arc = d3.arc<any>()
      .innerRadius(0)
      .outerRadius(radius);

    const arcs = svg.selectAll('arc')
      .data(pie(data))
      .enter()
      .append('g')
      .attr('class', 'arc');

    arcs.append('path')
      .attr('d', arc)
      .attr('fill', d => color(d.data.sector));

    arcs.append('text')
      .attr('transform', d => `translate(${arc.centroid(d)})`)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .text(d => d.data.sector);

    // Add a label for the pie chart
    svg.append('text')
      .attr('x', 0)
      .attr('y', -height / 2 + 20)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .text('Distribution by Sector');
  }

  // Line Chart
  onLineChartFilterChange(): void {
    this.createLineChart();
  }

  createLineChart(): void {
    d3.select('#lineChart').selectAll('*').remove();

    const width = this.chartWidth;
    const height = this.chartHeight;
    const margin = this.margin;

    const filteredData = this.data.filter(item => {
      return (!this.selectedSector || item.sector === this.selectedSector) &&
             (!this.selectedCountry || item.country === this.selectedCountry);
    });

    const svg = d3.select('#lineChart')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear()
      .domain(d3.extent(filteredData, d => +d.end_year) as [number, number])
      .range([0, width - margin.left - margin.right]);

    const y = d3.scaleLinear()
      .domain(d3.extent(filteredData, d => d.intensity) as [number, number])
      .range([height - margin.top - margin.bottom, 0]);

    const line = d3.line<any>()
      .x(d => x(+d.end_year))
      .y(d => y(d.intensity));

    const lineData = filteredData.map(d => ({ end_year: +d.end_year, intensity: d.intensity }));

    svg.append('path')
      .datum(lineData)
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 1.5)
      .attr('d', line);

    svg.append('g')
      .attr('transform', `translate(0,${height - margin.top - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d3.format('.0f')))
      .append('text')
      .attr('x', width - margin.left - margin.right)
      .attr('y', -6)
      .attr('fill', '#000')
      .attr('text-anchor', 'end')
      .text('End Year');

    svg.append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format('.0f')))
      .append('text')
      .attr('x', 6)
      .attr('y', margin.top)
      .attr('fill', '#000')
      .attr('text-anchor', 'start')
      .text('Intensity');

    // Add a label for the line chart
    svg.append('text')
      .attr('x', (width - margin.left - margin.right) / 2)
      .attr('y', -margin.top / 2)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .text('Intensity over Time');
  }

  // Scatter Plot
  onScatterPlotFilterChange(): void {
    this.createScatterPlot();
  }

  createScatterPlot(): void {
    d3.select('#scatterPlot').selectAll('*').remove();

    const width = this.chartWidth;
    const height = this.chartHeight;
    const margin = this.margin;

    const filteredData = this.data
      .filter(item => !this.selectedSector || item.sector === this.selectedSector)
      .filter(item => !this.selectedCountry || item.country === this.selectedCountry)
      .filter(item => !this.selectedRegion || item.region === this.selectedRegion);

    const svg = d3.select('#scatterPlot')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear()
      .domain([0, d3.max(filteredData, d => d.intensity) || 10])
      .range([0, width - margin.left - margin.right]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(filteredData, d => d.relevance) || 10])
      .range([height - margin.top - margin.bottom, 0]);

    svg.selectAll('circle')
      .data(filteredData)
      .enter()
      .append('circle')
      .attr('cx', d => x(d.intensity))
      .attr('cy', d => y(d.relevance))
      .attr('r', 4)
      .attr('fill', 'steelblue');

    svg.append('g')
      .attr('transform', `translate(0,${height - margin.top - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(5))
      .append('text')
      .attr('x', width - margin.left - margin.right)
      .attr('y', -6)
      .attr('fill', '#000')
      .attr('text-anchor', 'end')
      .text('Intensity');

    svg.append('g')
      .call(d3.axisLeft(y).ticks(5))
      .append('text')
      .attr('x', 6)
      .attr('y', margin.top)
      .attr('fill', '#000')
      .attr('text-anchor', 'start')
      .text('Relevance');

    // Add a label for the scatter plot
    svg.append('text')
      .attr('x', (width - margin.left - margin.right) / 2)
      .attr('y', -margin.top / 2)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .text('Intensity vs Relevance');
  }

  // Bubble Chart
  onBubbleChartFilterChange(): void {
    this.createBubbleChart();
  }

  createBubbleChart(): void {
    d3.select('#bubbleChart').selectAll('*').remove();

    const width = this.chartWidth;
    const height = this.chartHeight;
    const margin = this.margin;

    const filteredData = this.data
      .filter(item => !this.selectedSector || item.sector === this.selectedSector)
      .filter(item => !this.selectedCountry || item.country === this.selectedCountry)
      .filter(item => !this.selectedRegion || item.region === this.selectedRegion);

    const svg = d3.select('#bubbleChart')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear()
      .domain([0, d3.max(filteredData, d => d.intensity) || 10])
      .range([0, width - margin.left - margin.right]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(filteredData, d => d.relevance) || 10])
      .range([height - margin.top - margin.bottom, 0]);

    const size = d3.scaleSqrt()
      .domain([0, d3.max(filteredData, d => d.impact) || 10])
      .range([0, 30]);

    svg.selectAll('circle')
      .data(filteredData)
      .enter()
      .append('circle')
      .attr('cx', d => x(d.intensity))
      .attr('cy', d => y(d.relevance))
      .attr('r', d => size(d.impact))
      .attr('fill', 'steelblue')
      .attr('fill-opacity', 0.5);

    svg.append('g')
      .attr('transform', `translate(0,${height - margin.top - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(5))
      .append('text')
      .attr('x', width - margin.left - margin.right)
      .attr('y', -6)
      .attr('fill', '#000')
      .attr('text-anchor', 'end')
      .text('Intensity');

    svg.append('g')
      .call(d3.axisLeft(y).ticks(5))
      .append('text')
      .attr('x', 6)
      .attr('y', margin.top)
      .attr('fill', '#000')
      .attr('text-anchor', 'start')
      .text('Relevance');

    // Add a label for the bubble chart
    svg.append('text')
      .attr('x', (width - margin.left - margin.right) / 2)
      .attr('y', -margin.top / 2)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .text('Impact vs Intensity & Relevance');
  }

  // Heatmap
  onHeatmapFilterChange(): void {
    this.createHeatmap();
  }

  createHeatmap(): void {
    d3.select('#heatmap').selectAll('*').remove();

    const width = this.chartWidth;
    const height = this.chartHeight;
    const margin = this.margin;

    const filteredData = this.data
      .filter(item => !this.selectedSector || item.sector === this.selectedSector)
      .filter(item => !this.selectedCountry || item.country === this.selectedCountry)
      .filter(item => !this.selectedRegion || item.region === this.selectedRegion);

    const svg = d3.select('#heatmap')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
      .domain(Array.from(new Set(filteredData.map(d => d.region))))
      .range([0, width - margin.left - margin.right])
      .padding(0.05);

    const y = d3.scaleBand()
      .domain(Array.from(new Set(filteredData.map(d => d.country))))
      .range([height - margin.top - margin.bottom, 0])
      .padding(0.05);

    const color = d3.scaleSequential(d3.interpolateViridis)
      .domain([0, d3.max(filteredData, d => d.intensity) || 10]);

    svg.selectAll('rect')
      .data(filteredData)
      .enter()
      .append('rect')
      .attr('x', d => x(d.region) || 0)
      .attr('y', d => y(d.country) || 0)
      .attr('width', x.bandwidth())
      .attr('height', y.bandwidth())
      .attr('fill', d => color(d.intensity));

    svg.append('g')
      .attr('transform', `translate(0,${height - margin.top - margin.bottom})`)
      .call(d3.axisBottom(x).tickSize(0))
      .append('text')
      .attr('x', width - margin.left - margin.right)
      .attr('y', -6)
      .attr('fill', '#000')
      .attr('text-anchor', 'end')
      .text('Region');

    svg.append('g')
      .call(d3.axisLeft(y).tickSize(0))
      .append('text')
      .attr('x', 6)
      .attr('y', margin.top)
      .attr('fill', '#000')
      .attr('text-anchor', 'start')
      .text('Country');

    // Add a label for the heatmap
    svg.append('text')
      .attr('x', (width - margin.left - margin.right) / 2)
      .attr('y', -margin.top / 2)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .text('Heatmap of Intensity by Region and Country');
  }
}
