import React, { Component } from 'react'
import shallowequal from 'shallowequal'
import shouldUpdate from './shouldUpdate'

const noop = () => {}

class Headroom extends Component {
  constructor (props) {
    super(props)

    // Apply default props manually to avoid deprecation warning
    this.parent = props.parent ?? (() => window)
    this.disableInlineStyles = props.disableInlineStyles ?? false
    this.disable = props.disable ?? false
    this.pinProp = props.pin ?? false
    this.upTolerance = props.upTolerance ?? 5
    this.downTolerance = props.downTolerance ?? 0
    this.onPin = props.onPin ?? noop
    this.onUnpin = props.onUnpin ?? noop
    this.onUnfix = props.onUnfix ?? noop
    this.wrapperStyle = props.wrapperStyle ?? {}
    this.pinStart = props.pinStart ?? 0
    this.calcHeightOnResize = props.calcHeightOnResize ?? true
    this.tag = props.tag ?? 'div'

    // Class variables.
    this.currentScrollY = 0
    this.lastKnownScrollY = 0
    this.scrollTicking = false
    this.resizeTicking = false
    this.eventListenerOptions = { passive: true, capture: false }
    this.state = {
      state: 'unfixed',
      translateY: 0,
      className: 'headroom headroom--unfixed'
    }
  }

  static getDerivedStateFromProps (props, state) {
    const disable = props.disable ?? false
    if (disable && state.state !== 'unfixed') {
      return {
        translateY: 0,
        className: 'headroom headroom--unfixed headroom-disable-animation',
        animation: false,
        state: 'unfixed'
      }
    }

    return null
  }

  componentDidMount () {
    this.setHeightOffset()

    if (!this.disable) {
      this.parent()
        .addEventListener(
          'scroll',
          this.handleScroll,
          this.eventListenerOptions
        )

      if (this.calcHeightOnResize) {
        this.parent()
          .addEventListener(
            'resize',
            this.handleResize,
            this.eventListenerOptions
          )
      }
    }
  }

  shouldComponentUpdate (nextProps, nextState) {
    return (
      !shallowequal(this.props, nextProps) ||
      !shallowequal(this.state, nextState)
    )
  }

  componentDidUpdate (prevProps, prevState) {
    // If children have changed, remeasure height.
    if (prevProps.children !== this.props.children) {
      this.setHeightOffset()
    }

    // Update instance properties when props change
    this.disable = this.props.disable ?? false
    this.pinProp = this.props.pin ?? false
    this.parent = this.props.parent ?? (() => window)
    this.calcHeightOnResize = this.props.calcHeightOnResize ?? true
    this.onUnfix = this.props.onUnfix ?? noop

    // Add/remove event listeners when re-enabled/disabled
    if (!prevProps.disable && this.disable) {
      this.parent()
        .removeEventListener(
          'scroll',
          this.handleScroll,
          this.eventListenerOptions
        )
      this.parent()
        .removeEventListener(
          'resize',
          this.handleResize,
          this.eventListenerOptions
        )

      if (prevState.state !== 'unfixed' && this.state.state === 'unfixed') {
        this.onUnfix()
      }
    } else if (prevProps.disable && !this.disable) {
      this.parent()
        .addEventListener(
          'scroll',
          this.handleScroll,
          this.eventListenerOptions
        )

      if (this.calcHeightOnResize) {
        this.parent()
          .addEventListener(
            'resize',
            this.handleResize,
            this.eventListenerOptions
          )
      }
    }

    if (prevProps.pin !== this.pinProp) {
      this.handleScroll()
    }
  }

  componentWillUnmount () {
    if (this.parent()) {
      this.parent()
        .removeEventListener(
          'scroll',
          this.handleScroll,
          this.eventListenerOptions
        )
      this.parent()
        .removeEventListener(
          'resize',
          this.handleResize,
          this.eventListenerOptions
        )
    }
    window.removeEventListener(
      'scroll',
      this.handleScroll,
      this.eventListenerOptions
    )
  }

  setRef = (ref) => {
    this.inner = ref
  }

  setHeightOffset = () => {
    this.setState({
      height: this.inner ? this.inner.offsetHeight : ''
    })
    this.resizeTicking = false
  }

  getScrollY = () => {
    if (this.parent().pageYOffset !== undefined) {
      return this.parent().pageYOffset
    } if (this.parent().scrollTop !== undefined) {
      return this.parent().scrollTop
    }
    return (
      document.documentElement ||
        document.body.parentNode ||
        document.body
    ).scrollTop

  }

  static getViewportHeight = () =>
    window.innerHeight ||
    document.documentElement.clientHeight ||
    document.body.clientHeight

  static getDocumentHeight = () => {
    const { body } = document
    const { documentElement } = document

    return Math.max(
      body.scrollHeight,
      documentElement.scrollHeight,
      body.offsetHeight,
      documentElement.offsetHeight,
      body.clientHeight,
      documentElement.clientHeight
    )
  }

  static getElementPhysicalHeight = (elm) =>
    Math.max(elm.offsetHeight, elm.clientHeight)

