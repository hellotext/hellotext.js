import EventEmitter from "../lib/eventEmitter"

describe("#addSubscriber", function () {
  const instance = new EventEmitter()

  it("adds the callback to the list of subscribers for an event", () => {
    const callback = (session) => {}
    instance.addSubscriber("session-set", callback)
    expect(instance.subscribers["session-set"].length).toEqual(1)
  });
});

describe("#removeSubscriber", function () {
  const instance = new EventEmitter()

  it("removes the callback from the list of subscribers for an event", () => {
    const callback = (session) => {}
    instance.addSubscriber("session-set", callback)
    instance.removeSubscriber("session-set", callback)

    expect(instance.subscribers["session-set"].length).toEqual(0)
  });
});

describe("#emit", () => {
  const instance = new EventEmitter()

  it("notifies the listeners for an event", () => {
    const callback = jest.fn()

    instance.addSubscriber("session-set", callback)
    instance.emit("session-set", "session_payload")

    expect(callback).toHaveBeenCalledTimes(1)
  });
});
