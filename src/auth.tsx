import React from 'react';
import { ErrorPage } from './pages/ErrorPage';

export function Auth(props: { children: any; user: any; }) {
    return props.user.role === 0
        ? props.children
        : <ErrorPage />;
};