  static getElementHeight = (elm) =>
    Math.max(elm.scrollHeight, elm.offsetHeight, elm.clientHeight)

  getScrollerPhysicalHeight = () => {
    const parent = this.parent()

    return parent === window || parent === document.body
      ? Headroom.getViewportHeight()
      : Headroom.getElementPhysicalHeight(parent)
  }

  getScrollerHeight = () => {
    const parent = this.parent()

    return parent === window || parent === document.body
      ? Headroom.getDocumentHeight()
      : Headroom.getElementHeight(parent)
  }

  isOutOfBound = (currentScrollY) => {
    const pastTop = currentScrollY < 0

    const scrollerPhysicalHeight = this.getScrollerPhysicalHeight()
    const scrollerHeight = this.getScrollerHeight()

    const pastBottom = currentScrollY + scrollerPhysicalHeight > scrollerHeight

    return pastTop || pastBottom
  }

  handleScroll = () => {
    if (!this.scrollTicking) {
      this.scrollTicking = true
      requestAnimationFrame(this.update)
    }
  }

  handleResize = () => {
    if (!this.resizeTicking) {
      this.resizeTicking = true
      requestAnimationFrame(this.setHeightOffset)
    }
  }

  unpin = () => {
    this.onUnpin()

    this.setState({
      translateY: '-100%',
      className: 'headroom headroom--unpinned',
      animation: true,
      state: 'unpinned'
    })
  }

  unpinSnap = () => {
    this.onUnpin()

    this.setState({
      translateY: '-100%',
      className: 'headroom headroom--unpinned headroom-disable-animation',
      animation: false,
      state: 'unpinned'
    })
  }

  pin = () => {
    this.onPin()

    this.setState({
      translateY: 0,
      className: 'headroom headroom--pinned',
      animation: true,
      state: 'pinned'
    })
  }

  unfix = () => {
    this.onUnfix()

    this.setState({
      translateY: 0,
      className: 'headroom headroom--unfixed headroom-disable-animation',
      animation: false
    }, () => {
      setTimeout(() => {
        this.setState({ state: 'unfixed' })
      }, 0)
    })
  }

  update = () => {
    this.currentScrollY = this.getScrollY()

    if (!this.isOutOfBound(this.currentScrollY)) {
      const { action } = shouldUpdate(
        this.lastKnownScrollY,
        this.currentScrollY,
        {
          disable: this.disable,
          pin: this.pinProp,
          upTolerance: this.upTolerance,
          downTolerance: this.downTolerance,
          pinStart: this.pinStart
        },
        this.state
      )

      if (action === 'pin') {
        this.pin()
      } else if (action === 'unpin') {
        this.unpin()
      } else if (action === 'unpin-snap') {
        this.unpinSnap()
      } else if (action === 'unfix') {
        this.unfix()
      }
    }

    this.lastKnownScrollY = this.currentScrollY
    this.scrollTicking = false
  }

  render () {
    const { className: userClassName, ...divProps } = this.props
    delete divProps.onUnpin
    delete divProps.onPin
    delete divProps.onUnfix
    delete divProps.disableInlineStyles
    delete divProps.disable
    delete divProps.pin
    delete divProps.parent
    delete divProps.children
    delete divProps.upTolerance
    delete divProps.downTolerance
    delete divProps.pinStart
    delete divProps.calcHeightOnResize

    const { style, ...rest } = divProps

    let innerStyle = {
      position:
        this.disable || this.state.state === 'unfixed'
          ? 'relative'
          : 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1,
      WebkitTransform: `translate3D(0, ${this.state.translateY}, 0)`,
      MsTransform: `translate3D(0, ${this.state.translateY}, 0)`,
      transform: `translate3D(0, ${this.state.translateY}, 0)`
    }

    let { className } = this.state

    // Don't add css transitions until after we've done the initial
    // negative transform when transitioning from 'unfixed' to 'unpinned'.
    // If we don't do this, the header will flash into view temporarily
    // while it transitions from 0 — -100%.
    if (this.state.animation) {
      innerStyle = {
        ...innerStyle,
        WebkitTransition: 'all .2s ease-in-out',
        MozTransition: 'all .2s ease-in-out',
        OTransition: 'all .2s ease-in-out',
        transition: 'all .2s ease-in-out'
      }
      className += ' headroom--scrolled'
    }

    if (!this.disableInlineStyles) {
      innerStyle = {
        ...innerStyle,
        ...style
      }
    } else {
      innerStyle = style
    }

    const wrapperStyles = {
      ...this.wrapperStyle,
      height: this.state.height ? this.state.height : null
    }

    const wrapperClassName = userClassName
      ? `${userClassName} headroom-wrapper`
      : 'headroom-wrapper'

    return (
      <this.tag style={wrapperStyles} className={wrapperClassName}>
        <div
          ref={this.setRef}
          {...rest}
          style={innerStyle}
          className={className}
        >
          {this.props.children}
        </div>
      </this.tag>
    )
  }
}

export default Headroom
