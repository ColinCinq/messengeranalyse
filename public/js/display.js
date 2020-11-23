//<editor-fold> desc="Display"

// Create the display for imported json
function createFileDiv(fileName, fileSize){

    $('#listFile').removeClass('hidden')

    let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    if (fileSize === 0)
        fileSize = '0 Byte'
    let j = parseInt(Math.floor(Math.log(fileSize) / Math.log(1024)))
    fileSize = Math.round(fileSize / Math.pow(1024, j), 2) + ' ' + sizes[j]

    $('#listFile>.row').append(
        $('<div></div>').addClass('col-12 col-lg-6 fileDiv').append(
            $('<div></div>').addClass('row border border-secondary rounded my-1').append(
                $('<div></div>').addClass('col-6 text-left font-weight-bold').text(fileName),
                $('<div></div>').addClass('col-4 text-left size align-middle').text(fileSize),
                $('<div></div>').addClass('col-2').append(
                    $('<i></i>').addClass('fas fa-cog fa-spin ' + fileName)
                )
            )
        )
    )
}
function deleteAllFileDiv(){
    $('.fileDiv').remove()
    $("#listFile").addClass('hidden')
}

function display(dataProcess) {
    $('#totalMsg').text(dataProcess.getTotalMsg())

    // Nombre de messages par participants - Doughnut Chart
    let dataMsgPerParticipant = [], labelsMsgPerParticipant = []
    let sortedMsgPerParticipant = sort_object_by_value(dataProcess.getTotalMsgPerParticipant())
    for (let participant in sortedMsgPerParticipant) {
        addParticipantToList(participant)
        labelsMsgPerParticipant.push(participant)
        dataMsgPerParticipant.push(sortedMsgPerParticipant[participant])
    }
    let msgPerParticipant = document.getElementById('msgPerParticipantChart').getContext('2d');
    createDoughnutChart(msgPerParticipant, labelsMsgPerParticipant, dataMsgPerParticipant)

    // Nombre de messages par jour de la semaine - Radar Chart
    let msgPerWeekDayChart = document.getElementById('msgPerWeekDayChart').getContext('2d');
    createRadarChart(msgPerWeekDayChart,Object.keys(dataProcess.getTotalMsgPerWeekDay()), Object.values(dataProcess.getTotalMsgPerWeekDay()))

    // Nombre de messages par mois - Bar Chart
    let msgPerMonthChart = document.getElementById('msgPerMonthChart').getContext('2d');
    createBarChart(
        msgPerMonthChart,
        Object.keys(dataProcess.getTotalMsg('month')),
        {"Nombre de messages par mois" : Object.values(dataProcess.getTotalMsg('month'))}
    )

    // Nombre de messages par participant par mois - Bar Chart
    let msgPerParticipantPerMonth = dataProcess.getTotalMsgPerParticipant('month')
    let labels = [], data = {}
    for (participant of participantList) {
        data[participant] = []
    }
    for (msg in msgPerParticipantPerMonth) {
        labels.push(msg)
        for (participant in msgPerParticipantPerMonth[msg]) {
            data[participant].push(msgPerParticipantPerMonth[msg][participant])
        }
    }
    let msgPerParticipantPerMonthChart = document.getElementById('msgPerParticipantPerMonthChart').getContext('2d');
    createBarChart(
        msgPerParticipantPerMonthChart,
        labels,
        data
    )

    // Rapidité de réponse
    let responseTimePerParticipantChart = document.getElementById('responseTimePerParticipantChart').getContext('2d');
    createBarChart(
        responseTimePerParticipantChart,
        Object.keys(dataProcess.getResponseTimePerParticipant()),
        {"Temps de réponse par participant" : Object.values(dataProcess.getResponseTimePerParticipant())}
    )


}

function addParticipantToList(participant) {
    $('#participants-list').append(
        $('<li></li>').addClass('list-group-item d-flex justify-content-between align-items-center').text(participant).append(
            $('<span></span>').addClass('badge badge-primary badge-pill').text(dataProcess.getTotalMsgPerParticipant()[participant])
        )
    )
}

/**
 * Creates a doughnut chart (using chart.js)
 * @param ctx
 * @param labels
 * @param data
 */
function createDoughnutChart(ctx, labels, data) {
    new Chart(ctx, {
        // The type of chart we want to create
        type: 'doughnut',

        // The data for our dataset
        data: {
            labels: labels,
            datasets: [{
                label: 'My First dataset',
                data: data,
                backgroundColor: chartColorsArray
            }]
        },
        options: {}
    });
}

/**
 * Create a radar chart
 * @param ctx
 * @param labels
 * @param data
 */
function createRadarChart(ctx, labels, data) {
    new Chart(ctx, {
        // The type of chart we want to create
        type: 'radar',
        gridLines: {
            color: 'rgba(225, 225, 225, 1)',
        },

        // The data for our dataset
        data: {
            labels: labels,
            datasets: [{
                label: 'My First dataset',
                data: data,
                backgroundColor: chartBackgroundColorsArray[0],
                borderColor: chartColorsArray[0],
                pointBackgroundColor: chartColorsArray[0],
            }]
        },
        options: {
            scale: {
                angleLines: {
                    color: 'rgba(225, 225, 225, 1)',
                },
                gridLines: {
                    color: 'rgba(225, 225, 225, 1)',
                },
                ticks: {
                    min:0
                }
            }
        }
    });
}

/**
 * Create a bar chart
 * @param ctx
 * @param labels
 * @param data
 */
function createBarChart(ctx, labels, data) {
    let datasets = []
    let i=0
    for (dataset in data) {
        datasets.push({
            label: dataset,
            data: data[dataset],
            backgroundColor: chartColorsArray[i]
        })
        i++
    }

    new Chart(ctx, {
        // The type of chart we want to create
        type: 'bar',

        // The data for our dataset
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        min: 0
                    }
                }]
            }
        }
    });
}
//</editor-fold>