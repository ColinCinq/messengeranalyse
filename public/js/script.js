let messagesList = [],
    participantList = [],
    startDate,
    endDate,
    basedOnToday = 1

//util function
Date.prototype.format = function (formatter) {
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
Date.prototype.addDays = function(days) {
    this.setDate(this.getDate() + days)
    return this
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
Date.prototype.addMonths = function (value) {
    var n = this.getDate()
    this.setDate(1)
    this.setMonth(this.getMonth() + value)
    this.setDate(Math.min(n, this.getDaysInMonth()))
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
function generateGlobal() {
    startDate = new Date(messagesList[0].timestamp_ms)
    if (basedOnToday === 1) {
        endDate = new Date(messagesList[messagesList.length-1].timestamp_ms)
    } else {
        endDate = new Date()
    }
}

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

            $('#totMsg').text(dataProcess.getTotalMsg())
            $('#convSpan').text(dataProcess.getSpanOfConversation())

            for (data in dataProcess) {
                console.log(data + ' :')
                console.log(dataProcess[data]())
            }
        })
    })
})
// end of import process

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

    getTotalMsg : function(){
        return messagesList.length
    },

    getSpanOfConversation : function(){
        tmpDate = messagesList[messagesList.length-1].timestamp_ms - messagesList[0].timestamp_ms
        return Math.ceil(tmpDate / (1000 * 60 * 60 * 24)) + " jours"
    },

    getTotalMsgPerParticipant : function(){
        let ret = {}
        for(p of participantList){
            ret[p] = 0
        }
        for (m of messagesList){
            ret[m.sender_name] ++
        }
        return ret
    },

    getMsgPerMonth : function(){
        let ret = {}
        for (let i = new Date(new Date(startDate).setDate(1)) ; i<=new Date(new Date(endDate).setDate(2)) ; i.addMonths(1)){
            ret[i.format('yyyy MM')] = 0
        }
        for (m of messagesList) {
            ret[new Date(m.timestamp_ms).format('yyyy MM')] ++
        }
        return ret
    },

    getMonthWithMostMsg : function() {
        let msgPerMonth = this.getMessagesPerMonth()
        return Object.keys(msgPerMonth).reduce((a, b) => msgPerMonth[a] > msgPerMonth[b] ? a : b)
    },

    getMsgPerMonthPerParticipant : function(){
        let ret = {}
        for (let i = new Date(new Date(startDate).setDate(1)) ; i<=new Date(new Date(endDate).setDate(2)) ; i.addMonths(1)){
            ret[i.format('yyyy MM')] = {}
            for (p of participantList) {
                ret[i.format('yyyy MM')][p] = 0
            }
        }
        for (m of messagesList) {
            ret[new Date(m.timestamp_ms).format('yyyy MM')][m.sender_name] ++
        }
        return ret
    },

    getMsgPerDay : function(word){
        let ret = {}
        for (let i = new Date(startDate) ; i<=endDate ; i.addDays(1)){
            ret[i.format('yyyy MM dd')] = 0
        }
        for (m of messagesList) {
            if (word)
                a =1
            else
                ret[new Date(m.timestamp_ms).format('yyyy MM dd')] ++
        }
        return ret
    },

    getMsgPerDayPerParticipant : function(word){
        let ret = {}
        for (let i = new Date(new Date(startDate).setHours(1)) ; i<=new Date(new Date(endDate).setHours(2)) ; i.addDays(1)){
            ret[i.format('yyyy MM dd')] = {}
            for (p of participantList) {
                ret[i.format('yyyy MM dd')][p] = 0
            }
        }
        for (m of messagesList) {
            ret[new Date(m.timestamp_ms).format('yyyy MM dd')][m.sender_name] ++
        }
        return ret
    },

    getAverageResponseTimePerDay : function () {
        let ret = {}
        for (let i = new Date(new Date(startDate).setHours(1)) ; i<=new Date(new Date(endDate).setHours(2)) ; i.addDays(1)){
            ret[i.format('yyyy MM dd')] = {
                time : 0,
                nb : 0
            }
        }
        for (k in messagesList) {
            if (k!=0){
                let prev = messagesList[k-1],
                    m = messagesList[k]
                if (m.sender_name !== prev.sender_name){
                    ret[new Date(m.timestamp_ms).format('yyyy MM dd')].time += m.timestamp_ms - prev.timestamp_ms
                    ret[new Date(m.timestamp_ms).format('yyyy MM dd')].nb ++
                }
            }
        }
        for (date in ret) {
            let tmp = ret[date].time / ret[date].nb
            ret[date] = isNaN(tmp) ? null : Math.round(tmp)
        }
        return ret
    },

    getAverageResponseTimePerDayPerParticipant : function () {
        let ret = {}
        for (let i = new Date(new Date(startDate).setHours(1)) ; i<=new Date(new Date(endDate).setHours(2)) ; i.addDays(1)){
            ret[i.format('yyyy MM dd')] = {}
            for (p of participantList) {
                ret[i.format('yyyy MM dd')][p] = {
                    time : 0,
                    nb : 0
                }
            }
        }
        for (k in messagesList) {
            if (k!=0){
                let prev = messagesList[k-1],
                    m = messagesList[k]
                if (m.sender_name !== prev.sender_name){
                    ret[new Date(m.timestamp_ms).format('yyyy MM dd')][m.sender_name].time += m.timestamp_ms - prev.timestamp_ms
                    ret[new Date(m.timestamp_ms).format('yyyy MM dd')][m.sender_name].nb ++
                }
            }
        }
        for (date in ret) {
            for(participant in ret[date]){
                let tmp = ret[date][participant].time / ret[date][participant].nb
                ret[date][participant] = isNaN(tmp) ? null : Math.round(tmp)
            }
        }
        return ret
    }
}