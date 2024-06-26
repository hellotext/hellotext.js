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

describe("#addSubscriber", function () {
  const instance = new Event()

  it("adds the callback to the list of subscribers for an event", () => {
    const callback = (session) => {}
    instance.addSubscriber("session-set", callback)
    expect(instance.subscribers["session-set"].length).toEqual(1)
  });
});

describe("#removeSubscriber", function () {
  const instance = new Event()

  it("removes the callback from the list of subscribers for an event", () => {
    const callback = (session) => {}
    instance.addSubscriber("session-set", callback)
    instance.removeSubscriber("session-set", callback)

    expect(instance.subscribers["session-set"].length).toEqual(0)
  });
});

describe("#emit", () => {
  const instance = new Event()

  it("notifies the listeners for an event", () => {
    const callback = jest.fn()

    instance.addSubscriber("session-set", callback)
    instance.dispatch("session-set", "session_payload")

    expect(callback).toHaveBeenCalledTimes(1)
  });
});
