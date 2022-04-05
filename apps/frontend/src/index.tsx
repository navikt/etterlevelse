import 'react-app-polyfill/ie11'
import 'react-app-polyfill/stable'
import React from 'react'
import Main from './main'

import {createRoot} from 'react-dom/client';

// @ts-ignore
createRoot(document.getElementById('root')).render(<Main/>);
