import Hellotext from "../hellotext";
import Response from "./response";

class SubmissionsAPI {
  static endpoint = `http://api.lvh.me:3000/v1/public/submissions`

  static async resendOTP(id) {
    const response = await fetch(`${this.endpoint}/${id}/otps`, {
      method: 'POST',
      headers: Hellotext.headers
    })

    return new Response(response.ok, response)
  }

  static async verifyOTP(id, otp) {
    const response = await fetch(`${this.endpoint}/${id}/otps/${otp}/verify`, {
      method: 'POST',
      headers: Hellotext.headers,
      body: JSON.stringify({
        session: Hellotext.session
      })
    })

    return new Response(response.ok, response)
  }
}

export default SubmissionsAPI
