export function Serialize(property: string): (...args: any[]) => any {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    if (!target.constructor._propertyMap) {
      target.constructor._propertyMap = {};
    }
    target.constructor._propertyMap[propertyKey] = property;
  };
}
