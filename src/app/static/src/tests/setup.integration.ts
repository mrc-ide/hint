import axios from 'axios';

axios.defaults.adapter = require('axios/lib/adapters/http');

(global as any).appUrl = "http://localhost:8080/";
