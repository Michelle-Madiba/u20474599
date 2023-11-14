var arrdata = [];
var arrdata2=[];
///////////////////importing the csv file into the programm
async function getData() {
    const response = await fetch("./Data/2022_ZA_Region_Mobility_Report.csv");
    const data = await response.text();
//remove the headings and select specific columns from the  csv file
    const table = data.split('\n').slice(1);
    table.forEach(row => {
        const columns = row.split(',');
        const countrycode = columns[0];
        const country = columns[1];
        const province = columns[2];
        const dates = columns[8];
        const retail = parseFloat(columns[9]);
        const groceries = parseFloat(columns[10]);
        const workplace = parseFloat(columns[13]);
        const residential = parseFloat(columns[14]);

        arrdata.push({
            countrycode,
            country,
            province,
            dates,
            retail,
            groceries,
            workplace,
            residential
        });
        arrdata2.push({countrycode,country,province, dates,mobility:{retail,groceries, workplace, residential}});
    });

    console.log(arrdata);
}
///////////////////////Donut chart 
const data2022 = arrdata.filter(item => item.dates.getFullYear() === 2022);

// Calculate total lockdown days in 2022
const totalLockdownDays = data2022.length;

console.log("Total Lockdown Days in 2022:", totalLockdownDays);
createDonutChart(totalLockdownDays);
function createDonutChart(totalLockdownDays) {

const ctx = document.getElementById('donutChart').getContext('2d');
const donutChart = new Chart(ctx, {
type: 'doughnut',
data: {
 labels: ['Non-Lockdown', 'Lockdown'],
 datasets: [{
     data: [totalLockdownDays, 365 - totalLockdownDays],
     backgroundColor: ['#FF7720', '#FCE78D'],
     hoverBackgroundColor: ['#FF7720', '#FCE78D']
 }]
}
});
}

getData();

/////////////////////////////  Multline chart    
function createLineChart() {
const aggregatedData = arrdata.reduce((acc, entry) => {
if (!acc[entry.province]) {
acc[entry.province] = {
retail: 0,
groceries: 0,
workplace: 0,
residential: 0,
count: 0
};
}

acc[entry.province].retail += entry.retail;
acc[entry.province].groceries += entry.groceries;
acc[entry.province].workplace += entry.workplace;
acc[entry.province].residential += entry.residential;
acc[entry.province].count += 1;

return acc;
}, {});


const provinces = Object.keys(aggregatedData);

const datasets = [{
label: 'Retail mobility',
data: provinces.map(province => aggregatedData[province].retail / aggregatedData[province].count),
borderColor: 'orange',
fill: false,
tension: 0.4,
}, {
label: 'Groceries mobility',
data: provinces.map(province => aggregatedData[province].groceries / aggregatedData[province].count),
borderColor: 'blue',
fill: false,
tension: 0.4,
}, {
label: 'Workplace mobility',
data: provinces.map(province => aggregatedData[province].workplace / aggregatedData[province].count),
borderColor: 'green',
fill: false,
tension: 0.4,
}, {
label: 'Residential mobility',
data: provinces.map(province => aggregatedData[province].residential / aggregatedData[province].count),
borderColor: 'red',
fill: false,
tension: 0.4,
}];

const data = { labels: provinces, datasets };

//create line chart
const myChart = new Chart(document.getElementById('lineChart').getContext('2d'),
linecrts = {
type: 'line',
data,
options: {
scales: {
y: {
    beginAtZero: true,
    title: {
        display: true,
        text: 'Average mobility (%)'
    }
},
x: {
    title: {
        display: true,
        text: 'Province'
    }
}
}
}
});
}

getData().then(createLineChart);
///////////////////////createbar chart of total mobility per province
function createOverallMobilityGraph() {
const aggregatedData = arrdata.reduce((acc, entry) => {
if (!acc[entry.province]) {
acc[entry.province] = {
totalMobility: 0,
count: 0
};
}

// Calculate total mobility by summing up all mobility types
const totalMobility = (entry.retail + entry.groceries + entry.workplace + entry.residential)/4;

acc[entry.province].totalMobility += totalMobility;
acc[entry.province].count += 1;

return acc;
}, {});

const provinces = Object.keys(aggregatedData);

const datasets = [{
label: 'Overall Mobility',
data: provinces.map(province => aggregatedData[province].totalMobility / aggregatedData[province].count),
backgroundColor: 'rgba(0, 128, 0, 0.7)', // Green
}];

const data = { labels: provinces, datasets };

const config = {
type: 'bar',
data,
options: {
scales: {
y: {
    beginAtZero: true,
    title: {
        display: true,
        text: 'Average Overall combined Mobility (%)'
    }
},
x: {
    title: {
        display: true,
        text: 'Province'
    }
}
}
}
};

const myChart = new Chart(document.getElementById('overallMobilityGraph').getContext('2d'), config);
}

getData().then(createOverallMobilityGraph);
////////////////////////// distribution graph
async function createDistrChart() {
await getData(); 

const data = {
datasets: [{
label: 'Retail mobility',
data: arrdata2,
backgroundColor: 'orange',
tension: 0.4,
parsing: {
xAxisKey: 'province',
yAxisKey: 'mobility.retail',
}
}, {
label: 'Groceries mobility',
data: arrdata2,
backgroundColor: 'blue',
tension: 0.4,
parsing: {
xAxisKey: 'province',
yAxisKey: 'mobility.groceries',
}
}, {
label: 'Workplace mobility',
data: arrdata2,
backgroundColor: 'green',
tension: 0.4,
parsing: {
xAxisKey: 'province',
yAxisKey: 'mobility.workplace',
}
}, {
label: 'Residential mobility',
data: arrdata2,
backgroundColor: 'red',
tension: 0.4,
parsing: {
xAxisKey: 'province',
yAxisKey: 'mobility.residential',
}
}]
};

const distrplot = {
type: 'bar',
data,
options: {
scales: {
y: {
    beginAtZero: true,
    title:{
        display:true,
        text:'Mobility percentage from baseline'
    }
},
x:{
    title:{
        display:true,
        text:'Province'
    }
}
}
}
};

const myChart = new Chart(document.getElementById('distrChart').getContext('2d'), distrplot);
}
createDistrChart();
////////////////////////////create area chart
function createAreaChart() {
const aggregatedData = arrdata.reduce((acc, entry) => {
const date = new Date(entry.dates);
const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;

if (!acc[monthKey]) {
acc[monthKey] = {
totalMobility: 0,
count: 0
};
}

acc[monthKey].totalMobility +=
entry.retail + entry.groceries + entry.workplace + entry.residential;
acc[monthKey].count += 1;

return acc;
}, {});

const months = Object.keys(aggregatedData);

const data = {
labels: months,
datasets: [{
label: 'Total Mobility',
data: months.map(month => aggregatedData[month].totalMobility / aggregatedData[month].count),
backgroundColor: 'rgba(75, 192, 192, 0.2)',
borderColor: 'rgba(75, 192, 192, 1)',
borderWidth: 1,
tension: 0.4,
fill: true
}]
};

const options = {
scales: {
y: {
beginAtZero: true,
title: {
    display: true,
    text: 'Total Mobility'
}
},
x: {
title: {
    display: true,
    text: 'Month'
}
}
}
};

const areaChart = new Chart(document.getElementById('areaChart').getContext('2d'), {
type: 'line',
data,
options
});
}

getData().then(createAreaChart);
///////////////////////////////////////