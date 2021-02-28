import React from 'react';
import { Redirect } from 'react-router-dom';

export function Auth(props: { children: any; email : string; }) {
    // TODO ログイン判定
    return (props.email || '').split('@')[1] === 'mat-ltd.co.jp'
        ? props.children
        : <Redirect to={'/error'} />;
};