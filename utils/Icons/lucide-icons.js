import React from 'react';
import { StyleSheet } from 'react-native';
// import Icon from 'react-native-vector-icons/Feather';
import Icon from './LucideIcon';

export const LucideIconsPack = {
  name: "lucide",
  icons: createIconsMap(),
};

function createIconsMap() {
  return new Proxy({}, {
    get(target, name) {
      return IconProvider(name);
    },
  });
}

const IconProvider = (name) => ({
  toReactElement: (props) => LucideIcon({ name, ...props }),
});

function LucideIcon({ name, style }) {
  if (style === undefined) {
    return null;
  }

  const { height, tintColor, ...iconStyle } = StyleSheet.flatten(style);
  return (
    <Icon name={name} size={height} color={tintColor} style={iconStyle} />
  );
}
