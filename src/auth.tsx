// 当システムでは不要

import React from 'react';
import { Redirect } from 'react-router-dom';

export function Auth(props: { children: any; data: any; }) {
    return true
        ? props.children
        : <Redirect to={'/error'} />;
};