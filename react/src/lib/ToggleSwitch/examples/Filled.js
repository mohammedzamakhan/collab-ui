import React from 'react';
import { ToggleSwitch } from '@collab-ui/react';
export default class ToggleSwitchFilled extends React.PureComponent {
  render() {
    return (
      <ToggleSwitch
        checked={true}
        label='Toggle Switch'
        htmlId='testToggleSwitch1'
      />
    );
  }
}