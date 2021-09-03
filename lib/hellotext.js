import axios from "axios";

/**
 * @typedef ConversionHash
 * @type { object }
 *
 * @property { string } title
 * @property { string } currency
 * @property { number } amount
 * @property { string } clickId optional
 */

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
     * @param {ConversionHash} params a object that holds information for a conversion to occur
     *
     * @description
     * creates a conversion record. if __click_id__ is supplied, it will replace the current in the cookie
     * if __click_id__ is not supplied, it will use the __click_id__ from cookie
     */
    static async trackConversion(params) {
        if(params.clickId) {
            setCookie('hello_click_id', params.clickId);
        }

        return axios.post(apiUrl + api.conversions.track, {
            click_id: params.clickId || getCookieValue('hello_click_id'),
            ...params
        });
    }
}

const getCookieValue = (name) => (
    document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')?.pop()
);

const setCookie = (name, value) => {
    document.cookie = `${name}=${value}`;
};

const api = {
    conversions: {
        track: 'conversions/track'
    }
}

export default HelloText;