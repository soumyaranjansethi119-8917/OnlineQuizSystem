import React from 'react';

const Card = ({
  children,
  className = '',
  hover = false,
  padding = true,
  ...props
}) => {
  return (
    <div
      className={`card border-0 shadow-sm rounded-4 bg-white ${
        hover ? 'transition-hover' : ''
      } ${padding ? 'p-4' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`card-header border-bottom border-light px-0 pt-0 pb-3 mb-3 ${className}`} {...props}>
    {children}
  </div>
);

export const CardBody = ({ children, className = '', ...props }) => (
  <div className={`card-body p-0 ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '', ...props }) => (
  <div className={`card-footer border-top border-light px-0 pt-3 pb-0 mt-3 ${className}`} {...props}>
    {children}
  </div>
);

export default Card;
