// Shim for nanoid/non-secure in React Native.
// React Navigation expects a named export `nanoid` from `nanoid/non-secure`,
// but newer nanoid builds can resolve differently in Metro. This wrapper
// guarantees the expected named and default exports.
import { nanoid as secureNanoid } from 'nanoid';

export const nanoid = (...args) => secureNanoid(...args);
export default nanoid;

