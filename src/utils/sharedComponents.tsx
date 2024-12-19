import React from 'react';

let componentContent = {
  core: {},
  workflow: {}
};

export const setComponents = (module: string, components: any) => {
  componentContent[module]=components
};
/**
 * 根据组件名称获取组件
 * @param name
 */
export const getComponentByName = (module: string, name: string) => {
  return componentContent[module][name]
};

// @ts-ignore
export const SharedComponent:React.FC<{
  module: string,
  name: string,
}> = ({module, name,children, ...rest}) => {
  const Component = getComponentByName(module,name);
  return Component ? (
    <Component {...rest}>{children}</Component>
  ) : (<></>)
}
