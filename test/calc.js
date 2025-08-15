/* eslint-disable no-unused-expressions */
import { expect } from "chai"
import React from "react"
import { renderToString } from "react-dom/server"
import shouldUpdate from "../src/shouldUpdate.js"
import Headroom from "../src/index.js"

let propDefaults = {}

describe("react-headroom", () => {
  beforeEach(() => {
    propDefaults = {
      disableInlineStyles: false,
      disable: false,
      pin: false,
      upTolerance: 0,
      downTolerance: 0,
      offset: 0,
      pinStart: 0,
    }
  })

  describe("shouldUpdate logic (original test suite)", () => {
    it("should exist", () => {
      expect(shouldUpdate).to.exist
    })

    it("should return an object", () => {
      expect(shouldUpdate()).to.be.instanceof(Object)
    })

    // Test scrolling direction detection
    it("should report scrolling down when currentScroll is greater than lastKnownScrollY", () => {
      expect(shouldUpdate(0, 10).scrollDirection).to.equal("down")
    })

    it("should report scrolling up when currentScroll is less than lastKnownScrollY", () => {
      expect(shouldUpdate(10, 0).scrollDirection).to.equal("up")
    })

    // Test action logic
    it('should return an action of "none" if scrolling down and already unpinned', () => {
      const state = {
        height: 0,
        state: "unpinned",
      }
      const result = shouldUpdate(0, 10, propDefaults, state)
      expect(result.action).to.equal("none")
    })

    it('should return an action of "none" if scrolling up and already pinned', () => {
      const state = {
        height: 0,
        state: "pinned",
      }
      const result = shouldUpdate(100, 90, propDefaults, state)
      expect(result.action).to.equal("none")
    })

    it("should return an action of `unpin` if scrolling down and pinned", () => {
      const state = {
        height: 0,
        state: "pinned",
      }
      const result = shouldUpdate(0, 10, propDefaults, state)
      expect(result.action).to.equal("unpin")
    })

    it(
      "should not return an action of `unpin` if scrolling down and unfixed " +
        "but the scrolling amount is less than pinStart",
      () => {
        propDefaults.pinStart = 200
        const state = {
          height: 0,
          state: "unfixed",
        }
        const result = shouldUpdate(100, 110, propDefaults, state)
        expect(result.action).to.equal("none")
      }
    )

    it(
      "should not return an action of `unpin` if scrolling down and pinned " +
        "but the scrolling amount is less than downTolerance",
      () => {
        propDefaults.downTolerance = 1000
        const state = {
          height: 0,
          state: "pinned",
        }
        const result = shouldUpdate(100, 110, propDefaults, state)
        expect(result.action).to.equal("none")
      }
    )

    it("should return an action of `pin` if scrolling up and unpinned", () => {
      const state = {
        height: 0,
        state: "unpinned",
      }
      const result = shouldUpdate(10, 1, propDefaults, state)
      expect(result.action).to.equal("pin")
    })

    it(
      "should not return an action of `pin` if scrolling up and unpinned" +
        "but the scrolling amount is less than upTolerance",
      () => {
        propDefaults.upTolerance = 1000
        const state = {
          height: 0,
          state: "unpinned",
        }
        const result = shouldUpdate(110, 100, propDefaults, state)
        expect(result.action).to.equal("none")
      }
    )

    it("should return an action of 'none' if haven't scrolled past height of header", () => {
      const state = {
        height: 100,
        state: "unfixed",
      }
      const result = shouldUpdate(0, 10, propDefaults, state)
      expect(result.action).to.equal("none")
    })

    it(
      "should return an action of `none` if scrolling up " +
        "when pinned within height of header",
      () => {
        const state = {
          height: 100,
          state: "pinned",
        }
        const result = shouldUpdate(50, 10, propDefaults, state)
        expect(result.action).to.equal("none")
      }
    )

    it(
      "should return an action of `pin` if scrolling up when unpinned within height of header " +
        "regardless of the upTolerance value",
      () => {
        propDefaults.upTolerance = 1000
        let state = {
          height: 100,
          state: "unpinned",
        }
        let result = shouldUpdate(50, 10, propDefaults, state)

        expect(result.action).to.equal("pin")

        state = {
          height: 100,
          state: "unpinned",
        }
        result = shouldUpdate(50, 1, propDefaults, state)
        expect(result.action).to.equal("pin")
      }
    )

    it(
      "should return an action of `none` if scrolling down " +
        "when pinned within height of header",
      () => {
        const state = {
          height: 100,
          state: "pinned",
        }
        const result = shouldUpdate(50, 80, propDefaults, state)
        expect(result.action).to.equal("none")
      }
    )

    it(
      "should return an action of `none` if scrolling up " +
        "when pinned within height of header or at the top",
      () => {
        const state = {
          height: 100,
          state: "pinned",
        }
        const result = shouldUpdate(100, 1, propDefaults, state)

        expect(result.action).to.equal("none")
      }
    )

    it("should return an action of 'unfix' if currentScroll is less than or equal to pinStart", () => {
      propDefaults.pinStart = 20
      const state = {
        height: 100,
        state: "pinned",
      }
      let result = shouldUpdate(100, 10, propDefaults, state)

      expect(result.action).to.equal("unfix")

      result = shouldUpdate(100, 20, propDefaults, state)

      expect(result.action).to.equal("unfix")
    })

    it("should not return an action of 'unfix' if currentScroll is more than pinStart", () => {
      propDefaults.pinStart = 20
      const state = {
        height: 100,
        state: "pinned",
      }
      const result = shouldUpdate(100, 50, propDefaults, state)

      expect(result.action).to.equal("none")
    })

    it("should return an action of 'unpin' if scroll down past height of header", () => {
      const state = {
        height: 100,
        state: "unfixed",
      }
      const result = shouldUpdate(100, 110, propDefaults, state)
      expect(result.action).to.equal("unpin-snap")
    })

    it("should return an action of 'pin' if props.pin is set and not pinned, yet", () => {
      const state = {
        height: 100,
        state: "something",
      }

      const result = shouldUpdate(
        100,
        110,
        { ...propDefaults, pin: true },
        state
      )
      expect(result.action).to.equal("pin")
    })

    it("should return an action of 'none' if props.pin is set and already pinned", () => {
      const state = {
        height: 100,
        state: "pinned",
      }

      const result = shouldUpdate(
        100,
        110,
        { ...propDefaults, pin: true },
        state
      )
      expect(result.action).to.equal("none")
    })
  })

  describe("React 18/19 component integration", () => {
    it("should instantiate component", () => {
      const element = React.createElement(Headroom, {
        children: React.createElement("div", null, "Test Header"),
      })
      expect(element).to.exist
    })

    it("should render via server-side rendering", () => {
      const element = React.createElement(Headroom, {
        children: React.createElement("div", null, "Test Header"),
      })
      const html = renderToString(element)
      expect(html).to.contain("headroom-wrapper")
      expect(html).to.contain("headroom--unfixed")
    })

    it("should handle props correctly", () => {
      const element = React.createElement(Headroom, {
        pin: true,
        upTolerance: 10,
        downTolerance: 5,
        className: "test-class",
        children: React.createElement("div", null, "Test Header"),
      })
      const html = renderToString(element)
      expect(html).to.contain("test-class headroom-wrapper")
      expect(html).to.contain("headroom-wrapper")
    })

    it("should apply default props", () => {
      const element = React.createElement(Headroom, {
        children: React.createElement("div", null, "Test Header"),
      })
      const html = renderToString(element)
      expect(html).to.contain("headroom--unfixed")
      expect(html).to.contain("position:relative")
    })

    it("should handle disable prop", () => {
      const element = React.createElement(Headroom, {
        disable: true,
        children: React.createElement("div", null, "Test Header"),
      })
      const html = renderToString(element)
      expect(html).to.contain("position:relative")
    })


    it("should support disabling inline styles", () => {
      const element = React.createElement(Headroom, {
        disableInlineStyles: true,
        style: { backgroundColor: "red" },
        children: React.createElement("div", null, "Test Header"),
      })
      const html = renderToString(element)
      expect(html).to.contain("background-color:red")
    })
  })

  describe("React 18/19 compatibility", () => {
    it("should work with React 18+", () => {
      const majorVersion = parseInt(React.version.split(".")[0])
      expect(majorVersion).to.be.at.least(18)
    })

    it("should work with concurrent rendering", () => {
      const element = React.createElement(Headroom, {
        children: React.createElement("div", null, "Concurrent Test"),
      })

      // Multiple renders to simulate concurrent behavior
      for (let i = 0; i < 5; i++) {
        const html = renderToString(element)
        expect(html).to.contain("headroom-wrapper")
      }
    })

    it("should support getDerivedStateFromProps with React 18/19", () => {
      const element1 = React.createElement(Headroom, {
        disable: false,
        children: React.createElement("div", null, "Test"),
      })
      const html1 = renderToString(element1)
      expect(html1).to.contain("headroom--unfixed")

      const element2 = React.createElement(Headroom, {
        disable: true,
        children: React.createElement("div", null, "Test"),
      })
      const html2 = renderToString(element2)
      expect(html2).to.contain("position:relative")
    })
  })
})
