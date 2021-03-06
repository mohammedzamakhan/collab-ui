/** @component button-group */

import React from 'react';
import PropTypes from 'prop-types';

class ButtonGroup extends React.Component {
  static displayName = 'ButtonGroup';

  static childContextTypes = {
    handleClick: PropTypes.func,
    handleKeyDown: PropTypes.func,
    focusIndex: PropTypes.number,
    focusOnLoad: PropTypes.bool,
  };

  state = {
    activeIndex: this.props.activeIndex,
    focusIndex: 0,
  };

  getChildContext = () => {
    return {
      handleClick: (event, index) => this.handleClick(event, index),
      handleKeyDown: (event, index) => this.handleKeyDown(event, index),
      focusIndex: this.state.focusIndex,
      focusOnLoad: this.props.focusOnLoad,
    };
  };

  componentDidMount() {
    const { focusIndex, activeIndex } = this.state;
    const initialFocus = this.getNewIndex(focusIndex - 1 , 1);
    this.setFocusIndex(initialFocus);
    (activeIndex !== null) && this.determineInitialActive();
  }

  determineInitialActive = () => {
    /* eslint-disable no-console */
    const { activeIndex, children } = this.state;
    if(activeIndex < 0 && activeIndex > children.length - 1) {
      console.warn('[@collab-ui/react] ButtonGroup: activeIndex is out of bound');
      return;
    }
    const initialActive = this.getNewIndex(activeIndex - 1 , 1);
    this.setActiveIndex(initialActive);
    /* eslint-enable no-console */
  };

  setFocusIndex = index => {
    const { focusIndex } = this.state;
    return (
      focusIndex !== index
      && this.setState({ focusIndex: index })
    );
  };

  setActiveIndex = index => {
    const { activeIndex } = this.state;
    return (
      activeIndex !== index
      && this.setState({ activeIndex: index })
    );
  };

  handleClick = (event, index) => {
    const { onSelect } = this.props;
    this.setFocusIndex(index);
    this.setActiveIndex(index);
    onSelect && onSelect(event, index);
  };

  getNewIndex = (currentIndex, change) => {
    const { children } = this.props;
    const length = children.length - 1;

    const getPossibleIndex = () => {
      if (currentIndex + change < 0) {
        return length;
      } else if (currentIndex + change > length) {
        return 0;
      }

      return currentIndex + change;
    };

    const possibleIndex = getPossibleIndex();
    const potentialTarget = React.Children.toArray(children)[possibleIndex];

    return potentialTarget.props.disabled
      ? this.getNewIndex(possibleIndex, change)
      : possibleIndex;
  };

  getIncludesFirstCharacter = (str, char) =>
    str
      .charAt(0)
      .toLowerCase()
      .includes(char);

  setFocusByFirstCharacter = (char, currentIdx) => {
    const { children } = this.props;
    const length = children.length - 1;

    const newIndex = React.Children
      .toArray(children)
      .reduce((agg, child, idx, arr) => {

        const index = currentIdx + idx + 1 > length
          ? Math.abs(currentIdx + idx - length)
          : currentIdx + idx + 1;

        const label = typeof arr[index].props.children === 'string'
          ? arr[index].props.children
          : '';

        return (
          !agg.length
          && !arr[index].props.disabled
          && !arr[index].props.isReadOnly
          && this.getIncludesFirstCharacter(label, char)
        )
          ? agg.concat(index)
          : agg;
      },
      []
    );
    !isNaN(newIndex[0]) && this.setFocusIndex(newIndex[0]);
  };

  handleKeyDown = (e, idx) => {

    let newIndex;
    let flag = false;
    const char = e.key;

    const isPrintableCharacter = str => {
      return str.length === 1 && str.match(/\S/);
    };

    switch (e.which) {
      case 38:
      case 37:
        newIndex = this.getNewIndex(idx, -1);
        this.setFocusIndex(newIndex);
        flag = true;
        break;

      case 39:
      case 40:
        newIndex = this.getNewIndex(idx, 1);
        this.setFocusIndex(newIndex);
        flag = true;
        break;
      default:
        if (isPrintableCharacter(char)) {
          this.setFocusByFirstCharacter(char, idx);
          flag = true;
        }
        break;
    }

    if (flag) {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  render() {
    const {
      ariaLabel,
      children,
      className,
      highlightSelected,
      justified,
      pillWidth,
      theme,
      type,
     } = this.props;
    const { activeIndex } = this.state;

    const setButtons = () =>
      React.Children.map(children, (child, idx) => (
        child
          ? React.cloneElement(child, {
            active: type === 'pill' ? false : highlightSelected && activeIndex === idx,
            index: idx,
            isButtonGroup: true,
            style: {
              ...pillWidth && {width: pillWidth},
            }
          })
          : child
    ));

    return (
      <div
        className={
          'cui-button-group' +
          `${(theme && ` cui-button-group--${theme}`) || ''}` +
          `${(justified && ` cui-button-group--justified`) || ''}` +
          `${(type && ` cui-button-group--${type}` || '')}` +
          `${(className && ` ${className}`) || ''}`
        }
        role="group"
        aria-label={ariaLabel}
      >
        {setButtons()}
      </div>
    );
  }
}

ButtonGroup.propTypes = {
  /** @prop Sets initial active Button by index | null */
  activeIndex: PropTypes.number,
  /** @prop Text to display for blindness accessibility features | '' */
  ariaLabel: PropTypes.string,
  /** @prop Children nodes to render inside ButtonGroup | null */
  children: PropTypes.node,
  /** @prop Optional css class string | '' */
  className: PropTypes.string,
  /** @prop Set focus to ButtonGroup when page is loaded | false */
  focusOnLoad: PropTypes.bool,
  /** @prop Highlights the selected button within group | true */
  highlightSelected: PropTypes.bool,
  /** @prop Optional text-justified css styling | true */
  justified: PropTypes.bool,
  /** @prop Handler to be called when the user selects ButtonGroup | null */
  onSelect: PropTypes.func,
  /** @prop Sets width of a pill Button | '60px' */
  pillWidth: PropTypes.string,
  /** @prop Optional Button color theme for ButtonGroup | '' */
  theme: PropTypes.oneOf(['', 'dark']),
  /** @prop Optional Button type for ButtonGroup | '' */
  type: PropTypes.oneOf(['', 'pill']),
};

ButtonGroup.defaultProps = {
  activeIndex: null,
  ariaLabel: '',
  children: null,
  className: '',
  focusOnLoad: false,
  highlightSelected: true,
  justified: true,
  onSelect: null,
  pillWidth: '60px',
  theme: '',
  type:'',
};

export default ButtonGroup;
