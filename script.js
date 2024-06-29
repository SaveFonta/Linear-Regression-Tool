let scatterChart;

document.getElementById('calculateBtn').addEventListener('click', () => {
    const xValues = document.getElementById('xValues').value.split(',').map(Number);
    const yValues = document.getElementById('yValues').value.split(',').map(Number);
    if (xValues.length !== yValues.length) {
        alert('X and Y values must have the same length');
        return;
    }

    const n = xValues.length;
    const sumX = xValues.reduce((a, b) => a + b, 0);
    const sumY = yValues.reduce((a, b) => a + b, 0);
    const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
    const sumX2 = xValues.reduce((sum, x) => sum + x * x, 0);
    const sumY2 = yValues.reduce((sum, y) => sum + y * y, 0);

    const meanX = sumX / n;
    const meanY = sumY / n;
    const varianceX = sumX2 / n - Math.pow(meanX, 2);
    const varianceY = sumY2 / n - Math.pow(meanY, 2);
    const covariance = sumXY / n - meanX * meanY;
    const pearsonCorrelation = covariance / Math.sqrt(varianceX * varianceY);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    const rSquared = Math.pow((n * sumXY - sumX * sumY) / Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY)), 2);

    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `Slope: ${slope.toFixed(2)}<br>Intercept: ${intercept.toFixed(2)}<br>R-squared: ${rSquared.toFixed(2)}`;
    resultDiv.style.display = 'block';

    const pearsonCorrelationDiv = document.getElementById('pearsonCorrelation');
    pearsonCorrelationDiv.innerHTML = `<strong>Pearson Correlation Coefficient:</strong> ${pearsonCorrelation.toFixed(2)}`;

    const theoreticalYValues = xValues.map(x => slope * x + intercept);
    const theoreticalYValuesDiv = document.getElementById('theoreticalYValues');
    theoreticalYValuesDiv.innerHTML = `<strong>Theoretical Y Values:</strong> ${theoreticalYValues.map(y => y.toFixed(2)).join(', ')}`;

    const meanAndVarianceDiv = document.getElementById('meanAndVariance');
    meanAndVarianceDiv.innerHTML = `<strong>Mean and Variance:</strong><br>
                                    Mean(X): ${meanX.toFixed(2)}<br>
                                    Mean(Y): ${meanY.toFixed(2)}<br>
                                    Variance(X): ${varianceX.toFixed(2)}<br>
                                    Variance(Y): ${varianceY.toFixed(2)}`;

    const residuals = yValues.map((y, i) => y - (slope * xValues[i] + intercept));
    const sse = residuals.reduce((a, b) => a + b * b, 0);
    const sSquare = sse / (n - 2);
    const seSlope = Math.sqrt(sSquare / (n * varianceX));
    const tStatistic = slope / seSlope;
    
    const df = n - 2;
    const alpha = 0.05;
    const tCritical = jStat.studentt.inv(1 - alpha / 2, df);
    const decision = Math.abs(tStatistic) > tCritical ? "REJECT" : "ACCEPT";

    const tTestBetaDiv = document.getElementById('tTestBeta');
    tTestBetaDiv.innerHTML = `<strong>T-Test for Beta:</strong><br>
                              H<sub>0</sub>: β = 0<br>
                              t = ${tStatistic.toFixed(2)}<br>
                              Critical value: ±${tCritical.toFixed(2)}<br>
                              Decision: ${decision} H<sub>0</sub>`;

    const ctx = document.getElementById('scatterPlot').getContext('2d');
    const data = {
        labels: xValues,
        datasets: [
            {
                label: 'Data Points',
                data: xValues.map((x, i) => ({ x, y: yValues[i] })),
                backgroundColor: 'rgba(0, 123, 255, 0.5)',
                borderColor: 'rgba(0, 123, 255, 1)',
                showLine: false,
                pointRadius: 5
            },
            {
                label: 'Regression Line',
                data: [
                    { x: Math.min(...xValues), y: slope * Math.min(...xValues) + intercept },
                    {   x: Math.max(...xValues), y: slope * Math.max(...xValues) + intercept }
                ],
                borderColor: 'rgba(255, 0, 0, 1)',
                borderWidth: 2,
                fill: false,
                showLine: true,
                pointRadius: 0
                }
                ]
                };


    if (scatterChart) {
        scatterChart.destroy();
    }

    scatterChart = new Chart(ctx, {
        type: 'scatter',
        data: data,
        options: {
            scales: {
                x: { type: 'linear', position: 'bottom' },
                y: { type: 'linear' }
            }
        }
    });
});

