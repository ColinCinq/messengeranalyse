//<editor-fold> desc="Import Process"
// loading process for imported folder
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
            display(dataProcess)
        })
    })
})
//</editor-fold>