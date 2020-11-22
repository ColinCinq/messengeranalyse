let messagesList = [],
    participantList = [],
    startDate,
    endDate,
    basedOnToday = 1

//<editor-fold> desc="Utils"
let chartColors = {
    red:            'rgb(255, 99, 132)',
    orange:         'rgb(255, 159, 64)',
    yellow:         'rgb(255, 205, 86)',
    green:          'rgb(75, 192, 192)',
    blue:           'rgb(54, 162, 235)',
    purple:         'rgb(153, 102, 255)',
    grey:           'rgb(201, 203, 207)',
    teal:           'rgb(0, 128, 128)',
    marineBlue:     'rgb(0, 7, 45)',
    skyBlue:        'rgb(87, 196, 229)',
    hunterGreen:    'rgb(44, 85, 48)',
    bordeaux:       'rgb(55, 6, 23)',
    ochre:          'rgb(153, 98, 30)',
    greenyellow:    'rgb(165, 180, 82)',
    lightpink:      'rgb(212, 153, 185)',
    lime:           'rgb(203, 243, 210)',
    hotorange:      'rgb(255, 84, 0)',
    rubyred:        'rgb(154, 3, 30)',
}
let chartColorsArray = [
    chartColors.red,
    chartColors.orange,
    chartColors.yellow,
    chartColors.green,
    chartColors.blue,
    chartColors.purple,
    chartColors.grey,
    chartColors.teal,
    chartColors.marineBlue,
    chartColors.skyBlue,
    chartColors.hunterGreen,
    chartColors.bordeaux,
    chartColors.ochre,
    chartColors.greenyellow,
    chartColors.lightpink,
    chartColors.lime,
    chartColors.hotorange,
    chartColors.rubyred,
    chartColors.red,
    chartColors.orange,
    chartColors.yellow,
    chartColors.green,
    chartColors.blue,
    chartColors.purple,
    chartColors.grey,
    chartColors.teal,
    chartColors.marineBlue,
    chartColors.skyBlue,
    chartColors.hunterGreen,
    chartColors.bordeaux,
    chartColors.ochre,
    chartColors.greenyellow,
    chartColors.lightpink,
    chartColors.lime,
    chartColors.hotorange,
    chartColors.rubyred,
    chartColors.red,
    chartColors.orange,
    chartColors.yellow,
    chartColors.green,
    chartColors.blue,
    chartColors.purple,
    chartColors.grey,
    chartColors.teal,
    chartColors.marineBlue,
    chartColors.skyBlue,
    chartColors.hunterGreen,
    chartColors.bordeaux,
    chartColors.ochre,
    chartColors.greenyellow,
    chartColors.lightpink,
    chartColors.lime,
    chartColors.hotorange,
    chartColors.rubyred,
]
//util function
Date.prototype.format = function (formatter) {
    if (!formatter)
        return
    date = this
    let z = {
        M: date.getMonth() + 1,
        d: date.getDate(),
        h: date.getHours(),
        m: date.getMinutes(),
        s: date.getSeconds()
    }
    formatter = formatter.replace(/(M+|d+|h+|m+|s+)/g, function(v) {
        return ((v.length > 1 ? "0" : "") + z[v.slice(-1)]).slice(-2)
    })
    return formatter.replace(/(y+)/g, function(v) {
        return date.getFullYear().toString().slice(-v.length)
    })
}
Date.isLeapYear = function (year) {
    return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0))
}
Date.prototype.isLeapYear = function () {
    return Date.isLeapYear(this.getFullYear())
}
Date.prototype.getDaysInMonth = function () {
    return [31, (Date.isLeapYear(this.getFullYear()) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][this.getMonth()]
}
Date.prototype.addDays = function(value) {
    this.setDate(this.getDate() + value)
    return this
}
Date.prototype.addMonths = function (value) {
    var n = this.getDate()
    this.setDate(1)
    this.setMonth(this.getMonth() + value)
    this.setDate(Math.min(n, this.getDaysInMonth()))
    return this
}
Date.prototype.addYears = function(value) {
    this.setFullYear(this.getFullYear() + value)
    return this
}
function sort_object(obj) {
    items = Object.keys(obj).map(function(key) {
        return [key, obj[key]];
    });
    items.sort(function(first, second) {
        return second[1] - first[1];
    });
    sorted_obj={}
    $.each(items, function(k, v) {
        use_key = v[0]
        use_value = v[1]
        sorted_obj[use_key] = use_value
    })
    return(sorted_obj)
}
function sort_object_by_value(obj) {
    return Object.fromEntries(
        Object.entries(obj).sort(([,a],[,b]) => b-a)
    )
}
function object_to_array(obj) {
    return Object.keys(obj).map(function(key) {
        return [key, obj[key]];
    });
}
function generateGlobal() {
    startDate = new Date(messagesList[0].timestamp_ms)
    if (basedOnToday === 1) {
        endDate = new Date(messagesList[messagesList.length-1].timestamp_ms)
    } else {
        endDate = new Date()
    }
}
//</editor-fold>

//<editor-fold> desc="Display"
// Create the display for imported json file
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
    let dataMsg = [], labelsMsg = []
    let sorted = sort_object_by_value(dataProcess.getTotalMsgPerParticipant())
    for (let participant in sorted) {
        addParticipantToList(participant)
        labelsMsg.push(participant)
        dataMsg.push(sorted[participant])
    }
    msgParticipants = object_to_array(sorted)

    let ctx = document.getElementById('msgPerParticipantChart').getContext('2d');
    createDoughnutChart(ctx, labelsMsg, dataMsg)
}
function addParticipantToList(participant) {
    $('#participants-list').append(
        $('<li></li>').addClass('list-group-item d-flex justify-content-between align-items-center').text(participant).append(
            $('<span></span>').addClass('badge badge-primary badge-pill').text(dataProcess.getTotalMsgPerParticipant()[participant])
        )
    )
}
function createDoughnutChart(ctx, labels, data) {
    let chart = new Chart(ctx, {
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
//</editor-fold>

//<editor-fold> desc="Import Process"
// Import data from Json
// loading process from imported folder
let folder = $('#msgFolder')[0]
$(folder).on('change', () => {
    let files = []
    messagesList = []
    for (file of folder.files) {
        if (RegExp('message_[0-9]+.json').test(file.name))
            files.push(file)
    }

    //2 level of Promise :
    //   the inner one is for json reading process to complet
    //   the surronding one is here to wait until the inner one start initializing Promise (else the Promise.all will evalute an empty array)
    deleteAllFileDiv()
    let promiseDecod = [],
        promisePromise = []
    for (file of files) {
        promisePromise.push(new Promise( (resolvePromise) => {
            let fileName = file.name.split('.')[0]
            createFileDiv(fileName, file.size)

            // data generator
            let reader = new FileReader()
            reader.onload = ((theFile) => {
                return function (e) {
                    promiseDecod.push(new Promise((resolveDecod) => {
                        try {
                            json = JSON.parse(decodeURIComponent(escape(JSON.stringify(JSON.parse(e.target.result)))))
                        } catch (ex) {
                            alert('ex when trying to parse json = ' + ex)
                        }
                        messagesList = messagesList.concat(json.messages)
                        $('.' + fileName).removeClass('fa-cog').removeClass('fa-spin').addClass('fa-check').addClass('text-primary')
                        $('#currentMsgName').text(json.title)
                        resolveDecod()
                    }))
                    resolvePromise()
                }
            })(file)
            reader.readAsText(file)
        }))
    }

    Promise.all(promisePromise).then(() => {
        Promise.all(promiseDecod).then(() => {
            messagesList.sort((a, b) => (a.timestamp_ms > b.timestamp_ms) ? 1 : -1)
            dataProcess.getParticipant()
            generateGlobal()

            /*$('#totMsg').text(dataProcess.getTotalMsg())
            $('#convSpan').text(dataProcess.getSpanOfConversation())*/
            for (let data in dataProcess) {
                console.log(data + ' :')
                console.log(dataProcess[data]())
            }
            display(dataProcess)

        })
    })
})
// end of import process
//</editor-fold>

//<editor-fold> desc="Data Process"
// data process function
dataProcess = {
    getParticipant : function(){
        participantList = []
        for (m of messagesList) {
            if(!participantList.includes(m.sender_name))
                participantList.push(m.sender_name)
        }
        return participantList
    },
    getSpanOfConversation : function(){
        tmpDate = messagesList[messagesList.length-1].timestamp_ms - messagesList[0].timestamp_ms
        return Math.ceil(tmpDate / (1000 * 60 * 60 * 24)) + " jours"
    },
    getMonthWithMostMsg : function() {
        let msgPerMonth = this.getTotalMsg('month')
        return Object.keys(msgPerMonth).reduce((a, b) => msgPerMonth[a] > msgPerMonth[b] ? a : b)
    },

    // arg : nothing (all time) day/month/year (group by)
    getTotalMsg : function(format){
        let dateFormat, addMethod, ret = {}
        switch (format) {
            case 'day':
                dateFormat = 'yyyy-MM-dd'
                addMethod = 'addDays'
                break
            case 'month':
                dateFormat = 'yyyy-MM'
                addMethod = 'addMonths'
                break
            case 'year':
                dateFormat = 'yyyy'
                addMethod = 'addYears'
                break
            default:
                return messagesList.length
        }

        for (let i = new Date(startDate) ; i.format(dateFormat)<=endDate.format(dateFormat) ; i[addMethod](1)){
            ret[i.format(dateFormat)] = 0
        }
        for (m of messagesList) {
            ret[new Date(m.timestamp_ms).format(dateFormat)] ++
        }
        return ret
    },
    // arg : nothing (all time) day/month/year (group by)
    getTotalMsgPerParticipant : function(format){
        let dateFormat, addMethod, skip=false, ret = {}
        switch (format) {
            case 'day':
                dateFormat = 'yyyy-MM-dd'
                addMethod = 'addDays'
                break
            case 'month':
                dateFormat = 'yyyy-MM'
                addMethod = 'addMonths'
                break
            case 'year':
                dateFormat = 'yyyy'
                addMethod = 'addYears'
                break
            default:
                skip=true
        }

        if (!skip){
            for (let i = new Date(startDate) ; i.format(dateFormat)<=endDate.format(dateFormat) ; i[addMethod](1)){
                ret[i.format(dateFormat)] = {}
                for(p of participantList){
                    ret[i.format(dateFormat)][p] = 0
                }
            }
        } else {
            for(p of participantList){
                ret[p] = 0
            }
        }

        for (m of messagesList) {
            if (!skip){
                ret[new Date(m.timestamp_ms).format(dateFormat)][m.sender_name] ++
            } else {
                ret[m.sender_name] ++
            }
        }
        return ret
    },
    // arg : nothing (all time) day/month/year (group by)
    getResponseTime : function(format){
        let dateFormat, addMethod, skip=false, ret = {}
        switch (format) {
            case 'day':
                dateFormat = 'yyyy-MM-dd'
                addMethod = 'addDays'
                break
            case 'month':
                dateFormat = 'yyyy-MM'
                addMethod = 'addMonths'
                break
            case 'year':
                dateFormat = 'yyyy'
                addMethod = 'addYears'
                break
            default:
                skip=true
        }

        if (!skip){
            for (let i = new Date(startDate) ; i.format(dateFormat)<=endDate.format(dateFormat) ; i[addMethod](1)){
                ret[i.format(dateFormat)] = []
            }
        } else {
            ret = []
        }

        for (k in messagesList) {
            if (k!=='0'){
                let prev = messagesList[k-1],
                    m = messagesList[k]
                if (m.sender_name !== prev.sender_name){
                    if (!skip)
                        ret[new Date(m.timestamp_ms).format(dateFormat)].push(m.timestamp_ms - prev.timestamp_ms)
                    else
                        ret.push(m.timestamp_ms - prev.timestamp_ms)
                }
            }
        }

        if (!skip){
            for (date in ret) {
                let tmp = ret[date].reduce((a, b) => a + b, 0) /  ret[date].length
                ret[date] = isNaN(tmp) ? null : Math.round(tmp)
            }
        } else {
            let tmp = ret.reduce((a, b) => a + b, 0) / ret.length
            ret = isNaN(tmp) ? null : Math.round(tmp)
        }

        return ret
    },
    // arg : nothing (all time) day/month/year (group by)
    getResponseTimePerParticipant : function(format){
        let dateFormat, addMethod, skip=false, ret = {}
        switch (format) {
            case 'day':
                dateFormat = 'yyyy-MM-dd'
                addMethod = 'addDays'
                break
            case 'month':
                dateFormat = 'yyyy-MM'
                addMethod = 'addMonths'
                break
            case 'year':
                dateFormat = 'yyyy'
                addMethod = 'addYears'
                break
            default:
                skip=true
        }

        if (!skip){
            for (let i = new Date(startDate) ; i.format(dateFormat)<=endDate.format(dateFormat) ; i[addMethod](1)){
                ret[i.format(dateFormat)] = {}
                for (p of participantList) {
                    ret[i.format(dateFormat)][p] = []
                }
            }
        } else {
            ret = {}
            for (p of participantList) {
                ret[p] = []
            }
        }

        for (k in messagesList) {
            if (k!=='0'){
                let prev = messagesList[k-1],
                    m = messagesList[k]
                if (m.sender_name !== prev.sender_name){
                    if (!skip)
                        ret[new Date(m.timestamp_ms).format(dateFormat)][m.sender_name].push(m.timestamp_ms - prev.timestamp_ms)
                    else
                        ret[m.sender_name].push(m.timestamp_ms - prev.timestamp_ms)
                }
            }
        }

        if (!skip){
            for (date in ret) {
                for(participant in ret[date]) {
                    let tmp = ret[date][participant].reduce((a, b) => a + b, 0) / ret[date][participant].length
                    ret[date][participant] = isNaN(tmp) ? null : Math.round(tmp)
                }
            }
        } else {
            for (participant in ret){
                let tmp = ret[participant].reduce((a, b) => a + b, 0) / ret[participant].length
                ret[participant] = isNaN(tmp) ? null : Math.round(tmp)
            }
        }

        return ret
    }
}
//</editor-fold>