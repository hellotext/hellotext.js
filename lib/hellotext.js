import axios from "axios";

const apiUrl = 'http://api.lvh.me:3000/v1/';

class HelloText {
    /**
     * initialize the module.
     */
    static initialize() {
        window.addEventListener('load', () => {
            const urlSearchParams = new URLSearchParams(window.location.search);
            const clickId = urlSearchParams.get('hello_click_id');
            if(getCookieValue('hello_click_id').trim() === "") {
                document.cookie = `hello_click_id=${clickId}`
            }
        });
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

export default HelloText;
