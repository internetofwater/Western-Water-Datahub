import { Tooltip as _Tooltip, TooltipProps } from '@mantine/core';
import styles from '@/components/Tooltip/Tooltip.module.css';

const Tooltip: React.FC<TooltipProps> = (props) => {
  const {
    label,
    transitionProps = { transition: 'fade-right', duration: 300 },
    position = 'top-start',
    children,
    ...otherProps
  } = props;

  return (
    <_Tooltip
      classNames={{
        tooltip: styles.tooltip,
      }}
      label={label}
      transitionProps={transitionProps}
      position={position}
      {...otherProps}
    >
      {children}
    </_Tooltip>
  );
};

export default Tooltip;
