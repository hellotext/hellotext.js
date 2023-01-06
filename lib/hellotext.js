import axios from "axios";

const apiUrl = 'http://api.lvh.me:3000/v1/';

class HelloText {
    /**
     * initialize the module.
     */
    static initialize(business_id) {
        this.business_id = business_id

        const urlSearchParams = new URLSearchParams(window.location.search);
        const session = urlSearchParams.get('hello_session_id') || getCookieValue('hello_session_id')

        if(session) {
            this._session = session
            document.cookie = `hello_session_id=${session}`
        } else {
            this.mintAnonymousSession()
              .then(response => {
                this._session = response.data
                document.cookie = `hello_session_id=${response.data}`
            })
        }
    }

    /**
     *
     * @param { String } actionName
     * @param { Object } params
     * @returns {Promise}
     */
    static async track(actionName, params) {
        if(params.clickId) {
            setCookie('hello_click_id', params.clickId);
        }

        return axios.post(apiUrl + api.events.create, {
            click_id: params.clickId || getCookieValue('hello_click_id'),
            ...params
        })
    }

    static get session() {
        if(this._session) return this._session

        return this.mintAnonymousSession()
          .then((response) => {
              this._session = response.data
              return response.data
          })
    }

    // private

    static mintAnonymousSession() {
        const trackingUrl = apiUrl + "track/sessions"

        this.mintingPromise = axios.post(trackingUrl, {}, {
            headers: {
                "Authorization": `Bearer ${this.business_id}`
            }
        })

        return this.mintingPromise
    }
}

const getCookieValue = (name) => (
    document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')?.pop()
);

const setCookie = (name, value) => {
    document.cookie = `${name}=${value}`;
};

const api = {
    attribution: {
        events: {
            create: "/attribution/events"
        }
    }
}

HelloText.initialize("LDJzvJXE")
export default HelloText;
