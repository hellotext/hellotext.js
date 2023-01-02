import axios from "axios";
import { createConsumer } from "@rails/actioncable";

const apiUrl = 'https://api.lvh.me:3000/v1/';

class HelloText {
    /**
     * initialize the module.
     */
    static initialize(business_id) {
        this.business_id = business_id

        window.addEventListener('load', () => {
            const urlSearchParams = new URLSearchParams(window.location.search);
            const session = urlSearchParams.get('hello_session_id');
            if(getCookieValue('hello_session_id').trim() === "") {
                document.cookie = `hello_session_id=${session}`
            }
        });

        this.consumer = createConsumer("https://www.lvh.me:3000/cable")
        this.consumer.subscriptions.create({
            channel: "TrackingChannel",
            business: this.business_id
        }, {
            received: (data) => {
                console.log("Data is", data)
            }
        })
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
        if(this.sessionObject) return this.sessionObject
    }

    // private

    static get sessionObject() {

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
