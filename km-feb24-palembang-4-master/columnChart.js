// Function to parse date from string in format dd/mm/yyyy
function parseDates(dateString) {
    const [day, month, year] = dateString.split('/').map(str => str.trim());
    return new Date(`${year}-${month}-${day}`);
}

// Function to get date range based on selected value
function getDateRanges(value) {
    switch(value) {
        case 'jan': return [parseDates('01/01/2022'), parseDates('31/01/2022')];
        case 'feb': return [parseDates('01/02/2022'), parseDates('28/02/2022')];
        case 'mar': return [parseDates('01/03/2022'), parseDates('31/03/2022')];
        case 'apr': return [parseDates('01/04/2022'), parseDates('30/04/2022')];
        case 'may': return [parseDates('01/05/2022'), parseDates('31/05/2022')];
        case 'jun': return [parseDates('01/06/2022'), parseDates('30/06/2022')];
        case 'jul': return [parseDates('01/07/2022'), parseDates('31/07/2022')];
        case 'aug': return [parseDates('01/08/2022'), parseDates('31/08/2022')];
        case 'sept': return [parseDates('01/09/2022'), parseDates('30/09/2022')];
        case 'oct': return [parseDates('01/10/2022'), parseDates('31/10/2022')];
        case 'nov': return [parseDates('01/11/2022'), parseDates('30/11/2022')];
        case 'dec': return [parseDates('01/12/2022'), parseDates('31/12/2022')];
        default: return [parseDates('01/01/2022'), parseDates('31/12/2022')];
    }
}

// Function to update the column chart
function updateColumnChart() {
    const dateSelector = document.getElementById('selector');
    const selectedDateValue = dateSelector.value;
    const [startDate, endDate] = getDateRanges(selectedDateValue);

    fetch('data_vending.json')
    .then(response => response.json())
    .then(data => {
        const filteredData = data.filter(item => {
            const itemDate = parseDates(item.TransDate);
            return itemDate >= startDate && itemDate <= endDate;
        });

        const aggregatedData = filteredData.reduce((acc, item) => {
            if (item.RQty !== null && item.RQty !== '') {
                if (!acc[item.Product]) {
                    acc[item.Product] = {
                        RQty: 0,
                        Category: item.Category
                    };
                }
                acc[item.Product].RQty += parseInt(item.RQty);
            }
            return acc;
        }, {});
        const distinctProducts = new Set(filteredData.map(item => item.Product));
        const totalDistinctProducts = distinctProducts.size;
        document.getElementById('produk').innerHTML = `<strong>${totalDistinctProducts}</strong>`;
        const totalProducts = Object.values(aggregatedData).reduce((sum, product) => sum + product.RQty, 0);
        document.getElementById('totalProducts').innerHTML = `<strong>${totalProducts}</strong>`;
        const categories = ['Food', 'Water', 'Carbonated', 'Non Carbonated'];
        const chart = document.getElementById('columnChart').getContext('2d');
        const categorySelector = document.getElementById('categorySelector');
        const selectedCategory = categorySelector.value;

        let labels = Object.keys(aggregatedData);
        let dataFilters;

        if (selectedCategory === 'Type') {
            labels = labels
                .sort((a, b) => aggregatedData[b].RQty - aggregatedData[a].RQty)
                .slice(0, 10); 

            dataFilters = categories.map(category => ({
                label: category,
                data: labels.map(label => aggregatedData[label].Category === category ? aggregatedData[label].RQty : 0),
                backgroundColor: getCategoryColor(category),
                borderColor: getBorderColor(category),
                borderWidth: 1,
            }));
        } else {
            labels = labels.filter(label => aggregatedData[label].Category === selectedCategory)
                .sort((a, b) => aggregatedData[b].RQty - aggregatedData[a].RQty)
                .slice(0, 10); 

            dataFilters = [{
                label: selectedCategory,
                data: labels.map(label => aggregatedData[label].RQty),
                backgroundColor: getCategoryColor(selectedCategory),
                borderColor: getBorderColor(selectedCategory),
                borderWidth: 1,
            }];
        }

        if (myColumnChart) {
            myColumnChart.data.labels = labels;
            myColumnChart.data.datasets = dataFilters;
            myColumnChart.update();
        } else {
            myColumnChart = new Chart(chart, {
                type: "bar",
                data: {
                    labels: labels,
                    datasets: dataFilters,
                },
                options: {
                    indexAxis: "x",
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Product',
                            }
                        },
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Products Sold',
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                boxWidth: 20,
                                boxHeight: 2,
                            },
                        },
                    },
                    elements: {
                        bar: {
                            barThickness: 40,
                            barPercentage: selectedCategory === 'Type' ? 1 : 0.9,
                            categoryPercentage: selectedCategory === 'Type' ? 1 : 0.9,
                        }
                    },
                },
            });
        }
    })
    .catch(error => console.error('Error fetching data:', error));
}

function getCategoryColor(category) {
    switch (category) {
        case 'Food':
            return 'rgba(255, 99, 132, 0.7)';
        case 'Water':
            return 'rgba(173, 216, 230, 0.7)';
        case 'Carbonated':
            return 'rgba(144, 238, 144, 0.7)';
        case 'Non Carbonated':
            return 'rgba(255, 165, 0, 0.7)';
        default:
            return 'rgba(255, 159, 64, 0.7)';
    }
}

function getBorderColor(category) {
    switch (category) {
        case 'Food':
            return 'rgba(255, 99, 132, 1)';
        case 'Water':
            return 'rgba(173, 216, 230, 1)';
        case 'Carbonated':
            return 'rgba(144, 238, 144, 1)';
        case 'Non Carbonated':
            return 'rgba(255, 165, 0, 1)';
        default:
            return 'rgba(255, 159, 64, 1)';
    }
}

// Initial column chart setup
let myColumnChart;
updateColumnChart();
