export const layoutAlignProps = [
  'order',
  'justifyContent',
  'alignItems',
  'alignSelf',
  'alignContent'
];

export const layoutSizeProps = [
  'width',
  'minWidth',
  'maxWidth',
  'height',
  'minHeight',
  'maxHeight'
];

export const layoutFlexProps = [
  'flex',
  'flexGrow',
  'flexShrink',
  'flexBasis'
];

export const layoutBoxProps = [
  ...layoutAlignProps,
  ...layoutSizeProps
];

export const layoutProps = [
  ...layoutBoxProps,
  ...layoutFlexProps,
  'column',
  'row',
  'wrap',
  'inline',
  'center',
  'fit'
];

export const layoutPaddingProps = [
  'padding',
  'paddingLeft',
  'paddingRight',
  'paddingTop',
  'paddingBottom'
];

export const layoutMarginProps = [
  'margin',
  'marginLeft',
  'marginRight',
  'marginTop',
  'marginBottom'
];

export const layoutBorderProps = [
  'border',
  'borderWidth',
  'borderColor',
  'borderStyle',
  'borderLeft',
  'borderRight',
  'borderTop',
  'borderBottom'
];

export const layoutPositionProps = [
  'top',
  'left',
  'bottom',
  'right'
];

export const layoutOverflowProps = [
  'overflow',
  'overflowX',
  'overflowY',
  'textOverflow',
  'whiteSpace'
];

export const layoutContainerProps = [
  'boxSizing',
  ...layoutPaddingProps,
  ...layoutMarginProps,
  ...layoutBorderProps,
  ...layoutPositionProps,
  ...layoutOverflowProps
];

export const layoutBorderShortcutProps = [
  'borderTop',
  'borderWidth',
  'borderRight',
  'borderLeft'
];
