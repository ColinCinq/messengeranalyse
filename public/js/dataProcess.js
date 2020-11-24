//<editor-fold> desc="Data Process"
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

    /**
     * fill the object that contain the data
     * @param format => hour, day, week, month, year, weekhour
     * @param participantList
     */
    getTotalMsg : function(format, participantList){
        let process = [
            (ret, data) => {
                for (m of messagesList) {
                    this.fillRet(m, ret, data, function(message, parent, data) {
                        if (!isNaN(parent[data[0].property(message)]))
                            parent[data[0].property(message)] ++
                    })
                }
            }
        ]
        return this.processing(process, format, participantList)
    },
    /**
     * fill the object that contain the data
     * @param format => hour, day, week, month, year, weekhour
     * @param participantList
     */
    getResponseTime : function(format, participantList){
        let process = [
            (ret, data) => {
                for (m in messagesList) {
                    let currentMsg = messagesList[m],
                        lastMsg = messagesList[m > 0 ? m-1 : 0]
                    if (currentMsg.sender_name !== lastMsg.sender_name) {
                        this.fillRet(currentMsg, ret, data, (message, parent, data) => {
                            if (parent[data[0].property(message)] !== undefined) {
                                if (parent[data[0].property(message)] === 0)
                                    parent[data[0].property(message)] = []
                                parent[data[0].property(message)].push(currentMsg.timestamp_ms - lastMsg.timestamp_ms)
                            }
                        })
                    }
                }
            },
            (ret, data) => {
                this.fillRet({}, ret, data, (message, parent, data) => {
                    if (parent[data[0].property(message)] !== undefined) {
                        if (parent[data[0].property(message)] === 0)
                            parent[data[0].property(message)] = []
                        parent[data[0].property(message)].push(currentMsg.timestamp_ms - lastMsg.timestamp_ms)
                    }
                })
            }
        ]
        return this.processing(process, format, participantList)
    },
    // arg : nothing (all time) day/month/year (group by)
    getResponseTime2 : function(format){
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
    },

    /**
     * fill the object that contain the data
     * @param process
     * @param format => hour, day, week, month, year, weekhour
     * @param participantList
     */
    processing : function(process, format, participantList){
        let data = [], ret = {}

        switch (format) {
            case 'hour':
                data.push(
                    {
                        iterable : [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
                        property : (m) => {
                            return new Date(m.timestamp_ms).format('h')
                        }
                    }
                )
                break
            case 'week':
                data.push(
                    {
                        iterable : ['lundi','mardi','mercredi','jeudi','vendredi','samedi','dimanche'],
                        property : (m) => {
                            return new Date(m.timestamp_ms).format('DD')
                        }
                    }
                )
                break
            case 'weekhour':
                data.push(
                    {
                        iterable : ['lundi','mardi','mercredi','jeudi','vendredi','samedi','dimanche'],
                        property : (m) => {
                            return new Date(m.timestamp_ms).format('DD')
                        }
                    },
                    {
                        iterable : [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
                        property : (m) => {
                            return new Date(m.timestamp_ms).format('h')
                        }
                    }
                )
                break
            case 'day':
                data.push(
                    {
                        iterable : this.iterableDate('yyyy-MM-dd','addDays'),
                        property : (m) => {
                            return new Date(m.timestamp_ms).format('yyyy-MM-dd')
                        }
                    }
                )
                break
            case 'month':
                data.push(
                    {
                        iterable : this.iterableDate('yyyy-MM','addMonths'),
                        property : (m) => {
                            return new Date(m.timestamp_ms).format('yyyy-MM')
                        }
                    }
                )
                break
            case 'year':
                data.push(
                    {
                        iterable : this.iterableDate('yyyy','addYears'),
                        property : (m) => {
                            return new Date(m.timestamp_ms).format('yyyy')
                        }
                    }
                )
                break
            default:
                return messagesList.length
        }
        if (participantList){
            data.push(
                {
                    iterable : participantList,
                    property : (m) => {
                        return m.sender_name
                    }
                }
            )
        }

        this.createRet(ret, data)
        for (fct of process) {
            fct(ret, data)
        }
        return ret
    },
    /**
     * create an array whit all formatted date as string
     * @param dateFormat
     * @param addMethod
     */
    iterableDate : function(dateFormat, addMethod) {
        let ret = []
        for (let i = new Date(startDate) ; i.format(dateFormat)<=endDate.format(dateFormat) ; i[addMethod](1)){
            ret.push(i.format(dateFormat))
        }
        return ret
    },
    /**
     * create the object that contain the data
     * @param parent
     * @param data =>array(
     *  {
     *      iterable : array of key,
     *  },
     *  [...]
     *)
     */
    createRet : function(parent, data) {
        for (key of data[0].iterable){
            parent[key] = data[1] ? {} : 0
            if (data[1])
                this.createRet(parent[key], data.slice(1))
        }
    },
    /**
     * fill the object that contain the data
     * @param message
     * @param parent
     * @param data =>array(
     *  {
     *      iterable : array of key,
     *      value : the value of the key (obj or number)
     *  },
     *  [...]
     *)
     * @param process
     */
    fillRet : function(message, parent, data, process) {
        if (data[1]){
            this.fillRet(message, parent[data[0].property(message)], data.slice(1), process)
        }else{
            process(message, parent, data)
        }
    }
}
//</editor-fold>