import Event from "../src/event"

describe(".valid", function () {
  it("is true when event name is a valid defined name", () => {
    expect(Event.valid("session-set")).toEqual(true)
  });

  it("is false when event name is not defined", () =>  {
    expect(Event.valid("undefined-event")).toEqual(false)
  });
});

describe(".invalid", () => {
  it("is true when event name is not defined", () =>  {
    expect(Event.invalid("undefined-event")).toEqual(true)
  });

  it("is false when event name is a valid defined name", () => {
    expect(Event.invalid("session-set")).toEqual(false)
  });
});
