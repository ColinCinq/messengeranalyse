//<editor-fold> desc="Utils"
let messagesList = [],
    participantList = [],
    startDate,
    endDate,
    basedOnToday = 1
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
let chartBackgroundColors = {
    red:            'rgba(255, 99, 132, 0.2)',
    orange:         'rgba(255, 159, 64, 0.2)',
    yellow:         'rgba(255, 205, 86, 0.2)',
    green:          'rgba(75, 192, 192, 0.2)',
    blue:           'rgba(54, 162, 235, 0.2)',
    purple:         'rgba(153, 102, 255, 0.2)',
    grey:           'rgba(201, 203, 207, 0.2)',
    teal:           'rgba(0, 128, 128, 0.2)',
    marineBlue:     'rgba(0, 7, 45, 0.2)',
    skyBlue:        'rgba(87, 196, 229, 0.2)',
    hunterGreen:    'rgba(44, 85, 48, 0.2)',
    bordeaux:       'rgba(55, 6, 23, 0.2)',
    ochre:          'rgba(153, 98, 30, 0.2)',
    greenyellow:    'rgba(165, 180, 82, 0.2)',
    lightpink:      'rgba(212, 153, 185, 0.2)',
    lime:           'rgba(203, 243, 210, 0.2)',
    hotorange:      'rgba(255, 84, 0, 0.2)',
    rubyred:        'rgba(154, 3, 30, 0.2)',
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
let chartBackgroundColorsArray = [
    chartBackgroundColors.red,
    chartBackgroundColors.orange,
    chartBackgroundColors.yellow,
    chartBackgroundColors.green,
    chartBackgroundColors.blue,
    chartBackgroundColors.purple,
    chartBackgroundColors.grey,
    chartBackgroundColors.teal,
    chartBackgroundColors.marineBlue,
    chartBackgroundColors.skyBlue,
    chartBackgroundColors.hunterGreen,
    chartBackgroundColors.bordeaux,
    chartBackgroundColors.ochre,
    chartBackgroundColors.greenyellow,
    chartBackgroundColors.lightpink,
    chartBackgroundColors.lime,
    chartBackgroundColors.hotorange,
    chartBackgroundColors.rubyred,
]

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
    formatter = formatter.replace(/(D+)/g, function (v) {
        return date.toLocaleString('fr-FR', (v.length > 1 ? {weekday:'long'} : {weekday:'short'}))
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
function generateGlobal() {
    startDate = new Date(messagesList[0].timestamp_ms)
    if (basedOnToday === 1) {
        endDate = new Date(messagesList[messagesList.length-1].timestamp_ms)
    } else {
        endDate = new Date()
    }
}
//</editor-fold>