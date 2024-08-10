fetch('data_vending.json')
  .then(response => response.json())
  .then(data => {

    const transactionsByMonth = data.reduce((acc, item) => {
      if (item.TransDate && item.LineTotal) {
        const parts = item.TransDate.split('/');
        const month = parts[1];
        const year = parts[2];

        const formattedDate = `${year}-${month}`; 

        if (!acc[formattedDate]) {
          acc[formattedDate] = 0;
        }
        acc[formattedDate] += parseFloat(item.LineTotal); 
      }
      return acc;
    }, {});

    const sortedMonths = Object.keys(transactionsByMonth).sort();
    const labels = sortedMonths.map(date => moment(date, 'YYYY-MM').format('MMM'));
    const transactions = sortedMonths.map(date => transactionsByMonth[date]);

    const totalSales = Object.values(transactionsByMonth).reduce((sum, value) => sum + value, 0);
    document.getElementById('sales').innerHTML = `<strong>$ ${totalSales.toFixed(2)}</strong>`;

    const q1data = transactions.slice(0, Math.floor(transactions.length * 1/4));
    const q2data = transactions.slice(Math.floor(transactions.length * 1/4), Math.floor(transactions.length * 2/4));
    const q3data = transactions.slice(Math.floor(transactions.length * 2/4), Math.floor(transactions.length * 3/4));
    const q4data = transactions.slice(Math.floor(transactions.length * 3/4), transactions.length);

    const ctx = document.getElementById('lineChart').getContext('2d');

    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Total Transaksi',
          data: transactions,
          fill: false,
          backgroundColor: "rgba(255, 137, 28, 0.6)",
          borderColor: "rgba(255, 165, 0, 0.6)",
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {         
            beginAtZero: true,
            title: {
              display: true,
              text: 'Total Transaksi'
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function(tooltipItem) {
                let label = tooltipItem.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (tooltipItem.parsed.y !== null) {
                  label += `$ ${tooltipItem.parsed.y.toFixed(2)}`;
                }
                return label;
              },
              title: function(tooltipItems) {
                return tooltipItems[0].label;
              }
            }
          }
        },
        onClick: function(e, elements) {
          if (elements.length) {
            const index = elements[0].index;
            const month = labels[index];
            const value = transactions[index].toFixed(2);
            alert(`${month}: $ ${value}`);
          }
        }
      }
    });

    document.getElementById('quarterSelector').addEventListener('change', function() {
      const selectedQuarter = this.value;

      let newData = [];
      let newLabels = [];
      if (selectedQuarter === 'quarter1') {
        newData = q1data;
        newLabels = labels.slice(0, Math.floor(labels.length * 1/4));
      } else if (selectedQuarter === 'quarter2') {
        newData = q2data;
        newLabels = labels.slice(Math.floor(labels.length * 1/4), Math.floor(labels.length * 2/4));
      } else if (selectedQuarter === 'quarter3') {
        newData = q3data;
        newLabels = labels.slice(Math.floor(labels.length * 2/4), Math.floor(labels.length * 3/4));
      } else if (selectedQuarter === 'quarter4') {
        newData = q4data;
        newLabels = labels.slice(Math.floor(labels.length * 3/4), labels.length);
      } else {
        newData = transactions;
        newLabels = labels;
      }

      chart.data.labels = newLabels;
      chart.data.datasets[0].data = newData;

      chart.update();
    });
  })
  .catch(error => console.error('Error fetching data:', error))