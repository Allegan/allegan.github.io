export class Form {
    downloadEnabled
    operation

    constructor ($elems) {
        this.$elems = $elems
        this.downloadEnabled = false
        this.operation = 'encrypt'

        this.$elems.encryptRadio.addEventListener('click', (e) => {
            this.changeRadioState('encrypt')
            this.operation = 'encrypt'
        })

        this.$elems.decryptRadio.addEventListener('click', (e) => {
            this.changeRadioState('decrypt')
            this.operation = 'decrypt'
        })
    }

    changeRadioState (state) {
        switch (state) {
            case 'encrypt':
                this.$elems.title.textContent = 'Encrypt'
                this.$elems.submit.textContent = 'Encrypt'
                break
            case 'decrypt':
                this.$elems.title.textContent = 'Decrypt'
                this.$elems.submit.textContent = 'Decrypt'
                break
        }
    }

    toggleDownload () {
        this.downloadEnabled = !this.downloadEnabled

        if (this.downloadEnabled)
            this.$elems.download.className = this.$elems.download.className.replace('disabled', '')
        else
            this.$elems.download.className += 'disabled'
    }

    setDownloadContent (state) {
        const downloadBlob = new Blob([state.buff], {
            type: "application/octet-stream"
        })

        this.$elems.download.setAttribute('href', window.URL.createObjectURL(downloadBlob))
        this.$elems.download.setAttribute('download', state.filename)
        this.toggleDownload()

        const toggle = () => {
            this.toggleDownload()
            this.$elems.download.removeEventListener('click', toggle)
        }

        this.$elems.download.addEventListener('click', toggle)
    }

    addFormAction (fn) {
        this.$elems.submit.addEventListener('click', (e) => {
            e.preventDefault()

            fn({
                op: this.operation,
                file: this.$elems.file.files[0],
                pass: this.$elems.password.value
            })
        })
    }
}