/**
 * @jest-environment jsdom
 */

import Query from "../src/query";

describe("#toHellotextParameter", () => {
  it("prefixes the argument with hello_", () => {
    const query = new Query()

    expect(query.toHellotextParam("preview")).toEqual("hello_preview")
  });
})
