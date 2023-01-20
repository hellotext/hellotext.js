import Event from "../lib/event"

describe(".valid", function () {
  it("is true when event name starts with hello: and is already defined", () => {
    expect(Event.valid("hello:session-set")).toEqual(true)
  });

  it("is false when event name does not start with hello:", () =>  {
    expect(Event.valid("session-set")).toEqual(false)
  });

  it("is false when event name starts with hello: but is not defined", () =>  {
    expect(Event.valid("hello:undefined-event")).toEqual(false)
  });
});

describe(".invalid", () => {
  it("is true when event name does not start with hello:", () =>  {
    expect(Event.invalid("session-set")).toEqual(true)
  });

  it("is true when event name starts with hello: but is not defined", () =>  {
    expect(Event.invalid("hello:undefined-event")).toEqual(true)
  });

  it("is false when event name starts with hello: and is already defined", () =>  {
    expect(Event.invalid("hello:session-set")).toEqual(false)
  });
});
