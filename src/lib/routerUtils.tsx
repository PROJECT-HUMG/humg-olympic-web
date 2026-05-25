import type { ComponentType } from 'react';

/* eslint-disable @typescript-eslint/no-explicit-any --
   Dynamic module resolution requires `any` because page components
   have heterogeneous prop signatures that can't be unified under
   a single generic. The actual type safety is ensured at the
   call-site in appRoutes.tsx via the extraProps argument. */

export function lazyPage(
    importFn: () => Promise<Record<string, ComponentType<any>>>,
    componentName: string,
    extraProps?: Record<string, unknown>
) {
    return async () => {
        const mod = await importFn();
        const OriginalComponent = mod[componentName];

        if (extraProps && Object.keys(extraProps).length > 0) {
            const WrappedComponent = (props: Record<string, unknown>) => (
                <OriginalComponent {...extraProps} {...props} />
            );
            WrappedComponent.displayName = `LazyWithProps(${componentName})`;
            return { Component: WrappedComponent };
        }

        return { Component: OriginalComponent };
    };
}
/* eslint-enable @typescript-eslint/no-explicit-any */
